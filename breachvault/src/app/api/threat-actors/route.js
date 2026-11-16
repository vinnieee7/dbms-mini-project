import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const actors = await db.getThreatActors();
    return NextResponse.json({ success: true, count: actors.length, threatActors: actors });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

