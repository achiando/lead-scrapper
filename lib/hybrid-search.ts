import { GoogleGenAI, Type } from "@google/genai";
import { DentalClinic } from "./dental-data";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "" });

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  rating?: number;
  user_ratings_total?: number;
  website?: string;
  types: string[];
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface GooglePlacesResponse {
  results: GooglePlaceResult[];
  status: string;
  next_page_token?: string;
}

// Search Google Places for dental clinics
async function searchGooglePlaces(query: string): Promise<Partial<DentalClinic>[]> {
  try {
    // Extract city from query and construct search
    const searchQuery = query.includes('dental') ? query : `dental clinics in ${query}`;
    
    const response = await fetch(
      `/api/google-places?query=${encodeURIComponent(searchQuery)}`
    );
    
    if (!response.ok) {
      console.warn('Google Places API error:', response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.warn('Google Places API error:', data.status);
      return [];
    }

    return data.results.map((place: any) => ({
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      rating: place.rating,
      reviewsCount: place.user_ratings_total,
      websiteUrl: place.website || '',
      city: extractCityFromAddress(place.formatted_address || ''),
      category: 'Dental Clinic',
      source: 'google_places',
      placeId: place.place_id,
      lat: place.geometry?.location.lat,
      lng: place.geometry?.location.lng,
    }));
  } catch (error) {
    console.error('Error searching Google Places:', error);
    return [];
  }
}

// Search Gemini for additional clinics
async function searchGemini(query: string): Promise<Partial<DentalClinic>[]> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Search for dental clinics based on this query: "${query}". 
  ONLY provide businesses that DO NOT have a working website. 
  Provide a comprehensive list of real dental clinics in the specified area.
  For each business, include:
  - name
  - category (e.g., General Dentistry, Orthodontist, Pediatric Dentistry)
  - rating (1-5)
  - reviewsCount
  - phone
  - address
  - websiteUrl (leave empty if they don't have one)
  - city
  - metaTitle (SEO friendly title, max 60 chars)
  - metaDescription (SEO friendly description, max 160 chars)
  
  Return the data as a JSON array of objects.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              reviewsCount: { type: Type.INTEGER },
              phone: { type: Type.STRING },
              address: { type: Type.STRING },
              websiteUrl: { type: Type.STRING },
              city: { type: Type.STRING },
              metaTitle: { type: Type.STRING },
              metaDescription: { type: Type.STRING },
            },
            required: ["name"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const clinics: Partial<DentalClinic>[] = JSON.parse(text);
    return clinics.map((c: any) => ({
      ...c,
      source: 'gemini_ai',
      rating: c.rating !== undefined && c.rating !== null ? Number(c.rating) : undefined,
      reviewsCount: c.reviewsCount !== undefined && c.reviewsCount !== null ? Number(c.reviewsCount) : undefined,
      mapEmbedUrl: `https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(c.name + " " + (c.address || ""))}`,
    }));
  } catch (error) {
    console.error("Error searching Gemini:", error);
    return [];
  }
}

// Extract city from address
function extractCityFromAddress(address: string): string {
  const parts = address.split(',');
  if (parts.length >= 2) {
    return parts[parts.length - 2].trim();
  }
  return '';
}

// Remove duplicates based on name and address similarity
function removeDuplicates(clinics: Partial<DentalClinic>[]): Partial<DentalClinic>[] {
  const seen = new Set();
  const deduplicated: Partial<DentalClinic>[] = [];
  
  for (const clinic of clinics) {
    const key = `${clinic.name?.toLowerCase()}-${clinic.address?.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(clinic);
    }
  }
  
  return deduplicated;
}

// Main search function combining both sources
export async function searchClinics(query: string): Promise<Partial<DentalClinic>[]> {
  try {
    // Run both searches in parallel
    const [googleResults, geminiResults] = await Promise.all([
      searchGooglePlaces(query),
      searchGemini(query)
    ]);

    // Combine results
    const allResults = [...googleResults, ...geminiResults];
    
    // Remove duplicates
    const deduplicatedResults = removeDuplicates(allResults);
    
    // Filter for clinics without websites
    const clinicsWithoutWebsites = deduplicatedResults.filter(clinic => 
      !clinic.websiteUrl || 
      clinic.websiteUrl.trim() === '' || 
      clinic.websiteUrl === 'null' ||
      clinic.websiteUrl === 'undefined'
    );

    // Sort by rating (highest first) and source priority (Google Places first)
    return clinicsWithoutWebsites.sort((a, b) => {
      // Google Places results get priority
      if (a.source === 'google_places' && b.source !== 'google_places') return -1;
      if (a.source !== 'google_places' && b.source === 'google_places') return 1;
      
      // Then sort by rating
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return ratingB - ratingA;
    });

  } catch (error) {
    console.error("Error in hybrid search:", error);
    return [];
  }
}
