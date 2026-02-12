#!/bin/bash

# Advanced Features and Monitoring Setup Script
# Implements customer support, API gateway, and advanced monitoring

set -e

echo "🚀 Setting up Advanced Features and Monitoring..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ADVANCED_DIR="/opt/advanced"
API_GATEWAY_DIR="/opt/api-gateway"
SUPPORT_DIR="/opt/support"
MONITORING_DIR="/opt/advanced-monitoring"

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
log_info "Creating advanced features directories..."
sudo mkdir -p $ADVANCED_DIR/{api-gateway,support,monitoring,analytics}
sudo mkdir -p $API_GATEWAY_DIR/{config,routes,middleware,plugins}
sudo mkdir -p $SUPPORT_DIR/{tickets,knowledge-base,chat,notifications}
sudo mkdir -p $MONITORING_DIR/{metrics,alerts,dashboards,reports}
sudo mkdir -p /var/log/{api-gateway,support,advanced-monitoring}

# Set ownership
sudo chown -R root:root $ADVANCED_DIR
sudo chown -R www-data:www-data $SUPPORT_DIR
sudo chown -R root:root $MONITORING_DIR

# Install additional packages
log_info "Installing advanced features packages..."
sudo apt-get update
sudo apt-get install -y \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    docker-compose \
    elasticsearch \
    logstash \
    kibana \
    grafana-agent \
    prometheus-node-exporter \
    prometheus-process-exporter \
    python3-elasticsearch \
    python3-redis \
    python3-psutil \
    python3-flask \
    python3-sqlalchemy \
    python3-celery \
    redis-tools

# Set up API Gateway
log_info "Setting up API Gateway..."

# Create API Gateway configuration
sudo tee $API_GATEWAY_DIR/config/gateway.conf > /dev/null <<'EOF'
# API Gateway Configuration
server {
    listen 80;
    server_name api.provps.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.provps.com;

    # SSL configuration
    ssl_certificate /etc/ssl/vps-platform/certs/vps-platform.crt;
    ssl_certificate_key /etc/ssl/vps-platform/private/vps-platform.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
    limit_req zone=api_limit burst=200 nodelay;

    # CORS
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
    add_header Access-Control-Expose-Headers "Content-Length,Content-Range" always;

    # API routes
    location /api/v1/ {
        limit_req zone=api_limit burst=200 nodelay;
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # VPS management API
    location /api/v1/vps/ {
        limit_req zone=api_limit burst=50 nodelay;
        proxy_pass http://127.0.0.1:5550/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Billing API
    location /api/v1/billing/ {
        limit_req zone=api_limit burst=30 nodelay;
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Monitoring API
    location /api/v1/monitoring/ {
        limit_req zone=api_limit burst=100 nodelay;
        proxy_pass http://127.0.0.1:9090/api/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API documentation
    location /api/docs {
        proxy_pass http://127.0.0.1:3002/docs;
        proxy_set_header Host $host;
    }

    # Health check
    location /api/health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Create API Gateway middleware
sudo tee $API_GATEWAY_DIR/middleware/auth.js > /dev/null <<'EOF'
// API Gateway Authentication Middleware
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'api-gateway-secret';

// Rate limiting
const createRateLimit = (windowMs, max, message) => rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiters for different endpoints
const authRateLimit = createRateLimit(15 * 60 * 1000, 100, 'Too many authentication attempts');
const apiRateLimit = createRateLimit(15 * 60 * 1000, 1000, 'Too many API requests');
const vpsRateLimit = createRateLimit(15 * 60 * 1000, 100, 'Too many VPS operations');
const billingRateLimit = createRateLimit(15 * 60 * 1000, 50, 'Too many billing requests');

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'Access token required',
            code: 'TOKEN_MISSING'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            let errorMessage = 'Invalid token';
            let errorCode = 'TOKEN_INVALID';
            
            if (err.name === 'TokenExpiredError') {
                errorMessage = 'Token expired';
                errorCode = 'TOKEN_EXPIRED';
            } else if (err.name === 'JsonWebTokenError') {
                errorMessage = 'Malformed token';
                errorCode = 'TOKEN_MALFORMED';
            }
            
            return res.status(403).json({
                error: errorMessage,
                code: errorCode
            });
        }
        
        req.user = user;
        next();
    });
};

// Role-based Authorization Middleware
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }
        
        const userRole = req.user.role;
        const hasRole = Array.isArray(roles) ? roles.includes(userRole) : userRole === roles;
        
        if (!hasRole) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSIONS',
                required: Array.isArray(roles) ? roles : [roles],
                current: userRole
            });
        }
        
        next();
    };
};

