'use client';

import React, { useState } from 'react';
import { Search, Loader2, Save, CheckCircle, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { searchClinics } from '@/lib/hybrid-search';
import { DentalClinic } from '@/lib/dental-data';
import { db } from '@/firebase';
import { doc, setDoc, collection, query, where, getDocs, updateDoc, QueryFieldFilterConstraint } from 'firebase/firestore';
import { generateSlug } from '@/lib/slug-generator';

export default function SearchLeadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Partial<DentalClinic>[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);

  const totalPages = Math.ceil(results.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = results.slice(startIndex, endIndex);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const clinics = await searchClinics(searchQuery);
    setResults(clinics);
    setCurrentPage(1); // Reset to first page on new search
    setLoading(false);
  };

  const saveClinic = async (clinic: Partial<DentalClinic>) => {
    setSaving(clinic.name || 'clinic');
    const now = new Date().valueOf();
    try {
      // Generate slug for new clinics
      const slug = generateSlug(clinic.name || '', clinic.city);
      
      // Check if clinic already exists
      const q = query(collection(db, 'clinics'), where('name', '==', clinic.name));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Update existing clinic
        const existingDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'clinics', existingDoc.id), {
          ...clinic,
          updatedAt: now
        });
      } else {
        // Create new clinic with slug
        const clinicRef = doc(collection(db, 'clinics'));
        await setDoc(clinicRef, {
          ...clinic,
          slug,
          createdAt: now,
          status: 'new'
        });
      }
      setSaving(null);
    } catch (error) {
      console.error('Error saving clinic:', error);
      setSaving(null);
    }
  };

  const saveAllClinics = async () => {
    setSavingAll(true);
    setSaveProgress({ current: 0, total: results.length });
    const now = new Date().valueOf();
    
    try {
      for (let i = 0; i < results.length; i++) {
        const clinic = results[i];
        setSaveProgress({ current: i + 1, total: results.length });
        
        // Generate slug for new clinics
        const slug = generateSlug(clinic.name || '', clinic.city);
        
        // Check if clinic already exists
        const q = query(collection(db, 'clinics'), where('name', '==', clinic.name));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Update existing clinic
          const existingDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'clinics', existingDoc.id), {
            ...clinic,
            updatedAt: now
          });
        } else {
          // Create new clinic with slug
          const clinicRef = doc(collection(db, 'clinics'));
          await setDoc(clinicRef, {
            ...clinic,
            slug,
            createdAt: now,
            status: 'new'
          });
        }
        
        // Small delay to prevent overwhelming Firestore
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error saving all clinics:', error);
    } finally {
      setSavingAll(false);
      setSaveProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Search Leads</h2>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for dental clinics in a city..."
          className="flex-1 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />} Search
        </button>
      </form>

      {results.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-sm text-slate-600">
            Showing <span className="font-bold">{startIndex + 1}-{Math.min(endIndex, results.length)}</span> of <span className="font-bold">{results.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Results per page:</label>
            <select 
              value={resultsPerPage} 
              onChange={(e) => {
                setResultsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 rounded-lg border border-slate-200 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <button
              onClick={saveAllClinics}
              disabled={savingAll || results.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
            >
              {savingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {saveProgress.current}/{saveProgress.total}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Save All
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentResults.map((clinic, index) => (
          <div key={startIndex + index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg">{clinic.name}</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                clinic.source === 'google_places' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {clinic.source === 'google_places' ? 'Google Places' : 'AI Generated'}
              </div>
            </div>
            <p className="text-sm text-slate-500">{clinic.category} • {clinic.city}</p>
            <p className="text-sm text-slate-600 mt-2">{clinic.address}</p>
            {clinic.rating && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-medium ml-1">{clinic.rating}</span>
                </div>
                {clinic.reviewsCount && (
                  <span className="text-xs text-slate-500">({clinic.reviewsCount} reviews)</span>
                )}
              </div>
            )}
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page 
                    ? 'bg-blue-600 text-white' 
                    : 'border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
