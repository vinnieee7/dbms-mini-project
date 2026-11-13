import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const credentials = await db.getCompromisedCredentials();
    return NextResponse.json({
      success: true,
      count: credentials.length,
      credentials
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ success: false, error: 'Query parameter (email or hash) is required' }, { status: 400 });
    }

    const exposures = await db.checkCredentialExposure(query);
    return NextResponse.json({
      success: true,
      found: exposures.length > 0,
      count: exposures.length,
      exposures
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


