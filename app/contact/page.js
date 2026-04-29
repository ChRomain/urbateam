"use client";

import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import MotionSection from '../../components/MotionSection';
import GlassCard from '../../components/GlassCard';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    nom: '',
    motif: t('contact.form.motifs.urban'),
    email: '',
    telephone: '',
    message: '',
    captcha: '',
    website_hp: '' // Honeypot field
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === '1') {
      setSubmitted(true);
    } else if (params.get('error') === '1') {
      setError(t('contact.form.error_tech'));
    }
  }, [t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientValidation = (e) => {
    // Honeypot check: if this field is filled, it's likely a bot
    if (formData.website_hp !== '') {
      e.preventDefault();
      console.warn("Honeypot triggered");
      return;
    }

    if (formData.captcha !== '7') {
      e.preventDefault();
      setError(t('contact.form.error_captcha'));
    }
  };

  return (
    <div className="container py-section">
      <PageHeader 
        title={t('contact.header.title')} 
        subtitle={t('contact.header.subtitle')}
      />

      <div className="grid grid-cols-2" style={{ marginTop: '2rem' }}>
        {/* Contact Info */}
        <MotionSection>
          <h2 style={{ color: 'var(--secondary-color)', marginBottom: '2rem' }}>{t('contact.info.title')}</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>📍 {t('contact.info.renan')}</h3>
            <p style={{ color: 'var(--text-light)' }}>
              10 Rue Joseph le Velly<br />
              29290 Saint-Renan, France<br />
              📞 <a href="tel:+33298842965" style={{ fontWeight: 'bold' }}>+33 2 98 84 29 65</a>
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>📍 {t('contact.info.douarnenez')}</h3>
            <p style={{ color: 'var(--text-light)' }}>
              Za Ste Croix, 5 Rue Breizh Izel<br />
              29100 Douarnenez, France<br />
              📞 <a href="tel:+33298920756" style={{ fontWeight: 'bold' }}>+33 2 98 92 07 56</a>
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>✉️ {t('contact.info.email_label')}</h3>
            <p style={{ color: 'var(--text-light)' }}>
              <a href="mailto:contact@urbateam.fr" style={{ fontWeight: 'bold' }}>contact@urbateam.fr</a>
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🕒 {t('contact.info.hours_label')}</h3>
            <ul style={{ color: 'var(--text-light)', listStyle: 'none', padding: 0 }}>
              <li><strong>{t('contact.info.hours.mon')}</strong> 09:00 - 12:00, 14:00 - 18:00</li>
              <li><strong>{t('contact.info.hours.tue')}</strong> 09:00 - 12:00, 14:00 - 18:00</li>
              <li><strong>{t('contact.info.hours.wed')}</strong> {t('contact.info.hours.closed')}</li>
              <li><strong>{t('contact.info.hours.thu')}</strong> 09:00 - 12:00, 14:00 - 18:00</li>
              <li><strong>{t('contact.info.hours.fri')}</strong> 09:00 - 12:00, 14:00 - 18:00</li>
              <li><strong>{t('contact.info.hours.sat_sun')}</strong> {t('contact.info.hours.closed')}</li>
            </ul>
          </div>
        </MotionSection>

        {/* Contact Form */}
        <GlassCard>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>{t('contact.form.title')}</h2>
          {submitted ? (
            <div style={{ padding: '2rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', textAlign: 'center' }}>
              <h3>{t('contact.form.success_title')}</h3>
              <p>{t('contact.form.success_p')}</p>
            </div>
          ) : (
            <form action="/contact.php" method="POST" encType="multipart/form-data" onSubmit={handleClientValidation}>
              {error && <div style={{ color: '#dc2626', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}
              
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="nom" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('contact.form.label_name')}</label>
                <input type="text" id="nom" name="nom" required value={formData.nom} onChange={handleChange} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('contact.form.label_email')}</label>
                <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="telephone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('contact.form.label_phone')}</label>
                <input type="tel" id="telephone" name="telephone" value={formData.telephone} onChange={handleChange} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="motif" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('contact.form.label_motif')}</label>
                <select id="motif" name="motif" required value={formData.motif} onChange={handleChange}>
                  <option value={t('contact.form.motifs.urban')}>{t('contact.form.motifs.urban')}</option>
                  <option value={t('contact.form.motifs.infra')}>{t('contact.form.motifs.infra')}</option>
                  <option value={t('contact.form.motifs.topo')}>{t('contact.form.motifs.topo')}</option>
                  <option value={t('contact.form.motifs.surveyor')}>{t('contact.form.motifs.surveyor')}</option>
                  <option value={t('contact.form.motifs.sport')}>{t('contact.form.motifs.sport')}</option>
                  <option value={t('contact.form.motifs.other')}>{t('contact.form.motifs.other')}</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('contact.form.label_message')}</label>
                <textarea id="message" name="message" rows="5" required value={formData.message} onChange={handleChange}></textarea>
              </div>

              {/* Dépôt de Pièces Jointes */}
              <div style={{ marginBottom: '1.5rem', padding: '1.5rem', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <label htmlFor="attachment" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                  {t('contact.form.label_attachment')}
                </label>
                <input type="file" id="attachment" name="attachment[]" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style={{ width: '100%' }} />
                <small style={{ color: 'var(--text-light)', display: 'block', marginTop: '0.5rem', lineHeight: '1.4' }}>
                  {t('contact.form.attachment_help')}
                </small>
              </div>

              {/* Honeypot field - hidden from humans */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <input 
                  type="text" 
                  name="website_hp" 
                  tabIndex="-1" 
                  autoComplete="off" 
                  value={formData.website_hp} 
                  onChange={handleChange} 
                />
              </div>

              {/* Anti-Flood simple */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="captcha" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('contact.form.label_captcha')}</label>
                <input type="text" id="captcha" name="captcha" required value={formData.captcha} onChange={handleChange} placeholder={t('contact.form.captcha_placeholder')} />
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <input 
                  type="checkbox" 
                  id="rgpd" 
                  name="rgpd" 
                  required 
                  style={{ width: 'auto', marginTop: '4px', cursor: 'pointer' }} 
                />
                <label htmlFor="rgpd" style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4', cursor: 'pointer' }}>
                  {t('contact.form.label_rgpd_prefix')}
                  <a href="/vieprivee" target="_blank" style={{ textDecoration: 'underline', color: 'var(--secondary-color)' }}>
                    {t('contact.form.label_rgpd_link')}
                  </a>. *
                </label>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginBottom: '1.5rem' }}
              >
                {t('contact.form.btn_send')}
              </motion.button>
              
              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', lineHeight: 1.4, textAlign: 'center' }}>
                {t('contact.form.footer_note')}
              </p>
            </form>
          )}
        </GlassCard>
      </div>

      <MotionSection style={{ marginTop: '4rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>{t('contact.map.title')}</h2>
        <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
          <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
            <h3 style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--secondary-color)' }}>{t('contact.map.renan')}</h3>
            <div style={{ width: '100%', height: '350px' }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5293.370467000001!2d-4.6247953!3d48.4334336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4816c02eb9255555%3A0xc3cf3337a5f973e2!2s10%20Rue%20Joseph%20le%20Velly%2C%2029290%20Saint-Renan!5e0!3m2!1sfr!2sfr!4v1700000000001" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
          </GlassCard>
          <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
            <h3 style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--secondary-color)' }}>{t('contact.map.douarnenez')}</h3>
            <div style={{ width: '100%', height: '350px' }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10000.0!2d-4.311875!3d48.0836644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4816d12be68d1437%3A0x33f58e0a7273e653!2sUrbateam%20SARL!5e0!3m2!1sfr!2sfr!4v1713931662998!5m2!1sfr!2sfr" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
          </GlassCard>
        </div>
      </MotionSection>
    </div>
  );
}
