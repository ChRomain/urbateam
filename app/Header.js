'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
import { useLanguage } from '../context/LanguageContext';
import { usePathname } from 'next/navigation';
import Magnetic from '../components/Magnetic';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { language, switchLanguage, t } = useLanguage();

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

  const [activeDropdown, setActiveDropdown] = useState(null);

  if (pathname?.includes('/interface-admin-urbateam-inc')) {
    return null;
  }

  const expertiseLinks = [
    { name: t('expertise.items.urbanisme.title'), href: '/expertise/urbanisme' },
    { name: t('expertise.items.geometre.title'), href: '/expertise/geometre' },
    { name: t('expertise.items.vrd.title'), href: '/expertise/vrd' },
    { name: t('expertise.items.sport.title'), href: '/expertise/sport' },
    { name: t('expertise.items.topographie.title'), href: '/expertise/topographie' },
    { name: t('expertise.items.copropriete.title'), href: '/expertise/copropriete' },
  ];

  const portfolioLinks = [
    { name: t('header.projects'), href: '/projets' },
    { name: t('header.clients'), href: '/clients' },
    { name: t('header.partners'), href: '/partenaires' },
  ];

  const resourceLinks = [
    { name: t('header.my_project'), href: '/mon-projet' },
    { name: t('header.follow_us'), href: '/nous-suivre' },
    { name: t('header.faq'), href: '/faq' },
    { name: t('meta.rse.title').split('|')[0].trim(), href: '/rse' },
    { name: t('header.glossary'), href: '/lexique' },
    { name: t('header.blog'), href: '/blog' },
  ];

  const navLinks = [
    { name: t('header.about'), href: '/apropos' },
    { name: t('header.expertises'), href: '#', dropdown: expertiseLinks },
    { name: t('header.portfolio'), href: '#', dropdown: portfolioLinks },
    { name: t('header.technical'), href: '/moyens-techniques' },
    { name: t('header.resources_dropdown'), href: '#', dropdown: resourceLinks },
    { name: t('header.contact'), href: '/contact', primary: true },
  ];

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
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`} data-lang={language}>
      <div className={`container ${styles.container}`}>
        <Link href="/" className={styles.logo} onClick={() => setIsOpen(false)}>
          <Magnetic strength={0.15}>
            <motion.div 
              className={styles.logoText}
              style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
              whileHover="hover"
            >
              <motion.span 
                className={styles.urba}
                variants={{
                  hover: { 
                    rotateY: 15, 
                    rotateX: -10,
                    translateZ: 50,
                    textShadow: "0 10px 20px rgba(0,0,0,0.1)"
                  }
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                URBA
              </motion.span>
              <motion.span 
                className={styles.team}
                variants={{
                  hover: { 
                    rotateY: 25, 
                    rotateX: -15,
                    translateZ: 20,
                    translateX: 5,
                    textShadow: "0 5px 15px rgba(0,0,0,0.1)"
                  }
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                team
              </motion.span>
            </motion.div>
          </Magnetic>
        </Link>

        <nav className={styles.desktopNav}>
          <ul className={styles.navLinks}>
            {navLinks.map((link) => (
              <li 
                key={link.name} 
                className={link.dropdown ? styles.hasDropdown : ''}
                onMouseEnter={() => link.dropdown && setActiveDropdown(link.name)}
                onMouseLeave={() => link.dropdown && setActiveDropdown(null)}
              >
                {link.dropdown ? (
                  <div className={styles.dropdownTrigger}>
                    <Magnetic strength={0.2}>
                      <Link href={link.href} className={styles.navLink}>
                        {link.name} <ChevronDown size={14} className={`${styles.chevron} ${activeDropdown === link.name ? styles.chevronRotated : ''}`} />
                      </Link>
                    </Magnetic>
                    <AnimatePresence>
                      {activeDropdown === link.name && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className={styles.dropdownMenu}
                        >
                          {link.dropdown.map(sub => (
                            <Link key={sub.href} href={sub.href} className={styles.dropdownItem}>
                              {sub.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Magnetic strength={0.25}>
                    <Link 
                      href={link.href} 
                      className={link.primary ? 'btn btn-primary' : styles.navLink}
                      onMouseEnter={() => router.prefetch(link.href)}
                    >
                      {link.name}
                    </Link>
                  </Magnetic>
                )}
              </li>
            ))}
            
            <li 
              key="language-switcher"
              className={styles.langWrapper}
              onMouseEnter={() => setLangOpen(true)}
              onMouseLeave={() => setLangOpen(false)}
            >
              <Magnetic strength={0.15}>
                <button className={styles.langTrigger}>
                  <span className={styles.flagIcon}>{flags[language].icon}</span>
                  <span className={styles.langLabel}>{flags[language].label}</span>
                  <ChevronDown size={14} className={`${styles.chevron} ${langOpen ? styles.chevronRotated : ''}`} />
                </button>
              </Magnetic>
              
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

        <div className={styles.mobileControls}>
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
                    <motion.div key={link.name} variants={linkVariants}>
                      <Link 
                        href={link.href} 
                        className={styles.mobileNavLink}
                        onClick={() => setIsOpen(false)}
                      >
                        {link.name}
                        {!link.dropdown && <ArrowRight size={20} className={styles.itemArrow} />}
                      </Link>
                      {link.dropdown && (
                        <div className={styles.mobileSubNav}>
                          {link.dropdown.map(sub => (
                            <Link 
                              key={sub.href} 
                              href={sub.href} 
                              className={styles.mobileSubNavLink}
                              onClick={() => setIsOpen(false)}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
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
