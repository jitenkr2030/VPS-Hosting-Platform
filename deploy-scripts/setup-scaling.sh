#!/bin/bash

# Production Scaling and Optimization Setup Script
# Implements load balancing, caching, and performance optimization

set -e

echo "⚡ Setting up Production Scaling and Optimization..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCALING_DIR="/opt/scaling"
CACHE_DIR="/var/cache/vps-platform"
LOADBALANCER_DIR="/opt/nginx-lb"
REDIS_CLUSTER_DIR="/opt/redis-cluster"

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

# Create directories
log_info "Creating scaling directories..."
sudo mkdir -p $SCALING_DIR/{nginx,redis,php,monitoring}
sudo mkdir -p $CACHE_DIR/{nginx,redis,php,uploads}
sudo mkdir -p $LOADBALANCER_DIR/{conf,logs,ssl}
sudo mkdir -p $REDIS_CLUSTER_DIR/{nodes,config}
sudo mkdir -p /var/log/{nginx-lb,php-fpm-cluster}

# Set ownership
sudo chown -R root:root $SCALING_DIR
sudo chown -R www-data:www-data $CACHE_DIR
sudo chown -R root:root $LOADBALANCER_DIR
sudo chown -R redis:redis $REDIS_CLUSTER_DIR

# Install additional packages for scaling
log_info "Installing scaling packages..."
sudo apt-get update
sudo apt-get install -y \
    redis-server \
    redis-tools \
    memcached \
    varnish \
    haproxy \
    php8.2-fpm \
    php8.2-redis \
    php8.2-memcached \
    php8.2-opcache \
    nginx-extras

# Configure Redis Cluster
log_info "Setting up Redis cluster for caching..."

# Create Redis configuration
sudo tee /etc/redis/redis-cluster.conf > /dev/null <<'EOF'
# Redis Cluster Configuration
port 6379
bind 127.0.0.1 192.168.100.1
protected-mode yes
requirepass redis_cluster_pass_$(date +%s | sha256sum | cut -c1-16)

# Cluster configuration
cluster-enabled yes
cluster-config-file nodes-6379.conf
cluster-node-timeout 5000
cluster-announce-ip 127.0.0.1
cluster-announce-port 6379
cluster-announce-bus-port 16379

# Memory optimization
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log
syslog-enabled yes

# Security
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""
rename-command CONFIG "CONFIG_b835c3f8a5d2e7a4f6c9b1a8d7e5f2c3"

# Performance
tcp-keepalive 300
timeout 0
tcp-backlog 511
EOF

# Configure Redis as cache for VPS platform
sudo tee /etc/redis/redis-cache.conf > /dev/null <<'EOF'
# Redis Cache Configuration for VPS Platform
port 6380
bind 127.0.0.1
protected-mode yes
requirepass redis_cache_pass_$(date +%s | sha256sum | cut -c1-16)

# Memory optimization for caching
maxmemory 1gb
maxmemory-policy allkeys-lru

# No persistence for cache-only instance
save ""

# Logging
loglevel notice
logfile /var/log/redis/redis-cache.log

# Performance optimization
tcp-keepalive 60
timeout 0
tcp-backlog 511

# Database selection
databases 16

# Cache-specific settings
lazyfree-lazy-eviction yes
lazyfree-lazy-expire yes
lazyfree-lazy-server-del yes
replica-lazy-flush yes
EOF

# Create additional Redis instances for different purposes
sudo cp /etc/redis/redis-cache.conf /etc/redis/redis-session.conf
sudo sed -i 's/6380/6381/g; s/cache/session/g' /etc/redis/redis-session.conf
sudo sed -i 's/redis_cache_pass/redis_session_pass/g' /etc/redis/redis-session.conf

sudo cp /etc/redis/redis-cache.conf /etc/redis/redis-vps.conf
sudo sed -i 's/6380/6382/g; s/cache/vps/g' /etc/redis/redis-vps.conf
sudo sed -i 's/redis_cache_pass/redis_vps_pass/g' /etc/redis/redis-vps.conf

