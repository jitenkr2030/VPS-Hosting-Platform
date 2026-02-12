// MSME-VPS Server Templates Configuration
export interface ServerTemplate {
  id: string
  name: string
  category: string
  description: string
  icon: string
  price: string
  setupTime: string
  features: string[]
  targetAudience: string[]
  includes: string[]
  popular?: boolean
  indian?: boolean
  gstReady?: boolean
  oneClickDeploy?: boolean
}

export const serverTemplates: ServerTemplate[] = [
  // 1. Website & Online Presence Templates
  {
    id: 'wordpress-business',
    name: 'WordPress Business Website',
    category: 'website',
    description: 'Professional WordPress site with SSL, email, and automated backups',
    icon: '🌐',
    price: '₹999',
    setupTime: '5 minutes',
    features: [
      'Pre-installed WordPress latest version',
      'Free SSL certificate (Let\'s Encrypt)',
      'Business email accounts (5 included)',
      'Daily automated backups',
      'Security hardening',
      'Performance optimization',
      'CDN integration ready',
      'Google Analytics setup'
    ],
    targetAudience: ['Shops & retailers', 'Consultants', 'Professionals', 'Local service businesses'],
    includes: ['WordPress', 'SSL Certificate', 'Email Hosting', 'Backup System', 'Security Suite'],
    popular: true,
    indian: true,
    gstReady: true,
    oneClickDeploy: true
  },
  {
    id: 'wordpress-woocommerce',
    name: 'WordPress + WooCommerce Store',
    category: 'website',
    description: 'Complete e-commerce store with payment gateway integration',
    icon: '🛒',
    price: '₹1,299',
    setupTime: '10 minutes',
    features: [
      'WordPress + WooCommerce pre-installed',
      'Indian payment gateways (Razorpay, PayU)',
      'GST invoice generation',
      'Inventory management',
      'Shipping calculation',
      'Mobile-responsive themes',
      'SEO optimization',
      'Product import tools'
    ],
    targetAudience: ['Small online stores', 'Retail shops', 'Artisans', 'Local businesses'],
    includes: ['WooCommerce', 'Payment Gateway Setup', 'GST Invoicing', 'Inventory System', 'Mobile Themes'],
    indian: true,
    gstReady: true,
    oneClickDeploy: true
  },
  {
    id: 'portfolio-website',
    name: 'Portfolio / Company Website',
    category: 'website',
    description: 'Professional portfolio or company website with contact forms',
    icon: '📱',
    price: '₹799',
    setupTime: '5 minutes',
    features: [
      'Modern responsive design',
      'Contact forms with email integration',
      'Photo gallery and portfolio sections',
      'Social media integration',
      'Blog functionality',
      'SEO friendly URLs',
      'Google Maps integration',
      'Mobile menu navigation'
    ],
    targetAudience: ['Professionals', 'CA & lawyers', 'Creative agencies', 'Consultants'],
    includes: ['Responsive Theme', 'Contact Forms', 'Gallery', 'Blog System', 'SEO Tools'],
    indian: true,
    oneClickDeploy: true
  },

  // 2. Accounting & GST-Ready Server Templates
  {
    id: 'tally-cloud',
    name: 'Tally on Cloud (Single User)',
    category: 'accounting',
    description: 'Tally ERP with remote access and automated backups',
    icon: '🧾',
    price: '₹1,499',
    setupTime: '15 minutes',
    features: [
      'Tally ERP 9 pre-installed',
      'Remote desktop access (RDP)',
      'Automated daily backups',
      'Multi-user licensing support',
      'Data security encryption',
      'GST compliance features',
      'Report generation',
      'Mobile app access'
    ],
    targetAudience: ['Traders & wholesalers', 'CA firms', 'Distributors', 'Small manufacturers'],
    includes: ['Tally ERP License', 'Remote Access', 'Backup System', 'GST Compliance', 'Mobile Access'],
    popular: true,
    indian: true,
    gstReady: true,
    oneClickDeploy: true
  },
  {
    id: 'busy-accounting',
    name: 'Busy Accounting Software Hosting',
    category: 'accounting',
    description: 'Busy accounting with multi-user and GST features',
    icon: '📊',
    price: '₹1,299',
    setupTime: '15 minutes',
    features: [
      'Busy accounting software pre-installed',
      'GST invoicing and compliance',
      'Inventory management',
      'Bank reconciliation',
      'Multi-user access',
      'Automated backups',
      'Financial reports',
      'Data import/export'
    ],
    targetAudience: ['Small businesses', 'Traders', 'Service providers', 'Manufacturers'],
    includes: ['Busy Software', 'GST Features', 'Multi-user Access', 'Backup System', 'Reports'],
    indian: true,
    gstReady: true,
    oneClickDeploy: true
  },
  {
    id: 'marg-erp',
    name: 'Marg ERP Hosting',
    category: 'accounting',
    description: 'Marg ERP 9+ with inventory and billing features',
    icon: '🏭',
    price: '₹1,799',
    setupTime: '20 minutes',
    features: [
      'Marg ERP 9+ pre-installed',
      'Inventory and stock management',
      'GST billing and invoicing',
      'Barcode integration',
      'Multi-branch support',
      'Automated data backup',
      'Financial accounting',
      'Mobile reporting app'
    ],
    targetAudience: ['Manufacturers', 'Distributors', 'Wholesalers', 'Retail chains'],
    includes: ['Marg ERP License', 'Inventory System', 'GST Billing', 'Barcode Support', 'Mobile App'],
    indian: true,
    gstReady: true,
    oneClickDeploy: true
  },
  {
    id: 'gst-filing',
    name: 'GST Filing Server',
    category: 'accounting',
    description: 'Secure server for GST compliance and filing',
    icon: '📋',
    price: '₹999',
    setupTime: '10 minutes',
    features: [
      'GST filing software pre-installed',
      'Secure data encryption',
      'Automated backup system',
      'Document management',
      'Compliance reports',
      'CA/CS access controls',
      'Audit trail maintenance',
      'Integration with accounting software'
    ],
    targetAudience: ['CA firms', 'Tax consultants', 'Large businesses', 'Compliance officers'],
    includes: ['GST Software', 'Security Suite', 'Backup System', 'Document Management', 'Audit Tools'],
    indian: true,
    gstReady: true,
    oneClickDeploy: true
  },

  // 3. ERP & Business Management Templates
  {
    id: 'erpnext',
    name: 'ERPNext (Pre-installed)',
    category: 'erp',
    description: 'Complete ERP solution for growing businesses',
    icon: '🏢',
    price: '₹2,499',
    setupTime: '30 minutes',
    features: [
      'ERPNext latest version pre-installed',
      'HR and payroll management',
      'Inventory and stock management',
      'CRM and sales management',
      'Project management',
      'Manufacturing module',
      'Financial accounting',
      'Custom report builder'
    ],
    targetAudience: ['Manufacturing units', 'Logistics companies', 'Medium traders', 'Multi-branch businesses'],
    includes: ['ERPNext System', 'All Modules', 'Database Setup', 'Security Configuration', 'Training Materials'],
    popular: true,
    indian: true,
    gstReady: true,
    oneClickDeploy: true
  },
  {
    id: 'odoo-community',
    name: 'Odoo Community Edition',
    category: 'erp',
    description: 'Flexible Odoo ERP with essential business apps',
    icon: '🔧',
    price: '₹2,199',
    setupTime: '25 minutes',
    features: [
      'Odoo 17 Community Edition',
      'Inventory management',
      'CRM and sales',
      'Accounting and invoicing',
      'Website builder',
      'Project management',
      'HR management',
      'Reporting dashboard'
    ],
    targetAudience: ['Growing businesses', 'Service companies', 'Trading companies', 'Professional firms'],
    includes: ['Odoo System', 'Core Apps', 'Database Setup', 'User Training', 'Support Package'],
    indian: true,
    gstReady: true,
    oneClickDeploy: true
  },
  {
    id: 'inventory-billing',
    name: 'Inventory + Billing + HR ERP',
    category: 'erp',
    description: 'Focused ERP for inventory, billing, and HR',
    icon: '📦',
    price: '₹1,999',
    setupTime: '20 minutes',
    features: [
      'Inventory management system',
      'GST billing and invoicing',
      'HR and payroll management',
      'Supplier management',
      'Customer relationship management',
      'Financial reporting',
      'Barcode scanning support',
      'Multi-location inventory'
    ],
    targetAudience: ['Medium traders', 'Small manufacturers', 'Service companies', 'Retail chains'],
    includes: ['ERP Software', 'Inventory System', 'Billing Module', 'HR Module', 'Reporting Tools'],
    indian: true,
    gstReady: true,
    oneClickDeploy: true
  },
  {
    id: 'manufacturing-erp',
    name: 'Manufacturing ERP Template',
    category: 'erp',
    description: 'Complete manufacturing ERP with production planning',
    icon: '🏭',
    price: '₹2,999',
    setupTime: '35 minutes',
    features: [
      'Production planning and scheduling',
      'Bill of materials (BOM) management',
      'Quality control system',
      'Shop floor management',
      'Supply chain management',
      'Cost accounting',
      'Maintenance management',
      'Compliance reporting'
    ],
    targetAudience: ['Manufacturing units', 'Industrial companies', 'Production houses', 'Assembly plants'],
    includes: ['Manufacturing ERP', 'Production Module', 'Quality System', 'Maintenance Module', 'Compliance Tools'],
    indian: true,
    gstReady: true,
    oneClickDeploy: true
  },

  // 4. Retail & POS Server Templates
  {
    id: 'pos-inventory',
    name: 'POS + Inventory Server',
    category: 'retail',
    description: 'Complete POS system with inventory management',
    icon: '🛍️',
    price: '₹1,799',
    setupTime: '20 minutes',
    features: [
      'POS software pre-installed',
      'Barcode scanner support',
      'Inventory tracking',
      'Sales reporting',
      'Customer management',
      'GST invoicing',
      'Multi-store support',
      'Mobile POS access'
    ],
    targetAudience: ['Retail shops', 'Supermarkets', 'Pharmacies', 'Convenience stores'],
    includes: ['POS Software', 'Barcode System', 'Inventory Module', 'GST Billing', 'Mobile App'],
    popular: true,
    indian: true,
    gstReady: true,
    oneClickDeploy: true
  },
  {
    id: 'retail-billing',
    name: 'Retail Billing Software Hosting',
    category: 'retail',
    description: 'Billing software with GST and inventory features',
    icon: '💳',
    price: '₹1,499',
    setupTime: '15 minutes',
    features: [
      'Retail billing software',
      'GST-compliant invoicing',
      'Inventory management',
      'Customer database',
      'Discount and offer management',
      'Daily sales reports',
      'Barcode integration',
      'Loyalty program support'
    ],
    targetAudience: ['Retail shops', 'Small stores', 'Boutiques', 'Specialty shops'],
    includes: ['Billing Software', 'GST Invoicing', 'Inventory System', 'Customer DB', 'Reporting Tools'],
    indian: true,
    gstReady: true,
    oneClickDeploy: true
  },
  {
    id: 'restaurant-pos',
    name: 'Restaurant POS Backend Server',
    category: 'retail',
    description: 'Restaurant POS with kitchen and table management',
    icon: '🍽️',
    price: '₹1,999',
    setupTime: '25 minutes',
    features: [
      'Restaurant POS system',
      'Table management',
      'Kitchen order display (KDS)',
      'Menu management',
      'Recipe costing',
      'GST restaurant billing',
      'Staff management',
      'Online ordering integration'
    ],
    targetAudience: ['Restaurants', 'Cafés', 'Food courts', 'Cloud kitchens'],
    includes: ['Restaurant POS', 'KDS System', 'Menu Management', 'Table Management', 'Online Ordering'],
    indian: true,
    gstReady: true,
    oneClickDeploy: true
  },

  // 5. Startup & SaaS Ready Templates
  {
    id: 'nodejs-app',
    name: 'Node.js App Server',
    category: 'startup',
    description: 'Ready-to-deploy Node.js application server',
    icon: '💚',
    price: '₹1,299',
    setupTime: '10 minutes',
    features: [
      'Node.js 18+ pre-installed',
      'NPM package manager',
      'PM2 process manager',
      'MongoDB/MySQL database',
      'Redis caching',
      'SSL certificate',
      'Domain configuration',
      'Git deployment setup'
    ],
    targetAudience: ['Tech startups', 'Agencies', 'Freelancers', 'App developers'],
    includes: ['Node.js Runtime', 'Database', 'Process Manager', 'SSL Certificate', 'Deployment Tools'],
    indian: true,
    oneClickDeploy: true
  },
  {
    id: 'laravel-app',
    name: 'Laravel Application Server',
    category: 'startup',
    description: 'Optimized server for Laravel PHP applications',
    icon: '🔰',
    price: '₹1,199',
    setupTime: '10 minutes',
    features: [
      'PHP 8.2 with required extensions',
      'Laravel 10+ pre-installed',
      'Composer dependency manager',
      'MySQL database',
      'Nginx web server',
      'Redis caching',
      'Supervisor process manager',
      'SSL and domain setup'
    ],
    targetAudience: ['PHP developers', 'Web agencies', 'SaaS companies', 'Startups'],
    includes: ['Laravel Framework', 'Database', 'Web Server', 'Cache System', 'SSL Certificate'],
    indian: true,
    oneClickDeploy: true
  },
  {
    id: 'django-app',
    name: 'Django Application Server',
    category: 'startup',
    description: 'Python Django server with production optimization',
    icon: '🐍',
    price: '₹1,399',
    setupTime: '12 minutes',
    features: [
      'Python 3.11+ with Django 4+',
      'PostgreSQL database',
      'Gunicorn WSGI server',
      'Nginx reverse proxy',
      'Redis caching',
      'Virtual environment setup',
      'SSL certificate',
      'Static file serving'
    ],
    targetAudience: ['Python developers', 'Data science teams', 'AI startups', 'Web agencies'],
    includes: ['Django Framework', 'PostgreSQL', 'Web Server', 'Cache System', 'SSL Certificate'],
    indian: true,
    oneClickDeploy: true
  },
  {
    id: 'database-server',
    name: 'Database Server (MySQL/PostgreSQL)',
    category: 'startup',
    description: 'Optimized database server for applications',
    icon: '🗄️',
    price: '₹1,499',
    setupTime: '8 minutes',
    features: [
      'MySQL 8.0 and PostgreSQL 15',
      'Database optimization',
      'Automated backups',
      'Replication support',
      'Monitoring dashboard',
      'User management',
      'SSL encryption',
      'Remote access setup'
    ],
    targetAudience: ['Startups', 'SaaS companies', 'Data-driven businesses', 'Agencies'],
    includes: ['Database Systems', 'Backup Tools', 'Monitoring', 'Security Suite', 'Access Management'],
    indian: true,
    oneClickDeploy: true
  },
  {
    id: 'api-backend',
    name: 'API Backend Server',
    category: 'startup',
    description: 'Scalable backend server for APIs and microservices',
    icon: '🔌',
    price: '₹1,799',
    setupTime: '15 minutes',
    features: [
      'Docker container support',
      'Kubernetes-ready setup',
      'Load balancer configuration',
      'API gateway',
      'Monitoring and logging',
      'Auto-scaling ready',
      'SSL termination',
      'Health checks'
    ],
    targetAudience: ['Tech startups', 'API companies', 'Microservices architectures', 'DevOps teams'],
    includes: ['Container Runtime', 'Load Balancer', 'Monitoring Stack', 'API Gateway', 'Auto-scaling'],
    indian: true,
    oneClickDeploy: true
  },
  {
    id: 'staging-production',
    name: 'Staging + Production Setup',
    category: 'startup',
    description: 'Complete development to production environment',
    icon: '🔄',
    price: '₹2,499',
    setupTime: '30 minutes',
    features: [
      'Separate staging and production',
      'Git deployment pipelines',
      'Environment variables management',
      'Database migration tools',
      'Rollback capabilities',
      'SSL certificates',
      'Domain routing',
      'Backup strategies'
    ],
    targetAudience: ['Startups', 'Development teams', 'SaaS companies', 'Agencies'],
    includes: ['Dual Environments', 'Deployment Pipeline', 'Database Tools', 'SSL Setup', 'Backup System'],
    indian: true,
    oneClickDeploy: true
  },

  // 6. Office & Collaboration Templates
  {
    id: 'email-server',
    name: 'Company Email Server',
    category: 'office',
    description: 'Professional email server for business communication',
    icon: '📧',
    price: '₹1,299',
    setupTime: '15 minutes',
    features: [
      'Postfix email server',
      'Dovecot IMAP/POP3',
      'Spam filtering (SpamAssassin)',
      'Virus scanning (ClamAV)',
      'Webmail interface',
      'SSL/TLS encryption',
      'Auto-responder setup',
      'Email forwarding'
    ],
    targetAudience: ['Small offices', 'Professional firms', 'Service companies', 'Remote teams'],
    includes: ['Email Server', 'Security Suite', 'Webmail', 'SSL Certificate', 'Spam Protection'],
    indian: true,
    oneClickDeploy: true
  },
  {
    id: 'file-sharing',
    name: 'File Sharing & Backup Server',
    category: 'office',
    description: 'Secure file sharing and backup solution',
    icon: '📁',
    price: '₹999',
    setupTime: '10 minutes',
    features: [
      'Nextcloud file sharing',
      'Automatic backup system',
      'Version control',
      'Access control and permissions',
      'Mobile app access',
      'End-to-end encryption',
      'Calendar and contacts',
      'Document collaboration'
    ],
    targetAudience: ['Small offices', 'Remote teams', 'Agencies', 'Service companies'],
    includes: ['File Sharing Platform', 'Backup System', 'Mobile Apps', 'Security Features', 'Collaboration Tools'],
    popular: true,
    indian: true,
    oneClickDeploy: true
  },
  {
    id: 'remote-work',
    name: 'Remote Work Server',
    category: 'office',
    description: 'Complete remote work solution for teams',
    icon: '🏠',
    price: '₹1,799',
    setupTime: '20 minutes',
    features: [
      'VPN server for secure access',
      'Team collaboration tools',
      'Video conferencing setup',
      'Project management software',
      'Time tracking system',
      'Employee monitoring',
      'Secure file access',
      'Communication tools'
    ],
    targetAudience: ['Remote teams', 'Small offices', 'Agencies', 'Service companies'],
    includes: ['VPN Server', 'Collaboration Suite', 'Project Management', 'Time Tracking', 'Security Tools'],
    indian: true,
    oneClickDeploy: true
  },
  {
    id: 'internal-crm',
    name: 'Internal CRM Server',
    category: 'office',
    description: 'Customer relationship management for internal use',
    icon: '👥',
    price: '₹1,499',
    setupTime: '15 minutes',
    features: [
      'CRM software pre-installed',
      'Customer database management',
      'Sales pipeline tracking',
      'Email marketing integration',
      'Task management',
      'Reporting dashboard',
      'Mobile access',
      'Data import/export'
    ],
    targetAudience: ['Small offices', 'Sales teams', 'Service companies', 'Professional firms'],
    includes: ['CRM Software', 'Customer Database', 'Sales Tools', 'Email Integration', 'Reporting System'],
    indian: true,
    oneClickDeploy: true
  }
]

