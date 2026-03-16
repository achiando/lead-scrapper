'use client';

import React, { useState } from 'react';
import { Search, Loader2, Save, CheckCircle } from 'lucide-react';
import { searchClinics } from '@/lib/gemini-search';
import { DentalClinic } from '@/lib/dental-data';
import { db } from '@/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';

export default function SearchLeadsPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Partial<DentalClinic>[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const clinics = await searchClinics(query);
    setResults(clinics);
    setLoading(false);
  };

  const saveClinic = async (clinic: Partial<DentalClinic>) => {
    setSaving(clinic.name || 'clinic');
    const now = new Date().valueOf();
    try {
      const clinicRef = doc(collection(db, 'clinics'));
      await setDoc(clinicRef, {
        ...clinic,
        createdAt: now,
        status: 'new'
      });
      setSaving(null);
    } catch (error) {
      console.error('Error saving clinic:', error);
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Search Leads</h2>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for dental clinics in a city..."
          className="flex-1 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />} Search
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((clinic, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg">{clinic.name}</h3>
            <p className="text-sm text-slate-500">{clinic.category} • {clinic.city}</p>
            <p className="text-sm text-slate-600 mt-2">{clinic.address}</p>
            <button 
              onClick={() => saveClinic(clinic)}
              disabled={!!saving}
              className="mt-4 w-full bg-slate-900 text-white py-2 rounded-lg font-bold hover:bg-slate-800 flex items-center justify-center gap-2"
            >
              {saving === clinic.name ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Lead
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
