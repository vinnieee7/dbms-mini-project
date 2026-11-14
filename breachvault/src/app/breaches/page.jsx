'use client';

import { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  X,
  Filter,
  CheckCircle2
} from 'lucide-react';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import ShinyText from '@/components/reactbits/ShinyText';

export default function BreachesPage() {
  const [breaches, setBreaches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  
  // Ingestion form state
  const [form, setForm] = useState({
    breach_name: 'ApexFinance Dark Web Leak 2024',
    description: 'Threat actor dumped customer database containing email hashes, hashed passwords, and financial accounts exfiltrated via SQL injection.',
    breach_date: new Date().toISOString().split('T')[0],
    source_type: 'dark_web',
    severity: 'critical',
    cvss_score: 9.2,
    records_exposed: 450000,
    attack_vector: 'sqli',
    target_org_id: 2,
    attributed_actors: 'ShadowSyndicate',
    sample_email: 'alicia.w@globalbank.co.uk',
    data_classes: 'Email Addresses, Passwords, Credit Card Numbers'
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchBreaches = async () => {
    try {
      const res = await fetch('/api/breaches');
      const data = await res.json();
      if (data.success) {
        setBreaches(data.breaches);
        setFiltered(data.breaches);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBreaches();
  }, []);

  useEffect(() => {
    let list = [...breaches];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b => b.breach_name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
    }
    if (severityFilter !== 'all') {
      list = list.filter(b => b.severity === severityFilter);
    }
    if (sourceFilter !== 'all') {
      list = list.filter(b => b.source_type === sourceFilter);
    }
    setFiltered(list);
  }, [search, severityFilter, sourceFilter, breaches]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      const payload = {
        ...form,
        data_classes: form.data_classes.split(',').map(s => s.trim()),
        attributed_actors: form.attributed_actors.split(',').map(s => s.trim())
      };
      const res = await fetch('/api/breaches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: 'Incident ingested successfully via sp_ingest_breach!' });
        fetchBreaches();
        setTimeout(() => {
          setModalOpen(false);
          setMsg(null);
        }, 1200);
      } else {
        setMsg({ type: 'error', text: data.error || 'Ingestion failed' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-wrapper">
      
      {/* Header */}
      <div className="flex-between">
        <div className="page-header">
          <h1>
            <Database size={22} className="text-accent" />
            <ShinyText text="Breach Explorer & Ingestion" color="#fafafa" shineColor="#38bdf8" speed={3} />
          </h1>
          <p>
            Browse relational breach records or execute stored procedure <code>sp_ingest_breach</code>.
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={14} /> Ingest Breach (sp_ingest_breach)
        </button>
      </div>

      {/* Filter Controls Bar */}
      <SpotlightCard className="card flex-row gap-md" spotlightColor="rgba(59, 130, 246, 0.06)" style={{ padding: '0.85rem 1rem', flexWrap: 'wrap' }}>
        <div className="input-with-icon" style={{ flex: '1 1 280px' }}>
          <Search size={15} className="input-icon" />
          <input
            type="text"
            className="input"
            placeholder="Search breach name, description, attack vector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-row gap-sm" style={{ flexWrap: 'wrap' }}>
          <select className="input" style={{ width: 'auto' }} value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="input" style={{ width: 'auto' }} value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option value="all">All Sources</option>
            <option value="dark_web">Dark Web</option>
            <option value="paste_site">Paste Site</option>
            <option value="public_disclosure">Public Disclosure</option>
            <option value="insider">Insider</option>
          </select>
        </div>
      </SpotlightCard>

      {/* Breaches Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Breach Name</th>
              <th>Date</th>
              <th>Severity</th>
              <th>CVSS</th>
              <th>Exposed</th>
              <th>Vector</th>
              <th>Source</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.breach_id}>
                <td className="font-mono text-muted">#{b.breach_id}</td>
                <td className="fw-700">{b.breach_name}</td>
                <td className="text-secondary">{b.breach_date}</td>
                <td><span className={`badge badge-${b.severity}`}>{b.severity}</span></td>
                <td className="font-mono fw-700" style={{ color: b.cvss_score >= 9 ? 'var(--red)' : b.cvss_score >= 7 ? 'var(--amber)' : 'var(--accent)' }}>
                  {b.cvss_score}
                </td>
                <td className="font-mono">{(b.records_exposed || 0).toLocaleString()}</td>
                <td><span className="tag">{b.attack_vector}</span></td>
                <td className="text-secondary" style={{ textTransform: 'capitalize' }}>{b.source_type.replace('_', ' ')}</td>
                <td>
                  <button onClick={() => setDetailModal(b)} className="btn btn-secondary btn-sm">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className={`badge badge-${detailModal.severity}`} style={{ marginBottom: '0.4rem' }}>
                  {detailModal.severity} · CVSS {detailModal.cvss_score}
                </span>
                <h2>{detailModal.breach_name}</h2>
              </div>
              <button onClick={() => setDetailModal(null)} className="modal-close"><X size={18} /></button>
            </div>

            <div className="flex-col gap-lg">
              <div>
                <div className="form-label" style={{ marginBottom: '0.25rem' }}>Description</div>
                <p style={{ fontSize: '0.8125rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{detailModal.description}</p>
              </div>

              <div className="detail-grid">
                <div>
                  <div className="detail-label">Breach Date</div>
                  <div className="detail-value">{detailModal.breach_date}</div>
                </div>
                <div>
                  <div className="detail-label">Discovery Date</div>
                  <div className="detail-value">{detailModal.discovery_date || '2024-04-02'}</div>
                </div>
                <div>
                  <div className="detail-label">Records Exposed</div>
                  <div className="detail-value font-mono">{(detailModal.records_exposed || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="detail-label">Attack Vector</div>
                  <div className="detail-value" style={{ textTransform: 'uppercase' }}>{detailModal.attack_vector}</div>
                </div>
              </div>

              <div>
                <div className="form-label" style={{ marginBottom: '0.35rem' }}>Exposed Data Classes (breach_data_classes)</div>
                <div className="flex-row gap-xs" style={{ flexWrap: 'wrap' }}>
                  {(detailModal.data_classes || []).map((dc, i) => (
                    <span key={i} className="tag accent">{dc}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="form-label" style={{ marginBottom: '0.25rem' }}>Attributed Threat Actors (breach_threat_actors)</div>
                <div className="fw-600 text-amber" style={{ fontSize: '0.8125rem' }}>
                  {(detailModal.attributed_actors || ['Unknown']).join(', ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ingestion Modal (sp_ingest_breach) */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Ingest New Breach</h2>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>SQL Stored Procedure: <code>sp_ingest_breach</code></p>
              </div>
              <button onClick={() => setModalOpen(false)} className="modal-close"><X size={18} /></button>
            </div>

            {msg && (
              <div className={`msg ${msg.type === 'success' ? 'msg-success' : 'msg-error'}`} style={{ marginBottom: '1rem' }}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-stack">
              <div className="form-group">
                <label className="form-label">Breach Name</label>
                <input type="text" required className="input" value={form.breach_name} onChange={e => setForm({ ...form, breach_name: e.target.value })} placeholder="e.g., HydraMarket 2024 Database Exfiltration" />
              </div>

              <div className="form-group">
                <label className="form-label">Description (pgvector embedding input)</label>
                <textarea required className="input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed incident vector and leaked data narrative..." />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Victim Enterprise (Relational JOIN: organizations)</label>
                  <select className="input" value={form.target_org_id} onChange={e => setForm({ ...form, target_org_id: Number(e.target.value) })}>
                    <option value={2}>GlobalBank Financial (Domain: globalbank.co.uk - Watched!)</option>
                    <option value={1}>NexaCorp Technologies (Domain: nexacorp.com)</option>
                    <option value={3}>MedVault Health Systems (Domain: medvault.com)</option>
                    <option value={4}>CryptoHaven Exchange (Domain: cryptohaven.io)</option>
                    <option value={5}>EduConnect University (Domain: educonnect.ac.in)</option>
                    <option value={6}>Sentinel Defense Corp (Domain: sentineldef.com)</option>
                    <option value={7}>ShopStream Retail (Domain: shopstream.de)</option>
                    <option value={8}>CloudNine Solutions (Domain: cloudnine.ca)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Attributed Threat Actor (breach_threat_actors)</label>
                  <select className="input" value={form.attributed_actors} onChange={e => setForm({ ...form, attributed_actors: e.target.value })}>
                    <option value="ShadowSyndicate">ShadowSyndicate (Critical Financial Syndicate)</option>
                    <option value="PhantomSpider">PhantomSpider (Ransomware Group)</option>
                    <option value="NullSec Collective">NullSec Collective (State-Sponsored APT)</option>
                    <option value="DarkForge Crew">DarkForge Crew (Hacktivist Group)</option>
                    <option value="CryptoWraith">CryptoWraith (Cryptocurrency Draining)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <div className="flex-between" style={{ marginBottom: '0.25rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Sample Leaked Email (Trigger 2: trg_credential_reuse_check)</label>
                  <div className="flex-row gap-xs">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, sample_email: 'alicia.w@globalbank.co.uk' })}
                      className="tag accent cursor-pointer"
                      style={{ fontSize: '0.68rem', cursor: 'pointer' }}
                    >
                      Use Reused Email (alicia.w)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, sample_email: `victim_${Math.floor(Math.random()*900+100)}@globalbank.co.uk` })}
                      className="tag cursor-pointer"
                      style={{ fontSize: '0.68rem', cursor: 'pointer' }}
                    >
                      Use Unique Email
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  className="input font-mono"
                  value={form.sample_email}
                  onChange={e => setForm({ ...form, sample_email: e.target.value })}
                  placeholder="e.g., alicia.w@globalbank.co.uk"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Source Type</label>
                  <select className="input" value={form.source_type} onChange={e => setForm({ ...form, source_type: e.target.value })}>
                    <option value="dark_web">dark_web</option>
                    <option value="paste_site">paste_site</option>
                    <option value="public_disclosure">public_disclosure</option>
                    <option value="insider">insider</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Severity</label>
                  <select className="input" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                    <option value="critical">critical</option>
                    <option value="high">high</option>
                    <option value="medium">medium</option>
                    <option value="low">low</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">CVSS Score (0–10)</label>
                  <input type="number" step="0.1" min="0" max="10" className="input" value={form.cvss_score} onChange={e => setForm({ ...form, cvss_score: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Records Exposed</label>
                  <input type="number" className="input" value={form.records_exposed} onChange={e => setForm({ ...form, records_exposed: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Attack Vector</label>
                <select className="input" value={form.attack_vector} onChange={e => setForm({ ...form, attack_vector: e.target.value })}>
                  <option value="sqli">SQL Injection (sqli)</option>
                  <option value="phishing">Phishing Campaign</option>
                  <option value="rce">Remote Code Execution (rce)</option>
                  <option value="zero_day">Zero-Day Vulnerability</option>
                  <option value="misconfiguration">Cloud Misconfiguration</option>
                  <option value="insider">Malicious Insider</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Ingesting via SQL Procedure...' : 'Execute Ingest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
