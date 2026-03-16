'use client';

import React, { useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { generateSlug } from '@/lib/slug-generator';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ClinicData {
  id: string;
  name: string;
  city: string;
  slug?: string;
  status?: string;
}

export default function GenerateSlugsPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    updated: number;
    failed: number;
    details: ClinicData[];
  } | null>(null);

  const generateSlugs = async () => {
    setLoading(true);
    setResults(null);

    try {
      const querySnapshot = await getDocs(collection(db, 'clinics'));
      let updated = 0;
      let failed = 0;
      const details: ClinicData[] = [];

      for (const docSnapshot of querySnapshot.docs) {
        try {
          const clinic = { id: docSnapshot.id, ...docSnapshot.data() } as ClinicData;
          
          // Skip if already has slug
          if (clinic.slug) {
            details.push({
              ...clinic,
              status: 'already_has_slug'
            });
            continue;
          }

          // Generate slug
          const slug = generateSlug(clinic.name || '', clinic.city);
          
          // Update clinic with slug
          await updateDoc(doc(db, 'clinics', docSnapshot.id), {
            slug,
            updatedAt: Date.now()
          });
          
          updated++;
          details.push({
            ...clinic,
            slug,
            status: 'updated'
          });
          
        } catch (error) {
          console.error(`Failed to update clinic ${docSnapshot.id}:`, error);
          failed++;
          details.push({
            id: docSnapshot.id,
            name: (docSnapshot.data() as any).name || 'Unknown',
            city: (docSnapshot.data() as any).city || 'Unknown',
            status: 'failed'
          });
        }
      }
      
      setResults({
        total: querySnapshot.size,
        updated,
        failed,
        details
      });
      
    } catch (error) {
      console.error('Error generating slugs:', error);
      setResults({
        total: 0,
        updated: 0,
        failed: 1,
        details: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Generate Slugs for Clinics</h1>
        <p className="text-slate-600 mb-8">
          This will generate SEO-friendly slugs for all clinics that don't have them yet.
        </p>

        <button
          onClick={generateSlugs}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Slugs...
            </>
          ) : (
            'Generate Slugs for All Clinics'
          )}
        </button>

        {results && (
          <div className="mt-8 space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{results.total}</div>
                  <div className="text-sm text-slate-600">Total Clinics</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.updated}</div>
                  <div className="text-sm text-slate-600">Updated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                  <div className="text-sm text-slate-600">Failed</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.details.map((clinic) => (
                  <div key={clinic.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{clinic.name}</div>
                      <div className="text-sm text-slate-600">{clinic.city}</div>
                      {clinic.slug && (
                        <div className="text-xs text-blue-600 font-mono">{clinic.slug}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {clinic.status === 'updated' && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Updated</span>
                        </div>
                      )}
                      {clinic.status === 'already_has_slug' && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Has Slug</span>
                        </div>
                      )}
                      {clinic.status === 'failed' && (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">Failed</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {results.updated > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">✅ Success!</h3>
                <p className="text-green-700">
                  Generated slugs for {results.updated} clinics. You can now use SEO-friendly URLs like:
                </p>
                <div className="mt-2 space-y-1">
                  <code className="text-sm bg-green-100 px-2 py-1 rounded">
                    http://localhost:3002/preview/crossroads-dental-practice-nairobi
                  </code>
                  <br />
                  <code className="text-sm bg-green-100 px-2 py-1 rounded">
                    http://localhost:3002/preview/gigiri-dental-practice-nairobi
                  </code>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
