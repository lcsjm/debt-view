import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/dashboard';
import { expect, it, describe, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mocks do Supabase para evitar chamadas de API reais
vi.mock('../../utils/supabase', () => ({
  default: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              maybeSingle: vi.fn(() => Promise.resolve({ 
                data: { 
                  fixedIncome: 5000, 
                  variableIncome: 1000, 
                  fixedExpenses: 2000, 
                  variableExpenses: 500, 
                  investments: 300 
                }, 
                error: null 
              })),
              single: vi.fn(() => Promise.resolve({ data: null, error: null }))
            }))
          }))
        }))
      }))
    }))
  }
}));

// Mock do Contexto de Autenticação
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { 
      id: 'test-user-123', 
      email: 'alexia@example.com',
      user_metadata: { name: 'Alexia' }
    }
  })
}));

// Mock do Hook de Perfil
vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({
    profile: { name: 'Alexia Santos' },
    loading: false
  })
}));

// Mock do componente Recharts (usado no ChartsSection/AssistentSection) 
// para evitar erros de renderização no ambiente de teste JSDOM
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: () => <div data-testid="pie-chart" />,
  Pie: () => null,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

describe("Comportamento do Dashboard.tsx", () => {
    
    it(" Analisar o comportamento dessa pagina", async () => {
        // Rotina: tipo :Funcional ; entrada:Fazer Cadastro; saída esperada:Entrar na Dashboard, possuir uma funcionalidade intuitiva;
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Dashboard DebtView/i)).toBeInTheDocument();
            expect(screen.getByText(/Bem-vindo de volta, Alexia Santos/i)).toBeInTheDocument();
        });
    });

    it(" Se há alguma dificuldade de entendimento (se está confuso) no frontend.", async () => {
        // Rotina: tipo :exploratório ; entrada:Ver resultados do Raio-X Financeiro; saída esperada:Gráfico com os valores inseridos, possibilidade de entendimento do usuário.;
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        await waitFor(() => {
            const raidXTitle = screen.getAllByText(/Raio-X Financeiro/i);
            expect(raidXTitle.length).toBeGreaterThan(0);
        });
    });

    it(" Se as imagens apresentadas no site estão com discernimento.", async () => {
        // Rotina: tipo :confirmação; entrada:Clicar em "Feirão da Serasa"; saída esperada:Ir para a página da Serasa, usuário conseguir achar facilmente os StoryCards com o link externo;
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        await waitFor(() => {
            const serasaSection = screen.getByText(/Feirão da Serasa/i);
            expect(serasaSection).toBeInTheDocument();
            
            const serasaLink = screen.getByRole('link', { name: /Ir para Serasa Limpa Nome/i });
            expect(serasaLink).toBeInTheDocument();
            expect(serasaLink).toHaveAttribute('href', 'https://www.serasa.com.br/limpa-nome-online/');
        });
    });

    it("  Ver o que é possível ser melhorado..", async () => {
        // Rotina: tipo :aceitação; entrada:Explorar toda a Dashboard"; saída esperada:DashBoard está fácil de ser compreendida, encontrando todos os componentes sem nenhuma dificuldade.
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        await waitFor(() => {
            // 1. Calculadora / Raio-X 
            expect(screen.getAllByText(/Raio-X Financeiro/i)[0]).toBeInTheDocument();
            
            // 2. Transações
            expect(screen.getByText(/Minhas Transações/i)).toBeInTheDocument();
            
            // 3. Assistente (IA)
            expect(screen.getByText(/Assistente DebtView/i)).toBeInTheDocument();
            
            // 4. Footer
            expect(screen.getByRole('contentinfo')).toBeInTheDocument();
            expect(screen.getByText(/© 2024 DebtView/i)).toBeInTheDocument();
        });
    });
});
