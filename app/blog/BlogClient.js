'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export default function BlogClient({ posts }) {
  const { t } = useLanguage();
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = posts.filter(post => 
      post.title.toLowerCase().includes(query) || 
      post.content.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query))
    );
    setFilteredPosts(filtered);
  }, [searchQuery, posts]);

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('header.blog')} 
        subtitle="Suivez l'actualité d'URBATEAM et les évolutions de la réglementation foncière."
      />

      {/* Search Bar */}
      <div style={{ maxWidth: '600px', margin: '3rem auto 0', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Rechercher un article, un mot-clé..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '1.2rem 1.2rem 1.2rem 3.5rem', 
            borderRadius: '50px', 
            border: '1px solid var(--glass-border)', 
            backgroundColor: 'var(--glass-bg)',
            fontSize: '1.1rem',
            boxShadow: 'var(--shadow-md)',
            outline: 'none',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
        />
      </div>

      {posts.length === 0 ? (
        <MotionSection style={{ marginTop: '4rem', textAlign: 'center' }}>
          <div style={{ padding: '6rem 2rem', backgroundColor: 'rgba(var(--primary-rgb), 0.05)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Espace Actualités en préparation</h2>
            <p style={{ color: 'var(--secondary-color)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
              Bientôt, retrouvez ici nos conseils d'experts, nos retours d'expérience sur le terrain et les dernières nouvelles du cabinet.
            </p>
          </div>
        </MotionSection>
      ) : filteredPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem' }}>
          <p style={{ fontSize: '1.2rem', color: '#64748b' }}>Aucun article ne correspond à votre recherche "<strong>{searchQuery}</strong>".</p>
          <button onClick={() => setSearchQuery('')} style={{ marginTop: '1rem', color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700' }}>Voir tous les articles</button>
        </div>
      ) : (
        <div className="grid grid-cols-3" style={{ gap: '2.5rem', marginTop: '4rem' }}>
          {filteredPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <a href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <GlassCard style={{ padding: 0, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', height: '220px', overflow: 'hidden' }}>
                    <img 
                      src={post.featuredImage || '/placeholder-blog.jpg'} 
                      alt={post.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </div>
                  <div style={{ padding: '2rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      {post.tags.map(tag => (
                        <span key={tag} style={{ fontSize: '0.75rem', backgroundColor: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary-color)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: '600' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary-color)', marginBottom: '1rem', lineHeight: '1.3' }}>{post.title}</h3>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                      {post.excerpt || (post.content.substring(0, 120).replace(/<[^>]*>/g, '') + '...')}
                    </p>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-color)' }}>Lire la suite →</span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }} suppressHydrationWarning>
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
