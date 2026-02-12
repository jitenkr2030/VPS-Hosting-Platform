#!/bin/bash

# Flint VPS Management Service Setup Script
# This script sets up Flint for actual VPS management

set -e

echo "🔧 Setting up Flint VPS Management Service..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FLINT_DIR="/opt/flint"
FLINT_USER="flint"
FLINT_PORT="5550"
API_KEY_FILE="/home/$FLINT_USER/.flint/config.json"

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

# Install required packages
log_info "Installing required packages..."
sudo apt-get update
sudo apt-get install -y \
    qemu-kvm \
    libvirt-daemon-system \
    libvirt-clients \
    bridge-utils \
    virtinst \
    cpu-checker \
    libguestfs-tools \
    genisoimage \
    wget \
    curl \
    jq

# Check KVM support
log_info "Checking KVM support..."
if kvm-ok; then
    log_success "KVM support is available"
else
    log_error "KVM support is not available"
    exit 1
fi

# Add user to libvirt group
log_info "Adding user $USER to libvirt group..."
sudo usermod -aG libvirt,kvm $USER
sudo usermod -aG libvirt $FLINT_USER 2>/dev/null || true

# Create flint user if not exists
if ! id "$FLINT_USER" &>/dev/null; then
    log_info "Creating flint user..."
    sudo useradd -m -s /bin/bash $FLINT_USER
    sudo usermod -aG libvirt,kvm $FLINT_USER
fi

# Create directories
log_info "Creating directories..."
sudo mkdir -p $FLINT_DIR
sudo mkdir -p /var/lib/flint/images
sudo mkdir -p /var/lib/flint/image-repository
sudo mkdir -p /home/$FLINT_USER/.flint

# Set ownership
sudo chown -R $FLINT_USER:$FLINT_USER $FLINT_DIR
sudo chown -R $FLINT_USER:libvirt /var/lib/flint
sudo chown -R $FLINT_USER:$FLINT_USER /home/$FLINT_USER/.flint

# Download and build Flint
log_info "Downloading Flint..."
cd /tmp
if [ ! -d "flint" ]; then
    git clone https://github.com/volantvm/flint.git
fi

cd flint
log_info "Building Flint..."
go build -o flint ./cmd/flint

# Install Flint
sudo cp flint $FLINT_DIR/
sudo chown $FLINT_USER:$FLINT_USER $FLINT_DIR/flint

# Create systemd service
log_info "Creating systemd service..."
sudo tee /etc/systemd/system/flint.service > /dev/null <<EOF
[Unit]
Description=Flint VPS Management Service
After=network.target libvirtd.service
Wants=libvirtd.service

[Service]
Type=simple
User=$FLINT_USER
Group=$FLINT_USER
WorkingDirectory=$FLINT_DIR
ExecStart=$FLINT_DIR/flint serve
Restart=always
RestartSec=5
Environment=HOME=/home/$FLINT_USER

[Install]
WantedBy=multi-user.target
EOF

# Create libvirt storage pools
log_info "Setting up libvirt storage pools..."
sudo -u $FLINT_USER virsh pool-list --all | grep -q "default" || {
    sudo -u $FLINT_USER virsh pool-define-as default dir --target /var/lib/libvirt/images
    sudo -u $FLINT_USER virsh pool-build default
    sudo -u $FLINT_USER virsh pool-start default
    sudo -u $FLINT_USER virsh pool-autostart default
}

sudo -u $FLINT_USER virsh pool-list --all | grep -q "flint-images" || {
    sudo -u $FLINT_USER virsh pool-define-as flint-images dir --target /var/lib/flint/images
    sudo -u $FLINT_USER virsh pool-build flint-images
    sudo -u $FLINT_USER virsh pool-start flint-images
    sudo -u $FLINT_USER virsh pool-autostart flint-images
}

