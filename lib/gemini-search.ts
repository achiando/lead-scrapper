import { GoogleGenAI, Type } from "@google/genai";
import { DentalClinic } from "./dental-data";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "" });

export async function searchClinics(query: string): Promise<Partial<DentalClinic>[]> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Search for businesses based on this query: "${query}". 
  ONLY provide businesses that DO NOT have a working website. 
  Provide a list of up to 100 real or realistic businesses in the specified area.
  For each business, include:
  - name
  - category (e.g., Orthodontist, Realtor, Plumber)
  - rating (1-5)
  - reviewsCount
  - phone
  - address
  - websiteUrl (leave empty or null if they don't have one)
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
    // Double check filtering in code
    return clinics
      .filter(c => !c.websiteUrl || c.websiteUrl.trim() === "" || c.websiteUrl === "null")
      .map((c: any) => {
        const { websiteUrl, ...rest } = c;
        const ratingNum = rest.rating !== undefined && rest.rating !== null ? Number(rest.rating) : undefined;
        const reviewsNum = rest.reviewsCount !== undefined && rest.reviewsCount !== null ? Number(rest.reviewsCount) : undefined;
        return {
          ...rest,
          rating: !isNaN(ratingNum as number) ? ratingNum : undefined,
          reviewsCount: !isNaN(reviewsNum as number) ? reviewsNum : undefined,
          mapEmbedUrl: `https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=${encodeURIComponent(c.name + " " + (c.address || ""))}`,
        };
      });
  } catch (error) {
    console.error("Error searching clinics:", error);
    return [];
  }
}
