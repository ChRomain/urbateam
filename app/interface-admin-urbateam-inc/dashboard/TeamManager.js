'use client';

import { useState, useEffect } from 'react';
import GlassCard from '../../../components/GlassCard';
import { Save, Plus, Trash2, Users, ChevronUp, ChevronDown, Mail, Phone, User, Image as ImageIcon } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './ToastContext';

export default function TeamManager() {
  const { showToast } = useToast();
  const [data, setData] = useState({ header: {}, members: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState('fr');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/team');
      const teamData = await res.json();
      setData(teamData);
    } catch (err) {
      console.error('Erreur Équipe');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success) {
        showToast('Équipe mise à jour avec succès !', 'success');
      }
    } catch (err) {
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file, memberId = null, isTeamPhoto = false) => {
    const formData = new FormData();
    formData.append('file', file);
    if (memberId) formData.append('memberId', memberId);
    if (isTeamPhoto) formData.append('isTeamPhoto', 'true');

    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/team/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        if (isTeamPhoto) {
          setData(prev => ({
            ...prev,
            header: { ...prev.header, teamPhoto: result.url }
          }));
        } else if (memberId) {
          updateMember(memberId, 'common', 'image', result.url);
        }
        showToast('Image mise à jour', 'success');
      }
    } catch (error) {
      showToast('Erreur upload', 'error');
    }
  };

  const addMember = () => {
    const newMember = {
      id: `member-${Date.now()}`,
      order: data.members.length,
      generic: false,
      image: null,
      linkedin: null,
      fr: { name: '', role: '', desc: '', email: '', phone: '' },
      en: { name: '', role: '', desc: '', email: '', phone: '' },
      br: { name: '', role: '', desc: '', email: '', phone: '' }
    };
    setData({ ...data, members: [...data.members, newMember] });
  };

  const removeMember = (id) => {
    if (confirm('Supprimer ce membre ?')) {
      setData({ ...data, members: data.members.filter(m => m.id !== id) });
    }
  };

  const updateHeader = (lang, field, value) => {
    setData({
      ...data,
      header: {
        ...data.header,
        [lang]: { ...data.header[lang], [field]: value }
      }
    });
  };

  const updateMember = (id, lang, field, value) => {
    setData({
      ...data,
      members: data.members.map(m => {
        if (m.id === id) {
          if (lang === 'common') {
            return { ...m, [field]: value };
          }
          return {
            ...m,
            [lang]: { ...m[lang], [field]: value }
          };
        }
        return m;
      })
    });
  };

  const moveMember = (index, direction) => {
    const newMembers = [...data.members];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= data.members.length) return;
    [newMembers[index], newMembers[newIndex]] = [newMembers[newIndex], newMembers[index]];
    setData({ ...data, members: newMembers });
  };

  if (loading) return <p>Chargement de l'équipe...</p>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Gestion de l'Équipe</h2>
          <p style={{ color: '#64748b' }}>Gérez les membres de l'équipe et les pôles d'expertise.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={addMember}
            className="btn"
            style={{ 
              backgroundColor: '#f1f5f9', 
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={18} /> Nouveau membre
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Save size={18} /> {saving ? 'Enregistrement...' : 'Enregistrer tout'}
          </button>
        </div>
      </div>

      {/* Sélecteur de langue */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem',
        backgroundColor: '#f1f5f9',
        padding: '0.4rem',
        borderRadius: '12px',
        width: 'fit-content'
      }}>
        {['fr', 'en', 'br'].map(lang => (
          <button
            key={lang}
            onClick={() => setActiveLang(lang)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeLang === lang ? '#fff' : 'transparent',
              color: activeLang === lang ? '#0f172a' : '#64748b',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Header Section */}
      <GlassCard style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--primary-color)' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>En-tête de la section Équipe</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600' }}>Titre ({activeLang.toUpperCase()})</label>
            <input 
              type="text"
              value={data.header[activeLang]?.title || ''}
              onChange={(e) => updateHeader(activeLang, 'title', e.target.value)}
              style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600' }}>Sous-titre ({activeLang.toUpperCase()})</label>
            <textarea 
              value={data.header[activeLang]?.subtitle || ''}
              onChange={(e) => updateHeader(activeLang, 'subtitle', e.target.value)}
              style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px' }}
            />
          </div>
          <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-color)' }}>
              📸 PHOTO D'ÉQUIPE / VUE DRONE
            </label>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ 
                width: '240px', 
                height: '120px', 
                backgroundColor: '#f1f5f9', 
                borderRadius: '10px', 
                overflow: 'hidden', 
                border: '2px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {data.header.teamPhoto ? (
                  <img src={data.header.teamPhoto} alt="Equipe" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ImageIcon size={40} style={{ color: '#cbd5e1' }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                  Cette photo apparaîtra en haut de la section Équipe. Idéal pour une photo de groupe ou une vue drone de l'agence.
                </p>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => e.target.files[0] && uploadImage(e.target.files[0], null, true)}
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Members List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <AnimatePresence>
          {data.members.map((member, index) => (
            <motion.div
              key={member.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <GlassCard style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {/* Position controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '1rem', borderRight: '1px solid #e2e8f0' }}>
                    <button onClick={() => moveMember(index, -1)} disabled={index === 0} style={{ border: 'none', background: 'none', cursor: 'pointer', color: index === 0 ? '#cbd5e1' : '#64748b' }}>
                      <ChevronUp size={20} />
                    </button>
                    <div style={{ textAlign: 'center', fontWeight: '700', color: '#94a3b8' }}>{index + 1}</div>
                    <button onClick={() => moveMember(index, 1)} disabled={index === data.members.length - 1} style={{ border: 'none', background: 'none', cursor: 'pointer', color: index === data.members.length - 1 ? '#cbd5e1' : '#64748b' }}>
                      <ChevronDown size={20} />
                    </button>
                  </div>

                  {/* Main content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '700' }}>Nom (si individuel)</label>
                            <input 
                              type="text"
                              value={member[activeLang]?.name || ''}
                              onChange={(e) => updateMember(member.id, activeLang, 'name', e.target.value)}
                              placeholder="Ex: Frank Le Gall"
                              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '700' }}>Rôle / Titre ({activeLang.toUpperCase()})</label>
                            <input 
                              type="text"
                              value={member[activeLang]?.role || ''}
                              onChange={(e) => updateMember(member.id, activeLang, 'role', e.target.value)}
                              placeholder="Ex: Co-Gérant"
                              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                            />
                          </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '700' }}>Description ({activeLang.toUpperCase()})</label>
                          <textarea 
                            value={member[activeLang]?.desc || ''}
                            onChange={(e) => updateMember(member.id, activeLang, 'desc', e.target.value)}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', minHeight: '60px' }}
                          />
                        </div>

                        {!member.generic && (
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '700' }}><Mail size={14}/> Email</label>
                              <input 
                                type="email"
                                value={member[activeLang]?.email || ''}
                                onChange={(e) => updateMember(member.id, activeLang, 'email', e.target.value)}
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '700' }}><Phone size={14}/> Téléphone</label>
                              <input 
                                type="text"
                                value={member[activeLang]?.phone || ''}
                                onChange={(e) => updateMember(member.id, activeLang, 'phone', e.target.value)}
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image & Options */}
                      <div style={{ width: '150px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ 
                          width: '100%', 
                          height: '100px', 
                          backgroundColor: '#f1f5f9', 
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          border: '2px dashed #cbd5e1'
                        }}>
                          {member.image ? (
                            <img src={member.image} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <User size={40} style={{ color: '#cbd5e1' }} />
                          )}
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => e.target.files[0] && uploadImage(e.target.files[0], member.id)}
                          style={{ fontSize: '0.65rem', width: '100%' }}
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={member.generic} 
                            onChange={(e) => updateMember(member.id, 'common', 'generic', e.target.checked)}
                          />
                          Profil générique
                        </label>
                        {!member.generic && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                            <svg width="14" height="14" fill="#0077b5" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            <input 
                              type="text" 
                              placeholder="URL LinkedIn"
                              value={member.linkedin || ''}
                              onChange={(e) => updateMember(member.id, 'common', 'linkedin', e.target.value)}
                              style={{ width: '100%', padding: '0.3rem', fontSize: '0.7rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ alignSelf: 'flex-start' }}>
                    <button 
                      onClick={() => removeMember(member.id)}
                      style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
