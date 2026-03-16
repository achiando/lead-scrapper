'use client';

import React from 'react';
import Image from 'next/image';
import { Phone, MessageCircle, Star, MapPin, Clock, ShieldCheck, Award, Users, CheckCircle2, ChevronRight, HelpCircle, Instagram, Facebook, Twitter, BookOpen, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DentalClinic, DENTAL_STOCK_IMAGES, DEFAULT_SERVICES, BLOG_POSTS } from '@/lib/dental-data';

interface DemoWebsiteProps {
  clinic: Partial<DentalClinic>;
}

export default function DemoWebsite({ clinic }: DemoWebsiteProps) {
  const clinicName = clinic.name || "Modern Dental Clinic";
  const phone = clinic.phone || "+254 700 000 000";
  const address = clinic.address || "Main Street, Nairobi";
  const rating = clinic.rating || 4.8;
  const reviewsCount = clinic.reviewsCount || 120;

  const [selectedPost, setSelectedPost] = React.useState<typeof BLOG_POSTS[0] | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const whatsappLink = `https://wa.me/${phone.replace(/\s+/g, '')}`;
  const telLink = `tel:${phone.replace(/\s+/g, '')}`;
  
  const getHeroImage = () => {
    if (!clinic.category) return DENTAL_STOCK_IMAGES.hero[0];
    
    const category = clinic.category.toLowerCase();
    if (category.includes('orthodont')) return DENTAL_STOCK_IMAGES.services.braces;
    if (category.includes('pediatric')) return "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1200&auto=format&fit=crop";
    if (category.includes('whitening') || category.includes('cosmetic')) return DENTAL_STOCK_IMAGES.services.whitening;
    
    return DENTAL_STOCK_IMAGES.hero[0];
  };
  
  // Google Maps Embed URL without API key (using search query)
  const mapSearchQuery = encodeURIComponent(`${clinicName} ${address}`);
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=REPLACE_WITH_API_KEY&q=${mapSearchQuery}`;
  // Actually, for no API key, we should use the search embed format:
  const noApiKeyMapUrl = `https://maps.google.com/maps?q=${mapSearchQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white py-2 px-6 hidden md:block">
        <div className="container mx-auto flex justify-between items-center text-xs font-medium tracking-wider uppercase">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><MapPin className="w-3 h-3 text-blue-400" /> {address}</span>
            <span className="flex items-center gap-2"><Clock className="w-3 h-3 text-blue-400" /> Mon - Sat: 8am - 6pm</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-blue-400 transition-colors"><Instagram className="w-3 h-3" /></a>
            <a href="#" className="hover:text-blue-400 transition-colors"><Facebook className="w-3 h-3" /></a>
            <a href="#" className="hover:text-blue-400 transition-colors"><Twitter className="w-3 h-3" /></a>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 md:px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-blue-600 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg shadow-blue-200">
              {clinicName.charAt(0)}
            </div>
            <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 truncate max-w-[120px] sm:max-w-none">{clinicName}</span>
          </div>
          <div className="hidden lg:flex gap-8 font-semibold text-slate-600">
            <a href="#services" className="hover:text-blue-600 transition-colors">Services</a>
            <a href="#why-us" className="hover:text-blue-600 transition-colors">Why Choose Us</a>
            <a href="#blog" className="hover:text-blue-600 transition-colors">Dental Tips</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Testimonials</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <a href={telLink} className="hidden sm:flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700">
              <Phone className="w-4 h-4" /> {phone}
            </a>
            <a href={whatsappLink} className="bg-blue-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 text-sm md:text-base">
              Book Now
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    {clinicName.charAt(0)}
                  </div>
                  <span className="font-bold text-xl text-slate-900">{clinicName}</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-900">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-6 space-y-2">
                {[
                  { label: 'Services', href: '#services' },
                  { label: 'Why Choose Us', href: '#why-us' },
                  { label: 'Dental Tips', href: '#blog' },
                  { label: 'Testimonials', href: '#testimonials' },
                  { label: 'Contact', href: '#contact' },
                ].map((link) => (
                  <a 
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 text-lg font-bold text-slate-700 hover:text-blue-600 transition-all"
                  >
                    {link.label}
                    <ChevronRight className="w-5 h-5 opacity-30" />
                  </a>
                ))}
              </div>
              <div className="p-6 border-t border-slate-100 space-y-4">
                <a href={telLink} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-slate-900 font-bold">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  {phone}
                </a>
                <a href={whatsappLink} className="flex items-center justify-center gap-3 w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200">
                  <MessageCircle className="w-5 h-5" />
                  Book via WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center pt-8 md:pt-12 pb-16 md:pb-24 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-12 md:gap-16 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 md:space-y-8 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider mx-auto lg:mx-0">
              <Star className="w-3 h-3 md:w-4 md:h-4 fill-blue-600" />
              Trusted by {reviewsCount}+ Happy Patients
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Your Journey to a <span className="text-blue-600">Perfect Smile</span> Starts Here.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Experience world-class dental care at {clinicName}. Our expert team uses advanced technology to provide painless, high-quality treatments for the whole family.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
              <a href={whatsappLink} className="bg-slate-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-2xl hover:bg-slate-800 hover:-translate-y-1">
                <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                WhatsApp Us
              </a>
              <a href={telLink} className="bg-white border-2 border-slate-200 text-slate-900 px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:border-blue-600 hover:text-blue-600">
                <Phone className="w-5 h-5 md:w-6 md:h-6" />
                Call Clinic
              </a>
            </div>
            <div className="flex items-center gap-4 md:gap-6 pt-8 border-t border-slate-100 justify-center lg:justify-start">
              <div className="flex -space-x-3 md:-space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 md:border-4 border-white overflow-hidden bg-slate-200">
                    <Image src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" width={48} height={48} referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex text-yellow-400 mb-0.5 md:mb-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-current" />)}
                </div>
                <p className="text-xs md:text-sm font-bold text-slate-900">{rating}/5.0 based on {reviewsCount} reviews</p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative px-4 md:px-0"
          >
            <div className="relative z-10 rounded-[30px] md:rounded-[40px] overflow-hidden shadow-2xl shadow-blue-200 border-[8px] md:border-[12px] border-white">
              <Image 
                src={getHeroImage()} 
                alt="Modern Dental Clinic" 
                width={800} 
                height={1000} 
                className="object-cover aspect-[4/5]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -left-2 md:-bottom-10 md:-left-10 z-20 bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-100 scale-90 md:scale-100">
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm md:text-base">Painless Treatment</p>
                  <p className="text-[10px] md:text-sm text-slate-500">Advanced Anesthesia</p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm md:text-base">100% Safe & Sterile</p>
                  <p className="text-[10px] md:text-sm text-slate-500">ISO Certified Clinic</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-48 md:w-64 h-48 md:h-64 bg-blue-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6">Why Patients Trust {clinicName}</h2>
            <p className="text-base md:text-lg text-slate-500 leading-relaxed">
              We combine years of experience with a passion for dental excellence to provide you with the best possible care.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Award, title: "Expert Dentists", desc: "Our team consists of highly qualified specialists with years of clinical experience." },
              { icon: ShieldCheck, title: "Modern Technology", desc: "We use the latest digital X-rays, 3D imaging, and laser dentistry for precision." },
              { icon: Clock, title: "Flexible Hours", desc: "We offer evening and weekend appointments to fit your busy schedule." },
              { icon: Users, title: "Family Care", desc: "Specialized pediatric and geriatric dental care for all generations." },
              { icon: CheckCircle2, title: "Affordable Pricing", desc: "Transparent pricing and flexible payment plans for all treatments." },
              { icon: MessageCircle, title: "Easy Booking", desc: "Book your appointment instantly via WhatsApp or our online portal." },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 md:p-10 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:bg-blue-600 transition-colors">
                  <item.icon className="w-6 h-6 md:w-8 md:h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">{item.title}</h3>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 md:mb-16 gap-6 md:gap-8 text-center md:text-left">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6">Comprehensive Dental Solutions</h2>
            <p className="text-base md:text-lg text-slate-500">From routine checkups to complex surgeries, we cover all your dental needs under one roof.</p>
          </div>
          <a href={whatsappLink} className="text-blue-600 font-bold flex items-center gap-2 hover:gap-4 transition-all text-base md:text-lg mb-2">
            View All Services <ChevronRight className="w-5 h-5" />
          </a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {DEFAULT_SERVICES.map((service, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -12 }}
              className="bg-white rounded-[30px] md:rounded-[40px] overflow-hidden shadow-xl border border-slate-100 flex flex-col group"
            >
              <div className="relative h-48 md:h-64 overflow-hidden">
                <Image 
                  src={service.image} 
                  alt={service.title} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6 md:p-8">
                  <p className="text-white font-bold">Book this service now</p>
                </div>
              </div>
              <div className="p-6 md:p-10 flex-grow flex flex-col">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">{service.title}</h3>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-6 md:mb-8 flex-grow">{service.description}</p>
                <a href={whatsappLink} className="bg-slate-50 text-slate-900 px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all text-sm md:text-base">
                  Book Appointment <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="rounded-[40px] overflow-hidden border-[12px] border-white/10 shadow-2xl">
              <Image 
                src={DENTAL_STOCK_IMAGES.team} 
                alt="Our Team" 
                width={800} 
                height={1000} 
                className="object-cover aspect-[4/5]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-blue-600 p-10 rounded-3xl shadow-2xl max-w-xs">
              <p className="text-4xl font-black mb-2">15+</p>
              <p className="text-blue-100 font-bold uppercase tracking-wider text-sm">Years of Combined Excellence</p>
            </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-black leading-tight">Meet Our Expert <span className="text-blue-400">Dental Team</span></h2>
            <p className="text-xl text-slate-400 leading-relaxed">
              Our clinic is home to some of the most skilled dental professionals in the region. We are committed to continuous learning and using the latest clinical protocols to ensure your safety and comfort.
            </p>
            <div className="space-y-6">
              {[
                "Board-certified specialists in Orthodontics & Implants",
                "Compassionate care for children and nervous patients",
                "Regularly trained in the latest dental technologies",
                "Multilingual staff to serve diverse communities"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-medium text-slate-300">{text}</span>
                </div>
              ))}
            </div>
            <div className="pt-8">
              <a href={whatsappLink} className="inline-flex items-center gap-3 bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold hover:bg-blue-400 hover:text-white transition-all shadow-xl">
                Meet the Doctors <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">What Our Patients Say</h2>
          <div className="flex justify-center text-yellow-400 gap-1 mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 fill-current" />)}
          </div>
          <p className="text-xl font-bold text-slate-900">4.9/5.0 Average Rating</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Sarah Johnson", text: "The most professional dental experience I've ever had. The staff is incredibly gentle and the results are amazing!", role: "Patient" },
            { name: "David Mwangi", text: "I used to be terrified of dentists, but {clinicName} changed that. Painless treatment and very friendly environment.", role: "Patient" },
            { name: "Elena Rodriguez", text: "Brought my kids here for their first checkup. The pediatric dentist was wonderful and made them feel so comfortable.", role: "Parent" },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 relative">
              <div className="absolute top-10 right-10 text-slate-200">
                <Users className="w-12 h-12" />
              </div>
              <p className="text-lg text-slate-600 italic mb-8 leading-relaxed">&quot;{item.text.replace('{clinicName}', clinicName)}&quot;</p>
              <div>
                <p className="font-black text-slate-900 text-xl">{item.name}</p>
                <p className="text-blue-600 font-bold uppercase tracking-wider text-xs">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know before your visit.</p>
          </div>
          <div className="space-y-4">
            {[
              { q: "Do you accept dental insurance?", a: "Yes, we work with most major insurance providers. Contact us to verify your specific plan." },
              { q: "Is the treatment painful?", a: "We prioritize patient comfort and use advanced anesthesia and sedation techniques to ensure a painless experience." },
              { q: "How often should I visit for a checkup?", a: "We recommend a professional cleaning and checkup every 6 months to maintain optimal oral health." },
              { q: "Do you offer emergency dental care?", a: "Absolutely. We provide same-day emergency appointments for urgent dental issues." },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h4 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600" /> {item.q}
                </h4>
                <p className="text-slate-600 leading-relaxed pl-8">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="py-20 bg-red-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image 
            src={DENTAL_STOCK_IMAGES.emergency} 
            alt="Emergency" 
            fill 
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-black mb-6">Dental Emergency?</h2>
              <p className="text-xl text-red-100 leading-relaxed">
                Severe toothache, knocked-out tooth, or broken crown? Don&apos;t wait. We provide immediate emergency care to relieve your pain and save your smile.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <a href={telLink} className="bg-white text-red-600 px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:scale-105 transition-transform flex items-center justify-center gap-3">
                <Phone className="w-6 h-6" /> {phone}
              </a>
              <a href={whatsappLink} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:scale-105 transition-transform flex items-center justify-center gap-3">
                <MessageCircle className="w-6 h-6" /> WhatsApp Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="book" className="py-24 container mx-auto px-6">
        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden grid lg:grid-cols-2">
          <div className="p-12 md:p-20 space-y-8">
            <h2 className="text-4xl font-black text-slate-900">Request an Appointment</h2>
            <p className="text-lg text-slate-500">Fill out the form below and our team will contact you shortly to confirm your slot.</p>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" placeholder="Your Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" />
                <input type="tel" placeholder="Phone Number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                <option>Select Service</option>
                {DEFAULT_SERVICES.map((s, i) => <option key={i}>{s.title}</option>)}
              </select>
              <textarea placeholder="Tell us about your dental concern..." rows={4} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
              <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                Submit Request
              </button>
            </form>
          </div>
          <div className="relative hidden lg:block">
            <Image 
              src={DENTAL_STOCK_IMAGES.hero[2]} 
              alt="Happy Patient" 
              fill 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-blue-600/20"></div>
          </div>
        </div>
      </section>

      {/* Contact & Map */}
      <section id="contact" className="py-24 container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">Visit Our Clinic Today</h2>
            <div className="space-y-8 mb-12">
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-xl text-slate-900 mb-1">Our Location</h4>
                  <p className="text-lg text-slate-500">{address}</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-xl text-slate-900 mb-1">Contact Details</h4>
                  <p className="text-lg text-slate-500">{phone}</p>
                  <p className="text-lg text-slate-500">info@{clinicName.toLowerCase().replace(/\s+/g, '')}.com</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-black text-xl text-slate-900 mb-1">Working Hours</h4>
                  <p className="text-lg text-slate-500">Mon - Fri: 8:00 AM - 6:00 PM</p>
                  <p className="text-lg text-slate-500">Sat: 9:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={whatsappLink} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-center hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                Book Appointment
              </a>
              <a href={`https://www.google.com/maps/search/?api=1&query=${mapSearchQuery}`} target="_blank" className="bg-slate-100 text-slate-900 px-10 py-5 rounded-2xl font-bold text-center hover:bg-slate-200 transition-all">
                Get Directions
              </a>
            </div>
          </div>
          <div className="h-[400px] md:h-[600px] rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl border-4 md:border-[12px] border-white relative">
            <iframe 
              src={noApiKeyMapUrl}
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy"
              title="Clinic Location"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Blog / Dental Tips Section */}
      <section id="blog" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 md:mb-16 gap-6 md:gap-8 text-center md:text-left">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6">Dental Health <span className="text-blue-600">Tips & Advice</span></h2>
              <p className="text-base md:text-lg text-slate-500">Expert advice from our dentists to help you maintain a healthy smile at home.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {BLOG_POSTS.map((post) => (
              <motion.div 
                key={post.id}
                whileHover={{ y: -10 }}
                className="bg-slate-50 rounded-[24px] md:rounded-[32px] overflow-hidden border border-slate-100 group cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <div className="relative h-48 md:h-64 overflow-hidden">
                  <Image 
                    src={post.image} 
                    alt={post.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/90 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Dental Care
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <p className="text-[10px] md:text-sm font-bold text-slate-400 mb-2 md:mb-3">{post.date}</p>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-6 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:gap-4 transition-all text-sm md:text-base">
                    Read Full Article <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Post Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto rounded-[24px] md:rounded-[40px] shadow-2xl"
            >
              <button 
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 hover:bg-blue-600 hover:text-white transition-all shadow-lg"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <div className="relative h-48 md:h-96">
                <Image 
                  src={selectedPost.image} 
                  alt={selectedPost.title} 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
              </div>
              <div className="p-6 md:p-16 -mt-12 md:-mt-20 relative z-10">
                <div className="bg-blue-600 text-white px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-wider inline-block mb-6 md:mb-8">
                  Dental Health Advice
                </div>
                <h2 className="text-2xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6 leading-tight">{selectedPost.title}</h2>
                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-slate-400 font-bold mb-8 md:mb-12 text-xs md:text-base">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                  </div>
                  <span>By {clinicName} Medical Team</span>
                  <span className="hidden sm:inline w-1.5 h-1.5 bg-slate-200 rounded-full" />
                  <span>{selectedPost.date}</span>
                </div>
                <div className="prose prose-sm md:prose-lg max-w-none text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {selectedPost.content}
                </div>
                <div className="mt-12 md:mt-16 p-6 md:p-8 bg-blue-50 rounded-[24px] md:rounded-[32px] border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-center md:text-left">
                  <div>
                    <h4 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Need a professional cleaning?</h4>
                    <p className="text-sm md:text-base text-slate-600">Book an appointment today for a brighter, healthier smile.</p>
                  </div>
                  <a href={whatsappLink} className="w-full md:w-auto bg-blue-600 text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 whitespace-nowrap">
                    Book Appointment
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                  {clinicName.charAt(0)}
                </div>
                <span className="font-bold text-2xl tracking-tight">{clinicName}</span>
              </div>
              <p className="text-xl text-slate-400 leading-relaxed max-w-md mb-8">
                Providing exceptional dental care with a gentle touch. Your smile is our priority and our passion.
              </p>
              <div className="flex gap-4">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all">
                    <Icon className="w-6 h-6" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-xl mb-8">Quick Links</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Home</a></li>
                <li><a href="#services" className="hover:text-blue-400 transition-colors">Our Services</a></li>
                <li><a href="#why-us" className="hover:text-blue-400 transition-colors">Why Choose Us</a></li>
                <li><a href="#blog" className="hover:text-blue-400 transition-colors">Dental Tips</a></li>
                <li><a href="#testimonials" className="hover:text-blue-400 transition-colors">Testimonials</a></li>
                <li><a href="#contact" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xl mb-8">Our Services</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                {DEFAULT_SERVICES.slice(0, 5).map((s, i) => (
                  <li key={i}><a href="#services" className="hover:text-blue-400 transition-colors">{s.title}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 font-medium">
            <p>&copy; {new Date().getFullYear()} {clinicName}. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky WhatsApp Button for Mobile */}
      <a 
        href={whatsappLink}
        className="fixed bottom-8 right-8 z-50 bg-green-500 text-white p-5 rounded-full shadow-2xl md:hidden animate-bounce hover:scale-110 transition-transform"
      >
        <MessageCircle className="w-8 h-8" />
      </a>
    </div>
  );
}
