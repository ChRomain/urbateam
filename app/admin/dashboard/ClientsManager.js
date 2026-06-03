'use client';

import { useState, useEffect } from 'react';
import GlassCard from '../../../components/GlassCard';
import { Users, Trash2, Plus, Image as ImageIcon, Edit } from 'lucide-react';
import { useToast } from './ToastContext';
import { useTheme } from './ThemeContext';

export default function ClientsManager() {
  const { showToast } = useToast();
  const { colors, darkMode } = useTheme();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [updatingCarouselId, setUpdatingCarouselId] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/clients');
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
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
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        showToast(editingClient ? 'Client mis à jour !' : 'Client ajouté avec succès !', 'success');
        e.target.reset();
        setEditingClient(null);
        fetchClients();
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
    if (!confirm('Voulez-vous vraiment supprimer ce client ?')) return;

    try {
      const res = await fetch('/api/admin/clients', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        showToast('Client supprimé', 'info');
        fetchClients();
      }
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleToggleCarousel = async (id, checked) => {
    setUpdatingCarouselId(id);
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'PATCH',
        body: JSON.stringify({ id, in_carousel: checked }),
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await res.json();
      if (result.success) {
        showToast(checked ? 'Client ajouté au carrousel !' : 'Client retiré du carrousel.', 'success');
        fetchClients();
      } else {
        showToast(result.message || 'Une erreur est survenue', 'error');
      }
    } catch (err) {
      showToast('Erreur de connexion', 'error');
    } finally {
      setUpdatingCarouselId(null);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingClient(null);
  };

  const carouselClients = clients.filter(c => c.in_carousel);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: '2rem' }}>
      <div className="lg:col-span-5">
        <GlassCard style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: colors.text, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {editingClient ? <Users size={20} color="var(--primary-color)" /> : <Plus size={20} color="var(--primary-color)" />}
            {editingClient ? 'Modifier le Client' : 'Ajouter un Client'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.5rem' }}>Nom du client / organisme</label>
              <input 
                name="name" 
                type="text" 
                required 
                defaultValue={editingClient?.name || ''}
                key={editingClient?.id || 'new'}
                placeholder="ex: Mairie de Brest"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: `1px solid ${colors.border}`, backgroundColor: colors.input, color: colors.text }} 
              />
              {editingClient && <input type="hidden" name="id" value={editingClient.id} />}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.5rem' }}>Catégorie</label>
              <select 
                name="category" 
                defaultValue={editingClient?.category || 'collectivite'}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: `1px solid ${colors.border}`, backgroundColor: colors.input, color: colors.text }}
              >
                <option value="collectivite">Collectivité</option>
                <option value="promoteur">Aménageur & Promoteur</option>
                <option value="architecte">Architecte</option>
                <option value="particulier">Particulier</option>
                <option value="entreprise">Entreprise</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.5rem' }}>Logo (optionnel)</label>
              <input name="logo" type="file" accept="image/*" style={{ fontSize: '0.8rem', color: colors.text }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {editingClient && (
                <button type="button" onClick={handleCancel} className="btn" style={{ flex: 1, border: `1px solid ${colors.border}` }}>
                  Annuler
                </button>
              )}
              <button 
                className="btn btn-primary" 
                type="submit" 
                disabled={submitting} 
                style={{ flex: 2 }}
              >
                {submitting ? 'Publication...' : editingClient ? 'Mettre à jour' : 'Ajouter le client'}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>

      <div className="lg:col-span-7">
        <GlassCard style={{ padding: '1.2rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-color)' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', color: colors.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ✨ Carrousel Page d'Accueil ({carouselClients.length} / 15)
          </h4>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: colors.textMuted, lineHeight: '1.4' }}>
            Sélectionnez entre 4 et 15 clients à afficher dans le slider rotatif.
            {carouselClients.length < 4 && (
              <span style={{ color: 'var(--primary-color)', display: 'block', marginTop: '0.2rem', fontWeight: '600' }}>
                💡 Moins de 4 clients sélectionnés : des placeholders par défaut seront affichés en complément.
              </span>
            )}
          </p>
        </GlassCard>

        <h3 style={{ fontSize: '1.2rem', color: colors.text, marginBottom: '1.5rem' }}>Clients & Références ({clients.length})</h3>
        {loading ? (
          <p style={{ color: colors.textMuted }}>Chargement...</p>
        ) : clients.length === 0 ? (
          <GlassCard style={{ padding: '3rem', textAlign: 'center', color: colors.textMuted }}>
            Aucun client enregistré.
          </GlassCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {clients.map(client => (
              <GlassCard key={client.id} style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: darkMode ? '#333' : '#f1f5f9', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {client.logo ? (
                    <img src={client.logo} alt={client.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <ImageIcon size={24} color="#cbd5e1" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: colors.text }}>{client.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: '600', textTransform: 'uppercase' }}>{client.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '1rem' }}>
                    <input 
                      type="checkbox" 
                      id={`carousel-${client.id}`}
                      checked={client.in_carousel || false}
                      disabled={updatingCarouselId === client.id}
                      onChange={(e) => handleToggleCarousel(client.id, e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor={`carousel-${client.id}`} style={{ fontSize: '0.8rem', color: colors.textMuted, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Accueil
                    </label>
                  </div>
                  <button onClick={() => handleEdit(client)} style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary-color)', cursor: 'pointer' }}>
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(client.id)} style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: '#ef4444', cursor: 'pointer' }}>
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
