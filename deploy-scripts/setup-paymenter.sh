#!/bin/bash

# Paymenter Billing System Setup Script
# This script sets up Paymenter for actual billing management

set -e

echo "💳 Setting up Paymenter Billing System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PAYMENTER_DIR="/opt/paymenter"
PAYMENTER_USER="paymenter"
PAYMENTER_PORT="8000"
DB_NAME="paymenter"
DB_USER="paymenter"
DB_PASS="paymenter_db_pass_$(date +%s | sha256sum | cut -c1-8)"

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    log_error "This script should not be run as root"
    exit 1
fi

# Install PHP and required extensions
log_info "Installing PHP and required extensions..."
sudo apt-get update
sudo apt-get install -y \
    php8.2 \
    php8.2-fpm \
    php8.2-mysql \
    php8.2-xml \
    php8.2-mbstring \
    php8.2-curl \
    php8.2-zip \
    php8.2-bcmath \
    php8.2-gd \
    php8.2-intl \
    php8.2-sqlite3 \
    php8.2-tokenizer \
    php8.2-ctype \
    php8.2-fileinfo \
    php8.2-json \
    php8.2-iconv \
    composer \
    nginx \
    mysql-server \
    redis-server

# Install Node.js for frontend building
log_info "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create paymenter user
if ! id "$PAYMENTER_USER" &>/dev/null; then
    log_info "Creating paymenter user..."
    sudo useradd -m -s /bin/bash $PAYMENTER_USER
fi

# Create directories
log_info "Creating directories..."
sudo mkdir -p $PAYMENTER_DIR
sudo mkdir -p /var/log/paymenter
sudo mkdir -p /etc/paymenter

# Set ownership
sudo chown -R $PAYMENTER_USER:$PAYMENTER_USER $PAYMENTER_DIR
sudo chown -R $PAYMENTER_USER:$PAYMENTER_USER /var/log/paymenter
sudo chown -R $PAYMENTER_USER:$PAYMENTER_USER /etc/paymenter

# Setup MySQL
log_info "Setting up MySQL database..."
sudo systemctl start mysql
sudo systemctl enable mysql

# Create database and user
log_info "Creating Paymenter database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
sudo mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Clone Paymenter
log_info "Downloading Paymenter..."
cd /tmp
if [ ! -d "Paymenter" ]; then
    git clone https://github.com/paymenter/paymenter.git
fi

cd Paymenter
sudo cp -r . $PAYMENTER_DIR/
sudo chown -R $PAYMENTER_USER:$PAYMENTER_USER $PAYMENTER_DIR

# Install PHP dependencies
log_info "Installing PHP dependencies..."
cd $PAYMENTER_DIR
sudo -u $PAYMENTER_USER composer install --no-dev --optimize-autoloader

# Install Node.js dependencies and build frontend
log_info "Building frontend assets..."
sudo -u $PAYMENTER_USER npm install
sudo -u $PAYMENTER_USER npm run build

# Create environment file
log_info "Creating environment configuration..."
sudo -u $PAYMENTER_USER cp .env.example .env

# Configure environment
sudo -u $PAYMENTER_USER sed -i "s/APP_NAME=.*/APP_NAME=Pro VPS Hosting/" .env
sudo -u $PAYMENTER_USER sed -i "s/APP_ENV=.*/APP_ENV=production/" .env
sudo -u $PAYMENTER_USER sed -i "s/APP_DEBUG=.*/APP_DEBUG=false/" .env
sudo -u $PAYMENTER_USER sed -i "s/APP_URL=.*/APP_URL=http:\/\/localhost:$PAYMENTER_PORT/" .env

# Database configuration
sudo -u $PAYMENTER_USER sed -i "s/DB_CONNECTION=.*/DB_CONNECTION=mysql/" .env
sudo -u $PAYMENTER_USER sed -i "s/DB_HOST=.*/DB_HOST=127.0.0.1/" .env
sudo -u $PAYMENTER_USER sed -i "s/DB_PORT=.*/DB_PORT=3306/" .env
sudo -u $PAYMENTER_USER sed -i "s/DB_DATABASE=.*/DB_DATABASE=$DB_NAME/" .env
sudo -u $PAYMENTER_USER sed -i "s/DB_USERNAME=.*/DB_USERNAME=$DB_USER/" .env
sudo -u $PAYMENTER_USER sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env

# Generate application key
log_info "Generating application key..."
cd $PAYMENTER_DIR
sudo -u $PAYMENTER_USER php artisan key:generate --force

# Run database migrations
log_info "Running database migrations..."
sudo -u $PAYMENTER_USER php artisan migrate --force

# Seed database
log_info "Seeding database..."
sudo -u $PAYMENTER_USER php artisan db:seed --force

# Create storage links
log_info "Creating storage links..."
sudo -u $PAYMENTER_USER php artisan storage:link

# Clear and cache configurations
log_info "Optimizing application..."
sudo -u $PAYMENTER_USER php artisan config:cache
sudo -u $PAYMENTER_USER php artisan route:cache
sudo -u $PAYMENTER_USER php artisan view:cache
sudo -u $PAYMENTER_USER php artisan config:clear

