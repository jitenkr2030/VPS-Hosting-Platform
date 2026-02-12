# 🚀 VPS Platform Deployment Guide

## 📋 **Phase 1: Deploy Core Services - COMPLETE**

This guide walks you through deploying a fully functional VPS hosting platform with real VPS management, billing, and user management.

### **🎯 What You'll Have After Deployment:**

✅ **Real VPS Hosting**: Users can actually create and manage VPS instances  
✅ **Automated Billing**: Payment processing with instant VPS provisioning  
✅ **Free Trials**: 30-day free trials with automatic upgrade prompts  
✅ **Real-time Dashboard**: Live VPS status and performance monitoring  
✅ **Complete User Journey**: From signup to paying customer  

---

## 🛠️ **Prerequisites**

### **System Requirements:**
- **OS**: Ubuntu 20.04+ or Debian 11+
- **CPU**: 4+ cores (for virtualization)
- **RAM**: 8GB+ (for VPS hosting)
- **Storage**: 100GB+ SSD
- **Network**: Static IP address

### **Software Dependencies:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install basic tools
sudo apt install -y curl wget git vim htop
```

---

## 📦 **Deployment Steps**

### **Step 1: Deploy Flint VPS Management Service**

Flint is the core VPS management engine that creates and manages virtual machines.

```bash
# Make setup script executable
chmod +x deploy-scripts/setup-flint.sh

# Run Flint setup
./deploy-scripts/setup-flint.sh
```

**What this does:**
- Installs KVM virtualization
- Builds and deploys Flint service
- Sets up libvirt storage pools
- Creates network bridge for VPS networking
- Downloads Ubuntu cloud image
- Starts Flint service on port 5550

**Verify Flint:**
```bash
# Check service status
sudo systemctl status flint

# Test API
curl http://localhost:5550/api/host/status

# View web UI
# Open http://localhost:5550 in browser
```

### **Step 2: Deploy Paymenter Billing System**

Paymenter handles user management, billing, and order processing.

```bash
# Make setup script executable
chmod +x deploy-scripts/setup-paymenter.sh

# Run Paymenter setup
./deploy-scripts/setup-paymenter.sh
```

**What this does:**
- Installs PHP, MySQL, Nginx, Redis
- Deploys Paymenter application
- Sets up MySQL database
- Configures Nginx web server
- Creates admin user and API token
- Starts queue workers and cron jobs

**Verify Paymenter:**
```bash
# Check service status
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status mysql
sudo systemctl status paymenter-queue

# Test web interface
curl http://localhost:8000

# Admin login: admin@provps.com / admin123456
```

### **Step 3: Deploy Integration Service**

The integration service connects Flint, Paymenter, and the dashboard.

```bash
# Make setup script executable
chmod +x deploy-scripts/setup-integration.sh

# Run integration setup
./deploy-scripts/setup-integration.sh
```

**What this does:**
- Installs Node.js and MongoDB
- Deploys integration API service
- Configures connections to Flint and Paymenter
- Sets up real-time WebSocket communication
- Creates systemd service and monitoring

**Verify Integration Service:**
```bash
# Check service status
sudo systemctl status vps-integration

# Test API
curl http://localhost:3002/api/health

# Check all services
/usr/local/bin/check-vps-services
```

### **Step 4: Test Complete Workflow**

Run the end-to-end test to verify everything works together.

```bash
# Make test script executable
chmod +x deploy-scripts/test-vps-platform.sh

# Run complete test suite
./deploy-scripts/test-vps-platform.sh
```

**Expected Results:**
- ✅ All services healthy and communicating
- ✅ User registration works
- ✅ Free VPS creation works
- ✅ Real-time updates work
- ✅ Payment processing works
- ✅ Complete user journey functional

---

## 🔧 **Service Configuration**

### **Flint Configuration:**
```bash
# Location: /home/flint/.flint/config.json
# Contains: API key, server settings, security config

# View API key
sudo -u flint jq -r '.api_key' /home/flint/.flint/config.json

# Restart service
sudo systemctl restart flint
```

### **Paymenter Configuration:**
```bash
# Location: /opt/paymenter/.env
# Contains: Database config, app settings, security keys

# View admin credentials
sudo -u paymenter grep -E "ADMIN_EMAIL|ADMIN_PASS" /home/paymenter/.paymenter.env

# Restart services
sudo systemctl restart nginx php8.2-fpm mysql paymenter-queue
```

### **Integration Service Configuration:**
```bash
# Location: /opt/vps-integration/.env
# Contains: API keys, database URLs, JWT secrets

# View configuration
sudo -u vps-integration cat /opt/vps-integration/.env

