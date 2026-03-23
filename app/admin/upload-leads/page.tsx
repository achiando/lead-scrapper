'use client';

import React, { useState, useRef, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/firebase';
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
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const checkAuthentication = async () => {
    console.log('=== Authentication Check ===');
    console.log('Current user:', currentUser);
    console.log('User email:', currentUser?.email);
    console.log('User UID:', currentUser?.uid);
    
    if (!currentUser) {
      console.log('❌ No user found - not authenticated');
      setUploadStatus({
        type: 'error',
        message: 'Please sign in to upload leads. Refresh the page and sign in with your admin account.'
      });
      return false;
    }
    
    // Force token refresh to ensure we have a valid token
    try {
      console.log('🔄 Refreshing token...');
      const token = await currentUser.getIdToken(true);
      console.log('✅ Token refreshed successfully');
      console.log('Token length:', token.length);
      console.log('Token starts with:', token.substring(0, 20) + '...');
      return true;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      setUploadStatus({
        type: 'error',
        message: `Authentication expired: ${error instanceof Error ? error.message : 'Unknown error'}. Please refresh the page and sign in again.`
      });
      return false;
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!(await checkAuthentication())) return;
    
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
      console.log('📋 CSV Headers found:', headers);
      console.log('📊 Total rows to process:', lines.length - 1);
      
      const results = {
        total: lines.length - 1,
        successful: 0,
        failed: 0,
        errors: [] as string[]
      };

      // Process each row
      for (let i = 1; i < lines.length; i++) {
        console.log(`\n--- Processing Row ${i + 1}/${lines.length} ---`);
        
        try {
          // Re-check authentication before each row to prevent token expiry issues
          if (!(await checkAuthentication())) {
            results.failed += (lines.length - i);
            results.errors.push(`Authentication failed during upload. Stopped at row ${i + 1}.`);
            break;
          }
          
          const values = lines[i].split(',').map(v => v.trim());
          const rowData: any = {};
          
          console.log(`📝 Row ${i + 1} raw values:`, values);
          
          headers.forEach((header, index) => {
            rowData[header] = values[index] || '';
          });
          
          console.log('🔄 Processed row data:', rowData);
          console.log('🏷️ Available headers vs data mapping:');
          headers.forEach((header, index) => {
            console.log(`  ${header} -> "${values[index] || 'EMPTY'}"`);
          });

          // Generate slug
          const slug = generateSlug(rowData.name || '', rowData.city);
          console.log('Generated slug:', slug);
          
          // Prepare clinic data - filter out undefined values
          const clinicData: any = {
            name: rowData.name || '',
            category: rowData.category || 'General Dentistry',
            city: rowData.city || '',
            source: rowData.source || 'manual',
            searchTerm: rowData.searchterm || '',
            metaTitle: rowData.metatitle || '',
            metaDescription: rowData.metadescription || '',
            slug,
            createdAt: Date.now(),
            status: 'new'
          };
          
          console.log('🔧 Raw CSV field mappings:');
          console.log('  name field:', rowData.name);
          console.log('  city field:', rowData.city);
          console.log('  source field:', rowData.source);
          console.log('  searchterm field:', rowData.searchterm);
          console.log('  websiteurl field:', rowData.websiteurl);
          console.log('  address field:', rowData.address);
          
          // Fix common CSV parsing issues
          // Remove extra quotes from fields
          Object.keys(rowData).forEach(key => {
            if (typeof rowData[key] === 'string') {
              rowData[key] = rowData[key].replace(/^"|"$/g, ''); // Remove surrounding quotes
            }
          });
          
          // Fix field mapping issues - if city is empty but source has city value, swap them
          if (!rowData.city && rowData.source && rowData.source !== 'manual' && rowData.source !== 'google_places' && rowData.source !== 'gemini_ai') {
            console.log('🔧 Fixing field mapping: moving city from source to city field');
            rowData.city = rowData.source;
            rowData.source = 'manual';
          }
          
          // Ensure city is not empty for Firestore rules
          if (!rowData.city) {
            console.log('⚠️ City is empty, setting default');
            rowData.city = 'Unknown';
          }
          
          console.log('🔧 Fixed CSV field mappings:');
          console.log('  name:', rowData.name);
          console.log('  city:', rowData.city);
          console.log('  source:', rowData.source);
          console.log('  websiteUrl:', rowData.websiteurl);
          console.log('  address:', rowData.address);
          
          // Only add fields that have values (using fixed data)
          if (rowData.rating) clinicData.rating = parseFloat(rowData.rating);
          if (rowData.reviewscount) clinicData.reviewsCount = parseInt(rowData.reviewscount);
          if (rowData.phone) clinicData.phone = rowData.phone;
          if (rowData.email) clinicData.email = rowData.email;
          if (rowData.address) clinicData.address = rowData.address;
          
          // Handle websiteUrl - only add if it's a valid URL or empty
          if (rowData.websiteurl) {
            // Check if it's a valid URL (starts with http:// or https://)
            if (rowData.websiteurl.startsWith('http://') || rowData.websiteurl.startsWith('https://')) {
              clinicData.websiteUrl = rowData.websiteurl;
            } else {
              // Not a valid URL, don't include the field or set to empty string
              console.log('⚠️ websiteUrl is not a valid URL, excluding from save');
              clinicData.websiteUrl = ''; // Empty string to satisfy Firestore rules
            }
          } else {
            clinicData.websiteUrl = ''; // Empty string for missing URLs
          }
          
          // Update clinicData with fixed values
          clinicData.city = rowData.city;
          clinicData.source = rowData.source;

          console.log('📤 Attempting to save to Firestore...');
          console.log('Clinic data being saved:', clinicData);
          
          // Save to Firestore
          const docRef = await addDoc(collection(db, 'clinics'), clinicData);
          console.log('✅ Successfully saved document:', docRef.id);
          results.successful++;
          
        } catch (error) {
          console.error(`❌ Error processing row ${i + 1}:`, error);
          console.error('Error type:', error instanceof Error ? error.constructor.name : 'Unknown');
          console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
          
          results.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push(`Row ${i + 1}: ${errorMessage}`);
          
          // If it's a permission error, stop processing
          if (errorMessage.includes('permission') || errorMessage.includes('auth')) {
            console.log('🛑 Permission error detected, stopping upload');
            results.failed += (lines.length - i - 1);
            results.errors.push(`Stopped upload due to permission errors at row ${i + 1}.`);
            break;
          }
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
    
    if (!(await checkAuthentication())) return;
    
    setUploadStatus({ type: 'uploading', message: 'Saving lead...' });

    try {
      const slug = generateSlug(manualForm.name, manualForm.city);
      
      const clinicData: any = {
        name: manualForm.name,
        category: manualForm.category,
        city: manualForm.city,
        source: manualForm.source,
        slug,
        createdAt: Date.now(),
        status: 'new'
      };
      
      // Only add fields that have values
      if (manualForm.rating) clinicData.rating = parseFloat(manualForm.rating);
      if (manualForm.reviewsCount) clinicData.reviewsCount = parseInt(manualForm.reviewsCount);
      if (manualForm.phone) clinicData.phone = manualForm.phone;
      if (manualForm.email) clinicData.email = manualForm.email;
      if (manualForm.address) clinicData.address = manualForm.address;
      if (manualForm.websiteUrl) clinicData.websiteUrl = manualForm.websiteUrl;
      if (manualForm.searchTerm) clinicData.searchTerm = manualForm.searchTerm;
      if (manualForm.metaTitle) clinicData.metaTitle = manualForm.metaTitle;
      if (manualForm.metaDescription) clinicData.metaDescription = manualForm.metaDescription;

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
