#!/bin/bash

# =============================================================================
# Offline Package Repository Setup
# =============================================================================
# This script sets up a complete offline package repository for Private Cloud
# Includes Ubuntu packages, Docker images, and custom packages
# =============================================================================

set -e

# Configuration
REPO_BASE="/opt/private-cloud-repository"
MIRROR_BASE="${REPO_BASE}/ubuntu-mirror"
DOCKER_REGISTRY="${REPO_BASE}/docker-registry"
CUSTOM_PACKAGES="${REPO_BASE}/custom-packages"
LOG_FILE="/var/log/private-cloud-repo-setup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    echo "[ERROR] $1" >> "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
    echo "[WARNING] $1" >> "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
    echo "[INFO] $1" >> "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi
}

# Install required packages
install_dependencies() {
    log "Installing dependencies..."
    apt-get update
    apt-get install -y \
        apt-mirror \
        nginx \
        docker.io \
        docker-compose \
        apache2-utils \
        python3 \
        python3-pip \
        createrepo \
        dpkg-dev \
        reprepro \
        gpg \
        wget \
        curl \
        rsync
}

# Create directory structure
create_directories() {
    log "Creating repository directory structure..."
    mkdir -p "$REPO_BASE"/{ubuntu-mirror,docker-registry,custom-packages,documentation,vm-images}
    mkdir -p "$MIRROR_BASE"/{mirror,skel,var}
    mkdir -p "$DOCKER_REGISTRY"/{registry,data}
    mkdir -p "$CUSTOM_PACKAGES"/{deb,rpm,source}
}

# Setup Ubuntu mirror
setup_ubuntu_mirror() {
    log "Setting up Ubuntu package mirror..."
    
    # Create apt-mirror configuration
    cat > /etc/apt/mirror.list << 'EOF'
############# config ##################
#
set base_path    /opt/private-cloud-repository/ubuntu-mirror
#
# set mirror_path  $base_path/mirror
# set skel_path    $base_path/skel
# set var_path     $base_path/var
# set cleanscript $var_path/clean.sh
# set defaultarch  <running host architecture>
# set postmirror_script $var_path/postmirror.sh
# set run_postmirror 0
set nthreads     20
set _tilde 0
#
############# end config ##############

deb http://archive.ubuntu.com/ubuntu jammy main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu jammy-updates main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu jammy-backports main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu jammy-security main restricted universe multiverse

deb-src http://archive.ubuntu.com/ubuntu jammy main restricted universe multiverse
deb-src http://archive.ubuntu.com/ubuntu jammy-updates main restricted universe multiverse
deb-src http://archive.ubuntu.com/ubuntu jammy-backports main restricted universe multiverse
deb-src http://security.ubuntu.com/ubuntu jammy-security main restricted universe multiverse

# Private Cloud specific packages
deb http://packages.private-cloud.com stable main
deb-src http://packages.private-cloud.com stable main

clean http://archive.ubuntu.com/ubuntu
EOF

    # Run initial mirror sync (this will take a long time)
    log "Starting Ubuntu mirror synchronization (this may take several hours)..."
    apt-mirror || warning "Mirror sync completed with warnings"
    
    # Create clean script
    cat > /opt/private-cloud-repository/ubuntu-mirror/var/clean.sh << 'EOF'
#!/bin/bash
# Clean script for apt-mirror
rm -rf /opt/private-cloud-repository/ubuntu-mirror/mirror/archive.ubuntu.com/ubuntu/project
rm -rf /opt/private-cloud-repository/ubuntu-mirror/mirror/archive.ubuntu.com/ubuntu/dists
rm -rf /opt/private-cloud-repository/ubuntu-mirror/mirror/archive.ubuntu.com/ubuntu/indices
EOF
    chmod +x /opt/private-cloud-repository/ubuntu-mirror/var/clean.sh
}

