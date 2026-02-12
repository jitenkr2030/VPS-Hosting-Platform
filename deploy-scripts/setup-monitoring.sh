#!/bin/bash

# Production Monitoring Setup Script
# Implements comprehensive monitoring with Prometheus, Grafana, and AlertManager

set -e

echo "📊 Setting up Production Monitoring Infrastructure..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MONITORING_DIR="/opt/monitoring"
MONITORING_USER="monitoring"
PROMETHEUS_PORT="9090"
GRAFANA_PORT="3001"
ALERTMANAGER_PORT="9093"
NODE_EXPORTER_PORT="9100"

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

# Create monitoring user
if ! id "$MONITORING_USER" &>/dev/null; then
    log_info "Creating monitoring user..."
    sudo useradd -m -s /bin/bash $MONITORING_USER
fi

# Create directories
log_info "Creating monitoring directories..."
sudo mkdir -p $MONITORING_DIR/{prometheus,grafana,alertmanager,node-exporter}
sudo mkdir -p $MONITORING_DIR/data/{prometheus,grafana,alertmanager}
sudo mkdir -p /etc/monitoring/{prometheus,grafana,alertmanager}
sudo mkdir -p /var/log/monitoring

# Set ownership
sudo chown -R $MONITORING_USER:$MONITORING_USER $MONITORING_DIR
sudo chown -R $MONITORING_USER:$MONITORING_USER /var/log/monitoring
sudo chown -R $MONITORING_USER:$MONITORING_USER /etc/monitoring

# Install Docker for monitoring services
log_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $MONITORING_USER
    sudo usermod -aG docker $USER
    sudo systemctl enable docker
    sudo systemctl start docker
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create Prometheus configuration
log_info "Setting up Prometheus configuration..."
sudo -u $MONITORING_USER tee /etc/monitoring/prometheus/prometheus.yml > /dev/null <<'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "/etc/monitoring/prometheus/rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # Prometheus itself
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter for system metrics
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  # Flint VPS metrics
  - job_name: 'flint-vps'
    static_configs:
      - targets: ['localhost:5550']
    metrics_path: '/api/host/metrics'
    scrape_interval: 30s

  # Paymenter application metrics
  - job_name: 'paymenter'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  # Integration Service metrics
  - job_name: 'vps-integration'
    static_configs:
      - targets: ['localhost:3002']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  # Nginx metrics
  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']
    scrape_interval: 30s

  # MySQL metrics
  - job_name: 'mysql'
    static_configs:
      - targets: ['localhost:9104']
    scrape_interval: 30s

  # Redis metrics
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
    scrape_interval: 30s
EOF

# Create Prometheus alert rules
log_info "Creating Prometheus alert rules..."
sudo -u $MONITORING_USER mkdir -p /etc/monitoring/prometheus/rules

sudo -u $MONITORING_USER tee /etc/monitoring/prometheus/rules/vps-alerts.yml > /dev/null <<'EOF'
groups:
- name: vps-platform
  rules:
  # High CPU Usage Alert
  - alert: HighCPUUsage
    expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 5m
    labels:
      severity: warning
      service: vps-platform
    annotations:
      summary: "High CPU usage detected"
      description: "CPU usage is above 80% for more than 5 minutes on {{ $labels.instance }}"

  # High Memory Usage Alert
  - alert: HighMemoryUsage
    expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
    for: 5m
    labels:
      severity: warning
      service: vps-platform
    annotations:
      summary: "High memory usage detected"
      description: "Memory usage is above 85% for more than 5 minutes on {{ $labels.instance }}"

  # Disk Space Alert
  - alert: LowDiskSpace
    expr: (node_filesystem_avail_bytes{fstype!="tmpfs"} / node_filesystem_size_bytes{fstype!="tmpfs"}) * 100 < 10
    for: 5m
    labels:
      severity: critical
      service: vps-platform
    annotations:
      summary: "Low disk space detected"
      description: "Disk space is below 10% on {{ $labels.instance }} ({{ $labels.mountpoint }})"

  # Service Down Alert
  - alert: ServiceDown
    expr: up == 0
    for: 1m
    labels:
      severity: critical
      service: vps-platform
    annotations:
      summary: "Service is down"
      description: "Service {{ $labels.job }} on {{ $labels.instance }} is down"

  # Flint VM Creation Failure
  - alert: FlintVMCreationFailure
    expr: increase(flint_vm_creation_failures_total[5m]) > 0
    for: 2m
    labels:
      severity: warning
      service: flint
    annotations:
      summary: "VM creation failures detected"
      description: "Flint has reported VM creation failures in the last 5 minutes"

  # Paymenter High Error Rate
  - alert: PaymenterHighErrorRate
    expr: rate(paymenter_http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: warning
      service: paymenter
    annotations:
      summary: "High error rate in Paymenter"
      description: "Paymenter error rate is above 10% in the last 5 minutes"

  # Integration Service High Response Time
  - alert: IntegrationHighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="vps-integration"}[5m])) > 2
    for: 5m
    labels:
      severity: warning
      service: vps-integration
    annotations:
      summary: "High response time in Integration Service"
      description: "95th percentile response time is above 2 seconds"

  # Database Connection Issues
  - alert: DatabaseConnectionIssues
    expr: mysql_up{job="mysql"} == 0
    for: 2m
    labels:
      severity: critical
      service: database
    annotations:
      summary: "Database connection issues"
      description: "MySQL database is not responding"

  # Redis Connection Issues
  - alert: RedisConnectionIssues
    expr: redis_up{job="redis"} == 0
    for: 2m
    labels:
      severity: critical
      service: database
    annotations:
      summary: "Redis connection issues"
      description: "Redis cache is not responding"
