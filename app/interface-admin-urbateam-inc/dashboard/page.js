'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HelpCircle, 
  Book, 
  Users, 
  BarChart2, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Layout, 
  Settings, 
  LogOut, 
  Image as ImageIcon,
  Sun,
  Moon,
  ExternalLink,
  QrCode,
  Share2
} from 'lucide-react';

import SocialManager from './SocialManager';
import BlogManager from './BlogManager';
import ProjetsManager from './ProjetsManager';
import FAQManager from './FAQManager';
import GlossaryManager from './GlossaryManager';
import TeamManager from './TeamManager';
import StatsManager from './StatsManager';
import ClientsManager from './ClientsManager';
import PartnersManager from './PartnersManager';
import SummaryManager from './SummaryManager';
import QRCodeManager from './QRCodeManager';
import SocialCardsManager from './SocialCardsManager';
import { ToastProvider } from './ToastContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Handshake } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <DashboardContent />
      </ToastProvider>
    </ThemeProvider>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { darkMode, toggleDarkMode, colors } = useTheme();
  const [activeTab, setActiveTab] = useState('summary');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/interface-admin-urbateam-inc');
  };

  const tabs = [
    { id: 'summary', name: 'Vue d\'ensemble', icon: <Home size={20} /> },
    { id: 'stats', name: 'Statistiques', icon: <BarChart2 size={20} /> },
    { id: 'social', name: 'Galerie Photos', icon: <ImageIcon size={20} /> },
    { id: 'blog', name: 'Articles Blog', icon: <Book size={20} /> },
    { id: 'projets', name: 'Réalisations', icon: <Layout size={20} /> },
    { id: 'clients', name: 'Clients', icon: <Users size={20} /> },
    { id: 'partners', name: 'Partenaires', icon: <Handshake size={20} /> },
    { id: 'team', name: 'Équipe', icon: <Users size={20} /> },
    { id: 'faq', name: 'FAQ', icon: <HelpCircle size={20} /> },
    { id: 'glossary', name: 'Lexique', icon: <Book size={20} /> },
    { id: 'qrcode', name: 'QR Code', icon: <QrCode size={20} /> },
    { id: 'socialcards', name: 'Social Cards', icon: <Share2 size={20} /> },
  ];

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', display: 'flex', transition: 'background-color 0.3s ease' }}>
      {/* Sidebar Navigation */}
      <aside style={{ 
        width: isCollapsed ? '80px' : '280px', 
        backgroundColor: colors.sidebar, 
        color: 'white',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 200,
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Brand/Logo */}
        <div style={{ 
          padding: isCollapsed ? '1.5rem' : '2rem 1.5rem', 
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          gap: '1rem',
          minHeight: '85px'
        }}>
          <div style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '0.6rem', borderRadius: '10px', display: 'flex' }}>
            <Settings size={24} />
          </div>
          {!isCollapsed && (
            <h1 style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '0.5px', margin: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}>URBATEAM</h1>
          )}
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '1.5rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'hidden' }}>
          {!isCollapsed && <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', padding: '0 1rem 0.5rem', letterSpacing: '1px' }}>Contenu Site</p>}
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={isCollapsed ? tab.name : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '1rem',
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#94a3b8',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textAlign: 'left',
                width: '100%',
                overflow: 'hidden'
              }}
            >
              <div style={{ 
                color: activeTab === tab.id ? 'var(--primary-color)' : 'inherit',
                display: 'flex',
                minWidth: '20px'
              }}>
                {tab.icon}
              </div>
              {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{tab.name}</span>}
              {!isCollapsed && activeTab === tab.id && (
                <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }} />
              )}
            </button>
          ))}
          
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <button
              onClick={toggleDarkMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '1rem',
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#94a3b8',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                width: '100%'
              }}
            >
              <div style={{ display: 'flex', minWidth: '20px' }}>
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </div>
              {!isCollapsed && <span>{darkMode ? 'Mode Clair' : 'Mode Sombre'}</span>}
            </button>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexDirection: isCollapsed ? 'column' : 'row' }}>
          {!isCollapsed && (
            <button 
              onClick={() => window.location.href = '/'}
              title="Voir le site"
              style={{ 
                background: 'rgba(59, 130, 246, 0.1)', 
                border: '1px solid rgba(59, 130, 246, 0.2)', 
                color: 'var(--primary-color)', 
                cursor: 'pointer',
                padding: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                transition: 'all 0.2s',
                flex: 1
              }}
            >
              <ExternalLink size={20} />
            </button>
          )}

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Agrandir" : "Réduire"}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: 'none', 
              color: '#94a3b8', 
              cursor: 'pointer',
              padding: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              transition: 'all 0.2s',
              flex: isCollapsed ? 'none' : 1,
              width: isCollapsed ? '100%' : 'auto'
            }}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          {!isCollapsed && (
            <button 
              onClick={handleLogout} 
              title="Déconnexion"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flex: 1,
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                padding: '0.8rem', 
                borderRadius: '10px', 
                color: '#ef4444', 
                cursor: 'pointer', 
                transition: 'all 0.2s'
              }}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        marginLeft: isCollapsed ? '80px' : '280px', 
        padding: '2.5rem',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2rem', color: colors.text, fontWeight: '800', transition: 'color 0.3s' }}>
              {tabs.find(t => t.id === activeTab)?.name}
            </h2>
            <div style={{ height: '4px', width: '60px', backgroundColor: 'var(--primary-color)', marginTop: '0.5rem', borderRadius: '2px' }}></div>
          </div>
          <div style={{ color: colors.textMuted, fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.3s' }}>
            Admin {'>'} {tabs.find(t => t.id === activeTab)?.name}
          </div>
        </header>

        <div style={{ maxWidth: '1200px', color: colors.text }}>
          {activeTab === 'summary' && <SummaryManager />}
          {activeTab === 'social' && <SocialManager />}
          {activeTab === 'projets' && <ProjetsManager />}
          {activeTab === 'blog' && <BlogManager />}
          {activeTab === 'faq' && <FAQManager />}
          {activeTab === 'glossary' && <GlossaryManager />}
          {activeTab === 'team' && <TeamManager />}
          {activeTab === 'clients' && <ClientsManager />}
          {activeTab === 'partners' && <PartnersManager />}
          {activeTab === 'stats' && <StatsManager />}
          {activeTab === 'qrcode' && <QRCodeManager />}
          {activeTab === 'socialcards' && <SocialCardsManager />}
        </div>
      </main>
    </div>
  );
}