// API Key Authentication Middleware
const authenticateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        return res.status(401).json({
            error: 'API key required',
            code: 'API_KEY_MISSING'
        });
    }
    
    // Validate API key (in production, this would check against database)
    const validApiKeys = process.env.VALID_API_KEYS ? 
        process.env.VALID_API_KEYS.split(',') : 
        ['api_key_1', 'api_key_2'];
    
    if (!validApiKeys.includes(apiKey)) {
        return res.status(401).json({
            error: 'Invalid API key',
            code: 'INVALID_API_KEY'
        });
    }
    
    req.apiKey = apiKey;
    next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        };
        
        // Log to console (in production, this would go to a logging service)
        console.log(JSON.stringify(logData));
    });
    
    next();
};

// CORS middleware
const corsMiddleware = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
};

// Request validation middleware
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body);
        
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context.value
            }));
            
            return res.status(400).json({
                error: 'Validation failed',
                errors
            });
        }
        
        req.validatedBody = value;
        next();
    };
};

module.exports = {
    authenticateToken,
    requireRole,
    authenticateApiKey,
    authRateLimit,
    apiRateLimit,
    vpsRateLimit,
    billingRateLimit,
    requestLogger,
    corsMiddleware,
    validateRequest
};
EOF

# Create API Gateway plugins
sudo tee $API_GATEWAY_DIR/plugins/analytics.js > /dev/null <<'EOF'
// API Analytics Plugin
const Redis = require('redis');
const redis = new Redis({
    host: 'localhost',
    port: 6380,
    password: 'redis_cache_pass_placeholder'
});

class AnalyticsPlugin {
    constructor() {
        this.metrics = {
            requests: 0,
            errors: 0,
            responseTime: [],
            endpoints: {},
            users: new Set(),
            apiKeys: new Set()
        };
        
        // Initialize metrics collection
        this.initMetricsCollection();
    }
    
    initMetricsCollection() {
        // Collect metrics every minute
        setInterval(() => {
            this.collectMetrics();
        }, 60000);
    }
    
    async collectMetrics() {
        const metrics = {
            timestamp: new Date().toISOString(),
            requests: this.metrics.requests,
            errors: this.metrics.errors,
            avgResponseTime: this.calculateAverageResponseTime(),
            uniqueUsers: this.metrics.users.size,
            uniqueApiKeys: this.metrics.apiKeys.size,
            endpoints: this.metrics.endpoints,
            systemLoad: this.getSystemLoad()
        };
        
        // Store metrics in Redis
        await redis.zadd('api_metrics', Date.now(), JSON.stringify(metrics));
        
        // Keep only last 24 hours of metrics
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        await redis.zremrangebyscore('api_metrics', 0, oneDayAgo);
        
        // Reset counters
        this.metrics.requests = 0;
        this.metrics.errors = 0;
        this.metrics.responseTime = [];
        this.metrics.endpoints = {};
    }
    
