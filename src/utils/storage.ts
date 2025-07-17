import { FiniteAutomaton } from '@/types/automaton';

const STORAGE_KEY = 'finite_automata';

export const saveAutomaton = (fa: FiniteAutomaton): void => {
  const stored = getStoredAutomata();
  const index = stored.findIndex(existing => existing.id === fa.id);
  
  if (index >= 0) {
    stored[index] = fa;
  } else {
    stored.push(fa);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
};

export const getStoredAutomata = (): FiniteAutomaton[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const deleteAutomaton = (id: string): void => {
  const stored = getStoredAutomata();
  const filtered = stored.filter(fa => fa.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const getAutomatonById = (id: string): FiniteAutomaton | null => {
  const stored = getStoredAutomata();
  return stored.find(fa => fa.id === id) || null;
};