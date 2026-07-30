'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import Magnetic from '../../components/Magnetic';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, MapPin, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const ProjectsMap = dynamic(() => import('../../components/ProjectsMap'), { 
  ssr: false,
  loading: () => <div style={{ height: '400px', backgroundColor: '#f8fafc', borderRadius: '20px' }}></div>
});

const categoryLabelMap = {
  all: 'Tous',
  foncier: 'Foncier (Bornage, Division...)',
  topographie: 'Topographie',
  vrd: 'Ingénierie VRD',
  copropriete: 'Copropriété & 3D',
  urbanisme: 'Urbanisme & Paysage',
  sport: 'Ingénierie Sportive',
  geometre: 'Foncier & Bornage'
};

// projects est passé en props depuis le server component (page.js)
export default function ProjetsClient({ projects = [] }) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [subFilter, setSubFilter] = useState('all');

  // 1. Ne conserver que les catégories principales ayant au moins 1 projet
  const categories = useMemo(() => {
    const activeCategoryKeys = Array.from(new Set(projects.map(p => p.category).filter(Boolean)));
    
    const catList = [{ id: 'all', label: t('projects.categories.all') || 'Tous' }];

    activeCategoryKeys.forEach(key => {
      let label = categoryLabelMap[key];
      if (!label) {
        const i18nLabel = t(`projects.categories.${key}`);
        label = (i18nLabel && i18nLabel !== `projects.categories.${key}`) ? i18nLabel : key;
      }
      catList.push({ id: key, label });
    });

    return catList;
  }, [projects, t]);

  // 2. Extraire les sous-catégories associées à la catégorie sélectionnée
  const availableSubcategories = useMemo(() => {
    if (filter === 'all') return [];
    
    const projectsInCategory = projects.filter(p => {
      if (filter === 'foncier') return p.category === 'foncier' || p.category === 'geometre';
      return p.category === filter;
    });

    return Array.from(new Set(projectsInCategory.map(p => p.subcategory).filter(Boolean)));
  }, [projects, filter]);

  // Réinitialiser le sous-filtre lors d'un changement de catégorie principale
  const handleCategoryChange = (catId) => {
    setFilter(catId);
    setSubFilter('all');
  };

  // 3. Filtrage final des projets
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesCategory = filter === 'all' || p.category === filter || (filter === 'foncier' && p.category === 'geometre');
      const matchesSubcategory = subFilter === 'all' || p.subcategory === subFilter;
      return matchesCategory && matchesSubcategory;
    });
  }, [projects, filter, subFilter]);

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('projects.title')} 
        subtitle={t('projects.subtitle')}
      />

      <div style={{ marginTop: '3rem' }}>
        <ProjectsMap projects={projects} />
      </div>

      {/* 1. Ligne Principale des Catégories (Uniquement celles contenant des projets) */}
      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
        {categories.map((cat) => {
          const isActive = filter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              style={{
                padding: '0.75rem 1.8rem',
                borderRadius: '50px',
                border: isActive ? '2px solid var(--primary-color)' : '1px solid rgba(0, 0, 0, 0.12)',
                backgroundColor: isActive ? 'var(--primary-color)' : 'white',
                color: isActive ? 'white' : 'var(--secondary-color)',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: isActive ? '0 8px 20px rgba(121, 160, 129, 0.35)' : '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 2. Ligne Secondaire des Sous-catégories (Visuellement très différente) */}
      {availableSubcategories.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ 
            marginTop: '1.5rem', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '0.6rem',
            backgroundColor: 'rgba(241, 245, 249, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '0.85rem 1.5rem',
            borderRadius: '16px',
            border: '1px dashed rgba(16, 185, 129, 0.35)',
            maxWidth: 'fit-content',
            margin: '1.5rem auto 0',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}
        >
          <span style={{ 
            fontSize: '0.8rem', 
            fontWeight: '800', 
            color: 'var(--accent-color, #10b981)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px',
            marginRight: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <Tag size={14} /> Sous-catégories :
          </span>

          <button
            onClick={() => setSubFilter('all')}
            style={{
              padding: '0.4rem 1.1rem',
              borderRadius: '8px',
              border: subFilter === 'all' ? '2px solid #10b981' : '1px solid #cbd5e1',
              backgroundColor: subFilter === 'all' ? '#10b981' : 'white',
              color: subFilter === 'all' ? 'white' : '#475569',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: subFilter === 'all' ? '0 4px 10px rgba(16, 185, 129, 0.25)' : 'none'
            }}
          >
            Toutes
          </button>

          {availableSubcategories.map((subCat) => {
            const isActive = subFilter === subCat;
            return (
              <button
                key={subCat}
                onClick={() => setSubFilter(subCat)}
                style={{
                  padding: '0.4rem 1.1rem',
                  borderRadius: '8px',
                  border: isActive ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: isActive ? '#2563eb' : 'white',
                  color: isActive ? 'white' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 10px rgba(37, 99, 235, 0.25)' : 'none'
                }}
              >
                ↳ {subCat}
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Grille des Réalisations */}
      <MotionSection style={{ marginTop: '4rem', minHeight: '400px' }}>
        <AnimatePresence mode="wait">
          {filteredProjects.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ textAlign: 'center', width: '100%' }}
            >
              <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(var(--primary-rgb), 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 2rem',
                color: 'var(--primary-color)'
              }}>
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>{t('projects.placeholder')}</h3>
              <p style={{ color: 'var(--text-light)', maxWidth: '500px', margin: '0 auto' }}>
                {filter === 'all' 
                  ? "Nous préparons actuellement la présentation de nos derniers dossiers. Revenez bientôt pour découvrir notre travail sur le terrain."
                  : `Aucune réalisation correspondant au filtre sélectionné pour le moment.`}
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid" 
              style={{ width: '100%', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}
            >
              {filteredProjects.map((project) => {
                const catObj = categories.find(c => c.id === project.category || (c.id === 'foncier' && project.category === 'geometre'));
                const displayCategory = catObj?.label || project.category;

                return (
                  <GlassCard 
                    key={project.id} 
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    innerStyle={{ height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}
                  >
                    <div style={{ position: 'relative', height: '240px', flexShrink: 0, overflow: 'hidden', borderRadius: 'var(--border-radius-md) var(--border-radius-md) 0 0' }}>
                      <Image
                        src={project.image_after || project.images_gallery?.[0] || '/og-image.png'}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 350px"
                        style={{ objectFit: 'cover' }}
                      />
                      
                      {/* Badges Catégorie et Sous-catégorie */}
                      <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                        <div style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '0.35rem 0.85rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                          {displayCategory}
                        </div>
                        {project.subcategory && (
                          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', color: 'var(--secondary-color)', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '700', backdropFilter: 'blur(4px)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            {project.subcategory}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <p style={{ color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                          📍 {project.location}
                        </p>
                        <h3 style={{ fontSize: '1.5rem', color: 'var(--secondary-color)', marginBottom: '1rem' }}>{project.title}</h3>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-light)', lineClamp: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {project.description}
                        </p>
                      </div>

                      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column' }}>
                        {project.missions && Array.isArray(project.missions) && project.missions.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            {project.missions.slice(0, 3).map((mission, idx) => (
                              <span key={idx} style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', backgroundColor: '#f1f5f9', borderRadius: '4px', color: '#64748b' }}>
                                {mission}
                              </span>
                            ))}
                          </div>
                        )}
                        <Link 
                          href={`/projets/${project.slug || project.id}`}
                          className="btn btn-outline" 
                          style={{ width: '100%', textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: 'auto' }}
                        >
                          Voir les détails
                        </Link>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </MotionSection>

      <div style={{ marginTop: '6rem', textAlign: 'center' }}>
        <GlassCard style={{ padding: '3.5rem 2rem', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: 'var(--border-radius-lg)', boxShadow: '0 15px 35px rgba(121, 160, 129, 0.25)' }}>
          <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>{t('expertise.cta_title')}</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
            {t('expertise.cta_desc')}
          </p>
          <Magnetic strength={0.35}>
            <Link 
              href="/contact" 
              className="btn" 
              style={{ 
                backgroundColor: 'white', 
                color: 'var(--secondary-color)', 
                fontWeight: '700', 
                padding: '0.9rem 2.2rem', 
                borderRadius: '50px',
                textDecoration: 'none',
                display: 'inline-block',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                fontSize: '1rem'
              }} 
              aria-label="Nous contacter pour un projet"
            >
              {t('expertise.cta_btn')}
            </Link>
          </Magnetic>
        </GlassCard>
      </div>
    </div>
  );
}
