# VPS Hosting Platform - Complete Setup Guide

## 🎯 Platform Overview

You now have a **production-ready VPS hosting platform** that combines:
- **Flint** - KVM virtualization management
- **Paymenter** - Billing, user management, automation
- **Custom Integration** - Seamless VPS provisioning workflow

## 📊 VPS Plans Configuration

### Plan Structure
```
Starter VPS     → ₹499/month   (1 CPU, 2GB RAM, 40GB SSD)
Professional VPS → ₹999/month   (2 CPU, 4GB RAM, 80GB SSD)  
Business VPS    → ₹1999/month  (4 CPU, 8GB RAM, 160GB SSD)
```

### Setup Instructions

#### 1. Access Paymenter Admin Panel
```
URL: http://your-paymenter-domain.com/admin
Login: admin@example.com / admin123
```

#### 2. Configure Flint Server Extension
Navigate to: `Admin → Extensions → Servers → Create Server`

**Extension Configuration:**
```
Extension Type: Flint
Name: Flint KVM Cluster
Flint API URL: http://your-flint-server:5550
API Key: flint_xxxxxxxxxxxx (get from: flint api-key)
Default OS Image: ubuntu-24.04
Default Network: default
Storage Pool: default
```

**Test Connection** → Should show "Connection successful"

#### 3. Create VPS Products

## Starter VPS - ₹499/month
**Product Creation:**
```
Admin → Products → Create Product

Basic Settings:
- Name: Starter VPS
- Description: Perfect for small websites and applications
- Category: VPS Hosting
- Server: Flint KVM Cluster
- Welcome Email: VPS Welcome

Pricing:
- Monthly: ₹499.00
- Quarterly: ₹1,447.00 (3% discount)
- Annually: ₹5,389.00 (10% discount)
- Setup Fee: ₹0.00

Product Settings:
- Auto Activation: Yes
- Create Invoice: Yes
- Suspension Days: 3
- Termination Days: 14
```

**Server Configuration:**
```
CPU Cores: 1
Memory: 2048 MB
Disk Space: 40 GB
OS Image: ubuntu-24.04
Auto Start: Yes
Enable SSH Keys: Yes
Backups: No
```

## Professional VPS - ₹999/month
**Product Creation:**
```
Admin → Products → Create Product

Basic Settings:
- Name: Professional VPS
- Description: Ideal for growing businesses and developers
- Category: VPS Hosting
- Server: Flint KVM Cluster
- Welcome Email: VPS Welcome

Pricing:
- Monthly: ₹999.00
- Quarterly: ₹2,897.00 (3% discount)
- Annually: ₹10,789.00 (10% discount)
- Setup Fee: ₹0.00

Product Settings:
- Auto Activation: Yes
- Create Invoice: Yes
- Suspension Days: 3
- Termination Days: 14
```

**Server Configuration:**
```
CPU Cores: 2
Memory: 4096 MB
Disk Space: 80 GB
OS Image: ubuntu-24.04
Auto Start: Yes
Enable SSH Keys: Yes
Backups: Yes
Backup Frequency: weekly
```

## Business VPS - ₹1999/month
**Product Creation:**
```
Admin → Products → Create Product

Basic Settings:
- Name: Business VPS
- Description: High-performance VPS for demanding applications
- Category: VPS Hosting
- Server: Flint KVM Cluster
- Welcome Email: VPS Welcome

Pricing:
- Monthly: ₹1,999.00
- Quarterly: ₹5,797.00 (3% discount)
- Annually: ₹21,589.00 (10% discount)
- Setup Fee: ₹0.00

Product Settings:
- Auto Activation: Yes
- Create Invoice: Yes
- Suspension Days: 3
- Termination Days: 14
```

**Server Configuration:**
```
CPU Cores: 4
Memory: 8192 MB
Disk Space: 160 GB
OS Image: ubuntu-24.04
Auto Start: Yes
Enable SSH Keys: Yes
Backups: Yes
Backup Frequency: daily
```

#### 4. Configure Payment Gateways

## Razorpay Integration (Recommended for India)
```
Admin → Extensions → Gateways → Create Gateway

Gateway Type: Razorpay
Name: Razorpay
Key ID: rzp_test_xxxxxxxxxx
Key Secret: Your secret key
Webhook Secret: Your webhook secret
Enabled: Yes
```

## Stripe Integration (International)
```
Admin → Extensions → Gateways → Create Gateway

Gateway Type: Stripe
Name: Stripe
Publishable Key: pk_test_xxxxxxxxxx
Secret Key: sk_test_xxxxxxxxxx
Webhook Secret: whsec_xxxxxxxxxx
Enabled: Yes
```

#### 5. Configure Email Settings
```
Admin → Settings → Email

Mail Driver: SMTP
Mail Host: smtp.gmail.com
Mail Port: 587
Mail Username: your-email@gmail.com
Mail Password: your-app-password
Mail Encryption: TLS
From Address: noreply@your-vps-platform.com
From Name: VPS Hosting Platform
```

## 🔄 Automated Workflows Configuration

### 1. Service Observers Registration
Add to `app/Providers/AppServiceProvider.php`:

```php
public function boot()
{
    // Register VPS service observers
    Service::observe(VpsServiceObserver::class);
    Invoice::observe(VpsInvoiceObserver::class);
}
```

### 2. Queue Configuration
```bash
# Install queue worker
php artisan queue:table
php artisan migrate

# Start queue worker
php artisan queue:work --daemon
```

