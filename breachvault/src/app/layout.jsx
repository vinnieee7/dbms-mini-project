import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'BreachVault — Data Breach Intelligence',
  description: 'DBMS Experiential Learning Level 3 Project - A S Vincent (PES2UG24CS002) & Akshat Kumar (PES2UG24CS046)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 7rem)', padding: '1.75rem 0' }}>
          {children}
        </main>
        <footer style={{ borderTop: '1px solid var(--border)', padding: '1rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div className="container flex-between">
            <span><strong style={{ color: 'var(--text-secondary)' }}>BreachVault v1.0</strong> — PostgreSQL/MySQL + pgvector</span>
            <span>PES University · UE24CS351A · A S Vincent (002) & Akshat Kumar (046)</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
