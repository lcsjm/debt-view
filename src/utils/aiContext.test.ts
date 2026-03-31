/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { getAICachedContext } from './aiContext';
import supabase from '../../utils/supabase';

vi.mock('../../utils/supabase', () => {
  const queryMock = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: { mocked: true } }),
    then: vi.fn().mockImplementation((cb) => Promise.resolve(cb({ data: { cpf: '123' } })))
  };

  return {
    default: {
      from: vi.fn(() => queryMock)
    }
  };
});

describe('getAICachedContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const mockUser = { id: 'user-123' };

  it('should return empty string if no user is provided', async () => {
    const context = await getAICachedContext(null);
    expect(context).toBe('');
  });

  it('should fetch data from supabase when there is no cache', async () => {
    const context = await getAICachedContext(mockUser);
    
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(supabase.from).toHaveBeenCalledWith('financial');
    expect(supabase.from).toHaveBeenCalledWith('finances');
    expect(supabase.from).toHaveBeenCalledWith('debts');
    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(supabase.from).toHaveBeenCalledWith('simulators');
    expect(supabase.from).toHaveBeenCalledWith('chat');
    expect(context).toContain('DADOS BANCÁRIOS E PERFIL');
  });

  it('should use cache and prevent supabase calls if cache is valid', async () => {
    // Primeira chamada para preencher o cache
    await getAICachedContext(mockUser);
    
    // Limpar contagem de mocks
    vi.clearAllMocks();
    
    // Segunda chamada na sequência deve usar o cache
    const cachedContext = await getAICachedContext(mockUser);
    expect(supabase.from).not.toHaveBeenCalled();
    expect(cachedContext).toContain('DADOS BANCÁRIOS E PERFIL');
  });

  it('should re-fetch from supabase if cache is expired', async () => {
    // Forçar mock de data no localStorage com 10 minutos atrás
    const expiredTimestamp = Date.now() - (10 * 60 * 1000);
    localStorage.setItem(`ai_context_${mockUser.id}`, JSON.stringify({
      timestamp: expiredTimestamp,
      context: 'OLD_CONTEXT'
    }));

    const context = await getAICachedContext(mockUser);
    
    // Deve ignorar o cache expirado e chamar do supabase novamente
    expect(supabase.from).toHaveBeenCalled();
    expect(context).toContain('DADOS BANCÁRIOS E PERFIL');
  });
});
