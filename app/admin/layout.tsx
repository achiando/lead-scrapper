'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/firebase';
import { Search, BarChart3, Database, Upload, LogOut, Layout, Loader2, ShieldCheck } from 'lucide-react';

const ADMIN_EMAIL = "achiandofrancline@gmail.com";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  const handleLogout = () => signOut(auth);
  
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
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
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
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
          <Link href="/admin/search" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === '/admin/search' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
            <Search className="w-5 h-5" /> Search Leads
          </Link>
          <Link href="/admin/upload-leads" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === '/admin/upload-leads' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
            <Upload className="w-5 h-5" /> Upload Leads
          </Link>
          <Link href="/admin/analytics" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === '/admin/analytics' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
            <BarChart3 className="w-5 h-5" /> Analytics
          </Link>
          <Link href="/admin/manage" className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === '/admin/manage' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5" /> Manage Leads
            </div>
          </Link>
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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
        <nav className="flex justify-around py-2">
          <Link 
            href="/admin/search" 
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${pathname === '/admin/search' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Search</span>
          </Link>
          <Link 
            href="/admin/upload-leads" 
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${pathname === '/admin/upload-leads' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Upload className="w-5 h-5" />
            <span className="text-xs mt-1">Upload</span>
          </Link>
          <Link 
            href="/admin/manage" 
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${pathname === '/admin/manage' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Database className="w-5 h-5" />
            <span className="text-xs mt-1">Manage</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center p-2 rounded-lg text-slate-500 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs mt-1">Logout</span>
          </button>
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
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

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
