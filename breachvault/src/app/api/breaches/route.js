import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const source = searchParams.get('source');
    const attack = searchParams.get('attack');

    let breaches = await db.getBreaches();

    if (severity && severity !== 'all') {
      breaches = breaches.filter(b => b.severity === severity);
    }
    if (source && source !== 'all') {
      breaches = breaches.filter(b => b.source_type === source);
    }
    if (attack && attack !== 'all') {
      breaches = breaches.filter(b => b.attack_vector === attack);
    }

    return NextResponse.json({ success: true, count: breaches.length, breaches });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.breach_name || !body.description) {
      return NextResponse.json({ success: false, error: 'breach_name and description are required' }, { status: 400 });
    }

    const newBreach = await db.ingestBreach(body);
    return NextResponse.json({ success: true, message: 'Breach ingested successfully via sp_ingest_breach', breach: newBreach });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

