'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { DentalClinic } from '@/lib/dental-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const [clinics, setClinics] = useState<DentalClinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'clinics'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DentalClinic));
      setClinics(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const statusData = [
    { name: 'New', value: clinics.filter(c => c.status === 'new').length },
    { name: 'Contacted', value: clinics.filter(c => c.status === 'contacted').length },
    { name: 'Negotiating', value: clinics.filter(c => c.status === 'negotiating').length },
    { name: 'Closed', value: clinics.filter(c => c.status === 'closed').length },
  ];

  const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold mb-4">Leads by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold mb-4">Lead Count</h3>
          <p className="text-5xl font-black text-blue-600">{clinics.length}</p>
          <p className="text-slate-500 mt-2">Total Saved Leads</p>
        </div>
      </div>
    </div>
  );
}
