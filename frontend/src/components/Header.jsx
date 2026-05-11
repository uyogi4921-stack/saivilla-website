import React, { useState, useEffect } from 'react';
import { Phone, Search, Menu, X, Home } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
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
    <div className={`sticky top-0 z-50 transition-shadow duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      {/* Main header */}
      <header className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo — icon + stacked text */}
            <button
              onClick={() => scrollToSection('#home')}
              className="flex items-center gap-3 group"
            >
              <div className="w-9 h-9 md:w-11 md:h-11 bg-gray-900 rounded flex items-center justify-center shrink-0">
                <Home className="w-5 h-5 md:w-6 md:h-6 text-[#d4af37]" />
              </div>
              <div className="leading-none text-left">
                <div className="text-base md:text-lg font-black text-gray-900 tracking-wide">SAIVILLA</div>
                <div className="text-[10px] md:text-xs text-gray-500 font-semibold tracking-widest uppercase">Dreamhouse Pvt.Ltd.</div>
              </div>
            </button>

            {/* Desktop nav links — center */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors border-b-2 border-transparent hover:border-[#d4af37] pb-0.5"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-4 md:gap-6">
              <a
                href="tel:+919426319628"
                className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Phone className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden md:block text-sm font-medium">+91 94263 19628</span>
              </a>

              <button
                onClick={() => scrollToSection('#contact')}
                className="hidden lg:block text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Enquire button - desktop */}
              <button
                onClick={() => scrollToSection('#contact')}
                className="hidden lg:block bg-[#d4af37] hover:bg-[#b8941f] text-white text-sm font-semibold px-5 py-2 rounded transition-colors"
              >
                Enquire Now
              </button>

              {/* Hamburger - mobile */}
              <button
                className="lg:hidden p-1.5 text-gray-700 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sub-nav bar — desktop only */}
        <div className="hidden lg:block border-t border-gray-100 bg-gray-50">
          <div className="max-w-screen-2xl mx-auto px-10 flex items-center gap-10 h-10">
            {['Know Us', 'Projects', 'Amenities', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(`#${item.toLowerCase().replace(' us', '')}`)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 tracking-wider uppercase transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-40 flex flex-col">
          <div className="flex flex-col p-6 gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="text-left text-xl font-semibold text-gray-800 hover:text-[#d4af37] py-4 border-b border-gray-100 transition-colors"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('#contact')}
              className="mt-6 bg-[#d4af37] hover:bg-[#b8941f] text-white text-base font-semibold py-4 rounded transition-colors"
            >
              Enquire Now
            </button>
            <a
              href="tel:+919426319628"
              className="flex items-center justify-center gap-2 mt-3 text-gray-600 py-3"
            >
              <Phone className="w-4 h-4" /> +91 94263 19628
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
