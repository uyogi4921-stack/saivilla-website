import React from 'react';
import { Waves, Dumbbell, Users, Film, Baby, Sparkles, Shield, Zap, Car, TreePine } from 'lucide-react';
import { amenitiesData } from '@/data/siteData';

const iconComponents = {
  Waves, Dumbbell, Users, Film, Baby, Sparkles, Shield, Zap, Car, TreePine,
};

const Amenities = () => {
  return (
    <section id="amenities" className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-[#d4af37] text-sm font-semibold tracking-wider uppercase">
            World-Class Facilities
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
            Premium Amenities
          </h2>
          <div className="w-24 h-1 bg-[#d4af37] mx-auto mb-8" />
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Every SAIVILLA project comes with thoughtfully designed amenities to enhance your daily living experience
          </p>
        </div>

        {/* Featured amenities with images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {amenitiesData.filter(a => a.image).map((amenity) => {
            const Icon = iconComponents[amenity.icon];
            return (
              <div key={amenity.id} className="group relative h-64 rounded-xl overflow-hidden">
                <img
                  src={amenity.image}
                  alt={amenity.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {Icon && <Icon className="w-5 h-5 text-[#d4af37]" />}
                    <h3 className="text-lg font-bold text-white">{amenity.name}</h3>
                  </div>
                  <p className="text-gray-300 text-sm">{amenity.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Other amenities grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {amenitiesData.filter(a => !a.image).map((amenity) => {
            const Icon = iconComponents[amenity.icon];
            return (
              <div
                key={amenity.id}
                className="text-center p-5 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors group"
              >
                <div className="w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#d4af37]/20 transition-colors">
                  {Icon && <Icon className="w-6 h-6 text-[#d4af37]" />}
                </div>
                <h4 className="text-white font-medium text-sm mb-1">{amenity.name}</h4>
                <p className="text-gray-400 text-xs">{amenity.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Amenities;
