'use client';

import { useState, useEffect } from 'react';
import GlassCard from '../../../components/GlassCard';
import { LayoutGrid, Trash2, MapPin, Briefcase, Plus, FileText, Edit } from 'lucide-react';

export default function ProjetsManager() {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    fetchProjets();
  }, []);

  const fetchProjets = async () => {
    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/projets');
      const data = await res.json();
      setProjets(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData(e.target);

    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/projets', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        setMessage({ type: 'success', text: editingProject ? 'Réalisation mise à jour !' : 'Réalisation ajoutée avec succès !' });
        e.target.reset();
        setEditingProject(null);
        fetchProjets();
      } else {
        setMessage({ type: 'error', text: result.message || 'Une erreur est survenue' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cette réalisation ?')) return;

    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/projets', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        fetchProjets();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingProject(null);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: '2rem' }}>
      {/* Form Column */}
      <div className="lg:col-span-5">
        <GlassCard style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
            <div style={{ color: 'var(--primary-color)' }}>
              {editingProject ? <FileText size={24} /> : <Plus size={24} />}
            </div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--secondary-color)' }}>
              {editingProject ? 'Modifier la Réalisation' : 'Nouvelle Réalisation'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Titre de l'opération *</label>
              <input 
                name="title" 
                type="text" 
                required 
                defaultValue={editingProject?.title || ''}
                key={editingProject?.id || 'new'}
                placeholder="ex: Eco-quartier de la Vallée"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} 
              />
              {editingProject && <input type="hidden" name="id" value={editingProject.id} />}
            </div>

            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Catégorie</label>
                <select name="category" defaultValue={editingProject?.category || 'urbanisme'} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', backgroundColor: 'white' }}>
                  <option value="urbanisme">Urbanisme & Paysage</option>
                  <option value="geometre">Géomètre-Expert</option>
                  <option value="vrd">Ingénierie VRD</option>
                  <option value="sport">Ingénierie Sportive</option>
                  <option value="topographie">Topographie</option>
                  <option value="copropriete">Copropriété & 3D</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Localisation</label>
                <input 
                  name="location" 
                  type="text" 
                  defaultValue={editingProject?.location || ''}
                  placeholder="ex: Saint-Renan (29)" 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} 
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Maître d'Ouvrage (Client)</label>
              <input 
                name="client" 
                type="text" 
                defaultValue={editingProject?.client || ''}
                placeholder="ex: Commune de Plouzané" 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} 
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Missions (séparées par virgules)</label>
              <input 
                name="missions" 
                type="text" 
                defaultValue={editingProject?.missions?.join(', ') || ''}
                placeholder="ex: Maîtrise d'œuvre, Bornage, Suivi de chantier..." 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} 
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Description détaillée *</label>
              <textarea 
                name="description" 
                required 
                rows="5" 
                defaultValue={editingProject?.description || ''}
                placeholder="Présentez le projet, ses enjeux et notre intervention..."
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical' }}
              ></textarea>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Détails Techniques</label>
              <input 
                name="technicalDetails" 
                type="text" 
                defaultValue={editingProject?.technicalDetails || ''}
                placeholder="ex: 45 lots, 3 hectares, 2 km de réseaux..." 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} 
              />
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📸 COMPARISON AVANT / APRÈS
              </p>
              <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', marginBottom: '0.4rem', display: 'block' }}>IMAGE AVANT</label>
                  <input name="beforeImage" type="file" accept="image/*" style={{ fontSize: '0.7rem', width: '100%' }} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', marginBottom: '0.4rem', display: 'block' }}>IMAGE APRÈS</label>
                  <input name="afterImage" type="file" accept="image/*" style={{ fontSize: '0.7rem', width: '100%' }} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Galerie Photos (Plusieurs fichiers possibles)</label>
              <input name="gallery" type="file" accept="image/*" multiple style={{ fontSize: '0.8rem', width: '100%' }} />
            </div>
            
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Documents PDF (Plaquettes, plans, PV...)</label>
              <input name="documents" type="file" accept=".pdf" multiple style={{ fontSize: '0.8rem', width: '100%' }} />
            </div>

            {message.text && (
              <div style={{ 
                padding: '1rem', 
                borderRadius: '10px', 
                backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: message.type === 'success' ? '#166534' : '#991b1b',
                fontSize: '0.9rem',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {message.text}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              {editingProject && (
                <button 
                  type="button" 
                  onClick={handleCancel}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    backgroundColor: 'white',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
              )}
              <button 
                type="submit" 
                disabled={submitting}
                style={{
                  flex: 2,
                  padding: '1rem',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'Publication...' : editingProject ? 'Mettre à jour' : 'Publier la réalisation'}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>

      {/* List Column */}
      <div className="lg:col-span-7">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <LayoutGrid size={20} /> Réalisations publiées ({projets.length})
          </h2>
          <button 
            onClick={fetchProjets}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Actualiser
          </button>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem' }}>Chargement des projets...</div>
        ) : projets.length === 0 ? (
          <GlassCard style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            Aucune réalisation pour le moment. Utilisez le formulaire pour en ajouter une.
          </GlassCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {projets.map((p) => (
              <GlassCard key={p.id} style={{ padding: '1.2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9' }}>
                  <img 
                    src={p.images.after || p.images.gallery[0] || '/og-image.png'} 
                    alt={p.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary-color)', borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase' }}>
                      {p.category}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--secondary-color)', marginBottom: '0.3rem' }}>{p.title}</h3>
                  <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} /> {p.location}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Briefcase size={14} /> {p.client || 'Confidentiel'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleEdit(p)}
                    title="Modifier"
                    style={{ 
                      padding: '0.7rem', 
                      borderRadius: '10px', 
                      backgroundColor: 'rgba(var(--primary-rgb), 0.1)', 
                      color: 'var(--primary-color)', 
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    title="Supprimer"
                    style={{ 
                      padding: '0.7rem', 
                      borderRadius: '10px', 
                      backgroundColor: '#fee2e2', 
                      color: '#991b1b', 
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
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
