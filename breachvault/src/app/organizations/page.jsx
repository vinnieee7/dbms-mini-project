'use client';

import { useState, useEffect } from 'react';
import { Building2, Bell, BellOff, ShieldAlert, Globe } from 'lucide-react';
import ShinyText from '@/components/reactbits/ShinyText';

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organizations');
      const data = await res.json();
      if (data.success) {
        setOrgs(data.organizations);
        setWatchlist(data.watchlist);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleToggleWatch = async (orgId) => {
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrgs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isWatched = (orgId) => {
    const entry = watchlist.find(w => w.org_id === orgId);
    return entry && entry.alert_enabled;
  };

  return (
    <div className="container page-wrapper">
      
      {/* Header */}
      <div className="page-header">
        <h1>
          <Building2 size={22} className="text-accent" />
          <ShinyText text="Monitored Organizations & Domain Inventory" color="#fafafa" shineColor="#3b82f6" speed={3.5} />
        </h1>
        <p>
          Automated risk scoring, domain asset mapping, and automated alert triggering via <code>trg_watchlist_alert</code>.
        </p>
      </div>

      {/* Orgs Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Organization</th>
              <th>Industry</th>
              <th>Breaches & Leaks (JOIN)</th>
              <th>Monitored Domains</th>
              <th>Risk Tier</th>
              <th>Risk Score (fn_calc)</th>
              <th>Watchlist Alert (Trigger 4)</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map(org => {
              const watched = isWatched(org.org_id);
              return (
                <tr key={org.org_id}>
                  <td className="font-mono text-muted">#{org.org_id}</td>
                  <td>
                    <div className="fw-700">{org.org_name}</div>
                    <div style={{ fontSize: '0.72rem' }} className="text-muted">
                      {org.country} &bull; {(org.employee_count || 5000).toLocaleString()} employees
                    </div>
                  </td>
                  <td className="text-secondary">{org.industry}</td>
                  <td>
                    <div className="flex-row gap-xs" style={{ alignItems: 'center' }}>
                      <span className={`tag fw-700 ${(org.times_breached || 0) > 1 ? 'badge-critical' : (org.times_breached || 0) === 1 ? 'badge-high' : 'accent'}`} style={{ fontSize: '0.72rem' }}>
                        {org.times_breached || 0} {(org.times_breached || 0) === 1 ? 'breach' : 'breaches'}
                      </span>
                      <span className="font-mono text-muted" style={{ fontSize: '0.7rem' }}>
                        ({org.credentials_exposed || 0} creds)
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex-row gap-xs" style={{ flexWrap: 'wrap' }}>
                      {(org.domains || []).map((d, i) => (
                        <span key={i} className="font-mono tag">
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${org.risk_tier}`}>
                      {org.risk_tier}
                    </span>
                  </td>
                  <td className="font-mono fw-800" style={{ color: (org.calculated_score || 50) >= 70 ? 'var(--red)' : (org.calculated_score || 50) >= 40 ? 'var(--amber)' : 'var(--green)' }}>
                    {org.calculated_score || 50}/100
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleWatch(org.org_id)}
                      className={`btn btn-sm ${watched ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        background: watched ? 'var(--green-subtle)' : 'var(--bg-elevated)',
                        color: watched ? 'var(--green)' : 'var(--text-muted)',
                        borderColor: watched ? 'var(--green-border)' : 'var(--border)'
                      }}
                    >
                      {watched ? <Bell size={13} /> : <BellOff size={13} />}
                      {watched ? 'Watching' : 'Watch'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
