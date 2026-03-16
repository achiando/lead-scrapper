import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!query || !apiKey) {
    return NextResponse.json(
      { error: 'Missing query or API key' },
      { status: 400 }
    );
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=dentist&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Google Places API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google Places data' },
      { status: 500 }
    );
  }
}
