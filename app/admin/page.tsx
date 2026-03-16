'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, ExternalLink, Trash2, MapPin, Phone, Star, Globe, Loader2, Layout, Database, Users, LogOut, ShieldCheck, MessageCircle, Mail, MessageSquare, CheckCircle, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '@/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { DentalClinic } from '@/lib/dental-data';
import { searchClinics } from '@/lib/gemini-search';

const ADMIN_EMAIL = "achiandofrancline@gmail.com";

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('Dental clinic near Nairobi');
  const [searchResults, setSearchResults] = useState<Partial<DentalClinic>[]>([]);
  const [savedClinics, setSavedClinics] = useState<DentalClinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'search' | 'manage'>('search');
  
  const [editingSeo, setEditingSeo] = useState<DentalClinic | null>(null);
  const [seoForm, setSeoForm] = useState({ metaTitle: '', metaDescription: '' });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });

    const q = query(collection(db, 'clinics'), orderBy('createdAt', 'desc'));
    const unsubscribeClinics = onSnapshot(q, (snapshot) => {
      const clinics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DentalClinic));
      setSavedClinics(clinics);
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeClinics();
    };
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const results = await searchClinics(searchQuery);
    setSearchResults(results);
    setLoading(false);
  };

  const generateSlug = (name: string, existingSlugs?: Set<string>) => {
    let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!baseSlug) baseSlug = 'clinic';
    
    let slug = baseSlug;
    let counter = 1;
    
    const isSlugTaken = (s: string) => {
      if (existingSlugs && existingSlugs.has(s)) return true;
      return savedClinics.some(c => c.slug === s);
    };

    while (isSlugTaken(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    if (existingSlugs) {
      existingSlugs.add(slug);
    }
    
    return slug;
  };

  const isDuplicate = (clinic: Partial<DentalClinic>) => {
    return savedClinics.some(c => c.name === clinic.name || (c.phone && c.phone === clinic.phone));
  };

  const sanitizeClinic = (clinic: Partial<DentalClinic>, existingSlugs?: Set<string>) => {
    const slug = generateSlug(clinic.name || 'clinic', existingSlugs);
    const clinicData: any = {
      ...clinic,
      slug,
      searchTerm: searchQuery,
      status: 'new',
      createdAt: Date.now(),
    };
    
    // Enforce size limits from firestore.rules
    if (clinicData.name && typeof clinicData.name !== 'string') clinicData.name = String(clinicData.name);
    if (!clinicData.name || clinicData.name.trim() === '') clinicData.name = 'Unknown Clinic';
    if (clinicData.name && clinicData.name.length > 200) clinicData.name = clinicData.name.substring(0, 200);
    
    if (clinicData.category && typeof clinicData.category !== 'string') clinicData.category = String(clinicData.category);
    if (clinicData.category && clinicData.category.length > 100) clinicData.category = clinicData.category.substring(0, 100);
    
    if (clinicData.phone && typeof clinicData.phone !== 'string') clinicData.phone = String(clinicData.phone);
    if (clinicData.phone && clinicData.phone.length > 50) clinicData.phone = clinicData.phone.substring(0, 50);
    
    if (clinicData.address && typeof clinicData.address !== 'string') clinicData.address = String(clinicData.address);
    if (clinicData.address && clinicData.address.length > 500) clinicData.address = clinicData.address.substring(0, 500);
    
    if (clinicData.city && typeof clinicData.city !== 'string') clinicData.city = String(clinicData.city);
    if (clinicData.city && clinicData.city.length > 100) clinicData.city = clinicData.city.substring(0, 100);
    
    if (clinicData.metaTitle && typeof clinicData.metaTitle !== 'string') clinicData.metaTitle = String(clinicData.metaTitle);
    if (clinicData.metaTitle && clinicData.metaTitle.length > 200) clinicData.metaTitle = clinicData.metaTitle.substring(0, 200);
    
    if (clinicData.metaDescription && typeof clinicData.metaDescription !== 'string') clinicData.metaDescription = String(clinicData.metaDescription);
    if (clinicData.metaDescription && clinicData.metaDescription.length > 500) clinicData.metaDescription = clinicData.metaDescription.substring(0, 500);
    
    if (clinicData.websiteUrl && typeof clinicData.websiteUrl !== 'string') clinicData.websiteUrl = String(clinicData.websiteUrl);
    if (clinicData.websiteUrl) {
      if (!clinicData.websiteUrl.startsWith('http')) {
        clinicData.websiteUrl = 'https://' + clinicData.websiteUrl;
      }
      if (clinicData.websiteUrl.length > 500) clinicData.websiteUrl = clinicData.websiteUrl.substring(0, 500);
    }
    
    if (clinicData.mapEmbedUrl) {
      if (!clinicData.mapEmbedUrl.startsWith('http')) {
        clinicData.mapEmbedUrl = 'https://' + clinicData.mapEmbedUrl;
      }
      if (clinicData.mapEmbedUrl.length > 1000) clinicData.mapEmbedUrl = clinicData.mapEmbedUrl.substring(0, 1000);
    }
    
    if (clinicData.rating !== undefined) {
      clinicData.rating = Number(clinicData.rating);
      if (isNaN(clinicData.rating)) delete clinicData.rating;
      else {
        if (clinicData.rating < 0) clinicData.rating = 0;
        if (clinicData.rating > 5) clinicData.rating = 5;
      }
    }
    if (clinicData.reviewsCount !== undefined) {
      clinicData.reviewsCount = Number(clinicData.reviewsCount);
      if (isNaN(clinicData.reviewsCount)) delete clinicData.reviewsCount;
      else {
        if (clinicData.reviewsCount < 0) clinicData.reviewsCount = 0;
      }
    }
    
    // Remove undefined values
    Object.keys(clinicData).forEach(key => {
      if (clinicData[key] === undefined) {
        delete clinicData[key];
      }
    });
    
    return clinicData;
  };

  const saveClinic = async (clinic: Partial<DentalClinic>) => {
    if (isDuplicate(clinic)) {
      alert('This clinic is already saved in your leads.');
      return;
    }
    try {
      const clinicData = sanitizeClinic(clinic);
      await addDoc(collection(db, 'clinics'), clinicData);
      alert('Clinic saved successfully!');
    } catch (error) {
      console.error('Error saving clinic:', error);
      alert('Failed to save clinic. Check console for details.');
    }
  };

  const saveAllClinics = async () => {
    // Filter against already saved clinics
    let newClinics = searchResults.filter(c => !isDuplicate(c));
    
    // Filter out duplicates within the new clinics array itself
    const uniqueNewClinics: Partial<DentalClinic>[] = [];
    const seenNames = new Set<string>();
    const seenPhones = new Set<string>();
    
    for (const clinic of newClinics) {
      if (clinic.name && seenNames.has(clinic.name)) continue;
      if (clinic.phone && seenPhones.has(clinic.phone)) continue;
      
      if (clinic.name) seenNames.add(clinic.name);
      if (clinic.phone) seenPhones.add(clinic.phone);
      
      uniqueNewClinics.push(clinic);
    }
    
    newClinics = uniqueNewClinics;

    if (newClinics.length === 0) {
      alert('No new clinics to save. All are already in your leads.');
      return;
    }
    if (!confirm(`Are you sure you want to save ${newClinics.length} new clinics?`)) return;
    setLoading(true);
    try {
      const existingSlugs = new Set<string>();
      // Firestore batch limit is 500, but let's chunk by 100 to be safe
      const chunkSize = 100;
      for (let i = 0; i < newClinics.length; i += chunkSize) {
        const chunk = newClinics.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach(clinic => {
          const clinicData = sanitizeClinic(clinic, existingSlugs);
          const newDocRef = doc(collection(db, 'clinics'));
          batch.set(newDocRef, clinicData);
        });
        await batch.commit();
      }
      alert('All new clinics saved successfully!');
      setSearchResults([]);
    } catch (error) {
      console.error('Error saving clinics:', error);
      alert('Failed to save some clinics. Check console for details.');
    }
    setLoading(false);
  };

  const updateClinicStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'clinics', id), { status });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getContactMessage = (clinic: DentalClinic, type: 'whatsapp' | 'sms' | 'email') => {
    const url = `${window.location.origin}/preview/${clinic.slug || clinic.id}`;
    if (type === 'sms') {
      return encodeURIComponent(`Hi ${clinic.name}, this is Tijwa Limited. While searching online for dental clinics we found your practice and created a quick website demo for you: ${url}`);
    }
    return encodeURIComponent(`Hi ${clinic.name},\n\nThis is Tijwa Limited. We found your clinic while searching online and created a quick demo website showing how it could appear.\n\nPreview:\n${url}\n\nWould love your feedback.`);
  };

  const removeClinic = async (id: string) => {
    if (!confirm('Are you sure you want to remove this clinic?')) return;
    try {
      await deleteDoc(doc(db, 'clinics', id));
    } catch (error) {
      console.error('Error removing clinic:', error);
    }
  };

  const openPreview = (clinic: Partial<DentalClinic>) => {
    const slug = generateSlug(clinic.name || 'clinic');
    const clinicWithSlug = { ...clinic, slug };
    // Use encodeURIComponent to handle non-latin characters safely
    const data = btoa(encodeURIComponent(JSON.stringify(clinicWithSlug)));
    window.open(`/preview/${slug}?data=${data}`, '_blank');
  };

  const openSavedPreview = (clinic: DentalClinic) => {
    window.open(`/preview/${clinic.slug || clinic.id}`, '_blank');
  };

  const saveSeo = async () => {
    if (!editingSeo) return;
    try {
      await updateDoc(doc(db, 'clinics', editingSeo.id), {
        metaTitle: seoForm.metaTitle,
        metaDescription: seoForm.metaDescription
      });
      setEditingSeo(null);
    } catch (error) {
      console.error('Error updating SEO:', error);
      alert('Failed to update SEO.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Admin Access Only</h1>
          <p className="text-slate-500 mb-8">Please sign in with your admin account to manage dental clinics.</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            <Users className="w-5 h-5" /> Sign in with Google
          </button>
          {user && user.email !== ADMIN_EMAIL && (
            <p className="mt-4 text-red-500 text-sm font-medium">
              Access denied for {user.email}. Please use the admin email.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Layout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Admin</h1>
              <p className="text-slate-500 text-xs">Lead Generation</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
              {user.displayName?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-700 truncate">{user.displayName || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('search')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'search' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            <Search className="w-5 h-5" /> Search Leads
          </button>
          <button 
            onClick={() => setActiveTab('manage')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'manage' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5" /> Manage Leads
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'manage' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
              {savedClinics.length}
            </span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-4 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Layout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Admin</h1>
              <p className="text-slate-500 text-[10px]">Lead Generation</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Mobile Tab Switcher */}
          <div className="flex md:hidden bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setActiveTab('search')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'search' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Search
            </button>
            <button 
              onClick={() => setActiveTab('manage')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'manage' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Manage ({savedClinics.length})
            </button>
          </div>

          <div className="max-w-7xl mx-auto">
            {/* Dashboard Stats & Progress */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Lead Generation Progress</h2>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-500 mb-1">Clinics Searched</p>
                    <p className="text-2xl font-bold text-slate-800">{savedClinics.length}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                    <p className="text-sm font-medium text-yellow-600 mb-1">Contacted / Demos Sent</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {savedClinics.filter(c => c.status === 'contacted' || c.status === 'negotiating' || c.status === 'closed').length}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-sm font-medium text-blue-600 mb-1">Negotiating</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {savedClinics.filter(c => c.status === 'negotiating' || c.status === 'closed').length}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                    <p className="text-sm font-medium text-green-600 mb-1">Closed / Won</p>
                    <p className="text-2xl font-bold text-green-700">
                      {savedClinics.filter(c => c.status === 'closed').length}
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>Conversion Funnel</span>
                    <span>{savedClinics.length > 0 ? Math.round((savedClinics.filter(c => c.status === 'closed').length / savedClinics.length) * 100) : 0}% Conversion Rate</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    {savedClinics.length > 0 ? (
                      <>
                        <div 
                          className="h-full bg-slate-300 transition-all duration-500" 
                          style={{ width: `${(savedClinics.filter(c => !c.status || c.status === 'new').length / savedClinics.length) * 100}%` }}
                          title="New Leads"
                        ></div>
                        <div 
                          className="h-full bg-yellow-400 transition-all duration-500" 
                          style={{ width: `${(savedClinics.filter(c => c.status === 'contacted').length / savedClinics.length) * 100}%` }}
                          title="Contacted"
                        ></div>
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500" 
                          style={{ width: `${(savedClinics.filter(c => c.status === 'negotiating').length / savedClinics.length) * 100}%` }}
                          title="Negotiating"
                        ></div>
                        <div 
                          className="h-full bg-green-500 transition-all duration-500" 
                          style={{ width: `${(savedClinics.filter(c => c.status === 'closed').length / savedClinics.length) * 100}%` }}
                          title="Closed"
                        ></div>
                      </>
                    ) : (
                      <div className="h-full w-full bg-slate-100"></div>
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300"></div> New</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Contacted / Demos Sent</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Negotiating</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Closed</div>
                  </div>
                </div>
              </div>
            </div>

            {activeTab === 'search' ? (
          <div className="space-y-6 md:space-y-8">
            <section className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" /> Find Clinics
              </h2>
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., Dental clinic in Nairobi"
                    className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm md:text-base"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                </button>
              </form>
            </section>

            <section className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <div>
                  <h2 className="text-lg md:text-xl font-bold">Search Results</h2>
                  <span className="text-slate-400 text-xs md:text-sm font-medium">{searchResults.length} found</span>
                </div>
                {searchResults.length > 0 && (
                  <button 
                    onClick={saveAllClinics}
                    disabled={loading}
                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-100 transition-all flex items-center gap-2 text-sm"
                  >
                    <Database className="w-4 h-4" /> Save All
                  </button>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {searchResults.map((clinic, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base md:text-lg font-bold text-slate-800">{clinic.name}</h3>
                            <span className="bg-blue-50 text-blue-600 text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                              {clinic.category || 'Dentist'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-bold text-slate-700">{clinic.rating}</span>
                              <span>({clinic.reviewsCount})</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              <span className="truncate max-w-[100px] md:max-w-none">{clinic.city}</span>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-3 md:gap-4 text-[10px] md:text-xs font-medium text-slate-400">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {clinic.phone}</span>
                            <span className="flex items-center gap-1 text-red-500"><Globe className="w-3 h-3" /> No website</span>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                          <button 
                            onClick={() => openPreview(clinic)}
                            className="flex-grow sm:flex-grow-0 bg-slate-900 text-white px-4 py-2.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" /> Preview
                          </button>
                          <button 
                            onClick={() => saveClinic(clinic)}
                            className="flex-grow sm:flex-grow-0 bg-blue-50 text-blue-600 px-4 py-2.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                          >
                            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Save
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {searchResults.length === 0 && !loading && (
                  <div className="md:col-span-2 bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-400">No results yet</h3>
                    <p className="text-slate-400 text-sm">Search for clinics without websites to start generating demo sites.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Database className="w-5 h-5 text-blue-600" /> Manage Leads
              </h2>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                {savedClinics.length} Total
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-200">
                    <th className="p-4 font-semibold">Business Name</th>
                    <th className="p-4 font-semibold">Category & Search</th>
                    <th className="p-4 font-semibold">Contact</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {savedClinics.map((clinic) => (
                    <tr key={clinic.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{clinic.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {clinic.city || clinic.address}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-slate-700">
                          {clinic.category || 'N/A'}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Search className="w-3 h-3" /> {clinic.searchTerm || 'Unknown search'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-slate-700 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {clinic.phone}
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={clinic.status || 'new'}
                          onChange={(e) => updateClinicStatus(clinic.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-blue-500/20 outline-none
                            ${(!clinic.status || clinic.status === 'new') ? 'bg-slate-100 text-slate-600' : ''}
                            ${clinic.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' : ''}
                            ${clinic.status === 'negotiating' ? 'bg-blue-100 text-blue-700' : ''}
                            ${clinic.status === 'closed' ? 'bg-green-100 text-green-700' : ''}
                          `}
                        >
                          <option value="new">New Lead</option>
                          <option value="contacted">Demo Sent</option>
                          <option value="negotiating">Negotiating</option>
                          <option value="closed">Closed / Won</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <a 
                            href={`https://wa.me/${clinic.phone?.replace(/\s+/g, '')}?text=${getContactMessage(clinic, 'whatsapp')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors"
                            title="Send WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          <a 
                            href={`sms:${clinic.phone?.replace(/\s+/g, '')}?body=${getContactMessage(clinic, 'sms')}`}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                            title="Send SMS"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                          <a 
                            href={`mailto:?subject=Your New Website&body=${getContactMessage(clinic, 'email')}`}
                            className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-100 transition-colors"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                          <div className="w-px h-6 bg-slate-200 mx-1"></div>
                          <button 
                            onClick={() => {
                              setEditingSeo(clinic);
                              setSeoForm({
                                metaTitle: clinic.metaTitle || '',
                                metaDescription: clinic.metaDescription || ''
                              });
                            }}
                            className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-100 transition-colors"
                            title="Edit SEO"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openSavedPreview(clinic)}
                            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
                            title="View Demo"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => removeClinic(clinic.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {savedClinics.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                        No leads saved yet. Switch to &quot;Search Leads&quot; to find businesses.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
          </div>
        </main>
      </div>

      {/* SEO Edit Modal */}
      <AnimatePresence>
        {editingSeo && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-500" />
                  Edit SEO Settings
                </h3>
                <button 
                  onClick={() => setEditingSeo(null)}
                  className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 transition-colors"
                >
                  &times;
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Meta Title</label>
                  <input 
                    type="text" 
                    value={seoForm.metaTitle}
                    onChange={(e) => setSeoForm({ ...seoForm, metaTitle: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. Best Dental Clinic in Nairobi"
                    maxLength={200}
                  />
                  <p className="text-xs text-slate-400 mt-1 text-right">{seoForm.metaTitle.length}/200</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Meta Description</label>
                  <textarea 
                    value={seoForm.metaDescription}
                    onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[100px] resize-none"
                    placeholder="e.g. Professional dental services including cleaning, whitening, and braces..."
                    maxLength={500}
                  />
                  <p className="text-xs text-slate-400 mt-1 text-right">{seoForm.metaDescription.length}/500</p>
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button 
                  onClick={() => setEditingSeo(null)}
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveSeo}
                  className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
