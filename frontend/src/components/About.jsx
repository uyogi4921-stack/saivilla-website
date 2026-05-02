import React from 'react';
import { Building2, Award, Users, ThumbsUp } from 'lucide-react';
import { aboutData } from '@/data/siteData';

const iconMap = {
  0: Building2,
  1: Award,
  2: Users,
  3: ThumbsUp,
};

const About = () => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-[#d4af37] text-sm font-semibold tracking-wider uppercase">Who We Are</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            {aboutData.title}
          </h2>
          <div className="w-24 h-1 bg-[#d4af37] mx-auto mb-8" />
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            {aboutData.description}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {aboutData.stats.map((stat, index) => {
            const Icon = iconMap[index];
            return (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-[#d4af37]" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.number}</h3>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Mission section */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-8 bg-[#d4af37] rounded-full" />
              Our Mission
            </h3>
            <p className="text-gray-600 leading-relaxed">
              To deliver world-class residential and commercial properties that combine luxury living with
              affordable pricing, ensuring every family finds their dream home in Palanpur. We believe in
              building not just structures, but communities where families thrive.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-8 bg-[#d4af37] rounded-full" />
              Our Vision
            </h3>
            <p className="text-gray-600 leading-relaxed">
              To become the most trusted real estate developer in Gujarat, known for our commitment to quality,
              timely delivery, and customer satisfaction. We envision transforming Palanpur's skyline with
              iconic projects that set new standards in modern living.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