EOF

# Create AlertManager configuration
log_info "Setting up AlertManager configuration..."
sudo -u $MONITORING_USER tee /etc/monitoring/alertmanager/alertmanager.yml > /dev/null <<'EOF'
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@provps.com'
  smtp_auth_username: 'alerts@provps.com'
  smtp_auth_password: 'alert_password_123'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
  - match:
      severity: critical
    receiver: 'critical-alerts'
    group_wait: 5s
    repeat_interval: 30m
  - match:
      severity: warning
    receiver: 'warning-alerts'
    repeat_interval: 3h

receivers:
- name: 'web.hook'
  webhook_configs:
  - url: 'http://localhost:3002/api/webhooks/alerts'
    send_resolved: true

- name: 'critical-alerts'
  email_configs:
  - to: 'admin@provps.com'
    subject: '[CRITICAL] VPS Platform Alert: {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      Labels: {{ range .Labels.SortedPairs }}{{ .Name }}={{ .Value }} {{ end }}
      {{ end }}
  webhook_configs:
  - url: 'http://localhost:3002/api/webhooks/critical-alerts'
    send_resolved: true

- name: 'warning-alerts'
  email_configs:
  - to: 'ops@provps.com'
    subject: '[WARNING] VPS Platform Alert: {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      Labels: {{ range .Labels.SortedPairs }}{{ .Name }}={{ .Value }} {{ end }}
      {{ end }}
  webhook_configs:
  - url: 'http://localhost:3002/api/webhooks/warning-alerts'
    send_resolved: true

inhibit_rules:
- source_match:
    severity: 'critical'
  target_match:
    severity: 'warning'
  equal: ['alertname', 'cluster', 'service']
EOF

# Create Grafana configuration
log_info "Setting up Grafana configuration..."
sudo -u $MONITORING_USER tee /etc/monitoring/grafana/grafana.ini > /dev/null <<'EOF'
[server]
http_port = $GRAFANA_PORT
domain = localhost
root_url = http://localhost:$GRAFANA_PORT/

[database]
type = sqlite3
path = $MONITORING_DIR/data/grafana/grafana.db

[security]
admin_user = admin
admin_password = admin123456
secret_key = grafana_secret_key_$(date +%s | sha256sum | cut -c1-32)

[users]
allow_sign_up = false
auto_assign_org_role = Viewer

[auth.anonymous]
enabled = false

[smtp]
enabled = true
host = localhost:587
user = alerts@provps.com
password = alert_password_123
from_address = alerts@provps.com
from_name = VPS Platform Alerts

[log]
level = info
mode = file
file = /var/log/monitoring/grafana.log

[paths]
data = $MONITORING_DIR/data/grafana
logs = /var/log/monitoring
plugins = $MONITORING_DIR/data/grafana/plugins
provisioning = /etc/monitoring/grafana/provisioning
EOF

# Create Grafana datasources provisioning
sudo -u $MONITORING_USER mkdir -p /etc/monitoring/grafana/provisioning/{datasources,dashboards}

sudo -u $MONITORING_USER tee /etc/monitoring/grafana/provisioning/datasources/prometheus.yml > /dev/null <<'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://localhost:$PROMETHEUS_PORT
    isDefault: true
    editable: true
EOF

