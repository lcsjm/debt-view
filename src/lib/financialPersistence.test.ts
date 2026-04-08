import { describe, it, expect, vi, beforeEach } from 'vitest';
import { persistFinancialData, FinancialFormData } from './financialPersistence';
import supabase from '../../utils/supabase';

vi.mock('../../utils/supabase', () => ({
  default: {
    from: vi.fn(),
  },
}));

describe('persistFinancialData', () => {
  const userId = '123-abc';
  const mockData: FinancialFormData = {
    divida: [100],
    rendaFixa: [2000],
    rendaVariavel: [500],
    gastosFixos: [1000],
    gastosVariaveis: [300],
    investimentos: [200],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve realizar um update se dados ja existirem na tabela financial', async () => {
    const fromMock = supabase.from as unknown as ReturnType<typeof vi.fn>;
    
    // Mock for checking existing rows
    const selectMock = {
      eq: vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null }),
    };
    
    // Mock for update
    const updateMock = {
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    
    // Mock for upsert
    const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null });

    fromMock.mockImplementation((tableName: string) => {
      if (tableName === 'financial') {
        return {
          select: () => selectMock,
          update: () => updateMock,
        };
      }
      if (tableName === 'finances') {
        return {
          upsert: upsertMock,
        };
      }
      return {};
    });

    await persistFinancialData(userId, mockData);

    // Verify financial update was called
    expect(fromMock).toHaveBeenCalledWith('financial');
    expect(updateMock.eq).toHaveBeenCalledWith('user_id', userId);
    
    // Verify finances upsert was called
    expect(fromMock).toHaveBeenCalledWith('finances');
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: userId,
        fixed_income: 2000,
        variable_income: 500,
        fixed_expense: 1000,
        variable_expense: 300,
        debts: 100,
        investments: 200,
      }),
      { onConflict: 'user_id' }
    );
  });

  it('deve realizar um insert se dados nao existirem na tabela financial', async () => {
    const fromMock = supabase.from as unknown as ReturnType<typeof vi.fn>;
    
    // Mock for checking existing rows (empty)
    const selectMock = {
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    
    // Mock for insert
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });
    
    // Mock for upsert
    const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null });

    fromMock.mockImplementation((tableName: string) => {
      if (tableName === 'financial') {
        return {
          select: () => selectMock,
          insert: insertMock,
        };
      }
      if (tableName === 'finances') {
        return {
          upsert: upsertMock,
        };
      }
      return {};
    });

    await persistFinancialData(userId, mockData);

    // Verify financial insert was called
    expect(fromMock).toHaveBeenCalledWith('financial');
    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        user_id: userId,
        fixedIncome: 2000,
        variableIncome: 500,
        fixedExpenses: 1000,
        variableExpenses: 300,
        investments: 200,
      })
    ]);
  });
});
