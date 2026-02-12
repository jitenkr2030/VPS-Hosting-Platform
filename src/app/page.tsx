'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Server, Shield, Zap, Users, Headphones, Cpu, HardDrive, Wifi, Building, IndianRupee, MessageCircle, Award, FileText, Lock, HelpCircle, Star, Phone } from 'lucide-react'

export default function Home() {
  const [selectedPlan, setSelectedPlan] = useState('professional')
  const [productCategory, setProductCategory] = useState('all')
  const [showTemplates, setShowTemplates] = useState(false)

  const plans = [
    {
      id: 'free',
      name: 'Free VPS',
      price: '₹0',
      description: 'Perfect for trying out our platform - no credit card required',
      category: 'technical',
      badge: 'FREE',
      tagline: 'Try before you buy - 30 days free',
      features: [
        '0.5 vCPU Core (shared)',
        '512 MB RAM',
        '10 GB NVMe SSD',
        '500 GB Bandwidth',
        '1 Snapshot (manual)',
        'Basic monitoring',
        'Community support (forum)',
        'Full root access',
        'Ubuntu 22.04 LTS',
        '99.9% Uptime SLA',
        '30 days trial'
      ],
      color: 'border-green-400',
      limitations: [
        'Max 1 VM per account',
        'No custom OS images',
        'No API access',
        'No priority support',
        'Auto-suspend after 30 days'
      ]
    },
    {
      id: 'starter',
      name: 'Starter VPS',
      price: '₹499',
      description: 'Perfect for developers and small projects',
      category: 'technical',
      features: [
        '1 vCPU Core',
        '2 GB RAM',
        '40 GB NVMe SSD',
        '2 TB Bandwidth',
        '1 Snapshot',
        'Basic monitoring',
        'Email support',
        'Full root access',
        'API access',
        '99.9% Uptime SLA'
      ],
      color: 'border-gray-200'
    },
    {
      id: 'professional',
      name: 'Professional VPS',
      price: '₹999',
      description: 'Ideal for growing businesses and developers',
      category: 'technical',
      popular: true,
      badge: 'Most Popular',
      features: [
        '2 vCPU Cores',
        '4 GB RAM',
        '80 GB NVMe SSD',
        '4 TB Bandwidth',
        '3 Snapshots',
        'Advanced monitoring',
        'Priority support',
        'Full root access',
        'API access',
        'Free backups',
        '99.9% Uptime SLA'
      ],
      color: 'border-indigo-500'
    },
    {
      id: 'business',
      name: 'Business VPS',
      price: '₹1,999',
      description: 'High-performance VPS for demanding applications',
      category: 'technical',
      features: [
        '4 vCPU Cores',
        '8 GB RAM',
        '160 GB NVMe SSD',
        '8 TB Bandwidth',
        'Unlimited snapshots',
        'Premium monitoring',
        '24/7 support',
        'Full root access',
        'API access',
        'Daily backups',
        'DDoS protection',
        '99.9% Uptime SLA'
      ],
      color: 'border-gray-200'
    },
    {
      id: 'msme',
      name: 'MSME-VPS Business Server',
      price: '₹999',
      description: 'Complete business-ready server for Indian MSMEs',
      category: 'business',
      badge: 'MSME Focused',
      features: [
        '2 vCPU Cores',
        '4 GB RAM',
        '80 GB SSD Storage',
        '1 Public IP Address',
        'Daily Automated Backups',
        'Free SSL Certificate',
        'Managed Security & Updates',
        'Indian WhatsApp & Email Support',
        'No Technical Skills Required',
        'GST-Compliant Invoicing',
        '99% Uptime Guarantee',
        'Pre-configured for Business Apps'
      ],
      color: 'border-green-500',
      tagline: 'Simple, Secure, Managed VPS for Small Businesses'
    }
  ]

  const addons = [
    {
      name: 'Managed Support',
      price: '₹299/month',
      description: 'Priority support with dedicated account manager',
      icon: Headphones
    },
    {
      name: 'Extra Backups',
      price: '₹99/month', 
      description: 'Additional backup storage with 30-day retention',
      icon: Shield
    },
    {
      name: 'Setup & Migration',
      price: '₹499-₹999',
      description: 'One-time setup and data migration service',
      icon: Zap
    }
  ]

  const features = [
    {
      icon: Building,
      title: 'Business-Ready Server',
      description: 'Pre-configured for WordPress, ERPNext, accounting software, and custom business applications'
    },
    {
      icon: Shield,
      title: 'Fully Managed Security',
      description: 'We handle security updates, patches, and monitoring so you can focus on your business'
    },
    {
      icon: MessageCircle,
      title: 'Indian WhatsApp Support',
      description: 'Local support in Hindi, English, and regional languages via WhatsApp and email'
    },
    {
      icon: Zap,
      title: 'No Technical Skills Required',
      description: 'Simple dashboard designed for business owners - no command line or technical knowledge needed'
    },
    {
      icon: HardDrive,
      title: 'Automated Backups',
      description: 'Daily automatic backups with one-click restore to protect your business data'
    },
    {
      icon: Award,
      title: 'MSME Registered Provider',
      description: 'Officially MSME (Udyam) registered with GST-compliant billing and Indian data centers'
    }
  ]

  const useCases = [
    {
      title: 'WordPress Websites',
      description: 'Perfect for business websites, blogs, and e-commerce stores',
      icon: '🌐'
    },
    {
      title: 'ERPNext & Odoo',
      description: 'Host your business management and ERP software',
      icon: '📊'
    },
    {
      title: 'Accounting & GST Software',
      description: 'Run Tally, Busy, and other accounting applications',
      icon: '🧾'
    },
    {
      title: 'Custom Applications',
      description: 'Deploy your business software and databases',
      icon: '⚙️'
    }
  ]

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      business: 'Chartered Accountant Firm',
      content: 'MSME-VPS made it so easy to host our client portal. No technical knowledge needed, and WhatsApp support is amazing!',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      business: 'Educational Institute',
      content: 'We migrated from shared hosting to MSME-VPS. Our website is faster and we get proper Indian support when needed.',
      rating: 5
    },
    {
      name: 'Amit Patel',
      business: 'Small Manufacturing',
      content: 'Perfect for our ERP system. Managed security means we don\'t have to worry about technical issues.',
      rating: 5
    }
  ]

  const stats = [
    { value: '500+', label: 'MSME Businesses Trust Us' },
    { value: '99%', label: 'Uptime Guarantee' },
    { value: '24/7', label: 'WhatsApp Support' },
    { value: 'GST', label: 'Compliant Billing' }
  ]

  const trustIndicators = [
    { icon: Award, text: 'MSME Registered' },
    { icon: FileText, text: 'GST Compliant' },
    { icon: Shield, text: 'ISO Certified' },
    { icon: Lock, text: 'Data Privacy' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Server className="h-8 w-8 text-indigo-600" />
              <div>
                <span className="text-xl font-bold text-gray-900">Pro VPS Hosting</span>
                <p className="text-xs text-gray-600">Technical & Business Hosting</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-indigo-600 transition">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-indigo-600 transition">Pricing</a>
              <a href="#usecases" className="text-gray-600 hover:text-indigo-600 transition">Use Cases</a>
              <a href="#testimonials" className="text-gray-600 hover:text-indigo-600 transition">Testimonials</a>
              <Button variant="ghost">Login</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-green-100 text-green-800 mb-4">
              <Award className="h-4 w-4 mr-2" />
              MSME Registered Provider
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">VPS Hosting</span> & <span className="bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">MSME Solutions</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Complete hosting solutions for developers, businesses, and Indian MSMEs. 
              From technical VPS hosting to managed business servers - we've got you covered.
            </p>
            
            {/* Product Category Selector */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button 
                variant={productCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setProductCategory('all')}
                className="px-6"
              >
                <Server className="h-4 w-4 mr-2" />
                All Products
              </Button>
              <Button 
                variant={productCategory === 'technical' ? 'default' : 'outline'}
                onClick={() => setProductCategory('technical')}
                className="px-6"
              >
                <Cpu className="h-4 w-4 mr-2" />
                Technical VPS
              </Button>
              <Button 
                variant={productCategory === 'business' ? 'default' : 'outline'}
                onClick={() => setProductCategory('business')}
                className="px-6 bg-green-600 hover:bg-green-700 text-white"
              >
                <Building className="h-4 w-4 mr-2" />
                MSME-VPS
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Zap className="h-5 w-5 mr-2" />
                Start FREE - No Credit Card Required
              </Button>
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <IndianRupee className="h-5 w-5 mr-2" />
                View Paid Plans from ₹499/month
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => setShowTemplates(true)}
              >
                <Zap className="h-5 w-5 mr-2" />
                Browse Templates
              </Button>
              <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp Support
              </Button>
            </div>
          </div>

          {/* Featured Products Preview */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Technical VPS Preview */}
            <Card className="p-6 shadow-xl border-indigo-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-indigo-600">Technical VPS Hosting</CardTitle>
                  <Badge className="bg-indigo-100 text-indigo-800">For Developers</Badge>
                </div>
                <CardDescription>Full control with root access and APIs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center py-2">
                  <div className="text-2xl font-bold text-indigo-600">From ₹499</div>
                  <div className="text-gray-600">per month</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Full Root Access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">API Access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">99.9% Uptime SLA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* MSME-VPS Preview */}
            <Card className="p-6 shadow-xl border-green-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-green-600">MSME-VPS Business</CardTitle>
                  <Badge className="bg-green-100 text-green-800">For MSMEs</Badge>
                </div>
                <CardDescription>Managed servers for Indian businesses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center py-2">
                  <div className="text-2xl font-bold text-green-600">₹999</div>
                  <div className="text-gray-600">per month</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">No Technical Skills Required</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Indian WhatsApp Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">GST-Compliant Billing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustIndicators.map((indicator, index) => (
              <div key={index} className="flex items-center justify-center space-x-3">
                <indicator.icon className="h-8 w-8 text-green-600" />
                <span className="font-semibold text-gray-900">{indicator.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Business-Ready <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Server Templates</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pre-configured servers for Indian MSMEs. Start working in minutes, not days.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Badge className="bg-green-100 text-green-800 px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                One-Click Deploy
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                GST-Compliant
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
                <Phone className="h-4 w-4 mr-2" />
                Indian Support
              </Badge>
            </div>
          </div>

          {/* Template Categories Preview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowTemplates(true)}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">🌐</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Website & Online Presence</h3>
                  <p className="text-sm text-gray-600">WordPress, e-commerce, portfolio sites</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-green-600">3 templates</span> • From ₹799/month
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowTemplates(true)}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">🧾</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Accounting & GST-Ready</h3>
                  <p className="text-sm text-gray-600">Tally, Busy, Marg ERP, GST filing</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-green-600">4 templates</span> • From ₹999/month
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowTemplates(true)}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">🏢</div>
                <div>
                  <h3 className="font-semibold text-gray-900">ERP & Business Management</h3>
                  <p className="text-sm text-gray-600">ERPNext, Odoo, manufacturing ERP</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-green-600">4 templates</span> • From ₹1,999/month
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowTemplates(true)}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">🛍️</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Retail & POS</h3>
                  <p className="text-sm text-gray-600">POS software, inventory, restaurants</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-green-600">3 templates</span> • From ₹1,499/month
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowTemplates(true)}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">🚀</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Startup & SaaS Ready</h3>
                  <p className="text-sm text-gray-600">Node.js, Laravel, Django, databases</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-green-600">6 templates</span> • From ₹1,199/month
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowTemplates(true)}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">🏢</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Office & Collaboration</h3>
                  <p className="text-sm text-gray-600">Email, file sharing, CRM, remote work</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-green-600">4 templates</span> • From ₹999/month
              </div>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              onClick={() => setShowTemplates(true)}
            >
              <Zap className="h-5 w-5 mr-2" />
              Browse All 24 Templates
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Designed for <span className="bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">Indian MSMEs</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to run your business online, without the technical complexity
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="usecases" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Perfect for Your <span className="bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">Business Applications</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Host your business software with confidence
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{useCase.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-600 text-sm">{useCase.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Perfect Plan</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {productCategory === 'all' && 'Complete hosting solutions for every need - from developers to MSMEs'}
              {productCategory === 'technical' && 'Technical VPS hosting with full control and root access'}
              {productCategory === 'business' && 'Managed business servers for Indian MSMEs - no technical skills required'}
            </p>
          </div>

          {/* Filtered Plans Display */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans
              .filter(plan => productCategory === 'all' || plan.category === productCategory)
              .map((plan) => (
              <Card key={plan.id} className={`p-8 hover:shadow-xl transition-all border-2 ${plan.color} ${plan.popular ? 'shadow-xl scale-105' : ''}`}>
                {plan.badge && (
                  <div className="text-center mb-4">
                    <Badge className={`${plan.id === 'free' ? 'bg-green-100 text-green-800' : plan.category === 'business' ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800'} text-sm px-4 py-2`}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  {plan.tagline && <p className="text-sm text-green-600 mb-2">{plan.tagline}</p>}
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {plan.price}<span className="text-lg text-gray-600">{plan.id === 'free' ? '' : '/month'}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                  {plan.limitations && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-yellow-800 font-semibold">Limitations:</p>
                      {plan.limitations.map((limitation, idx) => (
                        <p key={idx} className="text-xs text-yellow-700">• {limitation}</p>
                      ))}
                    </div>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.slice(0, 6).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${
                    plan.id === 'free' 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                      : plan.category === 'business' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : plan.popular 
                          ? 'bg-indigo-600 hover:bg-indigo-700' 
                          : ''
                  }`}
                  variant={plan.id === 'free' || plan.category === 'business' || plan.popular ? 'default' : 'outline'}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.id === selectedPlan ? 'Selected ✓' : plan.id === 'free' ? 'Start Free Trial' : `Get ${plan.name}`}
                </Button>
              </Card>
            ))}
          </div>

          {/* Product Comparison Table */}
          {productCategory === 'all' && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Compare Our Products</h3>
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg shadow">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Starter VPS</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Professional VPS</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Business VPS</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">MSME-VPS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Price</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">₹499/mo</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">₹999/mo</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">₹1,999/mo</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-semibold bg-green-50">₹999/mo</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Target User</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">Developers</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">Growing Businesses</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">Enterprise</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-semibold bg-green-50">Indian MSMEs</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Root Access</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">✓</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">✓</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">✓</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-500 bg-green-50">✗ (Managed)</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Technical Skills</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">Required</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">Required</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">Required</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-semibold bg-green-50">Not Required</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Support Type</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">Email</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">Priority</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">24/7</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-semibold bg-green-50">WhatsApp + Indian</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">GST Billing</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">✓</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">✓</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">✓</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-semibold bg-green-50">✓ (Specialized)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add-ons for MSME-VPS */}
          {productCategory === 'business' && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">MSME-VPS Add-ons</h3>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {addons.map((addon, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-center mb-4">
                      <addon.icon className="h-8 w-8 text-orange-600 mr-3" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                        <p className="text-green-600 font-bold">{addon.price}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{addon.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by <span className="bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">Indian MSMEs</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our customers say about MSME-VPS
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.business}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-orange-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Grow Your Business Online?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join 500+ Indian MSMEs who trust MSME-VPS for their business hosting needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              <IndianRupee className="h-5 w-5 mr-2" />
              Start at ₹999/month
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
              <MessageCircle className="h-5 w-5 mr-2" />
              Chat on WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Server className="h-8 w-8 text-indigo-400" />
                <span className="text-xl font-bold">Pro VPS Hosting</span>
              </div>
              <p className="text-gray-400 mb-4">Technical VPS & MSME Business Solutions</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-800 text-green-200 text-xs">MSME Registered</Badge>
                <Badge className="bg-indigo-800 text-indigo-200 text-xs">GST Compliant</Badge>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Technical VPS</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Free VPS</a></li>
                <li><a href="#" className="hover:text-white transition">Starter VPS</a></li>
                <li><a href="#" className="hover:text-white transition">Professional VPS</a></li>
                <li><a href="#" className="hover:text-white transition">Business VPS</a></li>
                <li><a href="#" className="hover:text-white transition">API Access</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">MSME-VPS</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Business Server</a></li>
                <li><a href="#" className="hover:text-white transition">Managed Services</a></li>
                <li><a href="#" className="hover:text-white transition">WhatsApp Support</a></li>
                <li><a href="#" className="hover:text-white transition">GST Billing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Technical Support</a></li>
                <li><a href="#" className="hover:text-white transition">WhatsApp Support</a></li>
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Status Page</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Legal</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Pro VPS Hosting. Complete hosting solutions for developers and Indian MSMEs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}