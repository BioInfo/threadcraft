'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from './Icons';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/config', label: 'Config' },
    { href: '/readme', label: 'README' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <Icons.Magic />
            </div>
            <span className="font-bold text-lg text-gray-800">ThreadCraft</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-900"
            >
              {isMobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-2 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                className={`block py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}