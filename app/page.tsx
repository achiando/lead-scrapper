'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react';
import { auth } from '@/firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const handleAdminLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === "achiandofrancline@gmail.com") {
        router.push('/admin');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-200 mx-auto transform -rotate-6">
          <Layout className="w-10 h-10" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tight text-slate-900">
            Dental Demo <span className="text-blue-600">Pro</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-lg mx-auto leading-relaxed">
            The ultimate lead generation tool for dental marketing agencies. 
            Find clinics without websites and generate professional demos in seconds.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <button 
            onClick={handleAdminLogin}
            className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 text-lg"
          >
            <ShieldCheck className="w-6 h-6" /> Admin Dashboard <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-12 grid grid-cols-3 gap-8 border-t border-slate-200">
          <div>
            <p className="text-3xl font-bold text-slate-900">AI</p>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Search</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">1-Click</p>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Demo</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">No Web</p>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Targeting</p>
          </div>
        </div>
      </div>
    </div>
  );
}
