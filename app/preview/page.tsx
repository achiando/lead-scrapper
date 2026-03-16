'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import DemoWebsite from '@/components/DemoWebsite';
import { DentalClinic } from '@/lib/dental-data';

function PreviewContent() {
  const searchParams = useSearchParams();
  const [clinic, setClinic] = useState<Partial<DentalClinic> | null>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(data)));
        Promise.resolve().then(() => {
          setClinic(decoded);
        });
      } catch (e) {
        // Fallback for older links
        try {
          const decoded = JSON.parse(atob(data));
          Promise.resolve().then(() => {
            setClinic(decoded);
          });
        } catch (e2) {
          console.error("Failed to decode clinic data", e2);
        }
      }
    }
  }, [searchParams]);

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

  if (!clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <DemoWebsite clinic={clinic} />;
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