# Restart service
sudo systemctl restart vps-integration
```

---

## 🌐 **Access Points**

### **User-Facing Services:**
- **Landing Page**: http://localhost:3000
- **User Dashboard**: http://localhost:3000/dashboard
- **Admin Panel**: http://localhost:3000/admin

### **API Services:**
- **Integration API**: http://localhost:3002/api
- **Flint API**: http://localhost:5550/api
- **Paymenter API**: http://localhost:8000/api

### **Admin Interfaces:**
- **Flint Web UI**: http://localhost:5550
- **Paymenter Admin**: http://localhost:8000/admin
- **Integration Health**: http://localhost:3002/api/health

---

## 🔍 **Monitoring & Troubleshooting**

### **Check All Services:**
```bash
# Quick status check
/usr/local/bin/check-vps-services

# Detailed service status
sudo systemctl status flint paymenter-queue vps-integration nginx php8.2-fpm mysql
```

### **View Logs:**
```bash
# Flint logs
sudo journalctl -u flint -f

# Paymenter logs
sudo journalctl -u paymenter-queue -f
sudo tail -f /opt/paymenter/storage/logs/laravel.log

# Integration service logs
sudo journalctl -u vps-integration -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### **Common Issues:**

#### **Flint Issues:**
```bash
# Check KVM support
kvm-ok

# Check libvirt
sudo virsh list --all

# Restart libvirt
sudo systemctl restart libvirtd
```

#### **Paymenter Issues:**
```bash
# Check database connection
mysql -u paymenter -p paymenter_db

# Clear cache
sudo -u paymenter php /opt/paymenter/artisan config:clear
sudo -u paymenter php /opt/paymenter/artisan route:clear
```

#### **Integration Issues:**
```bash
# Check MongoDB
sudo systemctl status mongod

# Test API connections
curl http://localhost:3002/api/health
```

---

## 🚀 **First User Journey**

### **1. Access the Platform:**
```
Landing Page: http://localhost:3000
Click "Get Started" → "Sign Up"
```

### **2. Create Free Account:**
```
Email: test@example.com
Password: TestPass123!
First Name: Test
Last Name: User
```

### **3. Create Free VPS:**
```
Dashboard → "Create Server"
Select "Free VPS" plan
Server Name: my-first-vps
Click "Create Server"
```

### **4. Manage Your VPS:**
```
Wait 2-3 minutes for provisioning
View VPS status and IP address
Start/stop/restart VPS
Access console
Monitor resources
```

### **5. Upgrade to Paid Plan:**
```
Dashboard → "Billing" → "Upgrade"
Select "Starter" plan (₹499/month)
Process payment
VPS automatically upgraded
```

---

## 📊 **Business Verification**

### **Test Complete User Journey:**
```bash
# Run automated test
./deploy-scripts/test-vps-platform.sh

# Expected results:
# ✅ User registration: Working
# ✅ Free VPS creation: Working  
# ✅ Real-time management: Working
# ✅ Payment processing: Working
# ✅ Plan upgrades: Working
```

### **Verify Revenue Generation:**
1. **Free Trials**: Users can start without payment
2. **Conversion**: 20-30% should upgrade to paid plans
3. **Automation**: Payment → VPS provisioning works automatically
4. **Scaling**: System handles multiple users simultaneously

---

## 🎯 **Success Criteria**

### **✅ Platform is Ready When:**
- [ ] All services running without errors
- [ ] Users can sign up and get authenticated
- [ ] Free VPS creation works (actual VMs created)
- [ ] Real-time dashboard shows live VPS status
- [ ] Payment processing triggers VPS provisioning
- [ ] Complete test suite passes
- [ ] Monitoring and logging working

### **🚀 Business is Ready When:**
- [ ] First user can complete entire journey
- [ ] Free trials convert to paid plans
- [ ] Revenue generation workflow functional
- [ ] Support tickets can be created and managed
- [ ] System can handle 10+ concurrent users
- [ ] Performance monitoring shows healthy metrics

---

## 🔄 **Maintenance Tasks**

### **Daily:**
```bash
# Check service health
/usr/local/bin/check-vps-services

# Monitor logs for errors
sudo journalctl -u vps-integration --since "1 hour ago" | grep ERROR
```

### **Weekly:**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Backup databases
sudo mysqldump -u paymenter -p paymenter > /backup/paymenter-$(date +%Y%m%d).sql
```

### **Monthly:**
```bash
# Clean up old logs
sudo journalctl --vacuum-time=30d

# Update application dependencies
cd /opt/paymenter && sudo -u paymenter composer update
cd /opt/vps-integration && sudo -u vps-integration npm update
```

---

## 🎉 **Deployment Complete!**

Your VPS hosting platform is now **fully functional** and ready for commercial use!

### **What You Have:**
- **Real VPS hosting** with KVM virtualization
- **Automated billing** with multiple payment gateways
- **Free trial system** with conversion optimization
- **Real-time management** with live updates
- **Complete user journey** from signup to revenue

### **Next Steps:**
1. **Configure payment gateways** in Paymenter admin
2. **Set up domain and SSL** for production
3. **Monitor performance** and scale as needed
4. **Add customer support** systems
5. **Launch marketing** to acquire first customers

**🚀 Your VPS hosting business is ready to launch!**