import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Auth from '../pages/Auth';
import { expect, test, describe, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock do supabase e hooks
vi.mock('../../utils/supabase', () => ({
  default: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn()
    }
  }
}));

// Mock do toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('Auth Component', () => {
  test('renders login form by default', () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );
    
    // Verifica se os elementos do Login estão presentes
    expect(screen.getByText('Acessar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  test('switches to register form when clicking "Cadastre-se aqui"', () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );
    
    const registerButton = screen.getByText(/Cadastre-se aqui/i);
    fireEvent.click(registerButton);
    
    // Verifica se mudou para a tela de registro
    expect(screen.getByText(/Criar Conta/i)).toBeInTheDocument();
  });
});