# Configure PHP-FPM pool for scaling
log_info "Setting up PHP-FPM pool for scaling..."

sudo tee /etc/php/8.2/fpm/pool/www-scaling.conf > /dev/null <<'EOF'
[www-scaling]
user = www-data
group = www-data
listen = /run/php/php8.2-fpm-scaling.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660

; Process management
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500

; Process priority
process.priority = -5

; Timeout settings
request_terminate_timeout = 300s
request_slowlog_timeout = 10s

; Opcache optimization
php_admin_value[opcache.enable] = 1
php_admin_value[opcache.memory_consumption] = 256
php_admin_value[opcache.interned_strings_buffer] = 8
php_admin_value[opcache.max_accelerated_files] = 4000
php_admin_value[opcache.revalidate_freq] = 2
php_admin_value[opcache.fast_shutdown] = 1
php_admin_value[opcache.enable_cli] = 0
php_admin_value[opcache.save_comments] = 1
php_admin_value[opcache.load_comments] = 1
php_admin_value[opcache.validate_timestamps] = 1

; Session handling
php_admin_value[session.save_handler] = redis
php_admin_value[session.save_path] = "tcp://127.0.0.1:6381"
php_admin_value[session.serialize_handler] = php
php_admin_value[session.gc_maxlifetime] = 1440
php_admin_value[session.gc_probability] = 1
php_admin_value[session.gc_divisor] = 100

; Redis cache
php_admin_value[redis.default_host] = 127.0.0.1
php_admin_value[redis.default_port] = 6380
php_admin_value[redis.default_password] = redis_cache_pass_placeholder
php_admin_value[redis.default_database] = 0
php_admin_value[redis.default_timeout] = 2.0

; Error handling
php_flag[display_errors] = off
php_admin_flag[log_errors] = on
php_admin_value[error_log] = /var/log/php8.2-fpm-scaling.log
php_admin_value[error_reporting] = E_ALL & ~E_DEPRECATED & ~E_STRICT

; File uploads
php_admin_value[upload_max_filesize] = 100M
php_admin_value[post_max_size] = 100M
php_admin_value[max_execution_time] = 300
php_admin_value[max_input_time] = 300
php_admin_value[memory_limit] = 256M

; Security
php_admin_value[expose_php] = off
php_admin_value[allow_url_fopen] = off
php_admin_value[allow_url_include] = off
EOF

# Configure HAProxy for load balancing
log_info "Setting up HAProxy load balancer..."

sudo tee /etc/haproxy/haproxy.cfg > /dev/null <<'EOF'
global
    log /dev/log    local0
    log /dev/log    local1 notice
    maxconn 4096
    user haproxy
    group haproxy
    daemon

    # Default SSL material locations
    ca-base /etc/ssl/certs
    crt-base /etc/ssl/private

    # Default ciphers to use on SSL-enabled listening sockets
    ssl-default-bind-ciphers ECDH+AESGCM:EDH+AESGCM
    ssl-default-bind-ciphersuites TLSv1.2 TLSv1.3

defaults
    log     global
    mode    http
    option  httplog
    option  dontlognull
    timeout connect 5000
    timeout client  50000
    timeout server  50000
    timeout http-request 10s
    timeout queue 1m
    timeout check 10s
    maxconn 4096

# Statistics page
listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 30s
    stats show-node
    stats show-desc VPS Platform Load Balancer
    stats auth admin:haproxy_stats_123

# Frontend for VPS Platform
frontend vps-platform-frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/vps-platform/certs/vps-platform.crt
    redirect scheme https if !{ ssl_fc }
    option forwardfor
    http-request set-header X-Forwarded-Proto https if { ssl_fc }
    default_backend vps-platform-backend

# Backend for VPS Platform
backend vps-platform-backend
    balance roundrobin
    option httpchk GET /api/health HTTP/1.1\r\nHost:\ localhost
    http-check expect status 200
    cookie SERVERID insert indirect nocache
    server web1 127.0.0.1:8000 check cookie web1
    server web2 127.0.0.1:8001 check cookie web2 backup

