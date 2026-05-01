'use client';

import { useState, useEffect } from 'react';
import GlassCard from '../../../components/GlassCard';
import { Handshake, Trash2, Plus, Image as ImageIcon, Edit, Globe } from 'lucide-react';
import { useToast } from './ToastContext';
import { useTheme } from './ThemeContext';

export default function PartnersManager() {
  const { showToast } = useToast();
  const { colors, darkMode } = useTheme();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await fetch('/data/partners.json');
      const data = await res.json();
      setPartners(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);

    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/partners', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        showToast(editingPartner ? 'Partenaire mis à jour !' : 'Partenaire ajouté avec succès !', 'success');
        e.target.reset();
        setEditingPartner(null);
        fetchPartners();
      } else {
        showToast(result.message || 'Une erreur est survenue', 'error');
      }
    } catch (error) {
      showToast('Erreur de connexion', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer ce partenaire ?')) return;

    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/partners', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        showToast('Partenaire supprimé', 'info');
        fetchPartners();
      }
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingPartner(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: '2rem' }}>
      <div className="lg:col-span-5">
        <GlassCard style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: colors.text, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {editingPartner ? <Handshake size={20} color="var(--primary-color)" /> : <Plus size={20} color="var(--primary-color)" />}
            {editingPartner ? 'Modifier le Partenaire' : 'Ajouter un Partenaire'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.5rem' }}>Nom de l'entreprise / Partenaire</label>
              <input 
                name="name" 
                type="text" 
                required 
                defaultValue={editingPartner?.name || ''}
                key={editingPartner?.id || 'new'}
                placeholder="ex: Cabinet d'avocats Juridex"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: `1px solid ${colors.border}`, backgroundColor: colors.input, color: colors.text }} 
              />
              {editingPartner && <input type="hidden" name="id" value={editingPartner.id} />}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.5rem' }}>Rôle / Expertise</label>
              <input 
                name="role" 
                type="text" 
                required 
                defaultValue={editingPartner?.role || ''}
                placeholder="ex: Conseil Juridique / Notaire"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: `1px solid ${colors.border}`, backgroundColor: colors.input, color: colors.text }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.5rem' }}>Site Web (optionnel)</label>
              <div style={{ position: 'relative' }}>
                <Globe size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} />
                <input 
                  name="website" 
                  type="url" 
                  defaultValue={editingPartner?.website || ''}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.8rem', borderRadius: '10px', border: `1px solid ${colors.border}`, backgroundColor: colors.input, color: colors.text }} 
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.5rem' }}>Logo</label>
              <input name="logo" type="file" accept="image/*" style={{ fontSize: '0.8rem', color: colors.text }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {editingPartner && (
                <button type="button" onClick={handleCancel} className="btn" style={{ flex: 1, border: `1px solid ${colors.border}` }}>
                  Annuler
                </button>
              )}
              <button className="btn btn-primary" type="submit" disabled={submitting} style={{ flex: 2 }}>
                {submitting ? 'Publication...' : editingPartner ? 'Mettre à jour' : 'Ajouter le partenaire'}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>

      <div className="lg:col-span-7">
        <h3 style={{ fontSize: '1.2rem', color: colors.text, marginBottom: '1.5rem' }}>Nos Partenaires ({partners.length})</h3>
        {loading ? (
          <p style={{ color: colors.textMuted }}>Chargement...</p>
        ) : partners.length === 0 ? (
          <GlassCard style={{ padding: '3rem', textAlign: 'center', color: colors.textMuted }}>
            Aucun partenaire enregistré.
          </GlassCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {partners.map(partner => (
              <GlassCard key={partner.id} style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: darkMode ? '#333' : '#f1f5f9', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {partner.logo ? (
                    <img src={partner.logo} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Handshake size={24} color="#cbd5e1" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: colors.text }}>{partner.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: '600' }}>{partner.role}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(partner)} style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary-color)', cursor: 'pointer' }}>
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(partner.id)} style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
