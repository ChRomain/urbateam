'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
import { useLanguage } from '../context/LanguageContext';

export default function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { language, switchLanguage, t } = useLanguage();

  const navLinks = [
    { name: t('header.home'), href: '/' },
    { name: t('header.about'), href: '/apropos' },
    { name: t('header.expertises'), href: '/mon-projet' },
    { name: t('header.technical'), href: '/moyens-techniques' },
    { name: t('header.faq'), href: '/faq' },
    { name: t('header.contact'), href: '/contact', primary: true },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const menuVariants = {
    closed: { opacity: 0, x: "100%", transition: { type: "spring", stiffness: 400, damping: 40 } },
    open: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 400, damping: 40, staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const linkVariants = {
    closed: { x: 50, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  const flags = {
    fr: { label: 'FR', icon: '🇫🇷' },
    en: { label: 'EN', icon: '🇬🇧' },
    br: { label: 'BZH', icon: <img src="/pictures/flag-br.png" alt="BZH" width="20" height="20" style={{ objectFit: 'cover', borderRadius: '2px' }} /> }
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.container}`}>
        <Link href="/" className={styles.logo} onClick={() => setIsOpen(false)}>
          <div className={styles.logoText}>
            <span className={styles.urba}>URBA</span>
            <span className={styles.team}>team</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <ul className={styles.navLinks}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href} 
                  className={link.primary ? 'btn btn-primary' : styles.navLink}
                  onMouseEnter={() => router.prefetch(link.href)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            
            {/* Language Switcher */}
            <li 
              key="language-switcher"
              className={styles.langWrapper}
              onMouseEnter={() => setLangOpen(true)}
              onMouseLeave={() => setLangOpen(false)}
            >
              <button className={styles.langTrigger}>
                <span className={styles.flagIcon}>{flags[language].icon}</span>
                <span className={styles.langLabel}>{flags[language].label}</span>
                <ChevronDown size={14} className={`${styles.chevron} ${langOpen ? styles.chevronRotated : ''}`} />
              </button>
              
              <AnimatePresence>
                {langOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={styles.langDropdown}
                  >
                    {Object.keys(flags).filter(l => l !== language).map(lang => (
                      <button 
                        key={lang} 
                        onClick={() => {
                          switchLanguage(lang);
                          setLangOpen(false);
                        }}
                        className={styles.langOption}
                      >
                        <span className={styles.flagIcon}>{flags[lang].icon}</span>
                        {flags[lang].label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </ul>
        </nav>

        {/* Mobile Toggle */}
        <div className={styles.mobileControls}>
          {/* Mobile Lang Button - cycles through lang */}
          <button 
            className={styles.mobileLangBtn}
            onClick={() => {
              const nextLang = language === 'fr' ? 'en' : language === 'en' ? 'br' : 'fr';
              switchLanguage(nextLang);
            }}
          >
            <span key={language}>
              {flags[language === 'fr' ? 'en' : language === 'en' ? 'br' : 'fr'].icon}
            </span>
          </button>
          
          <button 
            className={styles.mobileToggle} 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className={styles.mobileMenu}
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <div className={styles.mobileMenuInner}>
                <nav className={styles.mobileNav}>
                  {navLinks.map((link) => (
                    <motion.div key={link.href} variants={linkVariants}>
                      <Link 
                        href={link.href} 
                        className={styles.mobileNavLink}
                        onClick={() => setIsOpen(false)}
                      >
                        {link.name}
                        <ArrowRight size={20} className={styles.itemArrow} />
                      </Link>
                    </motion.div>
                  ))}
                </nav>
                
                <motion.div 
                  className={styles.mobileFooter}
                  variants={linkVariants}
                >
                  <p>📍 Saint-Renan & Douarnenez</p>
                  <a href="tel:+33298842965" className={styles.mobilePhone}>+33 2 98 84 29 65</a>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
