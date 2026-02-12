'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Clock,
  Users,
  IndianRupee,
  Zap,
  Shield,
  CheckCircle,
  Star,
  Phone,
  MessageCircle,
  HelpCircle,
  Download,
  Play,
  Server,
  Database,
  Globe,
  Lock,
  BarChart
} from 'lucide-react'
import { serverTemplates, indianComplianceFeatures } from '@/lib/server-templates'

interface TemplateDetailProps {
  templateId: string
  onBack?: () => void
  onDeploy?: (template: any) => void
}

export default function TemplateDetail({ templateId, onBack, onDeploy }: TemplateDetailProps) {
  const template = serverTemplates.find(t => t.id === templateId)
  
  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Template Not Found</h2>
          <p className="text-gray-600 mb-4">The template you're looking for doesn't exist.</p>
          <Button onClick={onBack}>Back to Templates</Button>
        </div>
      </div>
    )
  }

  const [activeTab, setActiveTab] = useState('overview')

  const relatedTemplates = serverTemplates
    .filter(t => t.category === template.category && t.id !== template.id)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="text-gray-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Get Help
              </Button>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onDeploy?.(template)}
              >
                <Zap className="h-4 w-4 mr-2" />
                Deploy Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Template Hero */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-5xl">{template.icon}</div>
                <div>
                  <Badge className="bg-white/20 text-white mb-2">
                    {template.category.charAt(0).toUpperCase() + template.category.slice(1)} Template
                  </Badge>
                  {template.popular && (
                    <Badge className="bg-yellow-400 text-yellow-900 ml-2">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4">{template.name}</h1>
              <p className="text-xl text-white/90 mb-6">{template.description}</p>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <IndianRupee className="h-5 w-5 mr-2" />
                  <span className="text-2xl font-bold">{template.price}</span>
                  <span className="text-white/70">/month</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{template.setupTime} setup</span>
                </div>
                {template.oneClickDeploy && (
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    <span>One-click deploy</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button 
                  size="lg" 
                  className="bg-white text-green-600 hover:bg-gray-100"
                  onClick={() => onDeploy?.(template)}
                >
                  <Server className="h-5 w-5 mr-2" />
                  Deploy This Template
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp Support
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  <Phone className="h-5 w-5 mr-2" />
                  Call Expert
                </Button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{template.features.length}</div>
                  <div className="text-sm text-white/70">Features</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{template.targetAudience.length}</div>
                  <div className="text-sm text-white/70">Target Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-sm text-white/70">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-white/70">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              {['overview', 'features', 'includes', 'target'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">About This Template</h3>
                  <p className="text-gray-600 leading-relaxed">
                    This {template.name} template is specifically designed for Indian MSMEs who need a reliable, 
                    pre-configured server solution. With our one-click deployment, you can have your business 
                    applications running in minutes without any technical setup required.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Key Benefits</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <Zap className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <div className="font-medium">Quick Setup</div>
                        <div className="text-sm text-gray-600">Deploy in {template.setupTime}</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <div className="font-medium">Secure & Reliable</div>
                        <div className="text-sm text-gray-600">Enterprise-grade security</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <div className="font-medium">Local Support</div>
                        <div className="text-sm text-gray-600">Indian WhatsApp & phone support</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <BarChart className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <div className="font-medium">GST Ready</div>
                        <div className="text-sm text-gray-600">Compliant billing system</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Features & Capabilities</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {template.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'includes' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">What's Included</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {template.includes.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'target' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Perfect For</h3>
                <div className="flex flex-wrap gap-2">
                  {template.targetAudience.map((audience, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {audience}
                    </Badge>
                  ))}
                </div>
                
                <div className="mt-8 p-6 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">🇮🇳 India-Specific Benefits</h4>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li>• Data hosted in Indian data centers</li>
                    <li>• GST-compliant billing and invoicing</li>
                    <li>• Local Indian support via WhatsApp</li>
                    <li>• Pricing in Indian Rupees (INR)</li>
                    <li>• Compliance with Indian data regulations</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Templates */}
      {relatedTemplates.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Templates</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedTemplates.map((relatedTemplate) => (
              <Card key={relatedTemplate.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{relatedTemplate.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{relatedTemplate.name}</CardTitle>
                      <CardDescription>{relatedTemplate.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-green-600">{relatedTemplate.price}</span>
                    <span className="text-sm text-gray-500">{relatedTemplate.setupTime}</span>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => window.location.href = `/templates/${relatedTemplate.id}`}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Deploy {template.name}?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Get your business server running in minutes with our expert support
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onDeploy?.(template)}
            >
              <Server className="h-5 w-5 mr-2" />
              Deploy Now - {template.price}/mo
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-gray-900"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              WhatsApp Consultation
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}