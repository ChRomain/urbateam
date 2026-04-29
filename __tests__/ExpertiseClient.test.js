import { render, screen } from '@testing-library/react';
import ExpertiseClient from '../app/expertise/[slug]/ExpertiseClient';
import { LanguageProvider } from '../context/LanguageContext';
import React from 'react';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => children,
}));

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
    expect(screen.getByRole('heading', { name: 'Urbanisme & Paysage', level: 1 })).toBeInTheDocument();
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
