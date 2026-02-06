# 🚀 Complete VPS Hosting Platform Installation Guide

## 📋 What You're Getting

A **complete, production-ready VPS hosting platform** that includes:

✅ **Flint** - KVM virtualization management  
✅ **Paymenter** - Billing and user management system  
✅ **Custom Integration** - Bridge between Flint and Paymenter  
✅ **Automated Setup** - One-click installation script  
✅ **Business Ready** - Pricing, plans, and revenue model  

## 🎯 Quick Start (Recommended)

### Option 1: Automated Setup (Easiest)

```bash
# Clone the repository
git clone https://github.com/jitenkr2030/VPS-Hosting-Platform.git
cd VPS-Hosting-Platform

# Run the automated setup script
./setup-vps-platform.sh
```

**The automated script will:**
- ✅ Check system requirements
- ✅ Install and configure Flint
- ✅ Setup Paymenter with database
- ✅ Install VPS extension and UI
- ✅ Create admin user
- ✅ Generate startup scripts
- ✅ Provide configuration details

### Option 2: Manual Setup (Advanced)

If you prefer manual setup, follow the detailed steps below.

---

## 🔧 Manual Installation Steps

### 1. System Requirements

**Linux Server** (Ubuntu 20.04+, CentOS 8+, Debian 11+)
- **CPU**: 4+ cores recommended
- **RAM**: 8GB+ recommended  
- **Storage**: 100GB+ SSD
- **Network**: Static IP address

**Required Software:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y git curl wget php8.3 php8.3-fpm php8.3-mysql php8.3-xml php8.3-mbstring php8.3-curl php8.3-zip php8.3-bcmath php8.3-gd php8.3-intl composer nodejs npm mysql-server

# CentOS/RHEL
sudo dnf install -y git curl wget php php-fpm php-mysql php-xml php-mbstring php-curl php-zip php-bcmath php-gd php-intl composer nodejs npm mysql-server
```

**KVM Virtualization:**
```bash
# Ubuntu/Debian
sudo apt install -y qemu-kvm libvirt-daemon-system libvirt-daemon libvirt-clients bridge-utils
sudo systemctl enable --now libvirtd
sudo usermod -a -G libvirt $USER

# CentOS/RHEL  
sudo dnf install -y qemu-kvm libvirt libvirt-client virt-install
sudo systemctl enable --now libvirtd
sudo usermod -a -G libvirt $USER
```

### 2. Clone Repository

```bash
git clone https://github.com/jitenkr2030/VPS-Hosting-Platform.git
cd VPS-Hosting-Platform
git submodule update --init --recursive
```

### 3. Install Flint

```bash
cd flint
go build -o flint .
./flint --version

# Start Flint server
FLINT_PASSPHRASE="your-secure-password"
export FLINT_PASSPHRASE
./flint serve --passphrase "$FLINT_PASSPHRASE" &

# Get API key
FLINT_API_KEY=$(./flint api-key)
echo "Flint API Key: $FLINT_API_KEY"
```

### 4. Setup Paymenter

```bash
cd Paymenter

# Install dependencies
composer install --no-dev --optimize-autoloader
npm install
npm run build

# Setup environment
cp .env.example .env
php artisan key:generate

# Configure .env file
nano .env
```

**Environment Configuration:**
```env
APP_NAME="VPS Hosting Platform"
APP_URL=http://your-domain.com

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
MAIL_ENCRYPTION=tls

QUEUE_CONNECTION=database
```

### 5. Database Setup

```sql
CREATE DATABASE vps_platform;
CREATE USER 'vps_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON vps_platform.* TO 'vps_user'@'localhost';
FLUSH PRIVILEGES;
```

```bash
# Run migrations
php artisan migrate
php artisan db:seed
```

### 6. Install VPS Extension

```bash
# Copy VPS extension files
cp -r ../vps-platform/Paymenter/extensions/Servers/Flint extensions/Servers/
cp -r ../vps-platform/Paymenter/themes/default/views/services/vps.blade.php themes/default/views/services/
cp -r ../vps-platform/Paymenter/themes/default/views/admin/vps-dashboard.blade.php themes/default/views/admin/
cp -r ../vps-platform/Paymenter/app/Http/Controllers/Client/VpsController.php app/Http/Controllers/Client/
cp -r ../vps-platform/Paymenter/app/Jobs/Server/Vps* app/Jobs/Server/
cp -r ../vps-platform/Paymenter/app/Observers/VpsServiceObserver.php app/Observers/
cp ../vps-platform/Paymenter/routes/vps.php routes/

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

### 7. Create Admin User

```bash
php artisan tinker
```

```php
$user = new \App\Models\User();
$user->name = 'Admin User';
$user->email = 'admin@your-domain.com';
$user->password = \Hash::make('admin123');
$user->role = 'admin';
$user->email_verified_at = now();
$user->save();
exit;
```

### 8. Start Services

```bash
# Start Flint (in terminal 1)
cd /path/to/VPS-Hosting-Platform/flint
export FLINT_PASSPHRASE="your-secure-password"
nohup ./flint serve --passphrase "$FLINT_PASSPHRASE" &

# Start Paymenter (in terminal 2)
cd /path/to/VPS-Hosting-Platform/Paymenter
php artisan serve --host=0.0.0.0 --port=8000

# Start Queue Worker (in terminal 3)
cd /path/to/VPS-Hosting-Platform/Paymenter
php artisan queue:work --daemon
```

---

## ⚙️ Platform Configuration

