import { render, screen } from '@testing-library/react';
import ExpertiseClient from '../app/expertise/[slug]/ExpertiseClient';
import { LanguageProvider } from '../context/LanguageContext';
import React from 'react';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy(
      {},
      {
        get: (target, prop) => {
          return ({ children, ...props }) => React.createElement(prop, props, children);
        },
      }
    ),
    AnimatePresence: ({ children }) => children,
  };
});

const renderWithProvider = (ui) => {
  return render(
    <LanguageProvider>
      {ui}
    </LanguageProvider>
  );
};

describe('ExpertiseClient', () => {
  it('renders expertise title and description for "urbanisme"', () => {
    renderWithProvider(<ExpertiseClient slug="urbanisme" />);
    
    // Check for title in PageHeader (h1)
    expect(screen.getByRole('heading', { name: 'Urbanisme et Paysage', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/URBATEAM accompagne les collectivités/)).toBeInTheDocument();
  });

  it('renders specific missions', () => {
    renderWithProvider(<ExpertiseClient slug="urbanisme" />);
    
    expect(screen.getByText('Études de faisabilité urbaine')).toBeInTheDocument();
    expect(screen.getByText('Conception d\'Éco-quartiers & ZAC')).toBeInTheDocument();
  });

  it('renders 404 for unknown slug', () => {
    renderWithProvider(<ExpertiseClient slug="unknown" />);
    
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Expertise non trouvée')).toBeInTheDocument();
  });
});