export const templateCategories = [
  {
    id: 'website',
    name: 'Website & Online Presence',
    description: 'Professional websites and online stores',
    icon: '🌐',
    templates: serverTemplates.filter(t => t.category === 'website')
  },
  {
    id: 'accounting',
    name: 'Accounting & GST-Ready',
    description: 'Accounting software with GST compliance',
    icon: '🧾',
    templates: serverTemplates.filter(t => t.category === 'accounting')
  },
  {
    id: 'erp',
    name: 'ERP & Business Management',
    description: 'Complete ERP solutions for businesses',
    icon: '🏢',
    templates: serverTemplates.filter(t => t.category === 'erp')
  },
  {
    id: 'retail',
    name: 'Retail & POS',
    description: 'Point of sale and retail management',
    icon: '🛍️',
    templates: serverTemplates.filter(t => t.category === 'retail')
  },
  {
    id: 'startup',
    name: 'Startup & SaaS Ready',
    description: 'Development and deployment environments',
    icon: '🚀',
    templates: serverTemplates.filter(t => t.category === 'startup')
  },
  {
    id: 'office',
    name: 'Office & Collaboration',
    description: 'Productivity and collaboration tools',
    icon: '🏢',
    templates: serverTemplates.filter(t => t.category === 'office')
  }
]

export const indianComplianceFeatures = [
  {
    icon: '🇮🇳',
    title: 'India Data Centers',
    description: 'Servers hosted in Indian data centers for data sovereignty'
  },
  {
    icon: '🧾',
    title: 'GST-Compliant Billing',
    description: 'INR pricing with proper GST invoices and tax compliance'
  },
  {
    icon: '💬',
    title: 'Local Support',
    description: 'Phone and WhatsApp support in Hindi, English, and regional languages'
  },
  {
    icon: '🔧',
    title: 'No Technical Setup',
    description: 'One-click deployment with no technical knowledge required'
  },
  {
    icon: '📊',
    title: 'Simple Dashboard',
    description: 'Easy-to-use dashboard available in Hindi and English'
  },
  {
    icon: '🛡️',
    title: 'Data Security',
    description: 'Enterprise-grade security with Indian data protection compliance'
  }
]