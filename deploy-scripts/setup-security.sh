#!/bin/bash

# Production Security Setup Script
# Implements comprehensive security with SSL, firewall, and hardening

set -e

echo "🔒 Setting up Production Security Infrastructure..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SECURITY_DIR="/opt/security"
SSL_DIR="/etc/ssl/vps-platform"
FIREWALL_DIR="/etc/ufw"
LOG_DIR="/var/log/security"

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

# Create security directories
log_info "Creating security directories..."
sudo mkdir -p $SECURITY_DIR/{ssl,firewall,audit,backup}
sudo mkdir -p $SSL_DIR/{private,certs,csr}
sudo mkdir -p $LOG_DIR
sudo mkdir -p /var/log/audit

# Set proper permissions
sudo chmod 700 $SSL_DIR/private
sudo chmod 755 $SSL_DIR/{certs,csr}
sudo chown -R root:root $SECURITY_DIR
sudo chown -R root:adm $LOG_DIR

# Install security tools
log_info "Installing security tools..."
sudo apt-get update
sudo apt-get install -y \
    ufw \
    fail2ban \
    logwatch \
    rkhunter \
    chkrootkit \
    lynis \
    auditd \
    apparmor-profiles \
    openssl \
    certbot \
    python3-certbot-nginx

# Configure UFW Firewall
log_info "Configuring UFW firewall..."

# Reset UFW to default state
sudo ufw --force reset

# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw default deny forwarded

# Allow essential services
sudo ufw allow ssh/tcp
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 3000/tcp # Dashboard
sudo ufw allow 3002/tcp # Integration API
sudo ufw allow 5550/tcp # Flint API
sudo ufw allow 8000/tcp # Paymenter
sudo ufw allow 9090/tcp # Prometheus
sudo ufw allow 3001/tcp # Grafana
sudo ufw allow 9093/tcp # AlertManager

# Allow monitoring network
sudo ufw allow from 192.168.100.0/24  # Flint VPS network

# Enable UFW
sudo ufw --force enable

# Configure Fail2Ban
log_info "Configuring Fail2Ban..."

# Create Fail2Ban configuration
sudo tee /etc/fail2ban/jail.local > /dev/null <<'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
backend = systemd
usedns = warn
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5
bantime = 3600

[php-fpm]
enabled = true
port = 9000
logpath = /var/log/php8.2-fpm.log
maxretry = 3
bantime = 3600

[mysql]
enabled = true
port = 3306
logpath = /var/log/mysql/error.log
maxretry = 3
bantime = 3600

[recidive]
enabled = true
logpath = /var/log/mail.log
banaction = sendmail-whois
bantime = 86400
findtime = 21600
maxretry = 5
EOF