    calculateAverageResponseTime() {
        if (this.metrics.responseTime.length === 0) return 0;
        const sum = this.metrics.responseTime.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.metrics.responseTime.length);
    }
    
    getSystemLoad() {
        const fs = require('fs');
        const loadavg = fs.readFileSync('/proc/loadavg', 'utf8').split(' ');
        return {
            '1min': parseFloat(loadavg[0]),
            '5min': parseFloat(loadavg[1]),
            '15min': parseFloat(loadavg[2])
        };
    }
    
    // Middleware function
    middleware() {
        return (req, res, next) => {
            const startTime = Date.now();
            
            // Increment request counter
            this.metrics.requests++;
            
            // Track unique users
            if (req.user && req.user.id) {
                this.metrics.users.add(req.user.id);
            }
            
            // Track unique API keys
            if (req.apiKey) {
                this.metrics.apiKeys.add(req.apiKey);
            }
            
            // Track endpoints
            const endpoint = req.method + ' ' + req.route.path;
            if (!this.metrics.endpoints[endpoint]) {
                this.metrics.endpoints[endpoint] = { requests: 0, errors: 0 };
            }
            this.metrics.endpoints[endpoint].requests++;
            
            // Capture response
            const originalSend = res.send;
            res.send = function(data) {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                // Track response time
                this.metrics.responseTime.push(responseTime);
                
                // Track errors
                if (res.statusCode >= 400) {
                    this.metrics.errors++;
                    this.metrics.endpoints[endpoint].errors++;
                }
                
                // Add analytics headers
                res.set('X-Response-Time', `${responseTime}ms`);
                res.set('X-Request-ID', this.generateRequestId());
                
                originalSend.call(this, data);
            };
            
            next();
        };
    }
    
    generateRequestId() {
        return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Get metrics for dashboard
    async getMetrics(timeRange = '1h') {
        const now = Date.now();
        let startTime;
        
        switch (timeRange) {
            case '1h':
                startTime = now - (60 * 60 * 1000);
                break;
            case '24h':
                startTime = now - (24 * 60 * 60 * 1000);
                break;
            case '7d':
                startTime = now - (7 * 24 * 60 * 60 * 1000);
                break;
            default:
                startTime = now - (60 * 60 * 1000);
        }
        
        const metrics = await redis.zrangebyscore('api_metrics', startTime, '+inf');
        return metrics.map(m => JSON.parse(m[1]));
    }
    
    // Get real-time stats
    getRealTimeStats() {
        return {
            requests: this.metrics.requests,
            errors: this.metrics.errors,
            avgResponseTime: this.calculateAverageResponseTime(),
            uniqueUsers: this.metrics.users.size,
            uniqueApiKeys: this.metrics.apiKeys.size,
            systemLoad: this.getSystemLoad()
        };
    }
}

module.exports = AnalyticsPlugin;
EOF

# Set up Customer Support System
log_info "Setting up Customer Support System..."

# Create support ticket system
sudo tee $SUPPORT_DIR/tickets/ticket-system.py > /dev/null <<'EOF'
#!/usr/bin/env python3
"""
VPS Platform Customer Support Ticket System
"""

import os
import sys
import sqlite3
import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import redis
import logging

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
DATABASE_PATH = '/opt/support/tickets/support.db'
REDIS_HOST = 'localhost'
REDIS_PORT = 6381
REDIS_PASSWORD = 'redis_session_pass_placeholder'

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/support/ticket-system.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Redis
try:
    redis_client = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        password=REDIS_PASSWORD,
        decode_responses=True
    )
    redis_client.ping()
    logger.info("Connected to Redis")
except Exception as e:
    logger.error(f"Failed to connect to Redis: {e}")
    redis_client = None

# Database initialization
def init_database():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Create tickets table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id TEXT UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            user_email TEXT NOT NULL,
            user_name TEXT NOT NULL,
            subject TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            priority TEXT DEFAULT 'medium',
            status TEXT DEFAULT 'open',
            assigned_to TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP,
            satisfaction INTEGER,
            tags TEXT
        )
    ''')
    
    # Create ticket_responses table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ticket_responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id TEXT NOT NULL,
            responder_id INTEGER,
            responder_name TEXT NOT NULL,
            responder_type TEXT NOT NULL,
            message TEXT NOT NULL,
            is_internal BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ticket_id) REFERENCES tickets (ticket_id)
        )
    ''')
    
    # Create knowledge_base table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS knowledge_base (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT NOT NULL,
            tags TEXT,
            views INTEGER DEFAULT 0,
            helpful INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    logger.info("Database initialized successfully")

