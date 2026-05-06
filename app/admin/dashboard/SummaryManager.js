'use client';

import { useState, useEffect } from 'react';
import GlassCard from '../../../components/GlassCard';
import { Users, BookOpen, Image as ImageIcon, TrendingUp, Clock, ChevronRight, MessageSquare, Activity, Layout, UserPlus, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeContext';

export default function SummaryManager() {
  const { colors, darkMode } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const [blog, social, stats, team, faq, projets] = await Promise.all([
        fetch('/data/blog.json').then(r => r.ok ? r.json() : []),
        fetch('/data/social.json').then(r => r.ok ? r.json() : []),
        fetch('/data/stats.json').then(r => r.ok ? r.json() : { totalVisits: 0 }),
        fetch('/data/team.json').then(r => r.ok ? r.json() : { members: [] }),
        fetch('/data/faq.json').then(r => r.ok ? r.json() : []),
        fetch('/data/projets.json').then(r => r.ok ? r.json() : [])
      ]);

      const kpis = {
        totalArticles: Array.isArray(blog) ? blog.length : 0,
        totalSocial: Array.isArray(social) ? social.length : 0,
        totalVisits: stats?.totalVisits || 0,
        totalTeam: Array.isArray(team?.members) ? team.members.length : (Array.isArray(team) ? team.length : 0),
        totalFaq: Array.isArray(faq) ? faq.length : 0,
        totalProjets: Array.isArray(projets) ? projets.length : 0
      };

      setData({
        success: true,
        kpis,
        stats,
        recentActivity: [
          { id: 1, action: "Dernière visite", target: "Page d'accueil", date: new Date().toISOString(), type: 'stats' },
          { id: 2, action: "Contenu Blog", target: `${kpis.totalArticles} articles publiés`, date: new Date().toISOString(), type: 'blog' },
          { id: 3, action: "Galerie Photos", target: `${kpis.totalSocial} images en ligne`, date: new Date().toISOString(), type: 'social' }
        ]
      });
    } catch (err) {
      console.error(err);
      setData({ success: false });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: colors.textMuted }}>Chargement du tableau de bord...</div>;
  if (!data || (data.success === false && !data.kpis)) return <div style={{ padding: '2rem', color: '#ef4444' }}>Erreur critique lors du chargement des données.</div>;

  const kpiData = data.kpis || { totalArticles: 0, totalSocial: 0, totalVisits: 0, totalTeam: 0 };
  const kpis = [
    { title: 'Blog', value: kpiData.totalArticles, icon: <BookOpen size={20} />, color: '#3b82f6', bg: darkMode ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff' },
    { title: 'Photos', value: kpiData.totalSocial, icon: <ImageIcon size={20} />, color: '#10b981', bg: darkMode ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5' },
    { title: 'Visites', value: kpiData.totalVisits, icon: <TrendingUp size={20} />, color: '#f59e0b', bg: darkMode ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb' },
    { title: 'Équipe', value: kpiData.totalTeam, icon: <Users size={20} />, color: '#8b5cf6', bg: darkMode ? 'rgba(139, 92, 246, 0.15)' : '#f5f3ff' },
    { title: 'Projets', value: kpiData.totalProjets || 0, icon: <Layout size={20} />, color: '#ef4444', bg: darkMode ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2' },
    { title: 'FAQ', value: kpiData.totalFaq || 0, icon: <MessageSquare size={20} />, color: '#06b6d4', bg: darkMode ? 'rgba(6, 182, 212, 0.15)' : '#ecfeff' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* KPI Grid - Compact Squares */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '1rem' 
      }}>
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', textAlign: 'center' }}>
              <div style={{ backgroundColor: kpi.bg, color: kpi.color, padding: '0.8rem', borderRadius: '12px', display: 'flex' }}>
                {kpi.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: colors.text, margin: 0 }}>{kpi.value}</h3>
                <p style={{ fontSize: '0.75rem', color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem' }}>{kpi.title}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', 
        gap: '2rem' 
      }}>
        {/* Main Graph Area (Placeholder for now) */}
        <div style={{ gridColumn: 'span 2' }}>
          <GlassCard style={{ padding: '2rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: colors.text, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Activity size={20} color="var(--primary-color)" /> Activité des Visites
              </h3>
              <select style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.input, color: colors.text, fontSize: '0.85rem' }}>
                <option>7 derniers jours</option>
                <option>30 derniers jours</option>
              </select>
            </div>
            
            {/* Simple CSS Chart */}
            <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', paddingBottom: '1rem' }}>
              {[45, 62, 55, 80, 72, 90, 85].map((val, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${val}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    style={{ 
                      width: '100%', 
                      maxWidth: '40px',
                      background: 'linear-gradient(to top, var(--primary-color), #a8c6af)', 
                      borderRadius: '6px 6px 0 0',
                      position: 'relative'
                    }} 
                  >
                    <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: '700', color: colors.textMuted }}>{Math.floor(val * (data.kpis.totalVisits / 400))}</div>
                  </motion.div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i]}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Recent Activity */}
        <div>
          <GlassCard style={{ padding: '2rem', height: '100%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: colors.text, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Clock size={20} color="var(--primary-color)" /> Activité Récente
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {data.recentActivity.map((act) => (
                <div key={act.id} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: `1px solid ${colors.border}`
                  }}>
                    {act.type === 'blog' && <BookOpen size={18} color="#3b82f6" />}
                    {act.type === 'social' && <ImageIcon size={18} color="#10b981" />}
                    {act.type === 'team' && <Users size={18} color="#8b5cf6" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: '700', color: colors.text, margin: 0 }}>{act.action}</p>
                    <p style={{ fontSize: '0.8rem', color: colors.textMuted, margin: '0.1rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.target}</p>
                    <p style={{ fontSize: '0.75rem', color: colors.textMuted, opacity: 0.8 }}>{formatDate(act.date)}</p>
                  </div>
                </div>
              ))}
            </div>
            <button style={{ 
              marginTop: '1.5rem', 
              width: '100%', 
              padding: '0.8rem', 
              borderRadius: '10px', 
              border: `1px solid ${colors.border}`, 
              backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'white', 
              color: colors.textMuted, 
              fontSize: '0.85rem', 
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}>
              Voir tout l'historique <ChevronRight size={14} />
            </button>
          </GlassCard>
        </div>
      </div>

      {/* Quick Links / Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: colors.text }}>Actions Rapides</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', 
          gap: '1.5rem' 
        }}>
          <QuickActionButton title="Nouvel Article" description="Partagez vos actualités" icon={<BookOpen size={20} />} color="#3b82f6" />
          <QuickActionButton title="Ajouter une Photo" description="Galerie Nous Suivre" icon={<ImageIcon size={20} />} color="#10b981" />
          
          {/* Quick Invite Tool */}
          <GlassCard style={{ padding: '1.5rem', gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ color: '#8b5cf6', backgroundColor: '#8b5cf615', padding: '0.8rem', borderRadius: '10px' }}>
                <UserPlus size={20} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: colors.text }}>Inviter un membre</h4>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="email" 
                placeholder="Email..." 
                id="quick-invite-email"
                style={{ 
                  flex: 1, 
                  padding: '0.6rem', 
                  borderRadius: '8px', 
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.bg,
                  color: colors.text,
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button 
                onClick={async () => {
                  const email = document.getElementById('quick-invite-email').value;
                  if (!email) return;
                  const btn = document.activeElement;
                  const originalText = btn.innerHTML;
                  btn.innerHTML = '...';
                  try {
                    const token = document.cookie.split('; ').find(row => row.startsWith('admin_session='))?.split('=')[1];
                    const res = await fetch('/api/users', {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ email })
                    });
                    if (res.ok) {
                      btn.innerHTML = 'OK';
                      btn.style.backgroundColor = '#10b981';
                      document.getElementById('quick-invite-email').value = '';
                      setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.backgroundColor = '';
                      }, 2000);
                    } else {
                      btn.innerHTML = 'Erreur';
                      setTimeout(() => btn.innerHTML = originalText, 2000);
                    }
                  } catch (e) {
                    btn.innerHTML = 'Erreur';
                    setTimeout(() => btn.innerHTML = originalText, 2000);
                  }
                }}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}
              >
                Inviter
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ title, description, icon, color }) {
  const { colors } = useTheme();
  return (
    <GlassCard style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ color: color, backgroundColor: `${color}15`, padding: '0.8rem', borderRadius: '10px' }}>{icon}</div>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: colors.text }}>{title}</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: colors.textMuted }}>{description}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffHours < 1) return "À l'instant";
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return date.toLocaleDateString('fr-FR');
}
