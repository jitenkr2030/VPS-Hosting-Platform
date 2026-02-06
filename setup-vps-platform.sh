#!/bin/bash

# VPS Hosting Platform - Complete Setup Script
# This script sets up the entire VPS hosting platform

set -e

echo "🚀 Starting VPS Hosting Platform Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# System requirements check
print_header "📋 Checking System Requirements..."

# Check OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    print_status "Linux OS detected ✓"
else
    print_error "This platform requires Linux OS"
    exit 1
fi

# Check for required commands
for cmd in git curl wget php composer npm node; do
    if ! command -v $cmd &> /dev/null; then
        print_error "$cmd is not installed. Please install it first."
        exit 1
    fi
done
print_status "Required tools are installed ✓"

# Setup directory
VPS_DIR="$HOME/vps-hosting-platform"
print_status "Setting up platform in: $VPS_DIR"

# Create main directory
mkdir -p "$VPS_DIR"
cd "$VPS_DIR"

# Clone the complete repository
print_header "📥 Downloading VPS Hosting Platform..."
if [ -d "VPS-Hosting-Platform" ]; then
    print_warning "Repository already exists, updating..."
    cd VPS-Hosting-Platform
    git pull origin main
    git submodule update --init --recursive
else
    git clone https://github.com/jitenkr2030/VPS-Hosting-Platform.git
    cd VPS-Hosting-Platform
    git submodule update --init --recursive
fi

print_status "Repository downloaded and updated ✓"

# Install Flint
print_header "🔧 Installing Flint (KVM Management)..."

# Check if KVM/libvirt is available
if ! command -v virsh &> /dev/null; then
    print_warning "KVM/libvirt not found. Installing..."
    
    # Detect package manager
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y qemu-kvm libvirt-daemon-system libvirt-daemon libvirt-clients bridge-utils
        sudo systemctl enable --now libvirtd
        sudo usermod -a -G libvirt $USER
    elif command -v dnf &> /dev/null; then
        sudo dnf install -y qemu-kvm libvirt libvirt-client virt-install
        sudo systemctl enable --now libvirtd
        sudo usermod -a -G libvirt $USER
    elif command -v pacman &> /dev/null; then
        sudo pacman -S qemu-full libvirt virt-install virt-manager
        sudo systemctl enable --now libvirtd
        sudo usermod -a -G libvirt $USER
    else
        print_error "Unsupported package manager. Please install KVM/libvirt manually."
        exit 1
    fi
    
    print_status "KVM/libvirt installed ✓"
else
    print_status "KVM/libvirt already installed ✓"
fi

# Install Flint
cd flint
if [ ! -f "flint" ]; then
    print_status "Building Flint from source..."
    go build -o flint .
else
    print_status "Flint binary already exists ✓"
fi

# Test Flint installation
print_status "Testing Flint installation..."
./flint --version || print_warning "Flint version check failed"

# Start Flint in background
print_status "Starting Flint server..."
FLINT_PASSPHRASE="vps-platform-$(date +%s)"
export FLINT_PASSPHRASE
nohup ./flint serve --passphrase "$FLINT_PASSPHRASE" > flint.log 2>&1 &
FLINT_PID=$!
echo $FLINT_PID > flint.pid

# Wait for Flint to start
sleep 5

# Get Flint API key
FLINT_API_KEY=$(./flint api-key)
FLINT_HOST="http://localhost:5550"

print_status "Flint server started ✓"
print_status "API Key: $FLINT_API_KEY"
print_status "Host: $FLINT_HOST"

cd ..

# Setup Paymenter
print_header "💳 Setting up Paymenter (Billing System)..."

cd Paymenter

# Install PHP dependencies
print_status "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install
npm run build

# Setup environment file
if [ ! -f ".env" ]; then
    print_status "Creating environment file..."
    cp .env.example .env
    
    # Generate app key
    php artisan key:generate
    
    # Update environment with VPS platform settings
    cat >> .env << EOF

# VPS Platform Settings
APP_NAME="VPS Hosting Platform"
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vps_platform
DB_USERNAME=vps_user
DB_PASSWORD=vps_password

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls

# Queue
QUEUE_CONNECTION=database

EOF
fi

# Setup database
print_status "Setting up database..."
read -p "Enter MySQL root password: " -s MYSQL_ROOT_PASSWORD
echo

