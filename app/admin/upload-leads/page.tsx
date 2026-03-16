'use client';

import React, { useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { DentalClinic } from '@/lib/dental-data';
import { generateSlug } from '@/lib/slug-generator';
import { Upload, Plus, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ManualLeadForm {
  name: string;
  category: string;
  rating: string;
  reviewsCount: string;
  phone: string;
  email: string;
  address: string;
  websiteUrl: string;
  city: string;
  source: 'google_places' | 'gemini_ai' | 'manual';
  searchTerm: string;
  metaTitle: string;
  metaDescription: string;
}

export default function UploadLeadsPage() {
  const [activeTab, setActiveTab] = useState<'csv' | 'manual'>('csv');
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'idle' | 'uploading' | 'success' | 'error';
    message: string;
    details?: any;
  }>({ type: 'idle', message: '' });
  
  const [manualForm, setManualForm] = useState<ManualLeadForm>({
    name: '',
    category: 'General Dentistry',
    rating: '',
    reviewsCount: '',
    phone: '',
    email: '',
    address: '',
    websiteUrl: '',
    city: '',
    source: 'manual',
    searchTerm: '',
    metaTitle: '',
    metaDescription: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus({ type: 'uploading', message: 'Processing CSV file...' });

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const results = {
        total: lines.length - 1,
        successful: 0,
        failed: 0,
        errors: [] as string[]
      };

      // Process each row
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim());
          const rowData: any = {};
          
          headers.forEach((header, index) => {
            rowData[header] = values[index] || '';
          });

          // Generate slug
          const slug = generateSlug(rowData.name || '', rowData.city);
          
          // Prepare clinic data
          const clinicData: Partial<DentalClinic> = {
            name: rowData.name || '',
            category: rowData.category || 'General Dentistry',
            rating: rowData.rating ? parseFloat(rowData.rating) : undefined,
            reviewsCount: rowData.reviewscount ? parseInt(rowData.reviewscount) : undefined,
            phone: rowData.phone || undefined,
            email: rowData.email || undefined,
            address: rowData.address || undefined,
            websiteUrl: rowData.websiteurl || undefined,
            city: rowData.city || '',
            source: rowData.source || 'manual',
            searchTerm: rowData.searchterm || '',
            metaTitle: rowData.metatitle || '',
            metaDescription: rowData.metadescription || '',
            slug,
            createdAt: Date.now(),
            status: 'new'
          };

          // Save to Firestore
          await addDoc(collection(db, 'clinics'), clinicData);
          results.successful++;
          
        } catch (error) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${results.successful} leads`,
        details: results
      });

    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to process CSV file'
      });
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus({ type: 'uploading', message: 'Saving lead...' });

    try {
      const slug = generateSlug(manualForm.name, manualForm.city);
      
      const clinicData: Partial<DentalClinic> = {
        name: manualForm.name,
        category: manualForm.category,
        rating: manualForm.rating ? parseFloat(manualForm.rating) : undefined,
        reviewsCount: manualForm.reviewsCount ? parseInt(manualForm.reviewsCount) : undefined,
        phone: manualForm.phone || undefined,
        email: manualForm.email || undefined,
        address: manualForm.address || undefined,
        websiteUrl: manualForm.websiteUrl || undefined,
        city: manualForm.city,
        source: manualForm.source,
        searchTerm: manualForm.searchTerm || undefined,
        metaTitle: manualForm.metaTitle || undefined,
        metaDescription: manualForm.metaDescription || undefined,
        slug,
        createdAt: Date.now(),
        status: 'new'
      };

      await addDoc(collection(db, 'clinics'), clinicData);
      
      setUploadStatus({
        type: 'success',
        message: `Successfully saved lead: ${manualForm.name}`
      });

      // Reset form
      setManualForm({
        name: '',
        category: 'General Dentistry',
        rating: '',
        reviewsCount: '',
        phone: '',
        email: '',
        address: '',
        websiteUrl: '',
        city: '',
        source: 'manual',
        searchTerm: '',
        metaTitle: '',
        metaDescription: ''
      });

    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save lead'
      });
    }
  };

  const downloadCSVTemplate = () => {
    const template = `name,category,rating,reviewsCount,phone,email,address,websiteUrl,city,source,searchTerm,metaTitle,metaDescription
"Example Dental Clinic","General Dentistry","4.5","120","+254712345678","info@example.com","123 Main St, Nairobi","https://example.com","Nairobi","manual","dental nairobi","Best Dental Services in Nairobi","Professional dental care in Nairobi"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead-upload-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Upload Leads</h1>
        <button
          onClick={downloadCSVTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
        >
          <FileText className="w-4 h-4" />
          Download CSV Template
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('csv')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'csv'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            CSV Upload
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'manual'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Manual Entry
          </button>
        </div>

        <div className="p-6">
          {/* CSV Upload Tab */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
                <p className="text-slate-600 mb-4">
                  Upload a CSV file with lead data. Use the template for proper formatting.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Choose CSV File
                </button>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Required CSV Columns:</h4>
                <code className="text-sm bg-slate-100 p-2 rounded block">
                  name, category, rating, reviewsCount, phone, email, address, websiteUrl, city, source, searchTerm, metaTitle, metaDescription
                </code>
                <p className="text-xs text-slate-600 mt-2">
                  Only 'name' is required. All other fields are optional.
                </p>
              </div>
            </div>
          )}

          {/* Manual Entry Tab */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Clinic Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.name}
                    onChange={(e) => setManualForm({...manualForm, name: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    placeholder="Example Dental Clinic"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={manualForm.category}
                    onChange={(e) => setManualForm({...manualForm, category: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="General Dentistry">General Dentistry</option>
                    <option value="Orthodontist">Orthodontist</option>
                    <option value="Pediatric Dentistry">Pediatric Dentistry</option>
                    <option value="Cosmetic Dentistry">Cosmetic Dentistry</option>
                    <option value="Oral Surgery">Oral Surgery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={manualForm.phone}
                    onChange={(e) => setManualForm({...manualForm, phone: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    placeholder="+254712345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={manualForm.email}
                    onChange={(e) => setManualForm({...manualForm, email: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    placeholder="info@clinic.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={manualForm.city}
                    onChange={(e) => setManualForm({...manualForm, city: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    placeholder="Nairobi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={manualForm.websiteUrl}
                    onChange={(e) => setManualForm({...manualForm, websiteUrl: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    placeholder="https://clinic.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={manualForm.address}
                    onChange={(e) => setManualForm({...manualForm, address: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    placeholder="123 Main St, Nairobi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={manualForm.rating}
                    onChange={(e) => setManualForm({...manualForm, rating: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    placeholder="4.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Reviews Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={manualForm.reviewsCount}
                    onChange={(e) => setManualForm({...manualForm, reviewsCount: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    placeholder="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Source
                  </label>
                  <select
                    value={manualForm.source}
                    onChange={(e) => setManualForm({...manualForm, source: e.target.value as any})}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="google_places">Google Places</option>
                    <option value="gemini_ai">Gemini AI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Search Term
                  </label>
                  <input
                    type="text"
                    value={manualForm.searchTerm}
                    onChange={(e) => setManualForm({...manualForm, searchTerm: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    placeholder="dental clinics nairobi"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Meta Title (SEO)
                  </label>
                  <input
                    type="text"
                    value={manualForm.metaTitle}
                    onChange={(e) => setManualForm({...manualForm, metaTitle: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    placeholder="Best Dental Services in Nairobi"
                    maxLength={60}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Meta Description (SEO)
                  </label>
                  <textarea
                    value={manualForm.metaDescription}
                    onChange={(e) => setManualForm({...manualForm, metaDescription: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    placeholder="Professional dental care in Nairobi"
                    rows={3}
                    maxLength={160}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploadStatus.type === 'uploading'}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {uploadStatus.type === 'uploading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Save Lead
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {uploadStatus.type !== 'idle' && (
        <div className={`rounded-lg p-4 ${
          uploadStatus.type === 'success' ? 'bg-green-50 border border-green-200' :
          uploadStatus.type === 'error' ? 'bg-red-50 border border-red-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {uploadStatus.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {uploadStatus.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
            {uploadStatus.type === 'uploading' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
            <span className={`font-medium ${
              uploadStatus.type === 'success' ? 'text-green-800' :
              uploadStatus.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }`}>
              {uploadStatus.message}
            </span>
          </div>
          
          {uploadStatus.details && (
            <div className="mt-3 text-sm">
              <div className="grid grid-cols-3 gap-4 mb-2">
                <div>Total: {uploadStatus.details.total}</div>
                <div className="text-green-600">Successful: {uploadStatus.details.successful}</div>
                <div className="text-red-600">Failed: {uploadStatus.details.failed}</div>
              </div>
              {uploadStatus.details.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-red-600">View Errors</summary>
                  <div className="mt-1 space-y-1">
                    {uploadStatus.details.errors.map((error: string, index: number) => (
                      <div key={index} className="text-red-600 text-xs">{error}</div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
