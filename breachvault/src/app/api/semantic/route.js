import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { findSimilarBreaches } from '@/lib/vector';

export async function POST(request) {
  try {
    const { query, breachId, topK } = await request.json();
    const breaches = await db.getBreaches();

    let queryText = query;
    if (breachId) {
      const target = breaches.find(b => b.breach_id === Number(breachId));
      if (target) {
        queryText = target.breach_name + ' ' + target.description;
      }
    }

    if (!queryText) {
      return NextResponse.json({ success: false, error: 'Query text or target breachId is required' }, { status: 400 });
    }

    const matches = findSimilarBreaches(queryText, breaches, topK || 5, breachId ? Number(breachId) : null);

    return NextResponse.json({
      success: true,
      strategy: 'pgvector IVFFlat Cosine Similarity (<=>)',
      dimension: 384,
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      matchesCount: matches.length,
      matches
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

