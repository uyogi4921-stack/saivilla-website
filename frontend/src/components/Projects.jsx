import React, { useState } from 'react';
import { MapPin, Maximize, ChevronLeft, ChevronRight, Check, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { projectsData } from '@/data/siteData';

const ProjectModal = ({ project, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !project) return null;

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % project.gallery.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + project.gallery.length) % project.gallery.length);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image gallery */}
        <div className="relative h-64 md:h-96">
          <img
            src={project.gallery[currentImageIndex]}
            alt={`${project.name} - ${currentImageIndex + 1}`}
            className="w-full h-full object-cover rounded-t-2xl"
          />
          <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
            <X className="w-5 h-5" />
          </button>
          {project.gallery.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {project.gallery.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-[#d4af37]' : 'bg-white/60'}`}
              />
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{project.name}</h2>
              <p className="text-[#d4af37] font-medium mt-1">{project.bhk || project.type}</p>
            </div>
            <span className="bg-[#d4af37] text-white px-3 py-1 rounded-full text-sm font-medium">
              {project.status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <MapPin className="w-4 h-4" />
            <span>{project.location}</span>
          </div>

          {project.area && (
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <Maximize className="w-4 h-4" />
              <span>{project.area}</span>
            </div>
          )}

          <p className="text-gray-600 mb-6 leading-relaxed">{project.description}</p>

          {/* Highlights */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Highlights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {project.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#d4af37] mt-0.5 shrink-0" />
                  <span className="text-gray-600 text-sm">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="bg-[#d4af37] hover:bg-[#b8941f] text-white flex-1"
              onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Enquire Now
            </Button>
            {project.brochure && (
              <Button variant="outline" className="flex-1" asChild>
                <a href={project.brochure} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" /> Download Brochure
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const [filter, setFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);

  const types = ['All', ...new Set(projectsData.map((p) => p.type))];
  const filtered = filter === 'All' ? projectsData : projectsData.filter((p) => p.type === filter);

  return (
    <section id="projects" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="text-[#d4af37] text-sm font-semibold tracking-wider uppercase">Our Portfolio</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Featured Projects</h2>
          <div className="w-24 h-1 bg-[#d4af37] mx-auto mb-8" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                filter === type
                  ? 'bg-[#d4af37] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Project cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((project) => (
            <Card
              key={project.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedProject(project)}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#d4af37] text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {project.status}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-gray-900/70 text-white px-3 py-1 rounded-full text-xs">
                    {project.type}
                  </span>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                {project.bhk && (
                  <p className="text-[#d4af37] font-medium text-sm mb-2">{project.bhk}</p>
                )}
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="line-clamp-2">{project.location}</span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{project.description}</p>
                <Button className="w-full bg-[#d4af37] hover:bg-[#b8941f] text-white" size="sm">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};

export default Projects;
