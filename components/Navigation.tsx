
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, Activity, BarChart3, Home, Upload, FileText } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3, highlight: true },
    { href: '/upload', label: 'Upload Data', icon: Upload },
    { href: '/assessment', label: 'Assessment', icon: Activity },
    { href: '/memory', label: 'Memory Chat', icon: Brain },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">LabInsight AI</span>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Phase 2C
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isHighlight = item.highlight;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : isHighlight
                        ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {isHighlight && (
                      <span className="ml-1 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Memory + Context Integration
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
