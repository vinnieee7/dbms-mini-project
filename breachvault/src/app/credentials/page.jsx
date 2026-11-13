'use client';

import { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Hash, 
  Copy,
  Check
} from 'lucide-react';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import ShinyText from '@/components/reactbits/ShinyText';

export default function CredentialsPage() {
  const [query, setQuery] = useState('');
  const [computedHash, setComputedHash] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [allCreds, setAllCreds] = useState([]);
  const [loadingCreds, setLoadingCreds] = useState(true);

  const presets = [
    { label: 'alicia.w@globalbank.co.uk (Reused)', email: 'alicia.w@globalbank.co.uk' },
    { label: 'j.smith@nexacorp.com (Multi-breach)', email: 'j.smith@nexacorp.com' },
    { label: 'prod-api-key@cloudnine.ca (API Key)', email: 'prod-api-key@cloudnine.ca' },
    { label: 'safe.user@unbreached.com (Clean)', email: 'safe.user@unbreached.com' }
  ];

  const fetchCredentials = async () => {
    try {
      setLoadingCreds(true);
      const res = await fetch('/api/credentials');
      const data = await res.json();
      if (data.success) {
        setAllCreds(data.credentials);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCreds(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const computeSha256 = async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSearch = async (targetQuery) => {
    const term = targetQuery || query;
    if (!term.trim()) return;

    setLoading(true);
    try {
      let hash = term.trim();
      if (term.includes('@')) {
        hash = await computeSha256(term);
        setComputedHash(hash);
      } else {
        setComputedHash(term);
      }

      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: term })
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHash = () => {
    if (computedHash) {
      navigator.clipboard.writeText(computedHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="container page-wrapper">
      
      <div className="page-header">
        <h1>
          <KeyRound size={22} className="text-amber" />
          <ShinyText text="Credential Exposure Lookup" color="#fafafa" shineColor="#f59e0b" speed={3} />
        </h1>
        <p>
          Query database of compromised email hashes and API tokens. Executes SQL Stored Function: <code>fn_check_credential_exposure(p_email_hash)</code>.
        </p>
      </div>

      {/* Search Card */}
      <SpotlightCard className="card flex-col gap-lg" spotlightColor="rgba(245, 158, 11, 0.08)">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex-row gap-sm" style={{ flexWrap: 'wrap' }}>
          <div className="input-with-icon" style={{ flex: '1 1 350px' }}>
            <Search size={16} className="input-icon" />
            <input
              type="text"
              className="input"
              placeholder="Enter email address (e.g. alicia.w@globalbank.co.uk) or SHA-256 hash..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Executing Query...' : 'Check Exposure'}
          </button>
        </form>

        <div>
          <div className="preset-group">
            <span className="preset-label">Quick Presets:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setQuery(p.email); handleSearch(p.email); }}
                className="btn btn-secondary btn-sm"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {computedHash && (
          <div className="spec-row">
            <div className="flex-row gap-sm" style={{ flexWrap: 'wrap' }}>
              <Hash size={14} className="text-accent" />
              <span className="text-secondary">Calculated SHA-256:</span>
              <span className="font-mono text-accent" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{computedHash}</span>
            </div>
            <button onClick={handleCopyHash} className="btn btn-secondary btn-sm">
              {copied ? <Check size={11} className="text-green" /> : <Copy size={11} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </SpotlightCard>

      {/* Results */}
      {results && (
        <div>
          {results.found ? (
            <div className="flex-col gap-lg">
              <div className="alert-banner danger">
                <ShieldAlert size={28} style={{ color: 'var(--red)', flexShrink: 0 }} />
                <div>
                  <h3 style={{ color: 'var(--red)' }}>
                    Compromised — Found in {results.count} Recorded Breach{results.count > 1 ? 'es' : ''}
                  </h3>
                  <p>
                    This credential hash was matched against dark web breach intelligence records. Post-breach mitigation protocols are advised.
                  </p>
                </div>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Breach Incident</th>
                      <th>Date</th>
                      <th>Severity</th>
                      <th>Type</th>
                      <th>Domain / Org</th>
                      <th>Reuse Status</th>
                      <th>Discovered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.exposures.map((item, idx) => (
                      <tr key={idx}>
                        <td className="fw-700">{item.breach_name}</td>
                        <td className="text-secondary">{item.breach_date}</td>
                        <td><span className={`badge badge-${item.severity}`}>{item.severity}</span></td>
                        <td><span className="tag">{item.credential_type}</span></td>
                        <td>
                          <div>{item.domain_name}</div>
                          <div style={{ fontSize: '0.7rem' }} className="text-muted">{item.organization}</div>
                        </td>
                        <td>
                          {item.is_reused ? (
                            <span className="badge badge-critical flex-row gap-xs">
                              <AlertTriangle size={10} /> REUSED CREDENTIAL
                            </span>
                          ) : (
                            <span className="badge badge-low">Unique</span>
                          )}
                        </td>
                        <td className="font-mono text-muted" style={{ fontSize: '0.72rem' }}>
                          {item.discovered_at ? item.discovered_at.split('T')[0] : '2024-04-02'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <SpotlightCard className="card empty-state" spotlightColor="rgba(34, 197, 94, 0.08)">
              <div className="empty-icon" style={{ background: 'var(--green-subtle)', border: '1px solid var(--green-border)', color: 'var(--green)' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ color: 'var(--green)' }}>No Compromise Records Found</h3>
              <p>
                The queried email hash does not appear in any known dark web databases, dumps, or paste sites monitored in BreachVault.
              </p>
            </SpotlightCard>
          )}
        </div>
      )}

      {/* Database Inventory (JOIN: compromised_credentials + breaches + domains + organizations) */}
      <div style={{ marginTop: '2rem' }}>
        <div className="flex-between" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              Compromised Credentials Inventory (Relational 4-Table JOIN)
            </h2>
            <p className="text-muted" style={{ fontSize: '0.75rem' }}>
              <code>compromised_credentials cc JOIN breaches b JOIN domains d JOIN organizations o</code> — Real-time trigger reuse detection
            </p>
          </div>
          <button onClick={fetchCredentials} className="btn btn-secondary btn-sm">
            Refresh Inventory
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cred ID</th>
                <th>Exposed Account / Preview</th>
                <th>SHA-256 Hash Prefix</th>
                <th>Victim Organization & Domain</th>
                <th>Originating Breach</th>
                <th>Trigger Reuse Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allCreds.map(c => (
                <tr key={c.cred_id}>
                  <td className="font-mono text-muted">#{c.cred_id}</td>
                  <td className="fw-700 font-mono" style={{ fontSize: '0.8rem' }}>
                    {c.plain_preview}
                  </td>
                  <td className="font-mono text-muted" style={{ fontSize: '0.72rem' }}>
                    {c.email_hash ? c.email_hash.slice(0, 16) + '...' : '—'}
                  </td>
                  <td>
                    <div className="fw-600">{c.organization}</div>
                    <div className="text-secondary font-mono" style={{ fontSize: '0.72rem' }}>{c.domain_name}</div>
                  </td>
                  <td>
                    <span className={`tag fw-600 ${c.severity === 'critical' ? 'badge-critical' : 'badge-high'}`} style={{ fontSize: '0.72rem' }}>
                      {c.breach_name}
                    </span>
                  </td>
                  <td>
                    {c.is_reused ? (
                      <span className="badge badge-critical flex-row gap-xs" style={{ fontSize: '0.68rem' }}>
                        <AlertTriangle size={10} /> REUSED CREDENTIAL
                      </span>
                    ) : (
                      <span className="badge badge-low" style={{ fontSize: '0.68rem' }}>Unique</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setQuery(c.plain_preview);
                        handleSearch(c.plain_preview);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                    >
                      Inspect / JOIN
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
