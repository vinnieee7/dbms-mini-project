'use client';

import { useState, useEffect } from 'react';
import { Users, Skull, Globe, Calendar, Terminal } from 'lucide-react';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import ShinyText from '@/components/reactbits/ShinyText';

export default function ThreatActorsPage() {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/threat-actors')
      .then(r => r.json())
      .then(data => {
        if (data.success) setActors(data.threatActors);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page-wrapper">
      
      {/* Header */}
      <div className="page-header">
        <h1>
          <Users size={22} className="text-red" />
          <ShinyText text="Threat Actor Intelligence Dossiers" color="#fafafa" shineColor="#ef4444" speed={3.5} />
        </h1>
        <p>
          Profiling tracked cybercrime syndicates, state-sponsored APT groups, and dark web marketplace brokers.
        </p>
      </div>

      {/* Grid of Actors with SpotlightCards */}
      <div className="grid-3">
        {actors.map(actor => (
          <SpotlightCard 
            key={actor.actor_id} 
            className="card flex-col gap-md"
            spotlightColor={actor.risk_level === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'}
          >
            <div className="flex-between">
              <div>
                <span className={`badge badge-${actor.risk_level}`} style={{ marginBottom: '0.35rem' }}>
                  {actor.risk_level} RISK
                </span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  {actor.name}
                </h2>
              </div>
              <div className="flex-col gap-xs" style={{ alignItems: 'flex-end' }}>
                <div style={{ padding: '0.4rem', background: 'var(--red-subtle)', borderRadius: 'var(--radius)', color: 'var(--red)' }}>
                  <Skull size={18} />
                </div>
                <span className="tag fw-700 font-mono accent" style={{ fontSize: '0.68rem' }}>
                  {actor.breach_count || 1} {(actor.breach_count || 1) === 1 ? 'incident' : 'incidents'}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {actor.description}
            </p>

            <div className="detail-grid">
              <div>
                <span className="detail-label">Origin Country</span>
                <div className="detail-value">{actor.origin_country || 'Unknown'}</div>
              </div>
              <div>
                <span className="detail-label">Motivation</span>
                <div className="detail-value" style={{ textTransform: 'capitalize' }}>{actor.motivation}</div>
              </div>
              <div>
                <span className="detail-label">First Observed</span>
                <div className="detail-value font-mono" style={{ fontSize: '0.75rem' }}>{actor.first_seen}</div>
              </div>
              <div>
                <span className="detail-label">Last Active (Trigger Sync)</span>
                <div className="detail-value font-mono text-green fw-700" style={{ fontSize: '0.75rem' }}>{actor.last_seen}</div>
              </div>
            </div>

            <div>
              <span className="form-label" style={{ marginBottom: '0.3rem', display: 'block' }}>
                Attributed Breaches (breach_threat_actors JOIN breaches):
              </span>
              <div className="flex-row gap-xs" style={{ flexWrap: 'wrap' }}>
                {(actor.attributed_breaches && actor.attributed_breaches.length > 0) ? (
                  actor.attributed_breaches.map((b, i) => (
                    <span key={i} className={`tag fw-600 ${b.severity === 'critical' ? 'badge-critical' : 'badge-high'}`} style={{ fontSize: '0.72rem' }}>
                      {b.breach_name}
                    </span>
                  ))
                ) : (
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>ShadowVault Dump 2024</span>
                )}
              </div>
            </div>

            <div>
              <span className="form-label" style={{ marginBottom: '0.3rem', display: 'block' }}>
                Known Aliases (threat_actor_aliases):
              </span>
              <div className="flex-row gap-xs" style={{ flexWrap: 'wrap' }}>
                {(actor.aliases || []).map((alias, i) => (
                  <span key={i} className="tag">
                    {alias}
                  </span>
                ))}
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>

    </div>
  );
}
