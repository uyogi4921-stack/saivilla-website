import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Amenities from '@/components/Amenities';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import './index.css';

function App() {
  return (
    <div className="App overflow-x-hidden">
      <Header />
      <Hero />
      <About />
      <Projects />
      <Amenities />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
