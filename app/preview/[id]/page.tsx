'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { db } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { DentalClinic } from '@/lib/dental-data';
import DemoWebsite from '@/components/DemoWebsite';
import { Loader2 } from 'lucide-react';

function SavedPreviewContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [clinic, setClinic] = useState<DentalClinic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClinic() {
      if (!id) return;
      
      const dataParam = searchParams.get('data');
      if (dataParam) {
        try {
          const decoded = JSON.parse(decodeURIComponent(atob(dataParam)));
          setClinic(decoded);
          setLoading(false);
          return;
        } catch (e) {
          // Fallback for older links that weren't URI encoded
          try {
            const decoded = JSON.parse(atob(dataParam));
            setClinic(decoded);
            setLoading(false);
            return;
          } catch (e2) {
            console.error("Failed to decode clinic data", e2);
          }
        }
      }

      try {
        // First try to find by slug
        const q = query(collection(db, 'clinics'), where('slug', '==', id));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          setClinic({ id: docSnap.id, ...docSnap.data() } as DentalClinic);
        } else {
          // Fallback to finding by document ID
          const docRef = doc(db, 'clinics', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setClinic({ id: docSnap.id, ...docSnap.data() } as DentalClinic);
          }
        }
      } catch (error) {
        console.error("Error fetching clinic:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchClinic();
  }, [id, searchParams]);

  useEffect(() => {
    if (clinic) {
      if (clinic.metaTitle) {
        document.title = clinic.metaTitle;
      } else {
        document.title = `${clinic.name} | Dental Clinic`;
      }
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', clinic.metaDescription || `Professional dental services at ${clinic.name}.`);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = clinic.metaDescription || `Professional dental services at ${clinic.name}.`;
        document.head.appendChild(meta);
      }
    }
  }, [clinic]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-bold">Clinic not found.</p>
      </div>
    );
  }

  return <DemoWebsite clinic={clinic} />;
}

export default function SavedPreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <SavedPreviewContent />
    </Suspense>
  );
}