# Ticket class
class Ticket:
    def __init__(self):
        self.conn = sqlite3.connect(DATABASE_PATH)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()
    
    def create_ticket(self, user_id, user_email, user_name, subject, description, category, priority='medium'):
        ticket_id = self.generate_ticket_id()
        
        self.cursor.execute('''
            INSERT INTO tickets 
            (ticket_id, user_id, user_email, user_name, subject, description, category, priority)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (ticket_id, user_id, user_email, user_name, subject, description, category, priority))
        
        self.conn.commit()
        
        # Send notification
        self.send_notification('new_ticket', {
            'ticket_id': ticket_id,
            'subject': subject,
            'user_email': user_email,
            'category': category,
            'priority': priority
        })
        
        return ticket_id
    
    def get_ticket(self, ticket_id):
        self.cursor.execute('''
            SELECT * FROM tickets WHERE ticket_id = ?
        ''', (ticket_id,))
        
        ticket = self.cursor.fetchone()
        if ticket:
            # Get responses
            self.cursor.execute('''
                SELECT * FROM ticket_responses 
                WHERE ticket_id = ? 
                ORDER BY created_at ASC
            ''', (ticket_id,))
            
            responses = [dict(row) for row in self.cursor.fetchall()]
            return dict(ticket), responses
        
        return None, []
    
    def update_ticket_status(self, ticket_id, status, assigned_to=None):
        update_fields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP']
        update_values = [status]
        
        if assigned_to:
            update_fields.append('assigned_to = ?')
            update_values.append(assigned_to)
        
        if status == 'resolved':
            update_fields.append('resolved_at = CURRENT_TIMESTAMP')
        
        update_values.append(ticket_id)
        
        self.cursor.execute(f'''
            UPDATE tickets 
            SET {', '.join(update_fields)}
            WHERE ticket_id = ?
        ''', update_values)
        
        self.conn.commit()
        
        # Send notification
        self.send_notification('status_update', {
            'ticket_id': ticket_id,
            'status': status,
            'assigned_to': assigned_to
        })
    
    def add_response(self, ticket_id, responder_id, responder_name, responder_type, message, is_internal=False):
        self.cursor.execute('''
            INSERT INTO ticket_responses 
            (ticket_id, responder_id, responder_name, responder_type, message, is_internal)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (ticket_id, responder_id, responder_name, responder_type, message, is_internal))
        
        self.conn.commit()
        
        # Update ticket timestamp
        self.cursor.execute('''
            UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE ticket_id = ?
        ''', (ticket_id,))
        
        self.conn.commit()
        
        # Send notification for public responses
        if not is_internal:
            self.send_notification('new_response', {
                'ticket_id': ticket_id,
                'responder_name': responder_name,
                'message': message[:100] + '...' if len(message) > 100 else message
            })
    
    def get_user_tickets(self, user_id, status=None, limit=50, offset=0):
        query = 'SELECT * FROM tickets WHERE user_id = ?'
        params = [user_id]
        
        if status:
            query += ' AND status = ?'
            params.append(status)
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        self.cursor.execute(query, params)
        return [dict(row) for row in self.cursor.fetchall()]
    
    def get_all_tickets(self, status=None, assigned_to=None, limit=50, offset=0):
        query = 'SELECT * FROM tickets WHERE 1=1'
        params = []
        
        if status:
            query += ' AND status = ?'
            params.append(status)
        
        if assigned_to:
            query += ' AND assigned_to = ?'
            params.append(assigned_to)
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        self.cursor.execute(query, params)
        return [dict(row) for row in self.cursor.fetchall()]
    
    def generate_ticket_id(self):
        import random
        import string
        timestamp = datetime.now().strftime('%Y%m%d')
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"TCK-{timestamp}-{random_str}"
    
    def send_notification(self, event_type, data):
        """Send notification via Redis pub/sub"""
        if not redis_client:
            return
        
        notification = {
            'type': event_type,
            'data': data,
            'timestamp': datetime.now().isoformat()
        }
        
        redis_client.publish('support_notifications', json.dumps(notification))
        logger.info(f"Notification sent: {event_type}")
    
    def get_ticket_stats(self):
        self.cursor.execute('''
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
                COUNT(CASE WHEN created_at >= datetime('now', '-1 day') THEN 1 END) as today
            FROM tickets
        ''')
        
        stats = self.cursor.fetchone()
        return dict(stats)
    
    def close(self):
        self.conn.close()

