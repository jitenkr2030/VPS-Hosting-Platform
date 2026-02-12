#!/bin/bash

# Integration Service Setup Script
# This script sets up the Node.js integration service with real connections

set -e

echo "🔗 Setting up Integration Service..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
INTEGRATION_DIR="/opt/vps-integration"
INTEGRATION_USER="vps-integration"
INTEGRATION_PORT="3002"
NODE_VERSION="18"

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

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    log_info "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    NODE_VERSION_CURRENT=$(node -v | cut -d'v' -f1)
    if [ "$NODE_VERSION_CURRENT" != "$NODE_VERSION" ]; then
        log_warning "Node.js version $NODE_VERSION_CURRENT detected, recommend $NODE_VERSION"
    fi
fi

# Create integration user
if ! id "$INTEGRATION_USER" &>/dev/null; then
    log_info "Creating integration user..."
    sudo useradd -m -s /bin/bash $INTEGRATION_USER
fi

# Create directories
log_info "Creating directories..."
sudo mkdir -p $INTEGRATION_DIR
sudo mkdir -p /var/log/vps-integration
sudo mkdir -p /etc/vps-integration

# Set ownership
sudo chown -R $INTEGRATION_USER:$INTEGRATION_USER $INTEGRATION_DIR
sudo chown -R $INTEGRATION_USER:$INTEGRATION_USER /var/log/vps-integration
sudo chown -R $INTEGRATION_USER:$INTEGRATION_USER /etc/vps-integration

