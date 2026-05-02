import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { testimonialsData } from '@/data/siteData';

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-[#d4af37] text-sm font-semibold tracking-wider uppercase">
            What Our Customers Say
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Happy Homeowners
          </h2>
          <div className="w-24 h-1 bg-[#d4af37] mx-auto mb-8" />
        </div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonialsData.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="hover:shadow-lg transition-shadow duration-300 relative"
            >
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-[#d4af37]/20 absolute top-4 right-4" />

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }, (_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#d4af37] text-[#d4af37]" />
                  ))}
                </div>

                {/* Review */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  "{testimonial.review}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full bg-gray-200"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-xs text-gray-500">{testimonial.location}</p>
                    <p className="text-xs text-[#d4af37]">{testimonial.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
