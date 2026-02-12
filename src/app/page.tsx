'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Server, Shield, Zap, Users, Headphones, Cpu, HardDrive, Wifi, Building, IndianRupee, MessageCircle, Award, FileText, Lock, HelpCircle, Star, Phone, Cloud, Database, Globe, Settings, Monitor, AlertTriangle, Key } from 'lucide-react'

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

  // Private Cloud Solutions
  const privateCloudSolutions = [
    {
      id: 'private-cloud',
      name: 'Private Cloud-in-a-Box',
      price: 'Custom Quote',
      description: 'Complete on-premise cloud infrastructure for enterprises requiring data sovereignty',
      category: 'enterprise',
      badge: 'ENTERPRISE',
      tagline: 'Data Sovereignty & Compliance Guaranteed',
      icon: Cloud,
      features: [
        'Complete on-premise cloud infrastructure',
        'Data residency within your organization',
        'GDPR, HIPAA, ISO27001 compliance built-in',
        'White-label customization for your brand',
        'Air-gapped deployment capability',
        'Enterprise security with MFA & RBAC',
        'Real-time monitoring & analytics dashboard',
        'Automated compliance reporting',
        'Bootable ISO for offline installation',
        'Multi-tenant architecture with isolation',
        '99.9% uptime with SLA guarantee',
        '24/7 enterprise support'
      ],
      color: 'border-purple-500',
      highlights: [
        '60-80% cost savings vs public cloud',
        'Complete data control & ownership',
        'No vendor lock-in',
        'Custom integration capabilities'
      ]
    },
    {
      id: 'government',
      name: 'Government Cloud',
      price: 'Custom Quote',
      description: 'Secure cloud infrastructure for government agencies and public sector organizations',
      category: 'government',
      badge: 'GOVERNMENT',
      tagline: 'Secure & Compliant for Public Sector',
      icon: Building,
      features: [
        'Government audit compliance',
        'Citizen data protection',
        'Secure inter-departmental connectivity',
        'National data residency',
        'Defense-grade security',
        'Regulatory reporting automation',
        'Multi-language support',
        'Custom workflow integration',
        'Disaster recovery capabilities',
        'High availability clustering',
        'Secure remote access',
        'Comprehensive audit trails'
      ],
      color: 'border-blue-600',
      highlights: [
        'Meets government security standards',
        'Complete audit trail logging',
        'National data sovereignty',
        'Custom clearance levels'
      ]
    },
    {
      id: 'education',
      name: 'Education Cloud',
      price: 'Custom Quote',
      description: 'Campus-wide cloud infrastructure for educational institutions and universities',
      category: 'education',
      badge: 'EDUCATION',
      tagline: 'Campus-Wide Infrastructure for Learning',
      icon: Award,
      features: [
        'Campus-wide cloud deployment',
        'Student/faculty access controls',
        'Research computing infrastructure',
        'Learning Management System hosting',
        'Library system integration',
        'Departmental resource isolation',
        'Collaboration tools integration',
        'Academic calendar integration',
        'Secure student data handling',
        'Scalable for growing institutions',
        'Budget-friendly pricing models',
        'Educational compliance standards'
      ],
      color: 'border-green-600',
      highlights: [
        'Special pricing for education',
        'Research data protection',
        'Campus network integration',
        'Student privacy protection'
      ]
    },
    {
      id: 'healthcare',
      name: 'Healthcare Cloud',
      price: 'Custom Quote',
      description: 'HIPAA-compliant cloud infrastructure for healthcare organizations and hospitals',
      category: 'healthcare',
      badge: 'HEALTHCARE',
      tagline: 'HIPAA-Compliant Healthcare Infrastructure',
      icon: Shield,
      features: [
        'HIPAA compliance built-in',
        'Patient data encryption & protection',
        'Secure medical record systems',
        'Telemedicine infrastructure',
        'Research & clinical trial support',
        'Disaster recovery for healthcare',
        'Healthcare audit compliance',
        'Secure provider access controls',
        'Medical device integration',
        'Emergency response systems',
        'Data backup & recovery',
        'Healthcare analytics dashboard'
      ],
      color: 'border-red-600',
      highlights: [
        'HIPAA compliance guaranteed',
        'Patient data protection',
        'Healthcare-specific workflows',
        'Emergency response ready'
      ]
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
              <a href="#private-cloud" className="text-gray-600 hover:text-purple-600 transition font-semibold">Private Cloud</a>
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
              <Button 
                variant={productCategory === 'enterprise' ? 'default' : 'outline'}
                onClick={() => setProductCategory('enterprise')}
                className="px-6 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Cloud className="h-4 w-4 mr-2" />
                Private Cloud
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
              <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                <Cloud className="h-5 w-5 mr-2" />
                Private Cloud Demo
              </Button>
              <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp Support
              </Button>
            </div>
          </div>

          {/* Featured Products Preview */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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

            {/* Private Cloud Preview */}
            <Card className="p-6 shadow-xl border-purple-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cloud className="h-6 w-6 text-purple-600" />
                    <CardTitle className="text-lg font-bold text-purple-600">Private Cloud-in-a-Box</CardTitle>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>
                </div>
                <CardDescription>On-premise cloud infrastructure with data sovereignty</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center py-2">
                  <div className="text-2xl font-bold text-purple-600">Custom Quote</div>
                  <div className="text-gray-600">Based on requirements</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Complete Data Sovereignty</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">GDPR & HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">60-80% Cost Savings</span>
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

      {/* Pricing Section */}
      <section className="py-16 bg-white" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Perfect Plan</h2>
            <p className="text-gray-600">Flexible pricing for every need - from developers to enterprises</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.id} className={`p-6 shadow-lg ${plan.popular ? 'ring-2 ring-indigo-500 scale-105' : ''} ${plan.color}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    {plan.badge && <Badge className="bg-indigo-100 text-indigo-800">{plan.badge}</Badge>}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  {plan.tagline && (
                    <p className="text-sm text-indigo-600 font-medium mt-2">{plan.tagline}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{plan.price}</div>
                    <div className="text-gray-600">per month</div>
                  </div>
                  
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations && (
                    <div className="border-t pt-4">
                      <div className="text-sm font-medium text-gray-900 mb-2">Limitations:</div>
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="text-xs text-gray-500">• {limitation}</div>
                      ))}
                    </div>
                  )}

                  <Button className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}>
                    {plan.id === 'free' ? 'Start Free Trial' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Private Cloud Section */}
      <section className="py-16 bg-purple-50" id="private-cloud">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-purple-100 text-purple-800 mb-4">
              <Cloud className="h-4 w-4 mr-2" />
              Enterprise Solution
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Private Cloud-in-a-Box</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete on-premise cloud infrastructure for government, education, healthcare, and enterprises requiring data sovereignty
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {privateCloudSolutions.map((solution) => (
              <Card key={solution.id} className={`p-6 shadow-xl ${solution.color}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <solution.icon className="h-8 w-8 text-purple-600" />
                      <CardTitle className="text-xl font-bold">{solution.name}</CardTitle>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">{solution.badge}</Badge>
                  </div>
                  <CardDescription className="text-lg">{solution.description}</CardDescription>
                  {solution.tagline && (
                    <p className="text-sm text-purple-600 font-medium mt-2">{solution.tagline}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <div className="text-2xl font-bold text-purple-600">{solution.price}</div>
                    <div className="text-gray-600">Custom pricing based on requirements</div>
                  </div>
                  
                  <div className="space-y-2">
                    {solution.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {solution.highlights && (
                    <div className="border-t pt-4">
                      <div className="text-sm font-medium text-gray-900 mb-2">Key Benefits:</div>
                      {solution.highlights.map((highlight, index) => (
                        <div key={index} className="text-xs text-purple-600">• {highlight}</div>
                      ))}
                    </div>
                  )}

                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Get Custom Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600 mb-4">
              Save 60-80% compared to public cloud providers with complete data control
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Cloud className="h-5 w-5 mr-2" />
                Get Custom Quote
              </Button>
              <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                <Monitor className="h-5 w-5 mr-2" />
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Pro VPS Hosting?</h2>
            <p className="text-gray-600">Industry-leading features with Indian business focus</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6">
                <feature.icon className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 bg-gray-50" id="usecases">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Perfect for Every Use Case</h2>
            <p className="text-gray-600">From websites to enterprise applications</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index} className="p-6">
                <div className="text-4xl mb-4">{useCase.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-600">{useCase.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white" id="testimonials">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Indian Businesses</h2>
            <p className="text-gray-600">See what our customers say about us</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.business}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join 500+ MSME businesses who trust us with their hosting
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
              <Zap className="h-5 w-5 mr-2" />
              Start Your Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-indigo-700">
              <MessageCircle className="h-5 w-5 mr-2" />
              Chat with Support
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Server className="h-8 w-8 text-indigo-400" />
                <span className="text-xl font-bold">Pro VPS Hosting</span>
              </div>
              <p className="text-gray-400">Technical & Business hosting for India</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Technical VPS</li>
                <li>MSME-VPS</li>
                <li>Private Cloud</li>
                <li>Managed Services</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>24/7 Support</li>
                <li>WhatsApp Chat</li>
                <li>Email Support</li>
                <li>Knowledge Base</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Pro VPS Hosting. All rights reserved. MSME Registered (Udyam)</p>
          </div>
        </div>
      </footer>
    </div>
  )
}