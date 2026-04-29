import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../app/Header';
import { LanguageProvider } from '../context/LanguageContext';
import React from 'react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
}));

const renderWithProvider = (ui) => {
  return render(
    <LanguageProvider>
      {ui}
    </LanguageProvider>
  );
};

describe('Header Component', () => {
  it('renders the logo', () => {
    renderWithProvider(<Header />);
    expect(screen.getByText('URBA')).toBeInTheDocument();
    expect(screen.getByText('team')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithProvider(<Header />);
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('À propos')).toBeInTheDocument();
    expect(screen.getByText('Expertises')).toBeInTheDocument();
  });

  it('shows dropdown on hover/click (desktop logic)', async () => {
    renderWithProvider(<Header />);
    const expertiseTrigger = screen.getByText('Expertises');
    
    // In our implementation, we use onMouseEnter to show dropdown
    fireEvent.mouseEnter(expertiseTrigger.parentElement);
    
    // The dropdown items should appear
    expect(await screen.findByText('Urbanisme & Paysage')).toBeInTheDocument();
  });

  it('toggles mobile menu', () => {
    renderWithProvider(<Header />);
    const toggle = screen.getByLabelText('Toggle menu');
    
    fireEvent.click(toggle);
    
    // Check if mobile nav link is visible
    const mobileLinks = screen.getAllByText('Accueil');
    expect(mobileLinks.length).toBeGreaterThan(1); // One for desktop, one for mobile
  });
});
