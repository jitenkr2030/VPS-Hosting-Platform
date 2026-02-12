#!/bin/bash

# Private Cloud-in-a-Box Chroot Setup Script
# This script configures the chroot environment for the ISO

set -e

# Configuration
PRIVATE_CLOUD_DIR="/opt/private-cloud"
SERVICE_USER="private-cloud"
WEB_USER="www-data"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[CHROOT] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[CHROOT WARNING] $1${NC}"
}

# Create service user
create_service_user() {
    log "Creating service user..."
    if ! id "$SERVICE_USER" &>/dev/null; then
        useradd -r -s /bin/false -d "$PRIVATE_CLOUD_DIR" "$SERVICE_USER"
    fi
}

# Setup directory structure
setup_directories() {
    log "Setting up directory structure..."
    
    mkdir -p "$PRIVATE_CLOUD_DIR"/{app,config,data,logs,backups,templates,scripts}
    mkdir -p "$PRIVATE_CLOUD_DIR"/data/{vms,images,iso,packages}
    mkdir -p "$PRIVATE_CLOUD_DIR"/config/{nginx,ssl,security}
    mkdir -p "$PRIVATE_CLOUD_DIR"/logs/{app,nginx,system}
    mkdir -p "/var/lib/libvirt/images"
    mkdir -p "/var/lib/libvirt/templates"
    mkdir -p "/opt/registry"
    mkdir -p "/opt/repository"
    mkdir -p "/opt/monitoring"
    
    # Set permissions
    chown -R "$SERVICE_USER:$SERVICE_USER" "$PRIVATE_CLOUD_DIR"
    chown -R libvirt-qemu:libvirt-qemu "/var/lib/libvirt"
    chown -R root:root "/opt/registry"
    chown -R root:root "/opt/repository"
    chown -R root:root "/opt/monitoring"
}

# Install Node.js application
install_application() {
    log "Installing Node.js application..."
    
    cd "$PRIVATE_CLOUD_DIR/app"
    
    # Install dependencies
    npm install --production
    
    # Build application
    npm run build
    
    # Setup PM2 configuration
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'private-cloud-dashboard',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/opt/private-cloud/app',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/opt/private-cloud/logs/app/dashboard-error.log',
      out_file: '/opt/private-cloud/logs/app/dashboard-out.log',
      log_file: '/opt/private-cloud/logs/app/dashboard-combined.log',
      time: true
    },
    {
      name: 'private-cloud-api',
      script: 'server.js',
      cwd: '/opt/private-cloud/app',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/opt/private-cloud/logs/app/api-error.log',
      out_file: '/opt/private-cloud/logs/app/api-out.log',
      log_file: '/opt/private-cloud/logs/app/api-combined.log',
      time: true
    }
  ]
};
EOF
    
    chown "$SERVICE_USER:$SERVICE_USER" ecosystem.config.js
}

# Setup Nginx configuration
setup_nginx() {
    log "Setting up Nginx configuration..."
    
    cat > /etc/nginx/sites-available/private-cloud << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;
    server_name _;
    
    # SSL Configuration
    ssl_certificate /opt/private-cloud/config/ssl/cert.pem;
    ssl_certificate_key /opt/private-cloud/config/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:;";
    
    # Dashboard
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # API
    location /api/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location /static/ {
        alias /opt/private-cloud/app/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Upload limits
    client_max_body_size 10G;
    
    # Logging
    access_log /opt/private-cloud/logs/nginx/access.log;
    error_log /opt/private-cloud/logs/nginx/error.log;
}
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/private-cloud /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    nginx -t
}

# Setup SSL certificates
setup_ssl() {
    log "Setting up SSL certificates..."
    
    mkdir -p "$PRIVATE_CLOUD_DIR/config/ssl"
    
    # Generate self-signed certificate (will be replaced by proper cert in production)
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$PRIVATE_CLOUD_DIR/config/ssl/key.pem" \
        -out "$PRIVATE_CLOUD_DIR/config/ssl/cert.pem" \
        -subj "/C=US/ST=State/L=City/O=Private Cloud/OU=IT/CN=localhost"
    
    chmod 600 "$PRIVATE_CLOUD_DIR/config/ssl/key.pem"
    chmod 644 "$PRIVATE_CLOUD_DIR/config/ssl/cert.pem"
}

