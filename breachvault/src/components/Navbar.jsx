'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  ShieldAlert, 
  Database, 
  KeyRound, 
  Search, 
  Users, 
  Building2, 
  CheckSquare, 
  FileText,
  UserCheck
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState('admin');

  const navLinks = [
    { name: 'Dashboard', href: '/', icon: ShieldAlert },
    { name: 'Breaches', href: '/breaches', icon: Database },
    { name: 'Credentials', href: '/credentials', icon: KeyRound },
    { name: 'Vector Search', href: '/semantic-search', icon: Search },
    { name: 'Threat Actors', href: '/threat-actors', icon: Users },
    { name: 'Organizations', href: '/organizations', icon: Building2 },
    { name: 'Remediation', href: '/remediation', icon: CheckSquare },
    { name: 'Audit Trail', href: '/audit-logs', icon: FileText },
  ];

  const toggleRole = () => {
    setCurrentRole(prev => prev === 'admin' ? 'analyst' : 'admin');
  };

  return (
    <header className="header-navbar">
      <div className="navbar-container">
        
        {/* Left: Brand Identity */}
        <Link href="/" className="nav-brand">
          <div className="nav-logo">
            <ShieldAlert size={18} />
          </div>
          <div className="nav-title-group">
            <span className="nav-title">BreachVault</span>
            <span className="nav-subtitle">Threat Intel SOC</span>
          </div>
        </Link>

        {/* Center: Segmented Navigation Pill Bar */}
        <nav className="nav-links-wrapper" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={14} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Role Switcher (Academic Student Attribution) */}
        <button 
          onClick={toggleRole} 
          className={`role-badge-btn ${currentRole}`}
          title="Click to toggle RBAC Role"
        >
          <UserCheck size={14} />
          <span>
            {currentRole === 'admin' 
              ? 'Admin · Vincent (002)' 
              : 'Analyst · Akshat (046)'}
          </span>
        </button>

      </div>
    </header>
  );
}
