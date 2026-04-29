import { render, screen, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import React from 'react';

const TestComponent = ({ path }) => {
  const { t, switchLanguage, language } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="trans">{t(path)}</span>
      <button onClick={() => switchLanguage('en')}>Switch to EN</button>
    </div>
  );
};

describe('LanguageContext', () => {
  it('should have "fr" as default language and translate correctly', () => {
    render(
      <LanguageProvider>
        <TestComponent path="header.home" />
      </LanguageProvider>
    );
    
    expect(screen.getByTestId('lang')).toHaveTextContent('fr');
    expect(screen.getByTestId('trans')).toHaveTextContent('Accueil');
  });

  it('should switch language and update translation', () => {
    render(
      <LanguageProvider>
        <TestComponent path="header.home" />
      </LanguageProvider>
    );
    
    const button = screen.getByText('Switch to EN');
    act(() => {
      button.click();
    });
    
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(screen.getByTestId('trans')).toHaveTextContent('Home');
  });

  it('should return keypath if translation is missing', () => {
    render(
      <LanguageProvider>
        <TestComponent path="non.existent.key" />
      </LanguageProvider>
    );
    expect(screen.getByTestId('trans')).toHaveTextContent('non.existent.key');
  });
});