# Copy integration service files
log_info "Installing integration service..."
sudo cp -r /home/z/my-project/integration/* $INTEGRATION_DIR/
sudo chown -R $INTEGRATION_USER:$INTEGRATION_USER $INTEGRATION_DIR

# Install dependencies
log_info "Installing Node.js dependencies..."
cd $INTEGRATION_DIR
sudo -u $INTEGRATION_USER npm install --production

# Read configuration from other services
log_info "Reading service configurations..."

# Get Flint configuration
if [ -f "/home/flint/.flint.env" ]; then
    source /home/flint/.flint.env
    FLINT_API_URL=${FLINT_API_URL:-"http://localhost:5550"}
    FLINT_API_KEY=${FLINT_API_KEY:-"flint_api_key_placeholder"}
else
    log_warning "Flint configuration not found, using defaults"
    FLINT_API_URL="http://localhost:5550"
    FLINT_API_KEY="flint_api_key_placeholder"
fi

# Get Paymenter configuration
if [ -f "/home/paymenter/.paymenter.env" ]; then
    source /home/paymenter/.paymenter.env
    PAYMENTER_API_URL=${PAYMENTER_API_URL:-"http://localhost:8000"}
    PAYMENTER_API_TOKEN=${PAYMENTER_API_TOKEN:-"paymenter_api_token_placeholder"}
else
    log_warning "Paymenter configuration not found, using defaults"
    PAYMENTER_API_URL="http://localhost:8000"
    PAYMENTER_API_TOKEN="paymenter_api_token_placeholder"
fi

# Create environment file
log_info "Creating environment configuration..."
sudo -u $INTEGRATION_USER tee .env > /dev/null <<EOF
# Integration Service Configuration
NODE_ENV=production
PORT=$INTEGRATION_PORT

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/vps_integration

# JWT Secrets
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Flint Configuration
FLINT_API_URL=$FLINT_API_URL
FLINT_API_KEY=$FLINT_API_KEY
FLINT_WEB_URL=$FLINT_API_URL

# Paymenter Configuration
PAYMENTER_API_URL=$PAYMENTER_API_URL
PAYMENTER_API_TOKEN=$PAYMENTER_API_TOKEN

# Frontend URLs
FRONTEND_URL=http://localhost:3000
DASHBOARD_URL=http://localhost:3000/dashboard
ADMIN_URL=http://localhost:3000/admin

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Webhook Configuration
WEBHOOK_SECRET=$(openssl rand -base64 32)

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
EOF

# Set proper permissions
sudo chmod 600 $INTEGRATION_DIR/.env
sudo chown $INTEGRATION_USER:$INTEGRATION_USER $INTEGRATION_DIR/.env

# Create systemd service
log_info "Creating systemd service..."
sudo tee /etc/systemd/system/vps-integration.service > /dev/null <<EOF
[Unit]
Description=VPS Integration Service
After=network.target flint.service mysql.service redis.service
Wants=network.target

[Service]
Type=simple
User=$INTEGRATION_USER
Group=$INTEGRATION_USER
WorkingDirectory=$INTEGRATION_DIR
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
StandardOutput=journal
StandardError=journal
SyslogIdentifier=vps-integration

[Install]
WantedBy=multi-user.target
EOF

# Create log rotation
log_info "Setting up log rotation..."
sudo tee /etc/logrotate.d/vps-integration > /dev/null <<EOF
/var/log/vps-integration/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $INTEGRATION_USER $INTEGRATION_USER
    postrotate
        systemctl reload vps-integration > /dev/null 2>&1 || true
    endscript
}
EOF

# Install MongoDB if not present
if ! command -v mongod &> /dev/null; then
    log_info "Installing MongoDB..."
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo systemctl start mongod
    sudo systemctl enable mongod
fi

# Create MongoDB database and user
log_info "Setting up MongoDB database..."
mongo vps_integration --eval "
db.createUser({
    user: 'vps_integration',
    pwd: 'vps_integration_pass',
    roles: ['readWrite']
});
db.createCollection('users');
db.createCollection('services');
" 2>/dev/null || log_warning "MongoDB user/database may already exist"

# Reload systemd and start service
log_info "Starting integration service..."
sudo systemctl daemon-reload
sudo systemctl enable vps-integration
sudo systemctl start vps-integration

# Wait for service to start
log_info "Waiting for integration service to start..."
sleep 5

# Check if service is running
if sudo systemctl is-active --quiet vps-integration; then
    log_success "Integration service is running"
else
    log_error "Integration service failed to start"
    sudo journalctl -u vps-integration -n 20 --no-pager
    exit 1
fi

# Test API endpoints
log_info "Testing API endpoints..."

# Test health endpoint
sleep 2
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health_response.json \
    "http://localhost:$INTEGRATION_PORT/api/health")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    log_success "Health endpoint is responding"
    log_info "Services status: $(jq -r '.services' /tmp/health_response.json)"
else
    log_warning "Health endpoint not responding yet (HTTP $HEALTH_RESPONSE)"
fi

# Test Flint connection
log_info "Testing Flint connection..."
FLINT_TEST=$(curl -s -w "%{http_code}" -o /tmp/flint_test.json \
    "$FLINT_API_URL/api/host/status" \
    -H "Authorization: Bearer $FLINT_API_KEY")

if [ "$FLINT_TEST" = "200" ]; then
    log_success "Flint API is accessible"
else
    log_warning "Flint API not accessible (HTTP $FLINT_TEST), Flint may not be running"
fi

# Test Paymenter connection
log_info "Testing Paymenter connection..."
PAYMENTER_TEST=$(curl -s -w "%{http_code}" -o /tmp/paymenter_test.json \
    "$PAYMENTER_API_URL/api/user" \
    -H "Authorization: Bearer $PAYMENTER_API_TOKEN")

if [ "$PAYMENTER_TEST" = "200" ]; then
    log_success "Paymenter API is accessible"
else
    log_warning "Paymenter API not accessible (HTTP $PAYMENTER_TEST), Paymenter may not be running"
fi

# Create startup script
log_info "Creating startup script..."
sudo tee /usr/local/bin/start-vps-integration > /dev/null <<'EOF'
#!/bin/bash
echo "Starting VPS Integration Service..."
sudo systemctl start vps-integration
sudo systemctl status vps-integration
EOF

sudo chmod +x /usr/local/bin/start-vps-integration

# Create monitoring script
log_info "Creating monitoring script..."
sudo tee /usr/local/bin/check-vps-services > /dev/null <<'EOF'
#!/bin/bash

echo "=== VPS Platform Service Status ==="
echo ""

# Check Flint
echo "🔧 Flint Service:"
if systemctl is-active --quiet flint; then
    echo "  ✅ Running (http://localhost:5550)"
else
    echo "  ❌ Stopped"
fi

# Check Paymenter
echo "💳 Paymenter Service:"
if curl -s -f "http://localhost:8000" > /dev/null; then
    echo "  ✅ Running (http://localhost:8000)"
else
    echo "  ❌ Stopped"
fi

# Check Integration Service
echo "🔗 Integration Service:"
if systemctl is-active --quiet vps-integration; then
    echo "  ✅ Running (http://localhost:3002)"
else
    echo "  ❌ Stopped"
fi

# Check MongoDB
echo "🗄️  MongoDB:"
if systemctl is-active --quiet mongod; then
    echo "  ✅ Running"
else
    echo "  ❌ Stopped"
fi

# Check Redis
echo "🔴 Redis:"
if systemctl is-active --quiet redis-server; then
    echo "  ✅ Running"
else
    echo "  ❌ Stopped"
fi

echo ""
echo "=== API Endpoints Test ==="
echo ""

# Test Integration API
if curl -s -f "http://localhost:3002/api/health" > /dev/null; then
    echo "  ✅ Integration API: http://localhost:3002/api/health"
else
    echo "  ❌ Integration API: Not responding"
fi

echo ""
EOF

sudo chmod +x /usr/local/bin/check-vps-services

log_success "Integration Service setup completed!"
log_info "Service URL: http://localhost:$INTEGRATION_PORT"
log_info "API Documentation: http://localhost:$INTEGRATION_PORT/api/health"
log_info "Environment file: $INTEGRATION_DIR/.env"
log_info "Log file: /var/log/vps-integration/"

# Display next steps
echo ""
echo "========================================"
echo "🔗 Integration Service Setup Complete!"
echo "========================================"
echo "Next steps:"
echo "1. Test API: curl http://localhost:$INTEGRATION_PORT/api/health"
echo "2. Check logs: sudo journalctl -u vps-integration -f"
echo "3. Monitor services: /usr/local/bin/check-vps-services"
echo "4. Test VPS creation: Use the test script"
echo ""
echo "Integration service is ready to connect all components! 🔗"

# Clean up
rm -f /tmp/health_response.json /tmp/flint_test.json /tmp/paymenter_test.json

exit 0