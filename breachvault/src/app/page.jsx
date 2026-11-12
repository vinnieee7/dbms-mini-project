'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Database, 
  KeyRound, 
  Search, 
  AlertTriangle, 
  Building2, 
  ArrowRight,
  Layers,
  Activity,
  Cpu
} from 'lucide-react';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import ShinyText from '@/components/reactbits/ShinyText';
import CountUp from '@/components/reactbits/CountUp';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [breaches, setBreaches] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resStats, resBreaches, resOrgs] = await Promise.all([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/breaches').then(r => r.json()),
        fetch('/api/organizations').then(r => r.json())
      ]);

      if (resStats.success) setStats(resStats.stats);
      if (resBreaches.success) setBreaches(resBreaches.breaches);
      if (resOrgs.success) setOrgs(resOrgs.organizations);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container page-wrapper">
      
      {/* Hero Header with Spotlight */}
      <SpotlightCard className="hero-banner" spotlightColor="rgba(59, 130, 246, 0.08)">
        <div className="flex-between">
          <div style={{ maxWidth: '720px' }}>
            <div className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)', marginBottom: '0.65rem' }}>
              <Cpu size={12} style={{ marginRight: '4px' }} /> SQL + PGVECTOR EMBEDDINGS
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.35rem' }}>
              Threat Intelligence Command Center
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Continuous correlation of dark web paste sites, underground marketplaces, and leaked dumps.
              Powered by relational schemas, automated risk procedures, and 384-dimensional semantic similarity.
            </p>
          </div>
          <div className="flex-row gap-sm" style={{ flexWrap: 'wrap' }}>
            <Link href="/breaches" className="btn btn-primary">
              <Database size={14} /> Ingest Breach
            </Link>
            <Link href="/semantic-search" className="btn btn-secondary">
              <Search size={14} /> Semantic Search
            </Link>
          </div>
        </div>
      </SpotlightCard>

      {/* Metrics Row with React Bits CountUp */}
      <div className="grid-4">
        <SpotlightCard className="stat-card" spotlightColor="rgba(59, 130, 246, 0.12)">
          <div className="stat-header">
            <span className="stat-label">Total Breaches</span>
            <div className="stat-icon" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
              <Database size={15} />
            </div>
          </div>
          <div className="stat-value">
            {stats ? <CountUp to={stats.totalBreaches} duration={0.8} /> : '—'}
          </div>
          <div className="stat-sub text-red flex-row gap-xs">
            <AlertTriangle size={12} /> {stats ? `${stats.criticalBreaches} critical severity` : 'Loading...'}
          </div>
        </SpotlightCard>

        <SpotlightCard className="stat-card" spotlightColor="rgba(239, 68, 68, 0.12)">
          <div className="stat-header">
            <span className="stat-label">Records Exposed</span>
            <div className="stat-icon" style={{ background: 'var(--red-subtle)', color: 'var(--red)' }}>
              <ShieldAlert size={15} />
            </div>
          </div>
          <div className="stat-value">
            {stats ? (
              <>
                <CountUp to={stats.totalRecords / 1000000} decimals={1} duration={1} />M+
              </>
            ) : '—'}
          </div>
          <div className="stat-sub">Across 8 verified dark web dumps</div>
        </SpotlightCard>

        <SpotlightCard className="stat-card" spotlightColor="rgba(245, 158, 11, 0.12)">
          <div className="stat-header">
            <span className="stat-label">Leaked Credentials</span>
            <div className="stat-icon" style={{ background: 'var(--amber-subtle)', color: 'var(--amber)' }}>
              <KeyRound size={15} />
            </div>
          </div>
          <div className="stat-value">
            {stats ? <CountUp to={stats.totalCredentials} duration={0.8} /> : '—'}
          </div>
          <div className="stat-sub text-amber">
            {stats ? `${stats.reusedCreds} reused (${stats.reuseRate}%)` : ''}
          </div>
        </SpotlightCard>

        <SpotlightCard className="stat-card" spotlightColor="rgba(34, 197, 94, 0.12)">
          <div className="stat-header">
            <span className="stat-label">Monitored Orgs</span>
            <div className="stat-icon" style={{ background: 'var(--green-subtle)', color: 'var(--green)' }}>
              <Building2 size={15} />
            </div>
          </div>
          <div className="stat-value">
            {stats ? <CountUp to={stats.monitoredOrgs} duration={0.8} /> : '—'}
          </div>
          <div className="stat-sub text-green">
            {stats ? `${stats.activeThreatActors} active threat actors` : ''}
          </div>
        </SpotlightCard>
      </div>

      {/* Main Grid: Live Breaches vs Org Risk */}
      <div className="grid-2">
        
        {/* Recent Breaches */}
        <div className="card flex-col gap-md">
          <div className="flex-between">
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              <Database size={16} className="text-accent" />
              <ShinyText text="Live Breach Feed" color="#fafafa" shineColor="#3b82f6" speed={3} />
            </h2>
            <Link href="/breaches" className="section-link">
              View All <ArrowRight size={13} />
            </Link>
          </div>

          <div className="flex-col gap-sm">
            {breaches.slice(0, 4).map(b => (
              <div 
                key={b.breach_id} 
                style={{
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius)', 
                  padding: '0.85rem'
                }}
              >
                <div className="flex-between" style={{ marginBottom: '0.35rem' }}>
                  <span className="fw-700" style={{ fontSize: '0.875rem' }}>{b.breach_name}</span>
                  <span className={`badge badge-${b.severity}`}>
                    {b.severity} · CVSS {b.cvss_score}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.4rem' }}>
                  {b.description.slice(0, 120)}...
                </p>
                <div className="flex-between" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>Source: <strong>{b.source_type}</strong> · Vector: <strong>{b.attack_vector}</strong></span>
                  <span>{b.records_exposed ? (b.records_exposed / 1000000).toFixed(1) + 'M records' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Org Risk Table */}
        <div className="card flex-col gap-md">
          <div className="flex-between">
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              <Building2 size={16} className="text-amber" />
              <ShinyText text="Org Risk Scores" color="#fafafa" shineColor="#f59e0b" speed={3.5} />
            </h2>
            <Link href="/organizations" className="section-link">
              Watchlist <ArrowRight size={13} />
            </Link>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Industry</th>
                  <th>Breaches</th>
                  <th>Risk Tier</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {orgs.slice(0, 5).map(o => (
                  <tr key={o.org_id}>
                    <td className="fw-600">{o.org_name}</td>
                    <td className="text-secondary">{o.industry}</td>
                    <td>{o.times_breached || 1}</td>
                    <td><span className={`badge badge-${o.risk_tier}`}>{o.risk_tier}</span></td>
                    <td className="font-mono fw-700" style={{ color: (o.calculated_score || 50) >= 70 ? 'var(--red)' : 'var(--green)' }}>
                      {o.calculated_score || (o.risk_tier === 'critical' ? 88 : o.risk_tier === 'high' ? 65 : 40)}/100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="info-box">
            <Layers size={14} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent)' }} />
            <div>
              <strong>fn_calculate_org_risk_score(p_org_id)</strong>:
              Risk Score = (Breach Count × 10) + (Severity × 5) + (Reused Creds × 15) + Credential Volume Factor.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
