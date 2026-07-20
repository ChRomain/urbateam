'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function GlossaryTooltip() {
  const { t, language } = useLanguage();
  const [apiItems, setApiItems] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [placement, setPlacement] = useState('top');
  
  const hoverTimer = useRef(null);
  const hideTimer = useRef(null);
  const tooltipRef = useRef(null);

  // Fetch glossary from API on mount
  useEffect(() => {
    fetch('/api/glossary')
      .then(res => {
        if (!res.ok) throw new Error('API response error');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setApiItems(data);
        }
      })
      .catch(err => {
        console.warn('[GlossaryTooltip] Could not load API items, fallback will be used:', err);
      });
  }, []);

  // Format terms list based on active language
  const glossaryItems = useMemo(() => {
    const staticItems = t('glossary.items') || [];
    
    if (apiItems.length > 0) {
      return apiItems.map(item => ({
        term: item[`term_${language}`] || item.term_fr || '',
        definition: item[`definition_${language}`] || item.definition_fr || '',
      }));
    }
    
    return staticItems.map(item => ({
      term: item.term || '',
      definition: item.definition || '',
    }));
  }, [apiItems, language, t]);

  const startHideTimer = () => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
    }, 300); // 300ms to comfortably move mouse to tooltip
  };

  useEffect(() => {
    const handleMouseOver = (e) => {
      const link = e.target.closest('.wiki-link');
      if (!link) return;

      // Extract search query from href or use link text
      let searchTerm = '';
      try {
        const href = link.getAttribute('href');
        if (href) {
          const url = new URL(href, window.location.origin);
          searchTerm = url.searchParams.get('search') || '';
        }
      } catch (err) {
        // Fallback
      }

      if (!searchTerm) {
        searchTerm = link.textContent || '';
      }

      searchTerm = searchTerm.trim().toLowerCase();
      if (!searchTerm) return;

      // Find matching item
      const match = glossaryItems.find(item => {
        const termNorm = item.term.toLowerCase().trim();
        return (
          termNorm === searchTerm ||
          termNorm.startsWith(searchTerm + ' ') ||
          termNorm.includes(' / ' + searchTerm) ||
          termNorm.includes(searchTerm + ' /') ||
          termNorm.includes('(' + searchTerm + ')') ||
          searchTerm.includes(termNorm)
        );
      });

      if (match) {
        clearTimeout(hideTimer.current);
        clearTimeout(hoverTimer.current);

        hoverTimer.current = setTimeout(() => {
          // Position calculation
          const rect = link.getBoundingClientRect();
          const tooltipWidth = 320;
          
          let x = rect.left + rect.width / 2 - tooltipWidth / 2;
          let y = rect.top - 12; // 12px gap
          let currentPlacement = 'top';

          // Prevent left boundary overflow
          if (x < 10) x = 10;
          // Prevent right boundary overflow
          if (x + tooltipWidth > window.innerWidth - 10) {
            x = window.innerWidth - tooltipWidth - 10;
          }

          // If not enough space on top, show below
          if (rect.top < 180) {
            y = rect.bottom + 12;
            currentPlacement = 'bottom';
          }

          setCoords({ x, y });
          setPlacement(currentPlacement);
          setActiveItem(match);
          setVisible(true);
        }, 150);
      }
    };

    const handleMouseOut = (e) => {
      const link = e.target.closest('.wiki-link');
      if (!link) return;

      clearTimeout(hoverTimer.current);
      startHideTimer();
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      clearTimeout(hoverTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, [glossaryItems]);

  const handleTooltipEnter = () => {
    clearTimeout(hideTimer.current);
  };

  const handleTooltipLeave = () => {
    startHideTimer();
  };

  if (!activeItem) return null;

  return (
    <div
      ref={tooltipRef}
      className={`glossary-tooltip ${visible ? 'visible' : ''} placement-${placement}`}
      style={{
        position: 'fixed',
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        zIndex: 9999,
      }}
      onMouseEnter={handleTooltipEnter}
      onMouseLeave={handleTooltipLeave}
    >
      <div className="glossary-tooltip-content">
        <h4 className="glossary-tooltip-title">{activeItem.term}</h4>
        <p className="glossary-tooltip-definition">{activeItem.definition}</p>
        <div className="glossary-tooltip-footer">
          <a
            href={`/lexique?search=${encodeURIComponent(activeItem.term)}`}
            className="glossary-tooltip-link"
          >
            {language === 'en'
              ? 'Learn more'
              : language === 'br'
              ? "Gouzout muioc'h"
              : 'En savoir plus'}{' '}
            <span className="arrow">&rarr;</span>
          </a>
        </div>
      </div>
      <div className="glossary-tooltip-arrow" />
    </div>
  );
}