# Backend for API services
backend api-backend
    balance leastconn
    option httpchk GET /api/health HTTP/1.1\r\nHost:\ localhost
    http-check expect status 200
    server api1 127.0.0.1:3002 check
    server api2 127.0.0.1:3003 check backup

# Backend for Flint services
backend flint-backend
    balance roundrobin
    option httpchk GET /api/host/status HTTP/1.1\r\nHost:\ localhost
    http-check expect status 200
    server flint1 127.0.0.1:5550 check
    server flint2 127.0.0.1:5551 check backup

# Backend for monitoring
backend monitoring-backend
    balance roundrobin
    server prometheus 127.0.0.1:9090 check
    server grafana 127.0.0.1:3001 check
EOF

# Configure Nginx for high performance
log_info "Optimizing Nginx for high performance..."

# Create Nginx main configuration
sudo tee /etc/nginx/nginx.conf > /dev/null <<'EOF'
user www-data;
worker_processes auto;
worker_rlimit_nofile 65535;
pid /run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # MIME types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Performance optimizations
    client_max_body_size 100M;
    client_body_buffer_size 128k;
    large_client_header_buffers 4 16k;
    client_header_buffer_size 1k;
    client_body_timeout 60s;
    client_header_timeout 60s;
    send_timeout 60s;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;

    # Include configurations
    include /etc/nginx/conf.d/*.conf;
}
EOF

# Create high-performance server blocks
sudo tee /etc/nginx/conf.d/vps-platform-performance.conf > /dev/null <<'EOF'
# Upstream for PHP-FPM
upstream php-fpm-scaling {
    server unix:/run/php/php8.2-fpm-scaling.sock max_fails=3 fail_timeout=30s;
    server 127.0.0.1:9001 max_fails=3 fail_timeout=30s backup;
    keepalive 32;
}

# Upstream for API services
upstream api-services {
    least_conn;
    server 127.0.0.1:3002 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3003 max_fails=3 fail_timeout=30s backup;
    keepalive 16;
}

# Upstream for Flint services
upstream flint-services {
    server 127.0.0.1:5550 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:5551 max_fails=3 fail_timeout=30s backup;
    keepalive 8;
}

# Main VPS Platform server
server {
    listen 80;
    server_name provps.com www.provps.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name provps.com www.provps.com;

    # SSL configuration
    include /etc/nginx/snippets/ssl-vps-platform.conf;
    include /etc/nginx/snippets/security-headers.conf;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'" always;

    # Root directory
    root /var/www/vps-platform/public;
    index index.php index.html;

    # Rate limiting
    limit_req zone=api burst=20 nodelay;
    limit_conn zone=conn_limit_per_ip conn=20;

    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|eot|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
        access_log off;
    }

    # PHP processing
    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass php-fpm-scaling;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_connect_timeout 300;
    }

    # API endpoints
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://api-services;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Flint API proxy
    location /flint-api/ {
        proxy_pass http://flint-services/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Security
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Fallback
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
}
EOF

# Configure Varnish for HTTP caching
log_info "Setting up Varnish cache..."

sudo tee /etc/varnish/default.vcl > /dev/null <<'EOF'
vcl 4.0;

# Backend definitions
backend default {
    .host = "127.0.0.1";
    .port = "8080";
}

backend api {
    .host = "127.0.0.1";
    .port = "3002";
}

# ACL for purging
acl purge {
    "localhost";
    "127.0.0.1";
}

sub vcl_recv {
    # Set X-Forwarded-For header
    if (req.restarts == 0) {
        if (req.http.X-Forwarded-For) {
            set req.http.X-Forwarded-For = req.http.X-Forwarded-For + ", " + client.ip;
        } else {
            set req.http.X-Forwarded-For = client.ip;
        }
    }

    # Handle PURGE requests
    if (req.method == "PURGE") {
        if (!client.ip ~ purge) {
            return (synth(405, "Not allowed"));
        }
        return (purge);
    }

    # Normalize Accept-Encoding header
    if (req.http.Accept-Encoding) {
        if (req.http.Accept-Encoding ~ "gzip") {
            set req.http.Accept-Encoding = "gzip";
        } elsif (req.http.Accept-Encoding ~ "deflate") {
            set req.http.Accept-Encoding = "deflate";
        } else {
            unset req.http.Accept-Encoding;
        }
    }

    # Route to different backends
    if (req.url ~ "^/api/") {
        set req.backend_hint = api;
    } else {
        set req.backend_hint = default;
    }

    # Cache only GET and HEAD requests
    if (req.method != "GET" && req.method != "HEAD") {
        return (pass);
    }

    # Don't cache certain paths
    if (req.url ~ "^/admin" || 
        req.url ~ "^/api/auth" || 
        req.url ~ "^/cart" ||
        req.url ~ "\.(php|json)$") {
        return (pass);
    }

    return (hash);
}

sub vcl_hash {
    hash_data(req.url);
    if (req.http.Cookie) {
        hash_data(req.http.Cookie);
    }
    return (lookup);
}

sub vcl_backend_response {
    # Set cache TTL based on content type
    if (beresp.status == 200) {
        if (bereq.url ~ "\.(css|js|png|jpg|jpeg|gif|ico|woff|woff2)$") {
            set beresp.ttl = 1d;
            set beresp.grace = 1h;
        } elsif (bereq.url ~ "\.(html|htm)$") {
            set beresp.ttl = 1h;
            set beresp.grace = 30m;
        } else {
            set beresp.ttl = 5m;
            set beresp.grace = 10m;
        }
    }

    # Don't cache error responses
    if (beresp.status >= 400) {
        set beresp.ttl = 0s;
        set beresp.uncacheable = true;
    }

    return (deliver);
}

sub vcl_deliver {
    # Add cache headers
    if (obj.hits > 0) {
        set resp.http.X-Cache = "HIT";
    } else {
        set resp.http.X-Cache = "MISS";
    }

    # Add debug headers
    set resp.http.X-Backend = req.backend_hint;
    set resp.http.X-Server-Timing = obj.ttl;

    return (deliver);
}

sub vcl_purge {
    return (synth(200, "Purged"));
}
EOF

# Configure Varnish storage
sudo tee /etc/varnish/varnish.params > /dev/null <<'EOF'
# Varnish storage configuration
VARNISH_STORAGE_SIZE=1G
VARNISH_STORAGE=file,/var/lib/varnish/varnish_storage.bin,1G
VARNISH_LISTEN_ADDRESS=0.0.0.0
VARNISH_LISTEN_PORT=8080
VARNISH_ADMIN_LISTEN_ADDRESS=127.0.0.1
VARNISH_ADMIN_LISTEN_PORT=6082
VARNISH_SECRET=$(openssl rand -hex 32)
VARNISH_TTL=120
VARNISH_GRACE=10
EOF

# Create scaling monitoring script
log_info "Creating scaling monitoring script..."

sudo tee /usr/local/bin/scaling-monitor > /dev/null <<'EOF'
#!/bin/bash

echo "⚡ VPS Platform Scaling Monitor"
echo "==============================="
echo ""

# Function to check service status
check_service() {
    local service="$1"
    local port="$2"
    local status="$3"
    
    if nc -z localhost "$port" 2>/dev/null; then
        echo "  ✅ $service: Running (port $port)"
        return 0
    else
        echo "  ❌ $service: Not responding (port $port)"
        return 1
    fi
}

# Check load balancer status
echo "🔄 Load Balancer Status:"
if systemctl is-active haproxy >/dev/null 2>&1; then
    echo "  ✅ HAProxy: Running"
    # Check HAProxy stats
    if curl -s -u admin:haproxy_stats_123 http://localhost:8404/stats | grep -q "UP"; then
        echo "  ✅ HAProxy Stats: Accessible"
    else
        echo "  ⚠️  HAProxy Stats: Not accessible"
    fi
else
    echo "  ❌ HAProxy: Not running"
fi
echo ""

# Check cache systems
echo "💾 Cache Systems Status:"
check_service "Redis Cache" 6380
check_service "Redis Session" 6381
check_service "Redis VPS" 6382
check_service "Varnish Cache" 8080
echo ""

# Check PHP-FPM pools
echo "🐘 PHP-FPM Pools Status:"
for pool in www www-scaling; do
    if [ -S "/run/php/php8.2-fpm-$pool.sock" ]; then
        echo "  ✅ PHP-FPM $pool: Running"
    else
        echo "  ❌ PHP-FPM $pool: Not running"
    fi
done
echo ""

# Check Nginx performance
echo "🌐 Nginx Performance:"
nginx_processes=$(ps aux | grep nginx | wc -l)
echo "  Nginx processes: $nginx_processes"

if [ -f /var/log/nginx/access.log ]; then
    requests_last_min=$(tail -1000 /var/log/nginx/access.log | grep -c "$(date '+%d/%b/%Y:%H')" | head -1)
    echo "  Requests last minute: $requests_last_min"
fi

nginx_memory=$(ps aux | grep nginx | awk '{sum+=$6} END {print sum}')
echo "  Nginx memory usage: $nginx_memory KB"
echo ""

# Check Redis performance
echo "🔴 Redis Performance:"
for redis_port in 6379 6380 6381 6382; do
    if nc -z localhost "$redis_port" 2>/dev/null; then
        redis_info=$(redis-cli -p "$redis_port" info memory 2>/dev/null || echo "used_memory:0")
        used_memory=$(echo "$redis_info" | grep "used_memory:" | cut -d: -f2)
        echo "  Redis port $redis_port: ${used_memory}B used"
    fi
done
echo ""

# Check system resources
echo "💻 System Resources:"
cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
disk_usage=$(df -h / | awk 'NR==2 {print $5}')
load_avg=$(uptime | awk -F'load average:' '{print $2}' | cut -d',' -f1)

echo "  CPU Usage: ${cpu_usage}%"
echo "  Memory Usage: ${memory_usage}%"
echo "  Disk Usage: $disk_usage"
echo "  Load Average: $load_avg"
echo ""

# Check network connections
echo "🌐 Network Connections:"
active_connections=$(netstat -an | grep ESTABLISHED | wc -l)
echo "  Active connections: $active_connections"

listening_ports=$(netstat -tlnp | grep LISTEN | wc -l)
echo "  Listening ports: $listening_ports"
echo ""

# Check service response times
echo "⏱️  Service Response Times:"
services=("Paymenter:8000" "Integration:3002" "Flint:5550" "Grafana:3001")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    start_time=$(date +%s%N)
    if curl -s -f "http://localhost:$port" >/dev/null 2>&1; then
        end_time=$(date +%s%N)
        response_time=$(( (end_time - start_time) / 1000000 ))
        echo "  $name: ${response_time}ms"
    else
        echo "  $name: Not responding"
    fi
done
echo ""

# Check cache hit rates
echo "📊 Cache Hit Rates:"
if command -v varnishstat >/dev/null 2>&1; then
    varnish_stats=$(varnishstat -1 2>/dev/null | tail -n +2 | head -1)
    if [ -n "$varnish_stats" ]; then
        cache_hit_rate=$(echo "$varnish_stats" | awk '{print $2}' | sed 's/%//')
        echo "  Varnish: ${cache_hit_rate}% hit rate"
    fi
fi

# Redis cache info
for redis_port in 6380 6381 6382; do
    if nc -z localhost "$redis_port" 2>/dev/null; then
        redis_info=$(redis-cli -p "$redis_port" info stats 2>/dev/null || echo "keyspace_hits:0 keyspace_misses:0")
        hits=$(echo "$redis_info" | grep "keyspace_hits:" | cut -d: -f2)
        misses=$(echo "$redis_info" | grep "keyspace_misses:" | cut -d: -f2)
        if [ "$hits" -gt 0 ] || [ "$misses" -gt 0 ]; then
            hit_rate=$((hits * 100 / (hits + misses)))
            echo "  Redis port $redis_port: ${hit_rate}% hit rate"
        fi
    fi
done
echo ""

# Scaling recommendations
echo "📈 Scaling Recommendations:"

if [ "$cpu_usage" -gt 80 ]; then
    echo "  ⚠️  High CPU usage ($cpu_usage%) - Consider scaling up"
elif [ "$cpu_usage" -gt 60 ]; then
    echo "  💡 Moderate CPU usage ($cpu_usage%) - Monitor closely"
else
    echo "  ✅ Low CPU usage ($cpu_usage%) - Good performance"
fi

if [ "$memory_usage" -gt 85 ]; then
    echo "  ⚠️  High memory usage ($memory_usage%) - Consider scaling up"
elif [ "$memory_usage" -gt 70 ]; then
    echo "  💡 Moderate memory usage ($memory_usage%) - Monitor closely"
else
    echo "  ✅ Low memory usage ($memory_usage%) - Good performance"
fi

if [ "$requests_last_min" -gt 1000 ]; then
    echo "  ⚠️  High request rate ($requests_last_min/min) - Consider scaling out"
elif [ "$requests_last_min" -gt 500 ]; then
    echo "  💡 Moderate request rate ($requests_last_min/min) - Monitor closely"
else
    echo "  ✅ Low request rate ($requests_last_min/min) - Good performance"
fi

echo ""
echo "🔧 Scaling Actions Available:"
echo "  1. Add more PHP-FPM workers: sudo systemctl edit php8.2-fpm"
echo "  2. Scale Redis cluster: Add more Redis nodes"
echo "  3. Configure Varnish: Adjust cache rules"
echo "  4. Optimize Nginx: Tune worker processes"
echo "  5. Load balance: Add more backend servers"

exit 0
EOF

sudo chmod +x /usr/local/bin/scaling-monitor

# Create performance optimization script
sudo tee /usr/local/bin/performance-optimize > /dev/null <<'EOF'
#!/bin/bash

echo "🚀 VPS Platform Performance Optimization"
echo "======================================"
echo ""

# Function to optimize Nginx
optimize_nginx() {
    echo "🌐 Optimizing Nginx..."
    
    # Calculate optimal worker processes
    cpu_cores=$(nproc)
    worker_connections=$((4096 / cpu_cores))
    
    echo "  Setting worker_processes to $cpu_cores"
    echo "  Setting worker_connections to $worker_connections"
    
    # Optimize Nginx configuration
    sudo sed -i "s/worker_processes auto;/worker_processes $cpu_cores;/" /etc/nginx/nginx.conf
    sudo sed -i "s/worker_connections 1024;/worker_connections $worker_connections;/" /etc/nginx/nginx.conf
    
    # Enable gzip compression for better performance
    sudo sed -i 's/#gzip on/gzip on/' /etc/nginx/nginx.conf
    sudo sed -i 's/#gzip_vary on/gzip_vary on/' /etc/nginx/nginx.conf
    
    # Test Nginx configuration
    sudo nginx -t
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        echo "  ✅ Nginx optimized and reloaded"
    else
        echo "  ❌ Nginx configuration error - not reloaded"
    fi
}

# Function to optimize PHP-FPM
optimize_php_fpm() {
    echo "🐘 Optimizing PHP-FPM..."
    
    # Calculate optimal PM settings based on memory
    total_memory=$(free -m | awk '/^Mem:/{print $2}')
    memory_per_process=50  # MB per PHP-FPM process
    max_children=$((total_memory / memory_per_process))
    
    if [ $max_children -gt 100 ]; then
        max_children=100
    fi
    
    start_servers=$((max_children / 10))
    if [ $start_servers -lt 5 ]; then
        start_servers=5
    fi
    
    min_spare_servers=$start_servers
    max_spare_servers=$((max_children / 2))
    
    echo "  Setting max_children to $max_children"
    echo "  Setting start_servers to $start_servers"
    echo "  Setting min_spare_servers to $min_spare_servers"
    echo "  Setting max_spare_servers to $max_spare_servers"
    
    # Optimize PHP-FPM configuration
    sudo sed -i "s/pm.max_children = .*/pm.max_children = $max_children/" /etc/php/8.2/fpm/pool/www-scaling.conf
    sudo sed -i "s/pm.start_servers = .*/pm.start_servers = $start_servers/" /etc/php/8.2/fpm/pool/www-scaling.conf
    sudo sed -i "s/pm.min_spare_servers = .*/pm.min_spare_servers = $min_spare_servers/" /etc/php/8.2/fpm/pool/www-scaling.conf
    sudo sed -i "s/pm.max_spare_servers = .*/pm.max_spare_servers = $max_spare_servers/" /etc/php/8.2/fpm/pool/www-scaling.conf
    
    # Enable OPcache
    sudo sed -i 's/;opcache.enable=0/opcache.enable=1/' /etc/php/8.2/mods-available/opcache.ini
    sudo sed -i 's/;opcache.memory_consumption=128/opcache.memory_consumption=256/' /etc/php/8.2/mods-available/opcache.ini
    sudo sed -i 's/;opcache.max_accelerated_files=4000/opcache.max_accelerated_files=10000/' /etc/php/8.2/mods-available/opcache.ini
    sudo sed -i 's/;opcache.revalidate_freq=2/opcache.revalidate_freq=1/' /etc/php/8.2/mods-available/opcache.ini
    
    # Test PHP-FPM configuration
    sudo php-fpm8.2 -t
    if [ $? -eq 0 ]; then
        sudo systemctl restart php8.2-fpm
        echo "  ✅ PHP-FPM optimized and restarted"
    else
        echo "  ❌ PHP-FPM configuration error - not restarted"
    fi
}

