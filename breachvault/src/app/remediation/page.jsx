'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import ShinyText from '@/components/reactbits/ShinyText';

export default function RemediationPage() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/remediation');
      const data = await res.json();
      if (data.success) {
        setActions(data.actions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleStatusChange = async (actionId, newStatus) => {
    try {
      const res = await fetch('/api/remediation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchActions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container page-wrapper">
      
      {/* Header */}
      <div className="page-header">
        <h1>
          <CheckSquare size={22} className="text-green" />
          <ShinyText text="Incident Remediation & Containment Tracker" color="#fafafa" shineColor="#22c55e" speed={3.5} />
        </h1>
        <p>
          Execute post-breach mitigation protocols (password resets, token revocations, emergency patches) linked to breaches and users.
        </p>
      </div>

      {/* Actions Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Action ID</th>
              <th>Breach Incident</th>
              <th>Protocol</th>
              <th>Description</th>
              <th>Status</th>
              <th>Resolution Date</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {actions.map(action => (
              <tr key={action.action_id}>
                <td className="font-mono text-muted">#{action.action_id}</td>
                <td className="fw-700">{action.breach_name}</td>
                <td>
                  <span className="tag accent fw-600">
                    {action.action_type.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ fontSize: '0.8125rem' }} className="text-secondary">
                  {action.description}
                </td>
                <td>
                  <span className={`badge ${action.status === 'completed' ? 'badge-low' : action.status === 'in_progress' ? 'badge-high' : 'badge-critical'}`}>
                    {action.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="font-mono text-muted" style={{ fontSize: '0.72rem' }}>
                  {action.resolved_at || 'Pending resolution'}
                </td>
                <td>
                  <select
                    className="input"
                    style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    value={action.status}
                    onChange={(e) => handleStatusChange(action.action_id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
