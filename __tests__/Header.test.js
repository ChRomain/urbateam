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
    expect(screen.getByText('Le Cabinet')).toBeInTheDocument();
    expect(screen.getByText('Nos activités')).toBeInTheDocument();
    expect(screen.getByText('Nos Projets')).toBeInTheDocument();
  });

  it('renders "Nos Projets" as a direct link', () => {
    renderWithProvider(<Header />);
    const portfolioLink = screen.getByRole('link', { name: 'Nos Projets' });
    expect(portfolioLink).toBeInTheDocument();
    expect(portfolioLink).toHaveAttribute('href', '/projets');
  });

  it('toggles mobile menu', () => {
    renderWithProvider(<Header />);
    const toggle = screen.getByLabelText('Toggle menu');
    
    fireEvent.click(toggle);
    
    // Check if mobile nav link is visible
    const mobileLinks = screen.getAllByText('Le Cabinet');
    expect(mobileLinks.length).toBeGreaterThan(1); // One for desktop, one for mobile
  });
});
