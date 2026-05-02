import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Projects', href: '#projects' },
    { label: 'Amenities', href: '#amenities' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href) => {
    setIsMobileMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="sticky top-0 z-50">
      {/* Top bar - collapses on scroll */}
      <div className={`bg-gray-900 text-white text-sm hidden md:block transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0' : 'max-h-12'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-6">
            <a href="tel:+919426319628" className="flex items-center gap-1 hover:text-[#d4af37] transition-colors">
              <Phone className="w-3 h-3" /> +91 94263 19628
            </a>
            <a href="mailto:saivillaoffice@gmail.com" className="flex items-center gap-1 hover:text-[#d4af37] transition-colors">
              <Mail className="w-3 h-3" /> saivillaoffice@gmail.com
            </a>
          </div>
          <span className="text-gray-400">Mon - Sat: 10:00 AM - 7:00 PM</span>
        </div>
      </div>

      {/* Main header */}
      <header className={`transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  SAI<span className="text-[#d4af37]">VILLA</span>
                </h1>
                <p className="text-[10px] md:text-xs text-gray-500 tracking-wider -mt-1">DREAMHOUSE PVT.LTD.</p>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#d4af37] transition-colors rounded-md hover:bg-gray-50"
                >
                  {item.label}
                </button>
              ))}
              <Button
                onClick={() => scrollToSection('#contact')}
                className="ml-4 bg-[#d4af37] hover:bg-[#b8941f] text-white"
              >
                Get In Touch
              </Button>
            </nav>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t shadow-lg animate-fade-in-up">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:text-[#d4af37] hover:bg-gray-50 rounded-md transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Button
                onClick={() => scrollToSection('#contact')}
                className="w-full mt-4 bg-[#d4af37] hover:bg-[#b8941f] text-white"
              >
                Get In Touch
              </Button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default Header;
