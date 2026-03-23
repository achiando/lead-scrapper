'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { DentalClinic } from '@/lib/dental-data';
import { Trash2, Loader2, Edit2, Eye, MessageSquare, Phone, Mail, MoreVertical, CheckSquare, Square } from 'lucide-react';
import CommunicationActions from '@/components/CommunicationActions';
import { openBulkEmail } from '@/lib/bulk-email';

export default function ManageLeadsPage() {
  const [clinics, setClinics] = useState<DentalClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedClinics, setSelectedClinics] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'clinics'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DentalClinic));
      setClinics(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  const deleteClinic = async (id: string) => {
    await deleteDoc(doc(db, 'clinics', id));
  };

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'clinics', id), { status });
  };

  const handlePreview = (clinic: DentalClinic) => {
    const slug = clinic.slug || clinic.id;
    window.open(`/preview/${slug}`, '_blank');
  };

  const toggleDropdown = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedClinics);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedClinics(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const selectAll = () => {
    if (selectedClinics.size === clinics.length) {
      setSelectedClinics(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedClinics(new Set(clinics.map(c => c.id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkEmail = () => {
    const selectedClinicData = clinics.filter(c => selectedClinics.has(c.id));
    openBulkEmail(selectedClinicData);
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Leads</h2>
      
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedClinics.size} clinic{selectedClinics.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={selectAll}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {selectedClinics.size === clinics.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <button
            onClick={handleBulkEmail}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Send Email ({clinics.filter(c => selectedClinics.has(c.id) && c.email).length})
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold text-slate-700 w-12">
                  <button
                    onClick={selectAll}
                    className="text-slate-600 hover:text-slate-800"
                    title={selectedClinics.size === clinics.length ? 'Deselect All' : 'Select All'}
                  >
                    {selectedClinics.size === clinics.length && clinics.length > 0 ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="p-4 font-bold text-slate-700">Clinic</th>
                <th className="p-4 font-bold text-slate-700">Contact</th>
                <th className="p-4 font-bold text-slate-700">Slug</th>
                <th className="p-4 font-bold text-slate-700">Status</th>
                <th className="p-4 font-bold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clinics.map(clinic => (
                <tr key={clinic.id} className={`border-b border-slate-100 ${selectedClinics.has(clinic.id) ? 'bg-blue-50' : ''}`}>
                  <td className="p-4">
                    <button
                      onClick={() => toggleSelection(clinic.id)}
                      className="text-slate-600 hover:text-blue-600"
                    >
                      {selectedClinics.has(clinic.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <p className="font-bold">{clinic.name}</p>
                    <p className="text-xs text-slate-500">{clinic.city}</p>
                    {clinic.address && <p className="text-xs text-slate-400 mt-1">{clinic.address}</p>}
                  </td>
                  <td className="p-4">
                    {clinic.phone && (
                      <p className="text-sm text-slate-600">{clinic.phone}</p>
                    )}
                    {clinic.email && (
                      <a 
                        href={`mailto:${clinic.email}`}
                        className="text-xs text-blue-600 hover:text-blue-700 block mt-1"
                      >
                        {clinic.email}
                      </a>
                    )}
                    {clinic.websiteUrl && (
                      <a 
                        href={clinic.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 hover:text-purple-700 block mt-1"
                      >
                        Website
                      </a>
                    )}
                    {!clinic.phone && !clinic.email && !clinic.websiteUrl && (
                      <span className="text-xs text-slate-400 italic">No contact info</span>
                    )}
                  </td>
                  <td className="p-4">
                    {clinic.slug ? (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono">
                          {clinic.slug}
                        </code>
                        <a
                          href={`/preview/${clinic.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700"
                          title="View preview"
                        >
                          View
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No slug</span>
                    )}
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
                    <div className="relative">
                      <button
                        onClick={(e) => toggleDropdown(clinic.id, e)}
                        className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                        title="Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {openDropdown === clinic.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handlePreview(clinic)}
                              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Preview
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <div className="px-4 py-2">
                              <CommunicationActions clinic={{ ...clinic, id: clinic.id }} />
                            </div>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button
                              onClick={() => deleteClinic(clinic.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
          {clinics.map(clinic => (
            <div key={clinic.id} className={`bg-white border rounded-lg p-4 ${selectedClinics.has(clinic.id) ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}>
              {/* Header with checkbox and name */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => toggleSelection(clinic.id)}
                    className="text-slate-600 hover:text-blue-600 mt-1"
                  >
                    {selectedClinics.has(clinic.id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3 className="font-bold text-base">{clinic.name}</h3>
                    <p className="text-sm text-slate-500">{clinic.city}</p>
                    {clinic.address && <p className="text-xs text-slate-400 mt-1">{clinic.address}</p>}
                  </div>
                </div>
                <button
                  onClick={(e) => toggleDropdown(clinic.id, e)}
                  className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  title="Actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Contact Information */}
              <div className="mb-3 space-y-1">
                {clinic.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <a href={`tel:${clinic.phone}`} className="text-sm text-slate-600 hover:text-blue-600">
                      {clinic.phone}
                    </a>
                  </div>
                )}
                {clinic.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a 
                      href={`mailto:${clinic.email}`}
                      className="text-sm text-blue-600 hover:text-blue-700 truncate"
                    >
                      {clinic.email}
                    </a>
                  </div>
                )}
                {clinic.websiteUrl && (
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <a 
                      href={clinic.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-700 truncate"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>

              {/* Status and Actions */}
              <div className="flex items-center justify-between">
                <select 
                  value={clinic.status || 'new'} 
                  onChange={(e) => updateStatus(clinic.id, e.target.value)}
                  className="p-2 rounded-lg border border-slate-200 text-sm flex-1 mr-2"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="closed">Closed</option>
                </select>
                
                {clinic.slug && (
                  <a
                    href={`/preview/${clinic.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Preview
                  </a>
                )}
              </div>

              {/* Mobile Dropdown */}
              {openDropdown === clinic.id && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="space-y-2">
                    <div className="px-4 py-2">
                      <CommunicationActions clinic={{ ...clinic, id: clinic.id }} />
                    </div>
                    <button
                      onClick={() => deleteClinic(clinic.id)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
