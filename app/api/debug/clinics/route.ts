import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    
    if (slug) {
      // Check specific slug
      const q = query(collection(db, 'clinics'), where('slug', '==', slug));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const clinic = querySnapshot.docs[0].data();
        return NextResponse.json({
          found: true,
          clinic: {
            id: querySnapshot.docs[0].id,
            name: clinic.name,
            slug: clinic.slug,
            city: clinic.city
          }
        });
      } else {
        return NextResponse.json({
          found: false,
          message: `No clinic found with slug: ${slug}`
        });
      }
    } else {
      // List all clinics with their slugs
      const querySnapshot = await getDocs(collection(db, 'clinics'));
      const clinics = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        slug: doc.data().slug,
        city: doc.data().city
      }));
      
      return NextResponse.json({
        total: clinics.length,
        clinics
      });
    }
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinic data' },
      { status: 500 }
    );
  }
}
