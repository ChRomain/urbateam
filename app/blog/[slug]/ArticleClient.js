'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '../../../components/PageHeader';
import { ArrowLeft, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ArticleClient({ post }) {
  const router = useRouter();
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(new Date(post.date).toLocaleDateString());
  }, [post.date]);

  return (
    <div className="container py-section" style={{ maxWidth: '900px' }}>
      <button 
        onClick={() => router.back()}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          background: 'none', 
          border: 'none', 
          color: 'var(--primary-color)', 
          fontWeight: '600', 
          cursor: 'pointer',
          marginBottom: '2rem'
        }}
      >
        <ArrowLeft size={20} /> Retour aux articles
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {post.tags.map(tag => (
              <span key={tag} style={{ fontSize: '0.8rem', backgroundColor: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary-color)', padding: '0.3rem 0.8rem', borderRadius: '4px', fontWeight: '600' }}>
                {tag}
              </span>
            ))}
          </div>
          <h1 style={{ fontSize: '3rem', color: 'var(--secondary-color)', marginBottom: '1.5rem', lineHeight: '1.2' }}>{post.title}</h1>
          
          <div style={{ display: 'flex', gap: '2rem', color: '#64748b', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} /> {post.author}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} /> {formattedDate}
            </div>
          </div>
        </div>

        {post.featuredImage && (
          <div style={{ 
            width: '100%', 
            height: '500px', 
            borderRadius: 'var(--border-radius-lg)', 
            overflow: 'hidden', 
            marginBottom: '4rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <img src={post.featuredImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div 
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{ 
            fontSize: '1.2rem', 
            lineHeight: '1.8', 
            color: 'var(--secondary-color)',
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-md)'
          }}
        />
      </motion.div>

      <style jsx global>{`
        .blog-content h1, .blog-content h2, .blog-content h3 {
          color: var(--primary-color);
          margin-top: 2.5rem;
          margin-bottom: 1.5rem;
        }
        .blog-content p {
          margin-bottom: 1.5rem;
        }
        .blog-content ul {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
        }
        .blog-content img {
          max-width: 100%;
          border-radius: 8px;
          margin: 2rem 0;
        }
        .blog-content a {
          color: var(--primary-color);
          text-decoration: underline;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
