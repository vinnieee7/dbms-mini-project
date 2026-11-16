'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Layers, 
  Sparkles, 
  CheckCircle,
  Cpu
} from 'lucide-react';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import ShinyText from '@/components/reactbits/ShinyText';

export default function SemanticSearchPage() {
  const [query, setQuery] = useState('');
  const [breaches, setBreaches] = useState([]);
  const [selectedBreachId, setSelectedBreachId] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const sampleQueries = [
    'SQL injection dumping customer credentials and credit cards',
    'Phishing campaign harvesting educational portal login tokens',
    'Cloud misconfiguration exposing AWS S3 buckets and API keys',
    'State sponsored zero-day attack exfiltrating defense documents',
    'Cryptocurrency exchange wallet draining attack'
  ];

  useEffect(() => {
    fetch('/api/breaches')
      .then(r => r.json())
      .then(data => {
        if (data.success) setBreaches(data.breaches);
      })
      .catch(console.error);
  }, []);

  const handleSearch = async (customQuery = null, breachIdOverride = null) => {
    const q = customQuery !== null ? customQuery : query;
    const bId = breachIdOverride !== null ? breachIdOverride : selectedBreachId;

    if (!q.trim() && !bId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          breachId: bId || undefined,
          topK: 6
        })
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-wrapper">
      
      <div className="page-header">
        <div className="badge" style={{ background: 'var(--purple-subtle)', color: 'var(--purple)', border: '1px solid var(--purple-border)', marginBottom: '0.5rem' }}>
          <Sparkles size={12} style={{ marginRight: '4px' }} /> PGVECTOR COGNITIVE SIMILARITY ENGINE
        </div>
        <h1>
          <Search size={22} className="text-accent" />
          <ShinyText text="Semantic Vector Similarity Search" color="#fafafa" shineColor="#a855f7" speed={3.5} />
        </h1>
        <p>
          Execute approximate nearest-neighbor search against 384-dimensional dense text embeddings using pgvector cosine distance operator <code>&lt;=&gt;</code>.
        </p>
      </div>

      {/* Query Formulation Card */}
      <SpotlightCard className="card flex-col gap-lg" spotlightColor="rgba(168, 85, 247, 0.08)">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="form-stack">
          <div className="form-group">
            <label className="form-label">Natural Language Incident Description (Unstructured Text)</label>
            <div className="flex-row gap-sm" style={{ flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 350px' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Database exploit exfiltrating user passwords and financial records..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedBreachId('');
                  }}
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Computing Vectors...' : 'Find Nearest Incidents'}
              </button>
            </div>
          </div>
        </form>

        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
          <div className="flex-row gap-md" style={{ flexWrap: 'wrap' }}>
            <span className="form-label" style={{ whiteSpace: 'nowrap' }}>Or Find Similar to Known Incident:</span>
            <select 
              className="input" 
              style={{ width: 'auto', flex: '1 1 300px' }}
              value={selectedBreachId}
              onChange={(e) => {
                setSelectedBreachId(e.target.value);
                setQuery('');
                if (e.target.value) handleSearch('', e.target.value);
              }}
            >
              <option value="">Select a known breach...</option>
              {breaches.map(b => (
                <option key={b.breach_id} value={b.breach_id}>
                  #{b.breach_id} {b.breach_name} ({b.attack_vector})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="preset-group">
          <span className="preset-label">Try Prompts:</span>
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(sq);
                setSelectedBreachId('');
                handleSearch(sq, '');
              }}
              className="btn btn-secondary btn-sm"
            >
              {sq}
            </button>
          ))}
        </div>

        <div className="spec-row">
          <div className="flex-row gap-lg" style={{ flexWrap: 'wrap' }}>
            <span><strong>Model:</strong> sentence-transformers/all-MiniLM-L6-v2</span>
            <span><strong>Dimensions:</strong> 384</span>
            <span><strong>Index:</strong> IVFFlat (vector_cosine_ops)</span>
            <span><strong>Metric:</strong> Cosine Distance (1 - dot_product)</span>
          </div>
        </div>
      </SpotlightCard>

      {/* Results List */}
      {results && (
        <div className="flex-col gap-lg">
          <div className="flex-between">
            <h2 className="section-title">
              <Layers size={16} className="text-accent" /> Nearest Neighbor Breaches (Ranked by Cosine Similarity)
            </h2>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
              Returned top {results.matchesCount} matches
            </span>
          </div>

          <div className="flex-col gap-md">
            {results.matches.map((item, idx) => (
              <SpotlightCard 
                key={item.breach_id} 
                className={`card result-card ${item.similarity_score > 75 ? 'high-match' : item.similarity_score > 50 ? 'mid-match' : 'low-match'}`}
                spotlightColor={item.similarity_score > 75 ? 'rgba(34, 197, 94, 0.08)' : 'rgba(59, 130, 246, 0.08)'}
              >
                <div className="flex-col gap-md">
                  <div className="flex-between">
                    <div>
                      <div className="flex-row gap-sm" style={{ marginBottom: '0.2rem' }}>
                        <span className="font-mono text-muted" style={{ fontSize: '0.72rem' }}>MATCH #{idx + 1}</span>
                        <span className={`badge badge-${item.severity}`}>{item.severity}</span>
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>Vector: {item.attack_vector}</span>
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{item.breach_name}</h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: item.similarity_score > 75 ? 'var(--green)' : 'var(--accent)' }}>
                        {item.similarity_score}% Match
                      </div>
                      <div className="font-mono text-muted" style={{ fontSize: '0.68rem' }}>
                        Cosine Dist: {item.cosine_distance}
                      </div>
                    </div>
                  </div>

                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${item.similarity_score > 75 ? 'green' : ''}`} 
                      style={{ width: `${item.similarity_score}%` }} 
                    />
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.description}
                  </p>

                  <div className="info-box success">
                    <CheckCircle size={14} style={{ flexShrink: 0, marginTop: 2, color: 'var(--green)' }} />
                    <div>
                      <strong>Recommended Containment Strategy:</strong>{' '}
                      <span>{item.recommended_action}</span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
