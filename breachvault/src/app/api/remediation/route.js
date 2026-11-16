import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const actions = await db.getRemediationActions();
    return NextResponse.json({ success: true, actions });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { actionId, status } = await request.json();
    if (!actionId || !status) {
      return NextResponse.json({ success: false, error: 'actionId and status are required' }, { status: 400 });
    }
    const updated = await db.updateRemediationStatus(actionId, status);
    return NextResponse.json({ success: true, action: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