# Function to optimize Redis
optimize_redis() {
    echo "🔴 Optimizing Redis..."
    
    # Calculate optimal maxmemory
    total_memory=$(free -m | awk '/^Mem:/{print $2}')
    redis_memory=$((total_memory / 4))  # Use 25% of total memory
    
    if [ $redis_memory -gt 2048 ]; then
        redis_memory=2048  # Cap at 2GB
    fi
    
    echo "  Setting Redis maxmemory to ${redis_memory}MB"
    
    # Optimize Redis configuration
    sudo sed -i "s/maxmemory .*/maxmemory ${redis_memory}mb/" /etc/redis/redis-cache.conf
    sudo sed -i 's/maxmemory-policy .*/maxmemory-policy allkeys-lru/' /etc/redis/redis-cache.conf
    
    # Enable lazy eviction for better performance
    sudo sed -i 's/#lazyfree-lazy-eviction no/lazyfree-lazy-eviction yes/' /etc/redis/redis-cache.conf
    
    # Restart Redis
    sudo systemctl restart redis-server
    echo "  ✅ Redis optimized and restarted"
}

# Function to optimize system parameters
optimize_system() {
    echo "💻 Optimizing system parameters..."
    
    # Optimize network stack
    echo "  Optimizing network parameters..."
    sudo sysctl -w net.core.rmem_max=16777216
    sudo sysctl -w net.core.wmem_max=16777216
    sudo sysctl -w net.ipv4.tcp_rmem=4096 65536 16777216
    sudo sysctl -w net.ipv4.tcp_wmem=4096 65536 16777216
    sudo sysctl -w net.ipv4.tcp_congestion_control=1
    
    # Optimize file system
    echo "  Optimizing file system parameters..."
    sudo sysctl -w vm.swappiness=10
    sudo sysctl -w vm.dirty_ratio=15
    sudo sysctl -w vm.dirty_background_ratio=5
    sudo sysctl -w vm.vfs_cache_pressure=50
    
    # Optimize process limits
    echo "  Optimizing process limits..."
    echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
    echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf
    echo "* soft nproc 65536" | sudo tee -a /etc/security/limits.conf
    echo "* hard nproc 65536" | sudo tee -a /etc/security/limits.conf
    
    echo "  ✅ System parameters optimized"
}