# Setup Docker registry
setup_docker_registry() {
    log "Setting up Docker registry..."
    
    # Create docker-compose.yml for registry
    cat > "$DOCKER_REGISTRY/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  registry:
    image: registry:2
    container_name: private-cloud-registry
    restart: always
    ports:
      - "5000:5000"
    environment:
      REGISTRY_STORAGE_FILESYSTEM_ROOTDIRECTORY: /data
      REGISTRY_HTTP_ADDR: 0.0.0.0:5000
      REGISTRY_STORAGE_DELETE_ENABLED: true
      REGISTRY_AUTH: htpasswd
      REGISTRY_AUTH_HTPASSWD_REALM: Registry Realm
      REGISTRY_AUTH_HTPASSWD_PATH: /auth/htpasswd
    volumes:
      - ./data:/data
      - ./auth:/auth
    networks:
      - registry-network

  registry-ui:
    image: joxit/docker-registry-ui:main
    container_name: private-cloud-registry-ui
    restart: always
    ports:
      - "5001:80"
    environment:
      SINGLE_REGISTRY: true
      REGISTRY_TITLE: Private Cloud Docker Registry
      DELETE_IMAGES: true
      SHOW_CONTENT_DIGEST: true
      NGINX_PROXY_PASS_URL: http://registry:5000
      SHOW_CATALOG_NB_TAGS: true
      CATALOG_MIN_BRANCHES: 1
      CATALOG_MAX_BRANCHES: 1
      TAGLIST_PAGE_SIZE: 100
      REGISTRY_SECURED: false
      CATALOG_ELEMENTS_LIMIT: 1000
    depends_on:
      - registry
    networks:
      - registry-network

networks:
  registry-network:
    driver: bridge
EOF

    # Create auth directory and htpasswd file
    mkdir -p "$DOCKER_REGISTRY/auth"
    echo "admin:$(openssl passwd -apr1 privatecloud)" > "$DOCKER_REGISTRY/auth/htpasswd"
    
    # Start registry
    cd "$DOCKER_REGISTRY"
    docker-compose up -d
    
    # Pull and cache essential images
    log "Pulling and caching essential Docker images..."
    ESSENTIAL_IMAGES=(
        "ubuntu:22.04"
        "nginx:alpine"
        "postgres:14"
        "redis:alpine"
        "node:18-alpine"
        "python:3.9-alpine"
        "registry:2"
        "prom/prometheus:latest"
        "grafana/grafana:latest"
        "elasticsearch:8.5.0"
        "kibana:8.5.0"
    )
    
    for image in "${ESSENTIAL_IMAGES[@]}"; do
        log "Pulling $image..."
        docker pull "$image"
        docker tag "$image" "localhost:5000/$image"
        docker push "localhost:5000/$image"
    done
    
    cd - > /dev/null
}

# Setup custom package repository
setup_custom_repo() {
    log "Setting up custom package repository..."
    
    # Create GPG key for signing packages
    gpg --batch --gen-key << EOF
Key-Type: RSA
Key-Length: 4096
Subkey-Type: RSA
Subkey-Length: 4096
Name-Real: Private Cloud Repository
Name-Email: repo@private-cloud.local
Expire-Date: 0
%no-protection
EOF
    
    # Export public key
    gpg --armor --export "Private Cloud Repository" > "$CUSTOM_PACKAGES/private-cloud-repo.gpg"
    
    # Create repository configuration
    mkdir -p "$CUSTOM_PACKAGES/deb/conf"
    cat > "$CUSTOM_PACKAGES/deb/conf/distributions" << EOF
Origin: Private Cloud
Label: Private Cloud Repository
Suite: stable
Codename: jammy
Architectures: amd64 arm64
Components: main
Description: Custom packages for Private Cloud-in-a-Box
SignWith: $(gpg --list-secret-keys --keyid-format LONG | grep sec | awk '{print $2}' | cut -d'/' -f2)
EOF
    
    # Create sample custom package
    mkdir -p "$CUSTOM_PACKAGES/deb/sample-package"
    cat > "$CUSTOM_PACKAGES/deb/sample-package/sample-package.sh" << 'EOF'
#!/bin/bash
# Sample Private Cloud package
echo "Private Cloud Package installed successfully"
echo "This is a sample package for the offline repository"
EOF
    chmod +x "$CUSTOM_PACKAGES/deb/sample-package/sample-package.sh"
    
    # Create DEBIAN control files
    mkdir -p "$CUSTOM_PACKAGES/deb/sample-package/DEBIAN"
    cat > "$CUSTOM_PACKAGES/deb/sample-package/DEBIAN/control" << EOF
Package: private-cloud-sample
Version: 1.0.0
Section: admin
Priority: optional
Architecture: amd64
Depends: bash
Maintainer: Private Cloud Team <admin@private-cloud.local>
Description: Sample Private Cloud Package
 This is a sample package to demonstrate the custom
 package repository functionality for Private Cloud-in-a-Box.
EOF
    
    # Build the package
    cd "$CUSTOM_PACKAGES/deb"
    dpkg-deb --build sample-package
    reprepro includedeb stable sample-package.deb
    cd - > /dev/null
}

