import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '../components/ui/Button';
import { BrowserRouter } from 'react-router-dom';

describe('Button Component', () => {
  it('affiche correctement le texte', () => {
    render(<Button>Cliquez-moi</Button>);
    expect(screen.getByText('Cliquez-moi')).toBeInTheDocument();
  });

  it('affiche un spinner quand loading est vrai', () => {
    render(<Button loading>Chargement</Button>);
    // Le spinner est représenté par la classe animate-spin
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('est désactivé quand disabled est vrai', () => {
    render(<Button disabled>Bouton</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('se comporte comme un Link quand le prop "to" est fourni', () => {
    render(
      <BrowserRouter>
        <Button to="/test">Lien</Button>
      </BrowserRouter>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
  });
});
