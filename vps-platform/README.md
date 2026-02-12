# VPS Hosting Platform Setup Guide

## 🏗️ Architecture Overview

This platform combines **Flint** (KVM management) with **Paymenter** (billing system) to create a complete VPS hosting solution similar to DigitalOcean/Hetzner.

### Components:
- **Flint**: VM lifecycle management (create, start, stop, delete VMs)
- **Paymenter**: User management, billing, plans, automation
- **Flint Extension**: Bridge between Paymenter and Flint APIs

---

## 📋 VPS Plans Configuration

### Plan Tiers (Indian Pricing)

#### 0. Free VPS - ₹0/month (30 days trial)
- **CPU**: 0.5 vCore (shared)
- **RAM**: 512 MB DDR4
- **Storage**: 10 GB SSD
- **Bandwidth**: 500 GB/month
- **OS**: Ubuntu 22.04 LTS (fixed)
- **Features**: 
  - 1 Snapshot (manual)
  - Basic monitoring
  - Community support (forum)
  - Full root access
  - 30 days trial period
  - Auto-suspend if not upgraded

#### 1. Starter VPS - ₹499/month
- **CPU**: 1 vCore
- **RAM**: 2 GB DDR4
- **Storage**: 40 GB SSD
- **Bandwidth**: 2 TB/month
- **OS**: Ubuntu/Debian/CentOS
- **Features**: 
  - 1 Snapshot
  - Basic monitoring
  - Email support

#### 2. Professional VPS - ₹999/month  
- **CPU**: 2 vCores
- **RAM**: 4 GB DDR4
- **Storage**: 80 GB SSD
- **Bandwidth**: 4 TB/month
- **OS**: Ubuntu/Debian/CentOS/Fedora
- **Features**:
  - 3 Snapshots
  - Advanced monitoring
  - Priority support
  - Free backups

#### 3. Business VPS - ₹1,999/month
- **CPU**: 4 vCores
- **RAM**: 8 GB DDR4
- **Storage**: 160 GB SSD
- **Bandwidth**: 8 TB/month
- **OS**: All available OS
- **Features**:
  - Unlimited snapshots
  - Premium monitoring
  - 24/7 support
  - Daily backups
  - DDoS protection

---

## 🚀 Installation Steps

### 1. Flint Server Setup

```bash
# Install Flint on your KVM host
curl -fsSL https://raw.githubusercontent.com/volantvm/flint/main/install.sh | bash

# Start Flint server
flint serve --passphrase "your-secure-password"

# Get API key
flint api-key
```

### 2. Paymenter Setup

```bash
# Clone Paymenter with our VPS extension
git clone https://github.com/Paymenter/Paymenter.git
cp -r vps-platform/Paymenter/extensions/Servers/Flint Paymenter/extensions/Servers/

# Install dependencies
cd Paymenter
composer install
npm install
npm run build

# Configure database
php artisan migrate
php artisan db:seed

# Create admin user
php artisan user:create --email=admin@example.com --password=admin123 --role=admin
```

### 3. Configure Flint Extension in Paymenter

1. **Access Admin Panel**: Go to `/admin` and login
2. **Navigate**: Extensions → Servers → Create Server
3. **Select Extension**: Choose "Flint"
4. **Configure**:
   ```
   Flint API URL: http://your-flint-server:5550
   API Key: flint_xxxxxxxxxxxx (from step 1)
   Default OS Image: ubuntu-24.04
   Default Network: default
   Storage Pool: default
   ```

### 4. Create VPS Products

#### Free VPS Product:
```
Name: Free VPS
Description: Perfect for trying our platform - no credit card required
Price: ₹0
Setup Fee: ₹0
Billing Cycle: Monthly (30 days trial)

Server Settings:
- CPU Cores: 0.5 (shared)
- Memory: 512 MB
- Disk: 10 GB
- OS Image: ubuntu-22.04
- Auto Start: Yes
- SSH Keys: Yes
- Backups: No
- Trial Period: 30 days
- Auto-suspend: Yes
```

#### Starter VPS Product:
```
Name: Starter VPS
Description: Perfect for small websites and applications
Price: ₹499
Setup Fee: ₹0
Billing Cycle: Monthly

Server Settings:
- CPU Cores: 1
- Memory: 2048 MB
- Disk: 40 GB
- OS Image: ubuntu-24.04
- Auto Start: Yes
- SSH Keys: Yes
- Backups: No
```

#### Professional VPS Product:
```
Name: Professional VPS  
Description: Ideal for growing businesses and developers
Price: ₹999
Setup Fee: ₹0
Billing Cycle: Monthly

Server Settings:
- CPU Cores: 2
- Memory: 4096 MB
- Disk: 80 GB
- OS Image: ubuntu-24.04
- Auto Start: Yes
- SSH Keys: Yes
- Backups: Yes
- Backup Frequency: weekly
```

#### Business VPS Product:
```
Name: Business VPS
Description: High-performance VPS for demanding applications
Price: ₹1999
Setup Fee: ₹0
Billing Cycle: Monthly

Server Settings:
- CPU Cores: 4
- Memory: 8192 MB
- Disk: 160 GB
- OS Image: ubuntu-24.04
- Auto Start: Yes
- SSH Keys: Yes
- Backups: Yes
- Backup Frequency: daily
```

