import { Metadata } from 'next';
import { DentalClinic } from '@/lib/dental-data';

export function generatePreviewMetadata(clinic: DentalClinic): Metadata {
  const clinicName = clinic.name || "Modern Dental Clinic";
  const clinicAddress = clinic.address || "Nairobi, Kenya";
  const clinicPhone = clinic.phone || "+254 700 000 000";
  const clinicCity = clinic.city || "Nairobi";
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const previewUrl = `${baseUrl}/preview/${clinic.slug || clinic.id}`;
  
  return {
    title: `${clinicName} | Professional Dental Services in ${clinicCity}`,
    description: `Experience world-class dental care at ${clinicName} in ${clinicAddress}. We offer comprehensive dental services including general dentistry, orthodontics, cosmetic dentistry, and emergency care. Book your appointment today!`,
    keywords: `dental clinic, dentist ${clinicCity}, ${clinicName}, dental services, orthodontics, teeth whitening, dental implants, emergency dental care, ${clinicAddress}`,
    authors: [{ name: clinicName }],
    creator: clinicName,
    publisher: clinicName,
    
    // Open Graph
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: previewUrl,
      title: `${clinicName} - Professional Dental Services in ${clinicCity}`,
      description: `Experience world-class dental care at ${clinicName} in ${clinicAddress}. We offer comprehensive dental services including general dentistry, orthodontics, cosmetic dentistry, and emergency care.`,
      siteName: clinicName,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1606853921944-1c8955c8d5f3?q=80&w=1200&auto=format&fit=crop',
          width: 1200,
          height: 630,
          alt: `${clinicName} - Professional Dental Services`,
          type: 'image/jpeg',
        },
      ],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: `${clinicName} - Professional Dental Services in ${clinicCity}`,
      description: `Experience world-class dental care at ${clinicName} in ${clinicAddress}. Book your appointment today!`,
      images: ['https://images.unsplash.com/photo-1606853921944-1c8955c8d5f3?q=80&w=1200&auto=format&fit=crop'],
      creator: `@${clinicName.toLowerCase().replace(/\s+/g, '')}`,
      site: `@${clinicName.toLowerCase().replace(/\s+/g, '')}`,
    },
    
    // Additional meta tags
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Verification and business info
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    
    // Business structured data
    other: {
      'business:contact_data:street_address': clinicAddress,
      'business:contact_data:locality': clinicCity,
      'business:contact_data:country': 'Kenya',
      'business:contact_data:phone_number': clinicPhone,
      'business:contact_data:website': previewUrl,
      'business:contact_data:business_type': 'Dental Clinic',
    },
    
    // App links
    alternates: {
      canonical: previewUrl,
    },
  };
}
