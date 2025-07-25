
import Link from 'next/link'
import { Brain, Mail, Github, Twitter, Shield, Heart } from 'lucide-react'

const footerLinks = {
  product: [
    { name: 'Features', href: '/#features' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Upload', href: '/upload' },
    { name: 'Assessment', href: '/assessment' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ],
  resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'API Reference', href: '/api' },
    { name: 'Ray Peat Resources', href: '/ray-peat' },
    { name: 'Health Guides', href: '/guides' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'HIPAA Compliance', href: '/hipaa' },
    { name: 'Security', href: '/security' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">
                  BioSpark Health AI
                </span>
                <span className="text-sm text-gray-400">Memory-Enhanced Analysis</span>
              </div>
            </Link>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              Revolutionary health intelligence combining Ray Peat's bioenergetic principles 
              with advanced AI memory systems for truly personalized health insights.
            </p>
            
            <div className="flex items-center space-x-4">
              <a 
                href="mailto:support@biospark-health.ai" 
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                aria-label="Email support"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a 
                href="https://github.com/biospark33/biospark-health-ai" 
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                aria-label="GitHub repository"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com/biosparkhealth" 
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                aria-label="Twitter profile"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Shield className="h-4 w-4 text-green-400" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Heart className="h-4 w-4 text-red-400" />
                <span>Made for Health</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              © 2025 BioSpark Health AI. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
