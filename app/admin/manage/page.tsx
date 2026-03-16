'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { DentalClinic } from '@/lib/dental-data';
import { Trash2, Loader2, Edit2 } from 'lucide-react';

export default function ManageLeadsPage() {
  const [clinics, setClinics] = useState<DentalClinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'clinics'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DentalClinic));
      setClinics(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const deleteClinic = async (id: string) => {
    await deleteDoc(doc(db, 'clinics', id));
  };

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'clinics', id), { status });
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Leads</h2>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-bold text-slate-700">Clinic</th>
              <th className="p-4 font-bold text-slate-700">Status</th>
              <th className="p-4 font-bold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map(clinic => (
              <tr key={clinic.id} className="border-b border-slate-100">
                <td className="p-4">
                  <p className="font-bold">{clinic.name}</p>
                  <p className="text-xs text-slate-500">{clinic.city}</p>
                </td>
                <td className="p-4">
                  <select 
                    value={clinic.status || 'new'} 
                    onChange={(e) => updateStatus(clinic.id, e.target.value)}
                    className="p-2 rounded-lg border border-slate-200 text-sm"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td className="p-4">
                  <button onClick={() => deleteClinic(clinic.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
