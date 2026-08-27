import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Amenities from '@/components/Amenities';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/chat/ChatWidget';
import AdminPanel from '@/components/admin/AdminPanel';
import './index.css';

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return hash;
}

function App() {
  const hash = useHashRoute();

  if (hash.startsWith('#/admin')) {
    return <AdminPanel />;
  }

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
      <ChatWidget />
    </div>
  );
}

export default App;
