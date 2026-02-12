'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Clock, 
  Users, 
  IndianRupee, 
  Zap, 
  Shield, 
  CheckCircle,
  Star,
  Filter,
  ChevronRight,
  HelpCircle,
  Phone,
  MessageCircle
} from 'lucide-react'
import { serverTemplates, templateCategories, indianComplianceFeatures } from '@/lib/server-templates'

interface TemplateSelectionProps {
  onTemplateSelect?: (template: any) => void
}

export default function TemplateSelection({ onTemplateSelect }: TemplateSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const filteredTemplates = serverTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.targetAudience.some(audience => 
                           audience.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    return matchesCategory && matchesSearch
  })

  const popularTemplates = serverTemplates.filter(t => t.popular)
  const indianTemplates = serverTemplates.filter(t => t.indian)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Business-Ready Server <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Templates</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start working in minutes, not days. Pre-configured servers for Indian MSMEs.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm">
                <Zap className="h-4 w-4 mr-2" />
                One-Click Deploy
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm">
                <Shield className="h-4 w-4 mr-2" />
                GST-Compliant
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 px-4 py-2 text-sm">
                <Phone className="h-4 w-4 mr-2" />
                Indian Support
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search templates (e.g., WordPress, Tally, POS...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
          <Button variant="outline" className="h-12 px-6">
            <Filter className="h-5 w-5 mr-2" />
            Advanced Filter
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className="px-6"
          >
            All Templates ({serverTemplates.length})
          </Button>
          {templateCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="px-6"
            >
              {category.icon} {category.name} ({category.templates.length})
            </Button>
          ))}
        </div>

        {/* Popular Templates */}
        {selectedCategory === 'all' && !searchTerm && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              Most Popular Templates
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={() => {
                    setSelectedTemplate(template.id)
                    onTemplateSelect?.(template)
                  }}
                  selected={selectedTemplate === template.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Template Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => {
                setSelectedTemplate(template.id)
                onTemplateSelect?.(template)
              }}
              selected={selectedTemplate === template.id}
            />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Indian Compliance Features */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🇮🇳 Built for Indian MSMEs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compliance-ready features that Indian businesses need
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {indianComplianceFeatures.map((feature, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need Help Choosing the Right Template?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Our MSME specialists can help you select the perfect server template for your business needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              <MessageCircle className="h-5 w-5 mr-2" />
              Chat on WhatsApp
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
              <Phone className="h-5 w-5 mr-2" />
              Call Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface TemplateCardProps {
  template: any
  onSelect: () => void
  selected: boolean
}

function TemplateCard({ template, onSelect, selected }: TemplateCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        selected ? 'ring-2 ring-green-500 shadow-xl' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{template.icon}</div>
            <div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription className="text-sm">{template.description}</CardDescription>
            </div>
          </div>
          {template.popular && (
            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
              <Star className="h-3 w-3 mr-1" />
              Popular
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-green-600">{template.price}</div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {template.setupTime}
          </div>
        </div>

        <div className="space-y-2">
          {template.features.slice(0, 4).map((feature, index) => (
            <div key={index} className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Perfect for:</span>
            <div className="flex -space-x-2">
              {template.targetAudience.slice(0, 3).map((audience, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {audience}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              className={`flex-1 ${
                template.indian ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              size="sm"
            >
              {selected ? 'Selected ✓' : 'Select Template'}
            </Button>
            <Button variant="outline" size="sm">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {template.oneClickDeploy && (
          <div className="flex items-center justify-center text-xs text-green-600 bg-green-50 rounded px-2 py-1">
            <Zap className="h-3 w-3 mr-1" />
            One-Click Deploy
          </div>
        )}
      </CardContent>
    </Card>
  )
}