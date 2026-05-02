import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { heroData, aboutData, projectsData } from '@/data/siteData';

const Hero = () => {
  const heroImages = projectsData.slice(0, 3).map(p => p.image);

  return (
    <section id="home" className="relative" style={{ height: 'calc(100vh - 116px)', minHeight: '550px' }}>
      {/* Background slideshow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="slideshow-container">
          {heroImages.map((img, index) => (
            <div key={index} className="slide">
              <img
                src={img}
                alt={`Saivilla Project ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60" />

      {/* Content wrapper - full height, flex column */}
      <div className="absolute inset-0 z-10 flex flex-col">
        {/* Main content area - fills available space, centers text vertically */}
        <div className="flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl animate-fade-in-up">
              {/* Tagline with gold line */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-[3px] bg-[#d4af37]" />
                <span className="text-[#d4af37] text-sm md:text-base font-semibold tracking-wider uppercase">
                  Palanpur's Premier Developer
                </span>
              </div>

              {/* Main title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-3 leading-tight">
                {heroData.title}
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-2xl text-gray-300 font-light mb-2">
                {heroData.subtitle}
              </p>

              {/* Description */}
              <p className="text-gray-400 text-sm md:text-lg mb-8 max-w-xl leading-relaxed">
                {heroData.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-[#d4af37] hover:bg-[#b8941f] text-white text-base md:text-lg px-8 py-6 rounded-md font-semibold"
                  onClick={() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {heroData.ctaText} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10 text-base md:text-lg px-8 py-6 rounded-md font-semibold"
                  onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {heroData.ctaSecondary}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar pinned to bottom */}
        <div className="border-t border-white/10 bg-black/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
              {aboutData.stats.map((stat, index) => (
                <div key={index} className="py-4 md:py-5 px-4 md:px-8 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#d4af37] mb-0.5">{stat.number}</h3>
                  <p className="text-gray-400 text-xs md:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-[#d4af37] rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
