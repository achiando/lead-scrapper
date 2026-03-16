import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { generateSlug } from '@/lib/slug-generator';

export async function POST(request: NextRequest) {
  try {
    // Get all clinics
    const querySnapshot = await getDocs(collection(db, 'clinics'));
    let updated = 0;
    let failed = 0;
    const results = [];

    for (const docSnapshot of querySnapshot.docs) {
      try {
        const clinic = { id: docSnapshot.id, ...docSnapshot.data() } as any;
        
        // Skip if already has slug
        if (clinic.slug) {
          results.push({
            id: docSnapshot.id,
            name: clinic.name,
            status: 'already_has_slug',
            slug: clinic.slug
          });
          continue;
        }

        // Generate slug
        const slug = generateSlug(clinic.name || '', clinic.city);
        
        // Update clinic with slug
        await updateDoc(doc(db, 'clinics', docSnapshot.id), {
          slug,
          updatedAt: Date.now()
        });
        
        updated++;
        results.push({
          id: docSnapshot.id,
          name: clinic.name,
          status: 'updated',
          slug: slug
        });
        
      } catch (error) {
        console.error(`Failed to update clinic ${docSnapshot.id}:`, error);
        failed++;
        results.push({
          id: docSnapshot.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      total: querySnapshot.size,
      updated,
      failed,
      results
    });
    
  } catch (error) {
    console.error('Bulk slug generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate slugs' },
      { status: 500 }
    );
  }
}