# Setup nginx configuration
log_info "Configuring nginx..."
sudo tee /etc/nginx/sites-available/paymenter > /dev/null <<EOF
server {
    listen $PAYMENTER_PORT;
    server_name localhost;
    root $PAYMENTER_DIR/public;
    index index.php index.html index.htm;

    client_max_body_size 100M;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }

    location ~ /\.ht {
        deny all;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/paymenter /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart services
log_info "Restarting web services..."
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx
sudo systemctl restart mysql
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Create systemd service for Paymenter queue
log_info "Creating Paymenter queue service..."
sudo tee /etc/systemd/system/paymenter-queue.service > /dev/null <<EOF
[Unit]
Description=Paymenter Queue Worker
After=network.target mysql.service redis.service
Wants=mysql.service redis.service

[Service]
Type=simple
User=$PAYMENTER_USER
Group=$PAYMENTER_USER
WorkingDirectory=$PAYMENTER_DIR
ExecStart=/usr/bin/php $PAYMENTER_DIR/artisan queue:work --sleep=3 --tries=3
Restart=always
RestartSec=5
Environment=APP_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Enable and start queue worker
sudo systemctl daemon-reload
sudo systemctl enable paymenter-queue
sudo systemctl start paymenter-queue

# Create cron job for scheduled tasks
log_info "Setting up cron jobs..."
(crontab -u $PAYMENTER_USER -l 2>/dev/null; echo "* * * * * cd $PAYMENTER_DIR && php artisan schedule:run >> /var/log/paymenter/cron.log 2>&1") | sudo crontab -u $PAYMENTER_USER -

# Wait for services to start
log_info "Waiting for services to start..."
sleep 10

# Test Paymenter installation
log_info "Testing Paymenter installation..."
if curl -s -f "http://localhost:$PAYMENTER_PORT" > /dev/null; then
    log_success "Paymenter is responding correctly"
else
    log_error "Paymenter is not responding"
    sudo systemctl status nginx
    sudo systemctl status php8.2-fpm
    exit 1
fi

# Create admin user
log_info "Creating admin user..."
cd $PAYMENTER_DIR
ADMIN_EMAIL="admin@provps.com"
ADMIN_PASS="admin123456"

sudo -u $PAYMENTER_USER php artisan tinker --execute="
\$user = App\\Models\\User::create([
    'first_name' => 'Admin',
    'last_name' => 'User',
    'email' => '$ADMIN_EMAIL',
    'password' => bcrypt('$ADMIN_PASS'),
    'role' => 'admin',
    'email_verified_at' => now()
]);
\$user->assignRole('admin');
echo 'Admin user created successfully';
"

# Create API token for integration
log_info "Creating API token for integration..."
API_TOKEN=$(sudo -u $PAYMENTER_USER php artisan tinker --execute="
\$user = App\\Models\\User::where('email', '$ADMIN_EMAIL')->first();
\$token = \$user->createToken('integration-token', ['read', 'write']);
echo \$token->plainTextToken;
" | tail -1)

# Create environment file for integration service
log_info "Creating environment configuration..."
sudo -u $PAYMENTER_USER tee /home/$PAYMENTER_USER/.paymenter.env > /dev/null <<EOF
# Paymenter Configuration
PAYMENTER_API_URL=http://localhost:$PAYMENTER_PORT
PAYMENTER_API_TOKEN=$API_TOKEN
PAYMENTER_WEB_URL=http://localhost:$PAYMENTER_PORT

# Database Configuration
PAYMENTER_DB_NAME=$DB_NAME
PAYMENTER_DB_USER=$DB_USER
PAYMENTER_DB_PASS=$DB_PASS

# Admin Credentials
PAYMENTER_ADMIN_EMAIL=$ADMIN_EMAIL
PAYMENTER_ADMIN_PASS=$ADMIN_PASS
EOF

# Set proper permissions
sudo chmod 600 /home/$PAYMENTER_USER/.paymenter.env
sudo chown $PAYMENTER_USER:$PAYMENTER_USER /home/$PAYMENTER_USER/.paymenter.env

log_success "Paymenter Billing System setup completed!"
log_info "Service URL: http://localhost:$PAYMENTER_PORT"
log_info "Admin Login: $ADMIN_EMAIL / $ADMIN_PASS"
log_info "API Token: ${API_TOKEN:0:20}..."
log_info "Environment file: /home/$PAYMENTER_USER/.paymenter.env"

# Display next steps
echo ""
echo "========================================"
echo "💳 Paymenter Setup Complete!"
echo "========================================"
echo "Next steps:"
echo "1. Access Paymenter: http://localhost:$PAYMENTER_PORT"
echo "2. Admin login: $ADMIN_EMAIL"
echo "3. Configure payment gateways in admin panel"
echo "4. Create products and pricing plans"
echo "5. Check logs: sudo journalctl -u paymenter-queue -f"
echo ""
echo "Paymenter is ready for billing management! 💳"

exit 0