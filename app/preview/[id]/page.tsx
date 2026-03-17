import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { db } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { DentalClinic } from '@/lib/dental-data';
import DemoWebsite from '@/components/DemoWebsite';
import { Loader2 } from 'lucide-react';
import { generatePreviewMetadata } from './metadata';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ data?: string }>;
}

async function getClinicData(id: string, dataParam?: string): Promise<DentalClinic | null> {
  if (dataParam) {
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(dataParam)));
      return decoded;
    } catch (e) {
      // Fallback for older links that weren't URI encoded
      try {
        const decoded = JSON.parse(atob(dataParam));
        return decoded;
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
      return { id: docSnap.id, ...docSnap.data() } as DentalClinic;
    } else {
      // Fallback to finding by document ID
      const docRef = doc(db, 'clinics', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as DentalClinic;
      }
    }
  } catch (error) {
    console.error("Error fetching clinic:", error);
  }
  
  return null;
}

async function PreviewContent({ clinic }: { clinic: DentalClinic }) {
  return <DemoWebsite clinic={clinic} />;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
}

function NotFoundFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-500 font-bold">Clinic not found.</p>
    </div>
  );
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data } = await searchParams;
  
  const clinic = await getClinicData(id, data);
  
  if (!clinic) {
    return {
      title: 'Clinic Not Found',
      description: 'The requested dental clinic could not be found.',
    };
  }
  
  return generatePreviewMetadata(clinic);
}

export default async function PreviewPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { data } = await searchParams;
  
  const clinic = await getClinicData(id, data);
  
  if (!clinic) {
    return <NotFoundFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <PreviewContent clinic={clinic} />
    </Suspense>
  );
}
