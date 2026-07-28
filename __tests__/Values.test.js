import { render, screen } from '@testing-library/react';
import React from 'react';
import { LanguageProvider } from '../context/LanguageContext';
import Values from '../components/Values';

beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() { return []; }
    unobserve() {}
  };
});

describe('Values Component', () => {
  it('renders the values section title and all 4 value cards', () => {
    render(
      <LanguageProvider>
        <Values />
      </LanguageProvider>
    );

    expect(screen.getByText("LES VALEURS QUI GUIDENT NOTRE ACTION")).toBeInTheDocument();
    expect(screen.getByText("L'éthique professionnelle")).toBeInTheDocument();
    expect(screen.getByText("Le conseil")).toBeInTheDocument();
    expect(screen.getByText("La précision")).toBeInTheDocument();
    expect(screen.getByText("L'esprit d'équipe")).toBeInTheDocument();
  });
});