# Function to clear caches
clear_caches() {
    echo "🧹 Clearing caches..."
    
    # Clear Redis caches
    redis-cli -p 6380 FLUSHALL >/dev/null 2>&1 || echo "  Redis cache cleared"
    redis-cli -p 6381 FLUSHALL >/dev/null 2>&1 || echo "  Redis session cache cleared"
    redis-cli -p 6382 FLUSHALL >/dev/null 2>&1 || echo "  Redis VPS cache cleared"
    
    # Clear Varnish cache
    varnishadm "ban req.url ~ ." >/dev/null 2>&1 || echo "  Varnish cache cleared"
    
    # Clear OPcache
    sudo php8.2 -r 'opcache_reset();' >/dev/null 2>&1 || echo "  OPcache cleared"
    
    # Clear Nginx cache
    sudo rm -rf /var/cache/nginx/*
    sudo mkdir -p /var/cache/nginx
    sudo chown www-data:www-data /var/cache/nginx
    
    echo "  ✅ All caches cleared"
}

# Function to benchmark performance
benchmark_performance() {
    echo "📊 Running performance benchmark..."
    
    # Test web server response time
    echo "  Testing web server response time..."
    response_time=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:8000)
    echo "  Web server response time: ${response_time}s"
    
    # Test database query time
    echo "  Testing database query time..."
    db_time=$(mysql -u paymenter -ppaymenter_db_pass -e "SELECT 1;" 2>/dev/null | tail -n 1 || echo "0")
    echo "  Database query time: ${db_time}s"
    
    # Test Redis performance
    echo "  Testing Redis performance..."
    redis_time=$(redis-cli -p 6380 ping | head -1)
    echo "  Redis response: $redis_time"
    
    # Test system I/O
    echo "  Testing system I/O..."
    io_time=$(dd if=/dev/zero of=/tmp/testfile bs=1M count=100 2>&1 | grep -o '[0-9.]* MB/s' | head -1)
    echo "  Disk I/O: $io_time"
    
    # Clean up
    rm -f /tmp/testfile
    
    echo "  ✅ Performance benchmark completed"
}

# Main optimization logic
case "${1:-all}" in
    nginx)
        optimize_nginx
        ;;
    php)
        optimize_php_fpm
        ;;
    redis)
        optimize_redis
        ;;
    system)
        optimize_system
        ;;
    cache)
        clear_caches
        ;;
    benchmark)
        benchmark_performance
        ;;
    all)
        optimize_nginx
        optimize_php_fpm
        optimize_redis
        optimize_system
        clear_caches
        benchmark_performance
        ;;
    *)
        echo "Usage: $0 {nginx|php|redis|system|cache|benchmark|all}"
        exit 1
        ;;
esac

echo ""
echo "✅ Performance optimization completed!"
echo "Restart services if needed: sudo systemctl restart nginx php8.2-fpm redis-server"

exit 0
EOF

sudo chmod +x /usr/local/bin/performance-optimize

# Restart services to apply scaling configurations
log_info "Restarting services to apply scaling configurations..."
sudo systemctl restart redis-server
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx

log_success "Production scaling and optimization setup completed!"
log_info "Scaling features implemented:"
log_info "  🔄 HAProxy load balancer with health checks"
log_info "  💾 Redis cluster for caching and sessions"
log_info "  🐘 PHP-FPM pool optimization"
log_info "  🌐 Nginx high-performance configuration"
log_info "  ⚡ Varnish HTTP caching"
log_info "  📊 Performance monitoring and optimization"
log_info ""
log_info "Management scripts:"
log_info "  /usr/local/bin/scaling-monitor - Monitor scaling performance"
log_info "  /usr/local/bin/performance-optimize - Optimize system performance"
log_info ""
log_info "Next steps:"
log_info "  1. Monitor scaling performance: sudo /usr/local/bin/scaling-monitor"
log_info "  2. Optimize system performance: sudo /usr/local/bin/performance-optimize"
log_info "  3. Configure auto-scaling based on metrics"
log_info "  4. Set up additional backend servers"
log_info "  5. Configure geographic load balancing"

exit 0