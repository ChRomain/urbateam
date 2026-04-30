'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Image as ImageIcon, FileText, Settings } from 'lucide-react';
import SocialManager from './SocialManager';
import BlogManager from './BlogManager';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('social');
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/interface-admin-urbateam-inc');
  };

  const tabs = [
    { id: 'social', name: 'Flux Social', icon: <ImageIcon size={20} /> },
    { id: 'blog', name: 'Articles Blog', icon: <FileText size={20} /> },
  ];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* Header Admin */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e2e8f0', 
        padding: '0.7rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '0.5rem', borderRadius: '8px' }}>
                <Settings size={20} />
              </div>
              <h1 style={{ fontSize: '1.1rem', color: 'var(--secondary-color)', fontWeight: '800', letterSpacing: '-0.5px' }}>URBATEAM ADMIN</h1>
            </div>

            {/* Tab Navigation */}
            <nav style={{ display: 'flex', gap: '0.5rem' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: activeTab === tab.id ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--primary-color)' : '#64748b',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e2e8f0', background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </header>

      <main className="container" style={{ marginTop: '3rem', maxWidth: '1200px', margin: '3rem auto', padding: '0 1rem' }}>
        {activeTab === 'social' && <SocialManager />}
        {activeTab === 'blog' && <BlogManager />}
      </main>
    </div>
  );
}