### 1. Access Admin Panel

```
URL: http://your-domain.com:8000/admin
Email: admin@your-domain.com
Password: admin123
```

### 2. Configure Flint Extension

Navigate to: `Admin → Extensions → Servers → Create Server`

**Extension Settings:**
```
Extension Type: Flint
Name: Flint KVM Cluster
Flint API URL: http://localhost:5550
API Key: [Your Flint API Key]
Default OS Image: ubuntu-24.04
Default Network: default
Storage Pool: default
```

Click **Test Connection** - should show "Connection successful"

### 3. Create VPS Products

#### Starter VPS - ₹499/month
```
Admin → Products → Create Product

Basic Settings:
- Name: Starter VPS
- Description: Perfect for small websites and applications
- Category: VPS Hosting
- Server: Flint KVM Cluster

Pricing:
- Monthly: ₹499.00
- Quarterly: ₹1,447.00
- Setup Fee: ₹0.00

Server Configuration:
- CPU Cores: 1
- Memory: 2048 MB
- Disk Space: 40 GB
- OS Image: ubuntu-24.04
- Auto Start: Yes
- Enable SSH Keys: Yes
- Backups: No
```

#### Professional VPS - ₹999/month
```
Name: Professional VPS
Description: Ideal for growing businesses and developers
Pricing:
- Monthly: ₹999.00
- Quarterly: ₹2,897.00

Server Configuration:
- CPU Cores: 2
- Memory: 4096 MB
- Disk Space: 80 GB
- OS Image: ubuntu-24.04
- Auto Start: Yes
- Enable SSH Keys: Yes
- Backups: Yes
- Backup Frequency: weekly
```

#### Business VPS - ₹1999/month
```
Name: Business VPS
Description: High-performance VPS for demanding applications
Pricing:
- Monthly: ₹1,999.00
- Quarterly: ₹5,797.00

Server Configuration:
- CPU Cores: 4
- Memory: 8192 MB
- Disk Space: 160 GB
- OS Image: ubuntu-24.04
- Auto Start: Yes
- Enable SSH Keys: Yes
- Backups: Yes
- Backup Frequency: daily
```

### 4. Configure Payment Gateways

#### Razorpay (India)
```
Admin → Extensions → Gateways → Create Gateway

Gateway Type: Razorpay
Name: Razorpay
Key ID: rzp_live_xxxxxxxxxx
Key Secret: Your live secret key
Enabled: Yes
```

#### Stripe (International)
```
Gateway Type: Stripe
Name: Stripe
Publishable Key: pk_live_xxxxxxxxxx
Secret Key: sk_live_xxxxxxxxxx
Enabled: Yes
```

---

## 🌐 Production Deployment

### 1. Domain Setup

```bash
# Point your domain to server IP
# Configure DNS records:
# A record: @ -> YOUR_SERVER_IP
# A record: www -> YOUR_SERVER_IP
# A record: api -> YOUR_SERVER_IP
```

### 2. SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 3. Web Server Configuration

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    root /path/to/VPS-Hosting-Platform/Paymenter/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 4. Systemd Services

**Flint Service:**
```ini
# /etc/systemd/system/flint.service
[Unit]
Description=Flint VPS Management
After=network.target

[Service]
Type=simple
User=vps-user
WorkingDirectory=/home/vps-user/VPS-Hosting-Platform/flint
Environment="FLINT_PASSPHRASE=your-secure-password"
ExecStart=/home/vps-user/VPS-Hosting-Platform/flint/flint serve --passphrase $FLINT_PASSPHRASE
Restart=always

[Install]
WantedBy=multi-user.target
```

**Paymenter Queue Worker:**
```ini
# /etc/systemd/system/paymenter-queue.service
[Unit]
Description=Paymenter Queue Worker
After=network.target

[Service]
Type=simple
User=vps-user
WorkingDirectory=/home/vps-user/VPS-Hosting-Platform/Paymenter
ExecStart=/usr/bin/php artisan queue:work --daemon
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable services
sudo systemctl enable flint paymenter-queue
sudo systemctl start flint paymenter-queue
```

---

## 🎯 Launch Checklist

### Pre-Launch:
- [ ] Flint server installed and running
- [ ] Paymenter installed and configured
- [ ] VPS extension installed and tested
- [ ] All three VPS products created
- [ ] Payment gateways configured and tested
- [ ] Domain pointed and SSL configured
- [ ] Email settings configured
- [ ] Backup system implemented
- [ ] Monitoring and alerting setup

### Post-Launch:
- [ ] Test first customer signup and provisioning
- [ ] Verify payment processing
- [ ] Test suspension/termination workflows
- [ ] Monitor system performance
- [ ] Set up customer support
- [ ] Launch marketing campaign

---

## 🎉 Congratulations!

Your VPS hosting platform is now ready for production! You have:

✅ **Complete Infrastructure** - Flint + Paymenter + Custom Integration  
✅ **Business Ready** - Pricing, products, payment processing  
✅ **Automated Workflows** - Provisioning, suspension, termination  
✅ **Professional UI** - Customer dashboard + Admin panel  
✅ **Production Ready** - SSL, monitoring, backups  

**Your VPS hosting business can now serve customers and generate revenue! 🚀**

---

## 📞 Support

For issues and questions:
1. Check the troubleshooting section in `vps-platform/SETUP_GUIDE.md`
2. Review the Flint and Paymenter documentation
3. Open an issue in the GitHub repository

**Happy hosting! 🎯**