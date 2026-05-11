import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { aboutData, projectsData } from '@/data/siteData';

const Hero = () => {
  const heroImages = projectsData.slice(0, 3).map(p => p.image);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const stats = aboutData.stats;

  return (
    <section id="home" className="relative w-full" style={{ height: 'calc(100vh - 106px)', minHeight: '520px' }}>

      {/* Full-bleed slideshow images */}
      {heroImages.map((img, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: currentSlide === index ? 1 : 0 }}
        >
          <img
            src={img}
            alt={`SAIVILLA Project ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Very subtle gradient — only bottom corners for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/50" />

      {/* Stats grid — bottom right, Godrej style */}
      <div className="absolute bottom-14 right-0 md:right-8 z-10">
        <div className="grid grid-cols-2 divide-x divide-white/30">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`px-5 md:px-8 py-3 md:py-5 text-right ${index < 2 ? 'border-b border-white/30' : ''}`}
            >
              <div className="text-2xl md:text-4xl font-black text-white leading-none mb-1">
                {stat.number}
              </div>
              <div className="text-white/80 text-[10px] md:text-xs font-medium leading-tight max-w-[100px] md:max-w-[130px] ml-auto">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide dots — bottom center */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-[3px] rounded-full transition-all duration-300 ${
              currentSlide === index ? 'bg-white w-8' : 'bg-white/50 w-4'
            }`}
          />
        ))}
      </div>

      {/* Enquire Now — circular floating button, bottom right */}
      <button
        onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-12 right-4 md:bottom-16 md:right-20 z-10 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
      >
        <Plus className="w-6 h-6 md:w-7 md:h-7 text-gray-800 group-hover:text-[#d4af37] transition-colors" />
      </button>

      {/* Bottom-left label */}
      <div className="absolute bottom-5 left-5 z-10 hidden md:block">
        <p className="text-white/70 text-xs tracking-widest uppercase font-medium">
          Palanpur's Premier Developer
        </p>
      </div>
    </section>
  );
};

export default Hero;
