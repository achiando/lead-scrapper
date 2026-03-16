import { db } from '@/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { DentalClinic } from './dental-data';
import { generateSlug } from './slug-generator';

export async function ensureClinicHasSlug(clinic: DentalClinic): Promise<DentalClinic> {
  // If clinic already has slug, return as-is
  if (clinic.slug) {
    return clinic;
  }
  
  // Generate slug for clinic without one
  const slug = generateSlug(clinic.name || '', clinic.city);
  
  try {
    // Update the clinic in Firestore with the new slug
    await updateDoc(doc(db, 'clinics', clinic.id), {
      slug,
      updatedAt: Date.now()
    });
    
    // Return clinic with slug
    return { ...clinic, slug };
  } catch (error) {
    console.error('Failed to update clinic with slug:', error);
    // Return clinic without slug if update fails
    return clinic;
  }
}

export async function updateAllClinicsWithSlugs(): Promise<{ updated: number; failed: number }> {
  const clinicsRef = collection(db, 'clinics');
  const q = query(clinicsRef, where('slug', '==', null));
  
  try {
    const querySnapshot = await getDocs(q);
    let updated = 0;
    let failed = 0;
    
    for (const docSnapshot of querySnapshot.docs) {
      try {
        const clinic = { id: docSnapshot.id, ...docSnapshot.data() } as DentalClinic;
        const slug = generateSlug(clinic.name || '', clinic.city);
        
        await updateDoc(doc(db, 'clinics', docSnapshot.id), {
          slug,
          updatedAt: Date.now()
        });
        
        updated++;
      } catch (error) {
        console.error(`Failed to update clinic ${docSnapshot.id}:`, error);
        failed++;
      }
    }
    
    return { updated, failed };
  } catch (error) {
    console.error('Failed to fetch clinics without slugs:', error);
    return { updated: 0, failed: 0 };
  }
}
