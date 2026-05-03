import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { contactData, projectsData } from '@/data/siteData';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyInterest: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isWakingUp, setIsWakingUp] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsWakingUp(false);
    setSubmitStatus(null);

    // Show "waking up" message after 5 seconds if still waiting
    const wakeTimer = setTimeout(() => setIsWakingUp(true), 5000);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://saivilla-backend.onrender.com';
      await axios.post(`${apiUrl}/api/inquiries/`, formData, { timeout: 90000 });
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', propertyInterest: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      clearTimeout(wakeTimer);
      setIsSubmitting(false);
      setIsWakingUp(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-[#d4af37] text-sm font-semibold tracking-wider uppercase">
            Get In Touch
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Contact Us
          </h2>
          <div className="w-24 h-1 bg-[#d4af37] mx-auto mb-8" />
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Interested in our properties? Fill out the form and our team will get back to you within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-[#d4af37]/20">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#d4af37]/10 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                    <a href={`tel:${contactData.phone.replace(/\s/g, '')}`} className="text-gray-600 hover:text-[#d4af37] block text-sm">{contactData.phone}</a>
                    <a href={`tel:${contactData.phone2.replace(/\s/g, '')}`} className="text-gray-600 hover:text-[#d4af37] block text-sm">{contactData.phone2}</a>
                    <a href={`tel:${contactData.phone3.replace(/\s/g, '')}`} className="text-gray-600 hover:text-[#d4af37] block text-sm">{contactData.phone3}</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#d4af37]/10 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <a href={`mailto:${contactData.email}`} className="text-gray-600 hover:text-[#d4af37] text-sm">{contactData.email}</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#d4af37]/10 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Location</h4>
                    <p className="text-gray-600 text-sm">{contactData.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#d4af37]/10 rounded-full flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Office Hours</h4>
                    <p className="text-gray-600 text-sm">{contactData.officeHours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Maps embed */}
            <div className="rounded-xl overflow-hidden shadow-md h-64">
              <iframe
                title="SAIVILLA Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57756.51413614716!2d72.38!3d24.17!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395ce97920e3d5cb%3A0x69eae4a064256e2e!2sPalanpur%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1704000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                {submitStatus === 'success' ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                    <p className="text-gray-600 mb-6">
                      Your inquiry has been submitted successfully. Our team will contact you within 24 hours.
                    </p>
                    <Button
                      onClick={() => setSubmitStatus(null)}
                      className="bg-[#d4af37] hover:bg-[#b8941f] text-white"
                    >
                      Send Another Inquiry
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          required
                          minLength={2}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 XXXXX XXXXX"
                          required
                          minLength={10}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="propertyInterest">Property Interest</Label>
                        <select
                          id="propertyInterest"
                          name="propertyInterest"
                          value={formData.propertyInterest}
                          onChange={handleChange}
                          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select a project</option>
                          {projectsData.map((p) => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your requirements..."
                        required
                        minLength={10}
                        rows={5}
                        className="mt-1"
                      />
                    </div>

                    {submitStatus === 'error' && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                        Something went wrong. Please try again or call us directly.
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#d4af37] hover:bg-[#b8941f] text-white py-6 text-lg"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {isWakingUp ? 'Please wait, connecting...' : 'Sending...'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-5 h-5" /> Send Inquiry
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
