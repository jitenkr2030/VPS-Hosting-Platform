"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Server, Zap, Shield, Globe, Headphones, Cpu, HardDrive, Wifi } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">VPS Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional VPS
            <span className="text-blue-600"> Hosting</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Deploy virtual private servers in seconds. Get instant access to high-performance cloud infrastructure 
            with 24/7 monitoring and automated scaling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link href="#pricing">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our VPS Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for developers, businesses, and enterprises who demand performance and reliability.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardHeader>
                <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Instant Deployment</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Deploy your VPS in under 60 seconds with our automated provisioning system.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>DDoS Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced DDoS mitigation keeps your services online 24/7.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Global Network</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Choose from multiple data centers worldwide for optimal latency.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <Headphones className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Expert technical support available around the clock via live chat and tickets.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <Cpu className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>High Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Latest generation CPUs and NVMe SSDs for maximum performance.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <Wifi className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>99.9% Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Industry-leading uptime guarantee with SLA-backed service.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your needs. All plans include core features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <Card className="relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹499</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <CardDescription>Perfect for small projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>1 vCPU Core</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>2 GB RAM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>40 GB NVMe SSD</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>2 TB Bandwidth</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>1 IPv4 Address</span>
                </div>
                <Link href="/auth/signup">
                  <Button className="w-full mt-6">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="relative border-blue-600 border-2">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Professional</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹999</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <CardDescription>Great for growing businesses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>2 vCPU Cores</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>4 GB RAM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>80 GB NVMe SSD</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>4 TB Bandwidth</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>1 IPv4 Address</span>
                </div>
                <Link href="/auth/signup">
                  <Button className="w-full mt-6">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Business Plan */}
            <Card className="relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Business</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹1,999</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <CardDescription>For demanding workloads</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>4 vCPU Cores</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>8 GB RAM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>160 GB NVMe SSD</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>8 TB Bandwidth</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>2 IPv4 Addresses</span>
                </div>
                <Link href="/auth/signup">
                  <Button className="w-full mt-6">Get Started</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers and businesses who trust our VPS platform for their infrastructure needs.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Server className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold text-white">VPS Platform</span>
              </div>
              <p className="text-sm">
                Professional VPS hosting with instant deployment and 24/7 support.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/api" className="hover:text-white">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/status" className="hover:text-white">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 VPS Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}