# Setup VM image repository
setup_vm_images() {
    log "Setting up VM image repository..."
    
    # Create cloud-init images directory
    mkdir -p "$REPO_BASE/vm-images"/{ubuntu,debian,centos,custom}
    
    # Download base cloud images (these would normally be pre-downloaded)
    cat > "$REPO_BASE/vm-images/download-images.sh" << 'EOF'
#!/bin/bash
# Download base cloud images for offline use

IMAGES_DIR="/opt/private-cloud-repository/vm-images"

# Ubuntu images
wget -O "$IMAGES_DIR/ubuntu/jammy-server-cloudimg-amd64.img" \
    https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img

# Debian images
wget -O "$IMAGES_DIR/debian/debian-12-genericcloud-amd64.qcow2" \
    https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-genericcloud-amd64.qcow2

# Create custom images with Private Cloud optimizations
echo "Creating optimized VM images..."
# Custom image creation scripts would go here
EOF
    chmod +x "$REPO_BASE/vm-images/download-images.sh"
}

# Setup documentation server
setup_documentation() {
    log "Setting up offline documentation..."
    
    # Create documentation structure
    mkdir -p "$REPO_BASE/documentation"/{api,user-guide,admin-guide,troubleshooting}
    
    # Create index page
    cat > "$REPO_BASE/documentation/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Private Cloud Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .nav { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .nav ul { list-style: none; padding: 0; }
        .nav li { margin: 10px 0; }
        .nav a { text-decoration: none; color: #0066cc; }
        .nav a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Private Cloud-in-a-Box Documentation</h1>
        <p>Complete offline documentation for your private cloud infrastructure</p>
    </div>
    
    <div class="nav">
        <h2>Documentation Sections</h2>
        <ul>
            <li><a href="user-guide/index.html">User Guide</a> - End-user documentation</li>
            <li><a href="admin-guide/index.html">Administrator Guide</a> - System administration</li>
            <li><a href="api/index.html">API Documentation</a> - REST API reference</li>
            <li><a href="troubleshooting/index.html">Troubleshooting</a> - Common issues and solutions</li>
        </ul>
    </div>
    
    <div class="content">
        <h2>Quick Start</h2>
        <p>Welcome to Private Cloud-in-a-Box! This offline documentation provides everything you need to manage your private cloud infrastructure.</p>
        
        <h3>Getting Started</h3>
        <ol>
            <li>Review the <a href="user-guide/index.html">User Guide</a> for basic operations</li>
            <li>Consult the <a href="admin-guide/index.html">Administrator Guide</a> for system management</li>
            <li>Use the <a href="api/index.html">API Documentation</a> for automation</li>
            <li>Check <a href="troubleshooting/index.html">Troubleshooting</a> if you encounter issues</li>
        </ol>
    </div>
</body>
</html>
EOF
    
    # Create sample documentation files
    for section in user-guide admin-guide api troubleshooting; do
        echo "<h1>$section</h1><p>Documentation for $section will be available here.</p>" > "$REPO_BASE/documentation/$section/index.html"
    done
}

# Setup Nginx for serving repositories
setup_nginx() {
    log "Setting up Nginx for repository serving..."
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/private-cloud-repo << 'EOF'
server {
    listen 80;
    server_name repo.private-cloud.local;
    
    # Ubuntu mirror
    location /ubuntu/ {
        alias /opt/private-cloud-repository/ubuntu-mirror/mirror/archive.ubuntu.com/ubuntu/;
        autoindex on;
    }
    
    # Custom packages
    location /custom/ {
        alias /opt/private-cloud-repository/custom-packages/deb/;
        autoindex on;
    }
    
    # Docker registry (proxy)
    location /docker/ {
        proxy_pass http://localhost:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Documentation
    location /docs/ {
        alias /opt/private-cloud-repository/documentation/;
        autoindex on;
        index index.html;
    }
    
    # VM images
    location /images/ {
        alias /opt/private-cloud-repository/vm-images/;
        autoindex on;
    }
    
    # Repository index
    location / {
        root /opt/private-cloud-repository;
        index index.html;
        try_files $uri $uri/ =404;
    }
}
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/private-cloud-repo /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
}

# Create repository management scripts
create_management_scripts() {
    log "Creating repository management scripts..."
    
    # Update script
    cat > "$REPO_BASE/update-repo.sh" << 'EOF'
#!/bin/bash
# Repository update script

REPO_BASE="/opt/private-cloud-repository"
LOG_FILE="/var/log/private-cloud-repo-update.log"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting repository update..."

# Update Ubuntu mirror
log "Updating Ubuntu mirror..."
apt-mirror

# Update Docker images
log "Updating Docker images..."
cd /opt/private-cloud-repository/docker-registry
docker-compose pull
cd - > /dev/null

# Update custom packages
log "Updating custom packages..."
cd /opt/private-cloud-repository/custom-packages/deb
reprepro update
cd - > /dev/null

log "Repository update completed."
EOF
    chmod +x "$REPO_BASE/update-repo.sh"
    
    # Sync script for online environments
    cat > "$REPO_BASE/sync-repo.sh" << 'EOF'
#!/bin/bash
# Sync repository for online environments

REMOTE_REPO="https://repo.private-cloud.com"
LOCAL_REPO="/opt/private-cloud-repository"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting repository synchronization..."

# Sync Ubuntu packages
rsync -avz "$REMOTE_REPO/ubuntu/" "$LOCAL_REPO/ubuntu-mirror/mirror/archive.ubuntu.com/ubuntu/"

# Sync Docker images
docker pull "$REMOTE_REPO/docker/private-cloud-registry:latest"

# Sync custom packages
rsync -avz "$REMOTE_REPO/custom/" "$LOCAL_REPO/custom-packages/deb/"

log "Repository synchronization completed."
EOF
    chmod +x "$REPO_BASE/sync-repo.sh"
}

# Setup automatic updates
setup_cron_jobs() {
    log "Setting up automatic update cron jobs..."
    
    # Add cron jobs for repository maintenance
    cat > /etc/cron.d/private-cloud-repo << EOF
# Private Cloud Repository Maintenance
# Update Ubuntu mirror daily at 2 AM
0 2 * * * root /usr/bin/apt-mirror >> /var/log/apt-mirror.log 2>&1

# Update Docker images weekly on Sunday at 3 AM
0 3 * * 0 root /usr/bin/docker-compose -f /opt/private-cloud-repository/docker-registry/docker-compose.yml pull >> /var/log/docker-registry-update.log 2>&1

# Clean old packages weekly on Sunday at 4 AM
0 4 * * 0 root /opt/private-cloud-repository/ubuntu-mirror/var/clean.sh >> /var/log/repo-cleanup.log 2>&1

# Repository health check daily at 6 AM
0 6 * * * root /opt/private-cloud-repo/health-check.sh >> /var/log/repo-health.log 2>&1
EOF
    
    # Create health check script
    cat > "$REPO_BASE/health-check.sh" << 'EOF'
#!/bin/bash
# Repository health check

REPO_BASE="/opt/private-cloud-repository"
LOG_FILE="/var/log/repo-health.log"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Check Ubuntu mirror
if [ -d "$REPO_BASE/ubuntu-mirror/mirror/archive.ubuntu.com/ubuntu" ]; then
    log "Ubuntu mirror: OK"
else
    log "Ubuntu mirror: ERROR"
fi

# Check Docker registry
if docker ps | grep -q private-cloud-registry; then
    log "Docker registry: OK"
else
    log "Docker registry: ERROR"
fi

# Check Nginx
if systemctl is-active --quiet nginx; then
    log "Nginx: OK"
else
    log "Nginx: ERROR"
fi

# Check disk space
DISK_USAGE=$(df "$REPO_BASE" | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 90 ]; then
    log "Disk space: OK ($DISK_USAGE% used)"
else
    log "Disk space: WARNING ($DISK_USAGE% used)"
fi
EOF
    chmod +x "$REPO_BASE/health-check.sh"
}

# Create repository information
create_repo_info() {
    log "Creating repository information..."
    
    cat > "$REPO_BASE/README.md" << EOF
# Private Cloud Offline Repository

This directory contains the complete offline package repository for Private Cloud-in-a-Box.

## Directory Structure

- \`ubuntu-mirror/\` - Ubuntu package mirror
- \`docker-registry/\` - Docker image registry
- \`custom-packages/\` - Custom Private Cloud packages
- \`documentation/\` - Offline documentation
- \`vm-images/\` - VM image templates

## Access URLs

- Ubuntu Repository: http://repo.private-cloud.local/ubuntu/
- Custom Packages: http://repo.private-cloud.local/custom/
- Docker Registry: http://repo.private-cloud.local:5000/
- Documentation: http://repo.private-cloud.local/docs/
- VM Images: http://repo.private-cloud.local/images/

## Management Scripts

- \`update-repo.sh\` - Update all repositories
- \`sync-repo.sh\` - Sync from remote repository
- \`health-check.sh\` - Check repository health

## Automatic Updates

Cron jobs are configured for:
- Daily Ubuntu mirror updates (2 AM)
- Weekly Docker image updates (Sunday 3 AM)
- Weekly cleanup (Sunday 4 AM)
- Daily health checks (6 AM)

## GPG Key

The repository GPG key is available at:
\`custom-packages/private-cloud-repo.gpg\`

Import with:
\`sudo apt-key add custom-packages/private-cloud-repo.gpg\`

## Usage

### Add Ubuntu Repository
\`echo "deb http://repo.private-cloud.local/ubuntu/ jammy main restricted universe multiverse" | sudo tee /etc/apt/sources.list.d/private-cloud.list\`

### Add Custom Repository
\`echo "deb [arch=amd64] http://repo.private-cloud.local/custom/ stable main" | sudo tee /etc/apt/sources.list.d/private-cloud-custom.list\`

### Configure Docker
\`echo '{"insecure-registries":["repo.private-cloud.local:5000"]}' | sudo tee /etc/docker/daemon.json\`

Last updated: $(date)
EOF
}

# Main function
main() {
    log "Starting Private Cloud offline repository setup..."
    
    check_root
    install_dependencies
    create_directories
    setup_ubuntu_mirror
    setup_docker_registry
    setup_custom_repo
    setup_vm_images
    setup_documentation
    setup_nginx
    create_management_scripts
    setup_cron_jobs
    create_repo_info
    
    log "Offline repository setup completed successfully!"
    log "Repository is available at: http://repo.private-cloud.local"
    log "Documentation: http://repo.private-cloud.local/docs"
    log "Docker Registry: http://repo.private-cloud.local:5000"
    
    # Display repository information
    echo ""
    echo "=== Repository Information ==="
    echo "Base Directory: $REPO_BASE"
    echo "Ubuntu Mirror: $MIRROR_BASE"
    echo "Docker Registry: $DOCKER_REGISTRY"
    echo "Custom Packages: $CUSTOM_PACKAGES"
    echo ""
    echo "=== Access URLs ==="
    echo "Main Repository: http://repo.private-cloud.local"
    echo "Ubuntu Packages: http://repo.private-cloud.local/ubuntu/"
    echo "Custom Packages: http://repo.private-cloud.local/custom/"
    echo "Docker Registry: http://repo.private-cloud.local:5000/"
    echo "Documentation: http://repo.private-cloud.local/docs/"
    echo "VM Images: http://repo.private-cloud.local/images/"
    echo ""
    echo "=== Next Steps ==="
    echo "1. Add 'repo.private-cloud.local' to your DNS or /etc/hosts"
    echo "2. Import the GPG key: apt-key add $CUSTOM_PACKAGES/private-cloud-repo.gpg"
    echo "3. Configure clients to use the repository URLs"
    echo "4. Test repository access with a web browser"
}

# Run main function
main "$@"