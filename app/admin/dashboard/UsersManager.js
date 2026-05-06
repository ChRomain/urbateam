'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Mail, Shield, User, Search, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function UsersManager() {
  const { colors } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = document.cookie.split('; ').find(row => row.startsWith('admin_session='))?.split('=')[1];
      
      if (!token) return;

      const res = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const { data } = await res.json();
      setUsers(data || []);
    } catch (error) {
      console.error('Erreur fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviteLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('admin_session='))?.split('=')[1];
      
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Invitation envoyée avec succès à ${inviteEmail}` });
        setInviteEmail('');
        fetchUsers();
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: errorData.errors?.[0]?.message || 'Erreur lors de l\'invitation' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Impossible de contacter le serveur' });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('admin_session='))?.split('=')[1];
      const res = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <p style={{ color: colors.textMuted, margin: 0, fontSize: '1.1rem' }}>
          Gérez les accès à l'interface d'administration.
        </p>
        <button 
          onClick={fetchUsers}
          className="btn"
          style={{ 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1rem'
          }}
        >
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
          Actualiser
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Liste des utilisateurs */}
        <div style={{ 
          backgroundColor: colors.card, 
          borderRadius: 'var(--border-radius-lg)', 
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: `1px solid ${colors.border}`
        }}>
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>
              <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder="Rechercher un utilisateur..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.8rem 1rem 0.8rem 3rem', 
                borderRadius: 'var(--border-radius-sm)', 
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.bg,
                color: colors.text,
                outline: 'none'
              }}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: colors.textMuted }}>
              <RefreshCw size={30} className="spin" />
              <p style={{ marginTop: '1rem' }}>Chargement des utilisateurs...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredUsers.map(user => (
                <div 
                  key={user.id}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '1rem', 
                    borderRadius: '12px',
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                    transition: 'transform 0.2s'
                  }}
                >
                  <div style={{ 
                    width: '45px', 
                    height: '45px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--primary-color)', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    marginRight: '1rem'
                  }}>
                    {user.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', color: colors.text }}>
                      {user.first_name} {user.last_name}
                      {user.status === 'invited' && (
                        <span style={{ fontSize: '0.7rem', backgroundColor: '#fbbf24', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '10px', marginLeft: '0.5rem' }}>Invité</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Mail size={14} /> {user.email}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '8px', 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                      color: 'var(--primary-color)',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <Shield size={14} /> Admin
                    </div>
                    {user.email !== 'admin@urbateam.fr' && (
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        style={{ 
                          border: 'none', 
                          background: 'none', 
                          color: '#ef4444', 
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: colors.textMuted }}>
                  Aucun utilisateur trouvé.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Formulaire d'invitation */}
        <div>
          <div style={{ 
            backgroundColor: colors.card, 
            borderRadius: 'var(--border-radius-lg)', 
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: `1px solid ${colors.border}`,
            position: 'sticky',
            top: '2rem'
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>
              <UserPlus size={22} color="var(--primary-color)" />
              Inviter un collaborateur
            </h3>
            <p style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '1.5rem' }}>
              Envoyez une invitation par email. La personne recevra un lien pour configurer son propre mot de passe.
            </p>

            <form onSubmit={handleInvite}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600' }}>Adresse Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="exemple@urbateam.fr"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '0.8rem', 
                    borderRadius: 'var(--border-radius-sm)', 
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.bg,
                    color: colors.text,
                    outline: 'none'
                  }}
                />
              </div>

              {message.text && (
                <div style={{ 
                  padding: '0.8rem', 
                  borderRadius: '8px', 
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: message.type === 'success' ? '#10b981' : '#ef4444',
                }}>
                  {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {message.text}
                </div>
              )}

              <button 
                type="submit" 
                disabled={inviteLoading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', fontWeight: '700' }}
              >
                {inviteLoading ? 'Envoi...' : 'Envoyer l\'invitation'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