# Create database and user
mysql -u root -p"$MYSQL_ROOT_PASSWORD" << EOF
CREATE DATABASE IF NOT EXISTS vps_platform;
CREATE USER IF NOT EXISTS 'vps_user'@'localhost' IDENTIFIED BY 'vps_password';
GRANT ALL PRIVILEGES ON vps_platform.* TO 'vps_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Run migrations
print_status "Running database migrations..."
php artisan migrate

# Seed database
print_status "Seeding database..."
php artisan db:seed

# Install VPS extension
print_status "Installing VPS (Flint) extension..."
cp -r ../vps-platform/Paymenter/extensions/Servers/Flint extensions/Servers/

# Install VPS views
print_status "Installing VPS management views..."
cp -r ../vps-platform/Paymenter/themes/default/views/services/vps.blade.php themes/default/views/services/
cp -r ../vps-platform/Paymenter/themes/default/views/admin/vps-dashboard.blade.php themes/default/views/admin/

# Install VPS controllers and jobs
print_status "Installing VPS controllers and jobs..."
cp -r ../vps-platform/Paymenter/app/Http/Controllers/Client/VpsController.php app/Http/Controllers/Client/
cp -r ../vps-platform/Paymenter/app/Jobs/Server/Vps* app/Jobs/Server/
cp -r ../vps-platform/Paymenter/app/Observers/VpsServiceObserver.php app/Observers/

# Install VPS routes
print_status "Installing VPS routes..."
cp ../vps-platform/Paymenter/routes/vps.php routes/

# Clear caches
print_status "Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Create admin user
print_status "Creating admin user..."
php artisan tinker --execute="
\$user = new \App\Models\User();
\$user->name = 'Admin User';
\$user->email = 'admin@vps-platform.com';
\$user->password = \Hash::make('admin123');
\$user->role = 'admin';
\$user->email_verified_at = now();
\$user->save();
echo 'Admin user created: admin@vps-platform.com / admin123\n';
"

cd ..

# Create startup scripts
print_header "🚀 Creating Startup Scripts..."

# Flint startup script
cat > start-flint.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/flint"
export FLINT_PASSPHRASE="vps-platform-secure"
if [ -f flint.pid ]; then
    kill $(cat flint.pid) 2>/dev/null || true
    rm -f flint.pid
fi
nohup ./flint serve --passphrase "$FLINT_PASSPHRASE" > flint.log 2>&1 &
echo $! > flint.pid
echo "Flint started with PID: $(cat flint.pid)"
EOF

# Paymenter startup script
cat > start-paymenter.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/Paymenter"
php artisan serve --host=0.0.0.0 --port=8000 &
echo "Paymenter started on http://localhost:8000"
EOF

# Queue worker startup script
cat > start-queue.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/Paymenter"
php artisan queue:work --daemon
EOF

# Make scripts executable
chmod +x start-flint.sh start-paymenter.sh start-queue.sh

# Create configuration file with credentials
cat > vps-config.txt << EOF
🔧 VPS Platform Configuration
============================

Flint Server:
- Host: $FLINT_HOST
- API Key: $FLINT_API_KEY
- Passphrase: $FLINT_PASSPHRASE

Paymenter Admin:
- URL: http://localhost:8000/admin
- Email: admin@vps-platform.com
- Password: admin123

Database:
- Name: vps_platform
- User: vps_user
- Password: vps_password

Next Steps:
1. Start services: ./start-flint.sh && ./start-paymenter.sh
2. Access admin panel: http://localhost:8000/admin
3. Configure Flint extension in Paymenter
4. Create VPS products and pricing
5. Setup payment gateways
6. Launch your VPS hosting business! 🚀

EOF

print_status "Startup scripts created ✓"

# Final setup summary
print_header "🎉 VPS Hosting Platform Setup Complete!"

echo ""
echo "📁 Installation Directory: $VPS_DIR/VPS-Hosting-Platform"
echo "📋 Configuration saved to: vps-config.txt"
echo ""
echo "🚀 To start your platform:"
echo "   cd $VPS_DIR/VPS-Hosting-Platform"
echo "   ./start-flint.sh    # Start Flint server"
echo "   ./start-paymenter.sh # Start Paymenter web interface"
echo "   ./start-queue.sh    # Start queue worker (in separate terminal)"
echo ""
echo "🌐 Access Points:"
echo "   Paymenter Admin: http://localhost:8000/admin"
echo "   Flint API: http://localhost:5550/api"
echo ""
echo "📖 Read the setup guide: vps-platform/SETUP_GUIDE.md"
echo "💼 Business overview: vps-platform/README.md"
echo ""
print_status "Setup completed successfully! Your VPS hosting platform is ready to launch! 🎯"