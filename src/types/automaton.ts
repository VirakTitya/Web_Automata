export interface Transition {
  from: string;
  to: string;
  symbol: string;
}

export interface FiniteAutomaton {
  id: string;
  name: string;
  states: string[];
  alphabet: string[];
  startState: string;
  acceptStates: string[];
  transitions: Transition[];
  createdAt: string;
}

export interface SimulationResult {
  accepted: boolean;
  path: string[];
  currentStates?: string[]; // For NFA
}

export type AutomatonType = 'DFA' | 'NFA';