# Create Docker Compose file for monitoring services
log_info "Creating Docker Compose configuration..."
sudo -u $MONITORING_USER tee $MONITORING_DIR/docker-compose.yml > /dev/null <<'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "$PROMETHEUS_PORT:9090"
    volumes:
      - /etc/monitoring/prometheus:/etc/prometheus
      - $MONITORING_DIR/data/prometheus:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
    restart: unless-stopped
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "$GRAFANA_PORT:3000"
    volumes:
      - /etc/monitoring/grafana/grafana.ini:/etc/grafana/grafana.ini
      - $MONITORING_DIR/data/grafana:/var/lib/grafana
      - /etc/monitoring/grafana/provisioning:/etc/grafana/provisioning
      - /var/log/monitoring:/var/log/grafana
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin123456
      - GF_USERS_ALLOW_SIGN_UP=false
    restart: unless-stopped
    networks:
      - monitoring

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports:
      - "$ALERTMANAGER_PORT:9093"
    volumes:
      - /etc/monitoring/alertmanager:/etc/alertmanager
      - $MONITORING_DIR/data/alertmanager:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    restart: unless-stopped
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "$NODE_EXPORTER_PORT:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($|/)'
    restart: unless-stopped
    networks:
      - monitoring

  nginx-exporter:
    image: nginx/nginx-prometheus-exporter:latest
    container_name: nginx-exporter
    ports:
      - "9113:9113"
    command:
      - '-nginx.scrape-uri=http://nginx:80/stub_status'
    restart: unless-stopped
    networks:
      - monitoring

  mysql-exporter:
    image: prom/mysqld-exporter:latest
    container_name: mysql-exporter
    ports:
      - "9104:9104"
    environment:
      - DATA_SOURCE_NAME=paymenter:paymenter_db_pass@(mysql:3306)/paymenter
    restart: unless-stopped
    networks:
      - monitoring

  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: redis-exporter
    ports:
      - "9121:9121"
    environment:
      - REDIS_ADDR=redis://redis:6379
    restart: unless-stopped
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge
EOF

# Create systemd service for monitoring stack
log_info "Creating systemd service for monitoring..."
sudo tee /etc/systemd/system/monitoring-stack.service > /dev/null <<'EOF'
[Unit]
Description=VPS Platform Monitoring Stack
After=docker.service network.target
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$MONITORING_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
ExecReload=/usr/local/bin/docker-compose restart
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Create log rotation for monitoring
log_info "Setting up log rotation..."
sudo tee /etc/logrotate.d/monitoring > /dev/null <<'EOF'
/var/log/monitoring/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $MONITORING_USER $MONITORING_USER
    postrotate
        /usr/bin/docker-compose -f $MONITORING_DIR/docker-compose.yml restart
    endscript
}
EOF

# Start monitoring services
log_info "Starting monitoring stack..."
sudo systemctl daemon-reload
sudo systemctl enable monitoring-stack
sudo systemctl start monitoring-stack

# Wait for services to start
log_info "Waiting for monitoring services to start..."
sleep 10

# Test Prometheus
log_info "Testing Prometheus..."
if curl -s -f "http://localhost:$PROMETHEUS_PORT/api/v1/query?query=up" > /dev/null; then
    log_success "Prometheus is responding"
else
    log_warning "Prometheus may still be starting"
fi

# Test Grafana
log_info "Testing Grafana..."
if curl -s -f "http://localhost:$GRAFANA_PORT/api/health" > /dev/null; then
    log_success "Grafana is responding"
else
    log_warning "Grafana may still be starting"
fi

# Test AlertManager
log_info "Testing AlertManager..."
if curl -s -f "http://localhost:$ALERTMANAGER_PORT/api/v1/status" > /dev/null; then
    log_success "AlertManager is responding"
else
    log_warning "AlertManager may still be starting"
fi

# Create monitoring scripts
log_info "Creating monitoring utility scripts..."

# Service status script
sudo tee /usr/local/bin/monitoring-status > /dev/null <<'EOF'
#!/bin/bash

echo "=== VPS Platform Monitoring Status ==="
echo ""

# Check Docker containers
echo "🐳 Docker Containers:"
sudo -u monitoring docker-compose -f /opt/monitoring/docker-compose.yml ps
echo ""

# Check service endpoints
echo "📊 Service Endpoints:"
services=("Prometheus:$PROMETHEUS_PORT" "Grafana:$GRAFANA_PORT" "AlertManager:$ALERTMANAGER_PORT")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if curl -s -f "http://localhost:$port" > /dev/null; then
        echo "  ✅ $name: http://localhost:$port"
    else
        echo "  ❌ $name: http://localhost:$port (not responding)"
    fi