# Initialize ticket system
init_database()
ticket_system = Ticket()

# API Routes
@app.route('/api/tickets', methods=['POST'])
def create_ticket():
    try:
        data = request.get_json()
        
        required_fields = ['user_id', 'user_email', 'user_name', 'subject', 'description', 'category']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        ticket_id = ticket_system.create_ticket(
            data['user_id'],
            data['user_email'],
            data['user_name'],
            data['subject'],
            data['description'],
            data['category'],
            data.get('priority', 'medium')
        )
        
        return jsonify({
            'ticket_id': ticket_id,
            'message': 'Ticket created successfully'
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating ticket: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/tickets/<ticket_id>', methods=['GET'])
def get_ticket(ticket_id):
    try:
        ticket, responses = ticket_system.get_ticket(ticket_id)
        
        if not ticket:
            return jsonify({'error': 'Ticket not found'}), 404
        
        return jsonify({
            'ticket': ticket,
            'responses': responses
        })
        
    except Exception as e:
        logger.error(f"Error getting ticket {ticket_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/tickets/<ticket_id>/status', methods=['PUT'])
def update_ticket_status(ticket_id):
    try:
        data = request.get_json()
        status = data.get('status')
        assigned_to = data.get('assigned_to')
        
        if not status:
            return jsonify({'error': 'Status is required'}), 400
        
        ticket_system.update_ticket_status(ticket_id, status, assigned_to)
        
        return jsonify({'message': 'Ticket status updated successfully'})
        
    except Exception as e:
        logger.error(f"Error updating ticket status {ticket_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/tickets/<ticket_id>/respond', methods=['POST'])
def add_response(ticket_id):
    try:
        data = request.get_json()
        
        required_fields = ['responder_id', 'responder_name', 'responder_type', 'message']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        ticket_system.add_response(
            ticket_id,
            data['responder_id'],
            data['responder_name'],
            data['responder_type'],
            data['message'],
            data.get('is_internal', False)
        )
        
        return jsonify({'message': 'Response added successfully'})
        
    except Exception as e:
        logger.error(f"Error adding response to ticket {ticket_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/tickets/user/<int:user_id>', methods=['GET'])
def get_user_tickets(user_id):
    try:
        status = request.args.get('status')
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        tickets = ticket_system.get_user_tickets(user_id, status, limit, offset)
        
        return jsonify({'tickets': tickets})
        
    except Exception as e:
        logger.error(f"Error getting user tickets: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/tickets/all', methods=['GET'])
def get_all_tickets():
    try:
        status = request.args.get('status')
        assigned_to = request.args.get('assigned_to')
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        tickets = ticket_system.get_all_tickets(status, assigned_to, limit, offset)
        
        return jsonify({'tickets': tickets})
        
    except Exception as e:
        logger.error(f"Error getting all tickets: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/tickets/stats', methods=['GET'])
def get_ticket_stats():
    try:
        stats = ticket_system.get_ticket_stats()
        return jsonify(stats)
        
    except Exception as e:
        logger.error(f"Error getting ticket stats: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
EOF

# Make ticket system executable
sudo chmod +x $SUPPORT_DIR/tickets/ticket-system.py

# Create support systemd service
sudo tee /etc/systemd/system/support-tickets.service > /dev/null <<'EOF'
[Unit]
Description=VPS Platform Support Ticket System
After=network.target redis.service
Wants=network.target redis.service

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/opt/support/tickets
ExecStart=/usr/bin/python3 /opt/support/tickets/ticket-system.py
Restart=always
RestartSec=5
Environment=PYTHONPATH=/opt/support/tickets
StandardOutput=journal
StandardError=journal
SyslogIdentifier=support-tickets

[Install]
WantedBy=multi-user.target
EOF

# Create advanced monitoring configuration
log_info "Setting up advanced monitoring..."

# Create Grafana dashboards configuration
sudo tee $MONITORING_DIR/dashboards/vps-platform-dashboard.json > /dev/null <<'EOF'
{
  "dashboard": {
    "id": null,
    "title": "VPS Platform - Production Dashboard",
    "tags": ["vps-platform", "production"],
    "style": "dark",
    "timezone": "browser",
    "editable": true,
    "gnetId": null,
    "graphTooltip": 0,
    "templating": {
      "list": []
    },
    "time": {
      "from": "now-1h",
      "to": "now",
      "refresh": "30s"
    },
    "timepicker": {},
    "annotations": {
      "list": []
    },
    "refresh": "30s",
    "schemaVersion": 27,
    "version": 1,
    "panels": [
      {
        "id": 1,
        "title": "System Overview",
        "type": "stat",
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 0,
          "y": 0
        },
        "targets": [
          {
            "expr": "up{job=\"node-exporter\"}",
            "legendFormat": "{{instance}}",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "palette-classic"
            },
            "custom": {
              "hideFrom": {
                "legend": false,
                "tooltip": false,
                "vis": false
              },
              "displayMode": "list"
            },
            "mappings": [],
            "thresholds": {
              "steps": [
                {
                  "color": "green",
                  "value": null
                },
                {
                  "color": "red",
                  "value": 0
                }
              ]
            },
            "unit": "short",
            "max": 100,
            "min": 0,
            "noValue": "0"
          },
          "overrides": []
        },
        "options": {
          "colorMode": "value",
          "graphMode": "area",
          "justifyMode": "auto",
          "orientation": "auto",
          "reduceOptions": {
            "values": false,
            "calcs": [
              "lastNotNull"
            ],
            "fields": ""
          },
          "text": {},
          "color": {
            "mode": "background"
          }
        },
        "pluginVersion": "9.0.0",
        "type": "stat"
      },
      {
        "id": 2,
        "title": "CPU Usage",
        "type": "graph",
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 12,
          "y": 0
        },
        "targets": [
          {
            "expr": "100 - (avg by(instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "{{instance}}",
            "refId": "B"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "palette-classic"
            },
            "custom": {
              "axisLabel": "",
              "axisPlacement": "auto",
              "barAlignment": 0,
              "drawStyle": "line",
              "fillOpacity": 10,
              "gradientMode": "none",
              "hideFrom": {
                "legend": false,
                "tooltip": false,
                "vis": false
              },
              "lineInterpolation": "linear",
              "lineWidth": 1,
              "pointSize": 5,
              "scaleDistribution": {
                "type": "linear"
              },
              "showPoints": "never",
              "spanNulls": false,
              "stacking": {
                "group": "A",
                "mode": "none"
              },
              "thresholdsStyle": {
                "mode": "off"
              }
            },
            "mappings": [],
            "thresholds": {
              "steps": [
                {
                  "color": "green",
                  "value": null
                },
                {
                  "color": "yellow",
                  "value": 70
                },
                {
                  "color": "red",
                  "value": 90
                }
              ]
            },
            "unit": "percent",
            "max": 100,
            "min": 0
          },
          "overrides": []
        },
        "options": {
          "alert": {
            "alertRule": {}
          },
          "tooltip": {
            "mode": "multi",
            "sort": "none"
          },
          "legend": {
            "displayMode": "list",
            "placement": "bottom"
          }
        },
        "pluginVersion": "9.0.0",
        "type": "graph"
      },
      {
        "id": 3,
        "title": "Memory Usage",
        "type": "graph",
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 0,
          "y": 8
        },
        "targets": [
          {
            "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
            "legendFormat": "{{instance}}",
            "refId": "C"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "palette-classic"
            },
            "custom": {
              "axisLabel": "",
              "axisPlacement": "auto",
              "barAlignment": 0,
              "drawStyle": "line",
              "fillOpacity": 10,
              "gradientMode": "none",
              "hideFrom": {
                "legend": false,
                "tooltip": false,
                "vis": false
              },
              "lineInterpolation": "linear",
              "lineWidth": 1,
              "pointSize": 5,
              "scaleDistribution": {
                "type": "linear"
              },
              "showPoints": "never",
              "spanNulls": false,
              "stacking": {
                "group": "A",
                "mode": "none"
              },
              "thresholdsStyle": {
                "mode": "off"
              }
            },
            "mappings": [],
            "thresholds": {
              "steps": [
                {
                  "color": "green",
                  "value": null
                },
                {
                  "color": "yellow",
                  "value": 80
                },
                {
                  "color": "red",
                  "value": 95
                }
              ]
            },
            "unit": "percent",
            "max": 100,
            "min": 0
          },
          "overrides": []
        },
        "options": {
          "alert": {
            "alertRule": {}
          },
          "tooltip": {
            "mode": "multi",
            "sort": "none"
          },
          "legend": {
            "displayMode": "list",
            "placement": "bottom"
          }
        },
        "pluginVersion": "9.0.0",
        "type": "graph"
      },
      {
        "id": 4,
        "title": "VPS Count by Status",
        "type": "piechart",
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 12,
          "y": 8
        },
        "targets": [
          {
            "expr": "count by (status) flint_vm_status",
            "legendFormat": "{{status}}",
            "refId": "D"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "palette-classic"
            },
            "custom": {}
          },
          "overrides": []
        },
        "options": {
          "reduceOptions": {
            "values": false,
            "calcs": [
              "delta"
            ],
            "fields": ""
          },
          "pieType": "pie",
          "tooltip": {
            "mode": "single",
            "sort": "none"
          },
          "legend": {
            "displayMode": "list",
            "placement": "right"
          }
        },
        "pluginVersion": "9.0.0",
        "type": "piechart"
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now",
      "refresh": "30s"
    },
    "refresh": "30s"
  }
}
EOF

log_success("Advanced features and monitoring setup completed!")
log_info "Advanced features implemented:"
log_info "  🌐 API Gateway with authentication and rate limiting"
log_info "  🎫 Customer Support Ticket System with Redis notifications"
log_info "  📊 Advanced Monitoring with custom dashboards"
log_info "  🔔 Analytics Plugin for API usage tracking"
log_info "  📧 Notification system for support tickets"
log_info "  📈 Real-time metrics collection and reporting"
log_info ""
log_info "Services:"
log_info "  API Gateway: Nginx with advanced middleware"
log_info "  Support Tickets: Python Flask app on port 5000"
log_info "  Monitoring: Enhanced Grafana dashboards"
log_info "  Analytics: Redis-based metrics collection"
log_info ""
log_info "Next steps:"
log_info "  1. Start support ticket system: sudo systemctl start support-tickets"
log_info "  2. Configure API Gateway: Update Nginx configuration"
log_info "  3. Import Grafana dashboards: Use provided JSON config"
log_info "  4. Set up notification channels: Configure email/SMS"
log_info "  5. Monitor advanced metrics: Check custom dashboards"

exit 0