### 3. Schedule Automated Tasks
Add to `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    // Check for overdue services every hour
    $schedule->command('services:check-overdue')->hourly();
    
    // Process VPS backups daily
    $schedule->command('vps:process-backups')->daily();
    
    // Clean up old snapshots weekly
    $schedule->command('vps:cleanup-snapshots')->weekly();
}
```

## 🎨 Customer Experience

### Customer Dashboard Features:
- **Real-time VPS Status**: Running/Stopped with resource usage
- **Power Management**: Start/Stop/Restart controls
- **Console Access**: Direct VNC/SSH access to VPS
- **OS Management**: Reinstall with different operating systems
- **Backup Control**: Create/restore snapshots
- **IP Management**: View and copy IP addresses
- **Resource Monitoring**: CPU, RAM, disk usage graphs
- **Billing Management**: View invoices, upgrade plans

### User Journey:
1. **Signup** → Email verification
2. **Browse Plans** → Compare VPS options
3. **Select Plan** → Add to cart
4. **Checkout** → Payment via Razorpay/Stripe
5. **Provisioning** → Automatic VPS creation (2-3 minutes)
6. **Access** → Login to control panel
7. **Manage** → Full VPS control and monitoring

## 🛠️ Admin Dashboard Features

### VPS Management:
- **Overview**: All VPS instances with status
- **Resource Monitoring**: Host capacity and usage
- **Customer Management**: User accounts and services
- **Financial Reports**: Revenue, invoices, payments
- **Support System**: Ticket management
- **Automation Settings**: Suspension/termination rules

### Key Metrics:
- **Active VPS**: Total running instances
- **Resource Usage**: CPU, RAM, storage utilization
- **Monthly Revenue**: Recurring income tracking
- **Customer Growth**: New signups and churn
- **Support Tickets**: Response times and resolution

## 🔧 Advanced Configuration

### Multi-Node Setup
For scaling beyond single server:

1. **Add Multiple Flint Servers**:
```
Admin → Extensions → Servers → Create Server
- Name: Flint Node 2
- API URL: http://node2.your-domain.com:5550
- API Key: Node-specific API key
```

2. **Configure Load Balancing**:
```php
// In Flint extension, modify createServer method
$availableNodes = $this->getAvailableNodes();
$selectedNode = $this->selectBestNode($availableNodes, $resourceRequirements);
```

### Backup Strategy
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/backups/vps/$DATE"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup all VPS configurations
php artisan vps:backup-all --path=$BACKUP_DIR

# Upload to cloud storage
aws s3 sync $BACKUP_DIR s3://your-backup-bucket/vps/$DATE/

# Clean up old backups (keep 30 days)
find /backups/vps -type d -mtime +30 -exec rm -rf {} \;
```

### Monitoring Setup
```bash
# Install monitoring tools
npm install -g pm2
pm2 start "php artisan queue:work --daemon" --name vps-queue
pm2 start "php artisan schedule:work" --name vps-scheduler

# Monitor system resources
pm2 monit
```

## 📈 Business Operations

### Pricing Strategy Benefits:
- **Competitive**: ₹499 starter vs DigitalOcean $4 (₹333)
- **Premium Features**: Better support, local data centers
- **Flexible Plans**: Easy upgrades/downgrades
- **Transparent Billing**: No hidden charges

### Revenue Projections:
```
Month 1: 10 customers × ₹999 avg = ₹9,990
Month 6: 50 customers × ₹999 avg = ₹49,950  
Month 12: 200 customers × ₹999 avg = ₹199,800
Year 1 Revenue: ~₹12,00,000 (₹1L/month average)
```

### Target Markets:
- **Developers**: Need reliable testing environments
- **Small Businesses**: Cost-effective hosting solutions
- **Startups**: Scalable infrastructure
- **Students**: Affordable learning platforms
- **Agencies**: Multi-client hosting management

## 🚀 Launch Checklist

### Pre-Launch:
- [ ] Flint server installed and configured
- [ ] Paymenter installed with VPS extension
- [ ] All three VPS plans created
- [ ] Payment gateways configured and tested
- [ ] Email templates customized
- [ ] Domain and SSL certificates configured
- [ ] Backup systems implemented
- [ ] Monitoring and alerting setup

### Post-Launch:
- [ ] Monitor first 10 customer provisioning
- [ ] Test suspension/termination workflows
- [ ] Verify payment processing
- [ ] Check email deliverability
- [ ] Monitor system performance
- [ ] Gather customer feedback
- [ ] Optimize based on usage patterns

## 🎯 Success Metrics

### Technical KPIs:
- **Provisioning Time**: < 5 minutes
- **Uptime**: > 99.9%
- **Support Response**: < 2 hours
- **System Performance**: < 80% resource usage

### Business KPIs:
- **Customer Acquisition**: 20+ customers/month
- **Churn Rate**: < 5% monthly
- **Revenue Growth**: 25% quarterly
- **Customer Satisfaction**: > 4.5/5

---

## 🎉 Congratulations!

You now have a **complete, production-ready VPS hosting platform** that can compete with major providers like DigitalOcean and Hetzner, but with:

✅ **Lower Costs** - Self-hosted infrastructure  
✅ **Better Support** - Local, personalized service  
✅ **More Control** - Custom features and integrations  
✅ **Higher Margins** - No vendor fees  
✅ **Scalable Architecture** - Grow from 1 to 1000+ customers  

**Ready to launch your VPS hosting business! 🚀**