# Setup system services
setup_services() {
    log "Setting up system services..."
    
    # Private Cloud Dashboard Service
    cat > /etc/systemd/system/private-cloud-dashboard.service << 'EOF'
[Unit]
Description=Private Cloud Dashboard
After=network.target

[Service]
Type=forking
User=private-cloud
WorkingDirectory=/opt/private-cloud/app
ExecStart=/usr/bin/pm2 start ecosystem.config.js --only private-cloud-dashboard
ExecReload=/usr/bin/pm2 reload private-cloud-dashboard
ExecStop=/usr/bin/pm2 stop private-cloud-dashboard
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Private Cloud API Service
    cat > /etc/systemd/system/private-cloud-api.service << 'EOF'
[Unit]
Description=Private Cloud API
After=network.target

[Service]
Type=forking
User=private-cloud
WorkingDirectory=/opt/private-cloud/app
ExecStart=/usr/bin/pm2 start ecosystem.config.js --only private-cloud-api
ExecReload=/usr/bin/pm2 reload private-cloud-api
ExecStop=/usr/bin/pm2 stop private-cloud-api
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Docker Registry Service
    cat > /etc/systemd/system/private-cloud-registry.service << 'EOF'
[Unit]
Description=Private Cloud Docker Registry
After=docker.service
Requires=docker.service

[Service]
Type=simple
ExecStart=/usr/bin/docker run -d --name private-registry \
    -p 5000:5000 \
    -v /opt/registry:/var/lib/registry \
    --restart=always \
    registry:2
ExecStop=/usr/bin/docker stop private-registry
ExecStopPost=/usr/bin/docker rm private-registry
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Enable services
    systemctl enable private-cloud-dashboard
    systemctl enable private-cloud-api
    systemctl enable private-cloud-registry
    systemctl enable nginx
    systemctl enable libvirtd
    systemctl enable docker
}

# Setup firewall
setup_firewall() {
    log "Setting up firewall rules..."
    
    # UFW configuration
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow 22/tcp
    
    # Allow web traffic
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow Docker registry
    ufw allow 5000/tcp
    
    # Allow libvirt
    ufw allow 16509/tcp
    
    # Allow VM console access
    ufw allow 5900:6000/tcp
    
    # Enable firewall
    ufw --force enable
}

# Setup database
setup_database() {
    log "Setting up database..."
    
    # Start MySQL
    systemctl start mysql
    systemctl enable mysql
    
    # Create database and user
    mysql -e "CREATE DATABASE private_cloud;"
    mysql -e "CREATE USER 'private_cloud'@'localhost' IDENTIFIED BY 'PrivateCloud123!';"
    mysql -e "GRANT ALL PRIVILEGES ON private_cloud.* TO 'private_cloud'@'localhost';"
    mysql -e "FLUSH PRIVILEGES;"
    
    # Start Redis
    systemctl start redis-server
    systemctl enable redis-server
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create Prometheus configuration
    mkdir -p /opt/monitoring/prometheus
    cat > /opt/monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'libvirt'
    static_configs:
      - targets: ['localhost:9177']

  - job_name: 'private-cloud-api'
    static_configs:
      - targets: ['localhost:3001']

  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - localhost:9093
EOF

    # Create Grafana configuration
    mkdir -p /opt/monitoring/grafana
    cat > /etc/grafana/grafana.ini << 'EOF'
[server]
http_port = 3001
domain = localhost
root_url = https://localhost/grafana/

[database]
type = mysql
host = 127.0.0.1:3306
name = grafana
user = grafana
password = Grafana123!

[security]
admin_user = admin
admin_password = PrivateCloud123!
secret_key = private-cloud-secret-key

[users]
allow_sign_up = false
auto_assign_org_role = Viewer

[auth.anonymous]
enabled = false
EOF

    # Start monitoring services
    systemctl start prometheus
    systemctl start grafana-server
    systemctl enable prometheus
    systemctl enable grafana-server
}

# Setup security hardening
setup_security() {
    log "Setting up security hardening..."
    
    # Disable root login
    sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
    
    # Disable password authentication
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
    
    # Configure fail2ban
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /opt/private-cloud/logs/nginx/error.log
maxretry = 3
EOF

    systemctl restart sshd
    systemctl enable fail2ban
    systemctl start fail2ban
}

# Main execution
main() {
    log "Starting Private Cloud-in-a-Box chroot setup..."
    
    create_service_user
    setup_directories
    install_application
    setup_nginx
    setup_ssl
    setup_services
    setup_firewall
    setup_database
    setup_monitoring
    setup_security
    
    log "Chroot setup completed successfully!"
}

# Run main function
main "$@"