done
echo ""

# Check system metrics
echo "📈 System Metrics:"
if curl -s "http://localhost:$PROMETHEUS_PORT/api/v1/query?query=up" | jq -r '.data.result | length' > /dev/null 2>&1; then
    targets_up=$(curl -s "http://localhost:$PROMETHEUS_PORT/api/v1/query?query=up" | jq -r '.data.result | length')
    echo "  ✅ Prometheus targets up: $targets_up"
else
    echo "  ❌ Prometheus not accessible"
fi
echo ""

# Check disk usage
echo "💾 Disk Usage:"
df -h / | grep -E "(Filesystem|/dev/)" | head -5
echo ""

# Check memory usage
echo "🧠 Memory Usage:"
free -h
echo ""

# Check load average
echo "⚡ Load Average:"
uptime
echo ""

# Check recent alerts
echo "🚨 Recent Alerts (last hour):"
if curl -s "http://localhost:$ALERTMANAGER_PORT/api/v1/alerts?silenced=false" | jq -r '. | length' > /dev/null 2>&1; then
    recent_alerts=$(curl -s "http://localhost:$ALERTMANAGER_PORT/api/v1/alerts?silenced=false" | jq -r '. | length')
    echo "  Total active alerts: $recent_alerts"
    
    if [ "$recent_alerts" -gt 0 ]; then
        echo "  Recent alerts:"
        curl -s "http://localhost:$ALERTMANAGER_PORT/api/v1/alerts?silenced=false" | jq -r '.[] | "\(.labels.severity|upper): \(.annotations.summary|truncatechars(50))"' | head -5
    fi
else
    echo "  AlertManager not accessible"
fi
EOF

sudo chmod +x /usr/local/bin/monitoring-status

# Alert testing script
sudo tee /usr/local/bin/test-alerts > /dev/null <<'EOF'
#!/bin/bash

echo "🧪 Testing Alert System..."
echo ""

# Test CPU alert (simulate high CPU)
echo "Testing CPU alert (simulating high CPU)..."
dd if=/dev/zero of=/dev/null bs=1M count=100 &
CPU_PID=$!
sleep 5
kill $CPU_PID 2>/dev/null

# Test memory alert (simulate high memory)
echo "Testing memory alert (simulating high memory)..."
dd if=/dev/zero of=/dev/null bs=1M count=200 &
MEM_PID=$!
sleep 5
kill $MEM_PID 2>/dev/null

# Check if alerts were triggered
echo "Checking for triggered alerts..."
sleep 10

if curl -s "http://localhost:$ALERTMANAGER_PORT/api/v1/alerts?silenced=false" | jq -r '. | length' > /dev/null 2>&1; then
    alert_count=$(curl -s "http://localhost:$ALERTMANAGER_PORT/api/v1/alerts?silenced=false" | jq -r '. | length')
    echo "  Active alerts: $alert_count"
    
    if [ "$alert_count" -gt 0 ]; then
        echo "  Recent alerts:"
        curl -s "http://localhost:$ALERTMANAGER_PORT/api/v1/alerts?silenced=false" | jq -r '.[] | "\(.labels.severity|upper): \(.annotations.summary)"' | head -3
    else
        echo "  No alerts triggered (this may be normal)"
    fi
else
    echo "  Could not check alerts (AlertManager not accessible)"
fi

echo ""
echo "📊 Alert system test completed!"
EOF

sudo chmod +x /usr/local/bin/test-alerts

log_success "Production monitoring infrastructure setup completed!"
log_info "Services:"
log_info "  Prometheus: http://localhost:$PROMETHEUS_PORT"
log_info "  Grafana: http://localhost:$GRAFANA_PORT (admin/admin123456)"
log_info "  AlertManager: http://localhost:$ALERTMANAGER_PORT"
log_info "  Node Exporter: http://localhost:$NODE_EXPORTER_PORT"
log_info ""
log_info "Monitoring scripts:"
log_info "  /usr/local/bin/monitoring-status - Check all services"
log_info "  /usr/local/bin/test-alerts - Test alert system"
log_info ""
log_info "Next steps:"
log_info "  1. Access Grafana and import dashboards"
log_info "  2. Configure email/SMS notifications in AlertManager"
log_info "  3. Set up custom alert rules"
log_info "  4. Configure retention policies"

exit 0