---

## 🔄 Automated Workflows

### Provisioning Flow:
1. **User selects plan** → Paymenter checkout
2. **Payment completed** → Invoice marked paid
3. **Service activated** → Flint extension called
4. **VM created** → Resources allocated in KVM
5. **User notified** → Login details sent

### Suspension Flow:
1. **Payment failed** → Invoice overdue
2. **Grace period** → 3 days warning
3. **Service suspended** → VM stopped via Flint
4. **User notified** → Suspension email

### Termination Flow:
1. **Payment failed** → 14 days after suspension
2. **Backup created** → Final snapshot
3. **VM terminated** → Resources freed
4. **User notified** → Termination confirmation

---

## 🎯 User Experience

### Customer Dashboard:
- **VPS Status**: Real-time status (Running/Stopped)
- **Resource Usage**: CPU, RAM, Disk graphs
- **IP Management**: View/copy IP addresses
- **Power Controls**: Start/Stop/Restart VM
- **Console Access**: Direct VNC/SSH console
- **OS Reinstall**: Rebuild with different OS
- **Snapshots**: Create/restore backups
- **Billing**: View invoices, upgrade plans

### Admin Dashboard:
- **VPS Overview**: All VMs and their status
- **Resource Monitoring**: Host usage metrics
- **Customer Management**: User accounts and services
- **Financial Reports**: Revenue and billing analytics
- **Support Tickets**: Customer help requests

---

## 🔧 Configuration Files

### Flint Configuration (`~/.flint/config.json`):
```json
{
  "libvirt": {
    "uri": "qemu:///system"
  },
  "server": {
    "port": 5550,
    "web_passphrase_hash": "sha256_hash"
  }
}
```

### Paymenter Environment (`.env`):
```env
APP_NAME="VPS Hosting"
APP_URL=https://your-vps-platform.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vps_platform
DB_USERNAME=vps_user
DB_PASSWORD=secure_password

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

---

## 📊 Monitoring & Logging

### Flint Metrics:
- VM status and resource usage
- Host health and capacity
- Network and storage I/O
- API request logs

### Paymenter Metrics:
- User registrations and subscriptions
- Revenue and payment tracking
- Service provisioning status
- Support ticket metrics

### Integration Logs:
- VM creation/deletion events
- Payment processing status
- Suspension/termination actions
- API communication errors

---

## 🛡️ Security Considerations

### Network Security:
- **Firewall**: Restrict Flint API to Paymenter IP only
- **SSL/TLS**: Use HTTPS for all connections
- **API Keys**: Rotate Flint API keys regularly
- **Network Isolation**: Separate management and customer networks

### Application Security:
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent API abuse
- **Authentication**: Strong password policies
- **Audit Logging**: Track all administrative actions

---

## 📈 Scaling Architecture

### Single Server Setup:
```
┌─────────────────┐    ┌─────────────────┐
│   Paymenter     │    │     Flint       │
│   (Port 80/443) │◄──►│   (Port 5550)  │
│                 │    │                 │
│ • User Management│    │ • VM Management │
│ • Billing       │    │ • KVM/Libvirt   │
│ • Automation    │    │ • Resource Mgmt │
└─────────────────┘    └─────────────────┘
```

### Multi-Node Setup:
```
┌─────────────────┐
│   Paymenter     │
│   (Load Balanced)│
└─────────┬───────┘
          │
    ┌─────┴─────┐
    │           │
┌───▼───┐   ┌───▼───┐
│Flint 1│   │Flint 2│   ┌───▼───┐
│Node 1 │   │Node 2 │...│Flint N │
│       │   │       │   │Node N │
└───────┘   └───────┘   └───────┘
```

---

## 💰 Pricing Strategy

### Competitive Analysis:
- **DigitalOcean**: Starts at $4/month (₹333)
- **Vultr**: Starts at $3.50/month (₹291)  
- **Linode**: Starts at $5/month (₹416)
- **Our Pricing**: Starts at ₹499/month ($6)

### Value Proposition:
- ✅ **Local Support**: India-based customer service
- ✅ **Flexible Plans**: More customization options
- ✅ **Simple Billing**: No hidden charges
- ✅ **Fast Setup**: Instant provisioning
- ✅ **Data Privacy**: Self-hosted, no vendor lock-in

---

## 🎯 Next Steps

1. **Deploy Infrastructure**: Set up Flint and Paymenter servers
2. **Configure Integration**: Install and configure Flint extension
3. **Create Products**: Set up VPS plans and pricing
4. **Test Workflows**: Verify provisioning, billing, suspension
5. **Launch Marketing**: Prepare website and promotional materials
6. **Monitor Performance**: Set up monitoring and alerting
7. **Scale Operations**: Add more nodes as customer base grows

---

## 📞 Support & Maintenance

### Regular Tasks:
- **Daily**: Monitor system health and backups
- **Weekly**: Review resource usage and capacity
- **Monthly**: Update software and security patches
- **Quarterly**: Performance optimization and planning

### Emergency Procedures:
- **VM Failure**: Restore from latest snapshot
- **Host Failure**: Migrate VMs to backup host
- **Network Issues**: Switch to backup connectivity
- **Security Breach**: Isolate affected systems

This complete VPS hosting platform is now ready for production deployment! 🚀