# Create custom jail for VPS platform
sudo tee /etc/fail2ban/jail.d/vps-platform.conf > /dev/null <<'EOF'
[vps-api]
enabled = true
port = 3002,5550,8000
logpath = /var/log/vps-integration/*.log
maxretry = 5
bantime = 1800
filter = vps-api

[flint-api]
enabled = true
port = 5550
logpath = /var/log/flint/*.log
maxretry = 5
bantime = 1800
filter = flint-api

[paymenter-api]
enabled = true
port = 8000
logpath = /opt/paymenter/storage/logs/laravel.log
maxretry = 5
bantime = 1800
filter = paymenter-api
EOF

# Create filter definitions
sudo tee /etc/fail2ban/filter.d/vps-api.conf > /dev/null <<'EOF'
[Definition]
failregex = ^.*ERROR.*"client_ip":"<HOST>"*
ignoreregex =
EOF

sudo tee /etc/fail2ban/filter.d/flint-api.conf > /dev/null <<'EOF'
[Definition]
failregex = ^.*error.*client.*<HOST>.*
ignoreregex =
EOF

sudo tee /etc/fail2ban/filter.d/paymenter-api.conf > /dev/null <<'EOF'
[Definition]
failregex = ^.*\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\].*ERROR.*<HOST>.*
ignoreregex =
EOF

# Restart Fail2Ban
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban

# Generate SSL Certificates with Let's Encrypt
log_info "Setting up SSL certificates..."

# Create self-signed certificate for development (replace with Let's Encrypt in production)
log_info "Creating self-signed SSL certificate for development..."

# Generate private key
sudo openssl genrsa -out $SSL_DIR/private/vps-platform.key 4096

# Generate certificate signing request
sudo openssl req -new -key $SSL_DIR/private/vps-platform.key \
    -out $SSL_DIR/csr/vps-platform.csr \
    -subj "/C=IN/ST=Maharashtra/L=Mumbai/O=Pro VPS Hosting/CN=provps.com" \
    -days 365

# Generate self-signed certificate
sudo openssl x509 -req -in $SSL_DIR/csr/vps-platform.csr \
    -signkey $SSL_DIR/private/vps-platform.key \
    -out $SSL_DIR/certs/vps-platform.crt \
    -days 365 \
    -extensions v3_req \
    -extfile <(cat /etc/ssl/openssl.cnf <(printf "[v3_req]\nsubjectAltName=@DNS:localhost,DNS:provps.com,DNS:www.provps.com\nkeyUsage = keyEncipherment, dataEncipherment\nextendedKeyUsage = serverAuth"))

# Generate DH parameters for perfect forward secrecy
sudo openssl dhparam -out $SSL_DIR/certs/dhparam.pem 2048

# Set proper permissions
sudo chmod 600 $SSL_DIR/private/vps-platform.key
sudo chmod 644 $SSL_DIR/certs/vps-platform.crt
sudo chmod 644 $SSL_DIR/certs/dhparam.pem
sudo chown root:root $SSL_DIR/private/vps-platform.key
sudo chown root:root $SSL_DIR/certs/vps-platform.crt
sudo chown root:root $SSL_DIR/certs/dhparam.pem

# Configure Nginx for SSL
log_info "Configuring Nginx for SSL..."

# Create SSL configuration snippet
sudo tee /etc/nginx/snippets/ssl-vps-platform.conf > /dev/null <<'EOF'
ssl_certificate /etc/ssl/vps-platform/certs/vps-platform.crt;
ssl_certificate_key /etc/ssl/vps-platform/private/vps-platform.key;
ssl_dhparam /etc/ssl/vps-platform/certs/dhparam.pem;

ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;

ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# HSTS (uncomment to enable)
# add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

# Other security headers
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
EOF

# Create security headers configuration
sudo tee /etc/nginx/snippets/security-headers.conf > /dev/null <<'EOF'
# Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
EOF

# Configure Auditd
log_info "Configuring system auditing..."

# Create audit rules for VPS platform
sudo tee /etc/audit/rules.d/vps-platform.rules > /dev/null <<'EOF'
# Monitor VPS platform directories
-w /opt/vps-integration/ -p wa -k vps-platform
-w /opt/flint/ -p wa -k vps-platform
-w /opt/paymenter/ -p wa -k vps-platform
-w /opt/monitoring/ -p wa -k vps-platform

# Monitor SSL certificates
-w /etc/ssl/vps-platform/ -p wa -k vps-platform

# Monitor system authentication
-w /etc/passwd -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/group -p wa -k identity

# Monitor sudo usage
-w /var/log/auth.log -p wa -k sudo
-w /var/log/secure -p wa -k sudo

# Monitor network configuration
-w /etc/hosts -p wa -k network
-w /etc/resolv.conf -p wa -k network

# Monitor cron jobs
-w /etc/cron.* -p wa -k cron
-w /var/log/cron.log -p wa -k cron

# Monitor log files
-w /var/log/vps-integration/ -p wa -k logs
-w /var/log/flint/ -p wa -k logs
-w /var/log/nginx/ -p wa -k logs

# Monitor system calls for security
-a always,exit -F arch=b64 -S execve -k exec
-a always,exit -F arch=b64 -S socketcall -k socket
-a always,exit -F arch=b64 -S connect -k network
-a always,exit -F arch=b64 -S bind -k network
EOF

# Restart auditd
sudo systemctl restart auditd
sudo systemctl enable auditd

# Configure Logwatch
log_info "Configuring log monitoring..."

# Create Logwatch configuration
sudo tee /etc/logwatch/conf/logwatch.conf > /dev/null <<'EOF
LogDir = /var/log
TmpDir = /var/cache/logwatch
MailTo = admin@provps.com
MailFrom = logwatch@provps.com
Range = yesterday
Detail = High
Service = All
Format = html
Encode = base64
EOF

# Create service-specific logwatch configurations
sudo tee /etc/logwatch/conf/services/vps-platform.conf > /dev/null <<'EOF
##########################################################################
# VPS Platform Services
##########################################################################

# Integration Service
LogFile = /var/log/vps-integration/*.log
Archive = /var/log/vps-integration/*-*.log.gz
*ExpandRepeats
*ApplyStdDate
*OnlyHost
*RemoveHeaders

# Flint Service
LogFile = /var/log/flint/*.log
Archive = /var/log/flint/*-*.log.gz
*ExpandRepeats
*ApplyStdDate
*OnlyHost

# Paymenter Service
LogFile = /opt/paymenter/storage/logs/laravel.log
Archive = /opt/paymenter/storage/logs/laravel-*.log.gz
*ExpandRepeats
*ApplyStdDate
*OnlyHost

# Nginx
LogFile = /var/log/nginx/access.log
LogFile = /var/log/nginx/error.log
Archive = /var/log/nginx/*-*.log.gz
*ExpandRepeats
*ApplyStdDate
EOF

# Configure System Hardening
log_info "Implementing system hardening..."

# Secure shared memory
sudo tee /etc/fstab > /dev/null <<'EOF'
# /etc/fstab: static file system information.
#
# Use 'blkid' to print the universally unique identifier for a
# device; this may be used with UUID= as a more robust way to name
# devices that works even if disks are added and removed. See fstab(5).
#
# <file system> <mount point>   <type>  <options>  <dump>  <pass>
UUID=$(blkid -s UUID -o value /dev/sda1) /               ext4    errors=remount-ro 0       1
/proc                 /proc           proc    defaults        0       0
/sysfs                /sys            sysfs    defaults        0       0
/dev/pts              /dev/pts        devpts   defaults        0       0
tmpfs                 /tmp            tmpfs    defaults,nosuid,nodev,noexec 0       0
/dev/sda2             /home           ext4    defaults        0       2
tmpfs                 /run            tmpfs    nosuid,nodev,noexec,mode=755 0       0
tmpfs                 /dev/shm        tmpfs    nosuid,nodev,noexec 0       0
EOF

# Disable core dumps
echo "* hard core 0" | sudo tee -a /etc/security/limits.conf > /dev/null
echo "* soft core 0" | sudo tee -a /etc/security/limits.conf > /dev/null

# Configure sysctl security parameters
sudo tee /etc/sysctl.d/99-vps-security.conf > /dev/null <<'EOF'
# Network Security
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# TCP/IP Hardening
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5
net.ipv4.tcp_max_orphans = 32768
net.ipv4.tcp_time_wait = 30
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 1200
net.ipv4.tcp_keepalive_probes = 9
net.ipv4.tcp_keepalive_intvl = 15

# IP Spoofing protection
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# ICMP rate limiting
net.ipv4.icmp_ratelimit = 100
net.ipv4.icmp_ratemask = 255

# File System Security
fs.file-max = 65535
fs.inotify.max_user_watches = 524288

# Kernel Security
kernel.dmesg_restrict = 1
kernel.kptr_restrict = 2
kernel.perf_event_paranoid = 2
kernel.kexec_load_disabled = 1
kernel.apparmor_restrict_unprivileged_userns = 1
EOF

# Apply sysctl settings
sudo sysctl -p /etc/sysctl.d/99-vps-security.conf

# Create security monitoring script
log_info "Creating security monitoring script..."

sudo tee /usr/local/bin/security-monitor > /dev/null <<'EOF'
#!/bin/bash

echo "🔒 VPS Platform Security Monitor"
echo "=================================="
echo ""

# Function to check security status
check_security() {
    local service="$1"
    local status="$2"
    
    if [ "$status" = "active" ] || [ "$status" = "enabled" ]; then
        echo "  ✅ $service: $status"
        return 0
    else
        echo "  ❌ $service: $status"
        return 1
    fi
}

# Check firewall status
echo "🛡️  Firewall Status:"
ufw_status=$(sudo ufw status | head -1)
check_security "UFW Firewall" "$ufw_status"
echo ""

# Check Fail2Ban status
echo "🚫 Fail2Ban Status:"
fail2ban_status=$(sudo systemctl is-active fail2ban)
check_security "Fail2Ban" "$fail2ban_status"
echo ""

# Check SSL certificates
echo "🔐 SSL Certificate Status:"
if [ -f /etc/ssl/vps-platform/certs/vps-platform.crt ]; then
    cert_enddate=$(openssl x509 -in /etc/ssl/vps-platform/certs/vps-platform.crt -noout -enddate | cut -d= -f2)
    cert_days=$(( ($(date -d "$cert_enddate" +%s) - $(date +%s)) / 86400 ))
    
    if [ $cert_days -gt 30 ]; then
        echo "  ✅ SSL Certificate: Valid ($cert_days days remaining)"
    elif [ $cert_days -gt 7 ]; then
        echo "  ⚠️  SSL Certificate: Expiring soon ($cert_days days remaining)"
    else
        echo "  ❌ SSL Certificate: Expiring soon ($cert_days days remaining)"
    fi
else
    echo "  ❌ SSL Certificate: Not found"
fi
echo ""

# Check auditd status
echo "📋 Audit System Status:"
auditd_status=$(sudo systemctl is-active auditd)
check_security "Auditd" "$auditd_status"
echo ""

# Check recent security events
echo "🚨 Recent Security Events (last hour):"
if [ -d /var/log/audit ]; then
    sudo ausearch -k identity -ts recent -m avc | head -5 | while read line; do
        echo "  $line"
    done
else
    echo "  No audit logs available"
fi
echo ""

# Check failed login attempts
echo "🔑 Failed Login Attempts (last 24h):"
failed_logins=$(sudo journalctl _SYSTEMD_UNIT=sshd.service --since "24 hours ago" | grep "Failed password" | wc -l)
if [ "$failed_logins" -gt 0 ]; then
    echo "  ⚠️  $failed_logins failed login attempts"
    sudo journalctl _SYSTEMD_UNIT=sshd.service --since "24 hours ago" | grep "Failed password" | tail -3
else
    echo "  ✅ No failed login attempts"
fi
echo ""

# Check system updates
echo "📦 System Updates:"
updates=$(sudo apt list --upgradable 2>/dev/null | grep -v "WARNING" | wc -l)
if [ "$updates" -gt 0 ]; then
    echo "  ⚠️  $updates packages available for update"
    echo "  Run: sudo apt update && sudo apt upgrade"
else
    echo "  ✅ System is up to date"
fi
echo ""

# Check open ports
echo "🌐 Open Ports:"
ss -tuln | grep LISTEN | head -10
echo ""

# Check disk usage
echo "💾 Disk Usage:"
df -h | grep -E "(Filesystem|/dev/)" | head -5
echo ""

# Check memory usage
echo "🧠 Memory Usage:"
free -h
echo ""

# Check load average
echo "⚡ System Load:"
uptime
echo ""

# Check Fail2Ban banned IPs
echo "🚫 Banned IPs (Fail2Ban):"
if [ -f /var/log/fail2ban.log ]; then
    sudo grep "Ban " /var/log/fail2ban.log | tail -5 | while read line; do
        echo "  $line"
    done
else
    echo "  No banned IPs"
fi
echo ""

echo "🔍 Security scan recommendations:"
echo "  1. Run: sudo rkhunter --check --sk"
echo "  2. Run: sudo lynis audit system"
echo "  3. Run: sudo chkrootkit"
echo "  4. Review: sudo cat /var/log/auth.log | grep Failed"
echo "  5. Monitor: sudo tail -f /var/log/audit/audit.log"
echo ""

exit 0
EOF

sudo chmod +x /usr/local/bin/security-monitor

# Create backup script for security configurations
log_info "Creating security backup script..."

sudo tee /usr/local/bin/backup-security > /dev/null <<'EOF'
#!/bin/bash

BACKUP_DIR="/opt/security/backup/\$(date +%Y%m%d_%H%M%S)"
CONFIG_DIR="/etc"

echo "🔒 Backing up security configurations..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup firewall rules
echo "  Backing up firewall rules..."
sudo ufw status verbose > "$BACKUP_DIR/ufw-rules.txt"
sudo cp /etc/ufw/*.rules "$BACKUP_DIR/ufw-rules/" 2>/dev/null || true

# Backup Fail2Ban configuration
echo "  Backing up Fail2Ban configuration..."
sudo cp -r /etc/fail2ban "$BACKUP_DIR/"

# Backup SSL certificates
echo "  Backing up SSL certificates..."
sudo cp -r /etc/ssl/vps-platform "$BACKUP_DIR/ssl-certs/"

# Backup audit rules
echo "  Backing up audit rules..."
sudo cp -r /etc/audit/rules.d "$BACKUP_DIR/audit-rules/"
sudo cp /etc/audit/auditd.conf "$BACKUP_DIR/"

# Backup sysctl security settings
echo "  Backing up sysctl security settings..."
sudo cp /etc/sysctl.d/99-vps-security.conf "$BACKUP_DIR/"

# Backup security limits
echo "  Backing up security limits..."
sudo cp /etc/security/limits.conf "$BACKUP_DIR/"

# Backup logwatch configuration
echo "  Backing up logwatch configuration..."
sudo cp -r /etc/logwatch "$BACKUP_DIR/logwatch/"

# Create backup index
echo "Creating backup index..."
cat > "$BACKUP_DIR/backup-index.txt" <<EOF
VPS Platform Security Backup
Date: $(date)
Hostname: $(hostname)
Backup Directory: $BACKUP_DIR

Contents:
- ufw-rules.txt: UFW firewall configuration
- fail2ban/: Fail2Ban configuration and jail rules
- ssl-certs/: SSL certificates and keys
- audit-rules/: Auditd rules and configuration
- 99-vps-security.conf: Sysctl security parameters
- limits.conf: System security limits
- logwatch/: Logwatch configuration

Restore Commands:
sudo ufw --force reset
sudo ufw --force enable
sudo cp -r $BACKUP_DIR/ufw-rules/* /etc/ufw/
sudo cp -r $BACKUP_DIR/fail2ban/* /etc/fail2ban/
sudo cp -r $BACKUP_DIR/ssl-certs/* /etc/ssl/vps-platform/
sudo cp -r $BACKUP_DIR/audit-rules/* /etc/audit/rules.d/
sudo cp $BACKUP_DIR/audit-rules/auditd.conf /etc/audit/
sudo cp $BACKUP_DIR/99-vps-security.conf /etc/sysctl.d/
sudo cp $BACKUP_DIR/limits.conf /etc/security/
sudo cp -r $BACKUP_DIR/logwatch/* /etc/logwatch/
sudo sysctl -p /etc/sysctl.d/99-vps-security.conf
sudo systemctl restart auditd fail2ban ufw
EOF

# Compress backup
echo "Compressing backup..."
cd $(dirname "$BACKUP_DIR")
tar -czf "$(basename "$BACKUP_DIR").tar.gz" "$(basename "$BACKUP_DIR")"
rm -rf "$BACKUP_DIR"

echo "✅ Security backup completed!"
echo "Backup file: $(dirname "$BACKUP_DIR")/$(basename "$BACKUP_DIR").tar.gz"
echo "Index file saved in backup archive"

exit 0
EOF

sudo chmod +x /usr/local/bin/backup-security

# Create security check script
sudo tee /usr/local/bin/security-check > /dev/null <<'EOF'
#!/bin/bash

echo "🔍 VPS Platform Security Check"
echo "=============================="
echo ""

# Run Rootkit Hunter
echo "🔍 Running Rootkit Hunter..."
sudo rkhunter --check --skip-keypress --report-warnings-only > /tmp/rkhunter.log 2>&1
echo "Rootkit Hunter results saved to /tmp/rkhunter.log"
echo ""

# Run Lynis security audit
echo "🔍 Running Lynis security audit..."
sudo lynis audit system --quick --report-file /tmp/lynis-report.txt > /tmp/lynis.log 2>&1
echo "Lynis report saved to /tmp/lynis-report.txt"
echo ""

# Run Chkrootkit
echo "🔍 Running Chkrootkit..."
sudo chkrootkit > /tmp/chkrootkit.log 2>&1
echo "Chkrootkit results saved to /tmp/chkrootkit.log"
echo ""

# Check for suspicious files
echo "🔍 Checking for suspicious files..."
echo "SUID/SGID files:"
sudo find / -type f \( -perm -4000 -o -perm -2000 \) -ls | head -10
echo ""
echo "World-writable files:"
sudo find / -type f -perm -002 -ls | head -10
echo ""

# Check user accounts
echo "🔍 Checking user accounts..."
echo "Users with UID 0 (root):"
sudo awk -F: '$3 == "0" {print $1}' /etc/passwd
echo ""
echo "Users with empty passwords:"
sudo awk -F: '($2 == "" || $2 == "!") {print $1}' /etc/shadow 2>/dev/null || echo "None found"
echo ""

# Check network configuration
echo "🔍 Checking network configuration..."
echo "Listening ports:"
sudo netstat -tuln | grep LISTEN
echo ""
echo "Network interfaces:"
ip addr show
echo ""

# Check running services
echo "🔍 Checking running services..."
systemctl list-units --type=service --state=running | head -10
echo ""

# Check cron jobs
echo "🔍 Checking cron jobs..."
sudo crontab -l 2>/dev/null || echo "No root crontab"
sudo cat /etc/crontab | grep -v "^#" | grep -v "^$"
echo ""

echo "✅ Security check completed!"
echo "Detailed reports saved in /tmp/"
echo "  - /tmp/rkhunter.log (Rootkit Hunter)"
echo "  - /tmp/lynis-report.txt (Lynis audit)"
echo "  - /tmp/chkrootkit.log (Chkrootkit)"

exit 0
EOF

sudo chmod +x /usr/local/bin/security-check

# Restart services to apply security configurations
log_info "Restarting services to apply security configurations..."
sudo systemctl restart ufw fail2ban auditd nginx

log_success "Production security infrastructure setup completed!"
log_info "Security features implemented:"
log_info "  🔥 UFW Firewall with configured rules"
log_info "  🚫 Fail2Ban with custom VPS platform jails"
log_info "  🔐 SSL certificates with strong encryption"
log_info "  📋 System auditing with auditd"
log_info "  📊 Log monitoring with logwatch"
log_info "  🛡️ System hardening with sysctl parameters"
log_info "  🔍 Security monitoring and scanning tools"
log_info ""
log_info "Security management scripts:"
log_info "  /usr/local/bin/security-monitor - Real-time security status"
log_info "  /usr/local/bin/security-check - Comprehensive security scan"
log_info "  /usr/local/bin/backup-security - Backup security configurations"
log_info ""
log_info "Next steps:"
log_info "  1. Run security check: sudo /usr/local/bin/security-check"
log_info "  2. Monitor security: sudo /usr/local/bin/security-monitor"
log_info "  3. Set up log rotation for security logs"
log_info "  4. Configure email/SMS alerts for security events"
log_info "  5. Regular security updates and patches"

exit 0