# Download base Ubuntu image
log_info "Downloading Ubuntu 22.04 cloud image..."
sudo -u $FLINT_USER wget -O /var/lib/flint/images/ubuntu-22.04.qcow2 \
    https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img

# Create network bridge
log_info "Setting up network bridge..."
sudo -u $FLINT_USER virsh net-list --all | grep -q "flint-br0" || {
    sudo -u $FLINT_USER virsh net-define /dev/stdin <<EOF
<network>
  <name>flint-br0</name>
  <forward mode='nat'/>
  <bridge name='flint-br0' stp='on' delay='0'/>
  <ip address='192.168.100.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.100.100' end='192.168.100.200'/>
    </dhcp>
  </ip>
</network>
EOF
    sudo -u $FLINT_USER virsh net-autostart flint-br0
    sudo -u $FLINT_USER virsh net-start flint-br0
}

# Reload systemd and start Flint
log_info "Starting Flint service..."
sudo systemctl daemon-reload
sudo systemctl enable flint
sudo systemctl start flint

# Wait for Flint to start
log_info "Waiting for Flint to start..."
sleep 5

# Check if Flint is running
if sudo systemctl is-active --quiet flint; then
    log_success "Flint service is running"
else
    log_error "Flint service failed to start"
    sudo systemctl status flint
    exit 1
fi

# Get API key
log_info "Getting Flint API key..."
if [ -f "$API_KEY_FILE" ]; then
    API_KEY=$(sudo -u $FLINT_USER jq -r '.api_key' "$API_KEY_FILE")
    log_success "API key retrieved: ${API_KEY:0:20}..."
else
    log_warning "API key file not found, Flint will generate one on first run"
    API_KEY="flint_api_key_placeholder"
fi

# Test Flint API
log_info "Testing Flint API..."
sleep 2
API_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/flint_test.json \
    "http://localhost:$FLINT_PORT/api/host/status" \
    -H "Authorization: Bearer $API_KEY")

if [ "$API_RESPONSE" = "200" ]; then
    log_success "Flint API is responding correctly"
    log_info "Host status: $(sudo -u $FLINT_USER jq -r '.status' /tmp/flint_test.json)"
else
    log_warning "Flint API test failed (HTTP $API_RESPONSE), this is normal on first run"
fi

# Create environment file for integration service
log_info "Creating environment configuration..."
sudo -u $FLINT_USER tee /home/$FLINT_USER/.flint.env > /dev/null <<EOF
# Flint Configuration
FLINT_API_URL=http://localhost:$FLINT_PORT
FLINT_API_KEY=$API_KEY
FLINT_WEB_URL=http://localhost:$FLINT_PORT

# Network Configuration
FLINT_NETWORK=flint-br0
FLINT_STORAGE_POOL=flint-images

# Default VM Settings
DEFAULT_CPU_CORES=1
DEFAULT_MEMORY_MB=2048
DEFAULT_DISK_GB=20
DEFAULT_OS_IMAGE=ubuntu-22.04
EOF

# Set proper permissions
sudo chmod 600 /home/$FLINT_USER/.flint.env
sudo chown $FLINT_USER:$FLINT_USER /home/$FLINT_USER/.flint.env

log_success "Flint VPS Management Service setup completed!"
log_info "Service URL: http://localhost:$FLINT_PORT"
log_info "API Documentation: http://localhost:$FLINT_PORT/api"
log_info "Environment file: /home/$FLINT_USER/.flint.env"

# Display next steps
echo ""
echo "========================================"
echo "🎯 Flint Setup Complete!"
echo "========================================"
echo "Next steps:"
echo "1. Test Flint: curl http://localhost:$FLINT_PORT/api/host/status"
echo "2. Check logs: sudo journalctl -u flint -f"
echo "3. View web UI: http://localhost:$FLINT_PORT"
echo "4. API key location: $API_KEY_FILE"
echo ""
echo "Flint is ready for VPS management! 🚀"

# Clean up
rm -f /tmp/flint_test.json

exit 0