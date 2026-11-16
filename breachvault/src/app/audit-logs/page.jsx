'use client';

import { useState, useEffect } from 'react';
import { FileText, ShieldAlert, Terminal, Clock } from 'lucide-react';
import ShinyText from '@/components/reactbits/ShinyText';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit')
      .then(r => r.json())
      .then(data => {
        if (data.success) setLogs(data.logs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page-wrapper">
      
      {/* Header */}
      <div className="page-header">
        <h1>
          <FileText size={22} className="text-accent" />
          <ShinyText text="Database Security Audit Trail (audit_logs)" color="#fafafa" shineColor="#38bdf8" speed={3.5} />
        </h1>
        <p>
          Immutable logging of breach ingestions, credential reuse alerts, and watchlist trigger events.
        </p>
      </div>

      {/* Logs Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Action Type</th>
              <th>Target Table</th>
              <th>Target ID</th>
              <th>Audit Log Details</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => {
              const isAlert = log.action.includes('ALERT');
              const isReuse = log.action.includes('REUSE');
              return (
                <tr key={log.log_id}>
                  <td className="font-mono text-muted">#{log.log_id}</td>
                  <td>
                    <span 
                      className={`tag fw-700 font-mono ${isAlert ? 'badge-critical' : isReuse ? 'badge-high' : 'accent'}`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="font-mono text-secondary">{log.target_table}</td>
                  <td className="font-mono text-muted">#{log.target_id}</td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    {log.details}
                  </td>
                  <td className="font-mono text-muted" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                    {log.performed_at ? log.performed_at.replace('T', ' ').slice(0, 19) : ''}
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
