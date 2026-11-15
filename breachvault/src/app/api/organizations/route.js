import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const scoredOrgs = await db.calculateOrgRiskScores();
    const watchlist = await db.getWatchlist();
    return NextResponse.json({ success: true, organizations: scoredOrgs, watchlist });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { orgId } = await request.json();
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'orgId is required' }, { status: 400 });
    }
    const updated = await db.toggleWatchlist(Number(orgId));
    return NextResponse.json({ success: true, watchlistEntry: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

