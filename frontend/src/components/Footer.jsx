import React from 'react';
import { Phone, Mail, MapPin, ArrowUp } from 'lucide-react';
import { contactData, projectsData } from '@/data/siteData';

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-2">
              SAI<span className="text-[#d4af37]">VILLA</span>
            </h3>
            <p className="text-xs text-gray-400 tracking-wider mb-4">DREAMHOUSE PVT.LTD.</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Building dreams, one home at a time. Premium residential and commercial properties
              in Palanpur, Gujarat with world-class amenities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#d4af37]">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'About', 'Projects', 'Amenities', 'Testimonials', 'Contact'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Projects */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#d4af37]">Our Projects</h4>
            <ul className="space-y-2">
              {projectsData.map((project) => (
                <li key={project.id}>
                  <button
                    onClick={() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm"
                  >
                    {project.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#d4af37]">Contact Info</h4>
            <div className="space-y-3">
              <a href={`tel:${contactData.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-gray-400 hover:text-[#d4af37] transition-colors text-sm">
                <Phone className="w-4 h-4 shrink-0" /> {contactData.phone}
              </a>
              <a href={`mailto:${contactData.email}`} className="flex items-center gap-3 text-gray-400 hover:text-[#d4af37] transition-colors text-sm">
                <Mail className="w-4 h-4 shrink-0" /> {contactData.email}
              </a>
              <div className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" /> {contactData.address}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} SAIVILLA DREAMHOUSE PVT.LTD. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="w-10 h-10 bg-[#d4af37] hover:bg-[#b8941f] rounded-full flex items-center justify-center transition-colors"
          >
            <ArrowUp className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
