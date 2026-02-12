'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Server, Shield, Zap, Users, Headphones, Cpu, HardDrive, Wifi, Building, IndianRupee, MessageCircle, Award, FileText, Lock, HelpCircle, Star, Phone, Cloud, Database, Globe, Settings, Monitor, AlertTriangle, Key } from 'lucide-react'

export default function Home() {
  const [selectedSolution, setSelectedSolution] = useState('private-cloud')
  const [targetMarket, setTargetMarket] = useState('all')

  const solutions = [
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

  const enterpriseFeatures = [
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Military-grade security with MFA, RBAC, and comprehensive audit trails'
    },
    {
      icon: Database,
      title: 'Data Sovereignty',
      description: 'Complete data control with 100% data residency guarantees'
    },
    {
      icon: Settings,
      title: 'White-Label Solution',
      description: 'Complete branding customization with your organization\'s identity'
    },
    {
      icon: Monitor,
      title: 'Real-Time Monitoring',
      description: 'Comprehensive monitoring and analytics with customizable dashboards'
    },
    {
      icon: Globe,
      title: 'Compliance Ready',
      description: 'GDPR, HIPAA, ISO27001 compliance with automated reporting'
    },
    {
      icon: Cloud,
      title: 'Offline Operation',
      description: 'Full functionality without internet connectivity (air-gapped deployment)'
    }
  ]

  const targetMarkets = [
    {
      id: 'government',
      name: 'Government',
      icon: Building,
      description: 'Secure infrastructure for government agencies',
      solutions: ['Defense organizations', 'Education departments', 'Healthcare ministries', 'Finance departments']
    },
    {
      id: 'education',
      name: 'Education',
      icon: Award,
      description: 'Campus-wide cloud for educational institutions',
      solutions: ['Universities', 'Research institutions', 'K-12 schools', 'Educational departments']
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: Shield,
      description: 'HIPAA-compliant infrastructure for healthcare',
      solutions: ['Hospitals', 'Clinics', 'Research organizations', 'Medical schools']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Server,
      description: 'Complete infrastructure for large corporations',
      solutions: ['Fortune 500 companies', 'Manufacturing', 'Financial services', 'Technology firms']
    }
  ]

  const stats = [
    { value: '60-80%', label: 'Cost Savings vs Public Cloud' },
    { value: '100%', label: 'Data Residency' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '24/7', label: 'Enterprise Support' }
  ]

  const complianceBadges = [
    { name: 'GDPR', description: 'General Data Protection Regulation' },
    { name: 'HIPAA', description: 'Health Insurance Portability and Accountability Act' },
    { name: 'ISO27001', description: 'Information Security Management' },
    { name: 'SOC 2', description: 'Service Organization Control 2' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Cloud className="h-8 w-8 text-purple-600" />
              <div>
                <span className="text-xl font-bold text-gray-900">Private Cloud-in-a-Box</span>
                <p className="text-xs text-gray-600">Enterprise On-Premise Solution</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#solutions" className="text-gray-600 hover:text-purple-600 transition">Solutions</a>
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition">Features</a>
              <a href="#markets" className="text-gray-600 hover:text-purple-600 transition">Markets</a>
              <a href="#compliance" className="text-gray-600 hover:text-purple-600 transition">Compliance</a>
              <Button variant="ghost">Login</Button>
              <Button className="bg-purple-600 hover:bg-purple-700">Get Quote</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-purple-100 text-purple-800 mb-4">
              <Shield className="h-4 w-4 mr-2" />
              Enterprise-Grade Private Cloud
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Private <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Cloud-in-a-Box</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Complete on-premise cloud infrastructure for government, education, healthcare, and enterprises. 
              Data sovereignty, compliance, and security built-in.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Cloud className="h-5 w-5 mr-2" />
                Get Custom Quote
              </Button>
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Shield className="h-5 w-5 mr-2" />
                View Compliance Details
              </Button>
              <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                <Monitor className="h-5 w-5 mr-2" />
                Live Demo
              </Button>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Market Selector */}
      <section className="py-12 bg-white border-y">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Market</h2>
            <p className="text-gray-600">Specialized solutions for different organizational needs</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {targetMarkets.map((market) => (
              <Card 
                key={market.id}
                className={`cursor-pointer transition-all ${targetMarket === market.id ? 'ring-2 ring-purple-500' : ''}`}
                onClick={() => setTargetMarket(market.id)}
              >
                <CardContent className="p-6 text-center">
                  <market.icon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900">{market.name}</h3>
                  <p className="text-sm text-gray-600 mt-2">{market.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-16" id="solutions">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Enterprise Solutions</h2>
            <p className="text-gray-600">Tailored private cloud solutions for your organization</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution) => (
              <Card key={solution.id} className={`p-6 shadow-xl ${solution.color} ${solution.popular ? 'ring-2 ring-purple-500' : ''}`}>
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
                    {solution.features.slice(0, 6).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {solution.highlights && (
                    <div className="border-t pt-4">
                      <div className="text-sm font-medium text-gray-900 mb-2">Key Highlights:</div>
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
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-16 bg-white" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Enterprise Features</h2>
            <p className="text-gray-600">Comprehensive capabilities for modern organizations</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enterpriseFeatures.map((feature, index) => (
              <Card key={index} className="p-6">
                <feature.icon className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-16 bg-gray-50" id="compliance">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Compliance & Security</h2>
            <p className="text-gray-600">Built to meet the highest regulatory standards</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {complianceBadges.map((badge, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">{badge.name}</div>
                <p className="text-sm text-gray-600">{badge.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready for Your Private Cloud?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Get a custom quote tailored to your organization's needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              <Cloud className="h-5 w-5 mr-2" />
              Get Custom Quote
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-purple-700">
              <Phone className="h-5 w-5 mr-2" />
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} mb-12">
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