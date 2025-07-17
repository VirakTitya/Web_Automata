import { FiniteAutomaton, Transition, SimulationResult, AutomatonType } from '@/types/automaton';

export const isDFA = (fa: FiniteAutomaton): boolean => {
  // Check for epsilon transitions
  if (fa.transitions.some(t => t.symbol === 'ε' || t.symbol === '')) {
    return false;
  }
  
  // Check for non-determinism (multiple transitions from same state with same symbol)
  const transitionMap = new Map<string, Set<string>>();
  
  for (const transition of fa.transitions) {
    const key = `${transition.from}-${transition.symbol}`;
    if (!transitionMap.has(key)) {
      transitionMap.set(key, new Set());
    }
    transitionMap.get(key)!.add(transition.to);
  }
  
  return !Array.from(transitionMap.values()).some(destinations => destinations.size > 1);
};

export const getAutomatonType = (fa: FiniteAutomaton): AutomatonType => {
  return isDFA(fa) ? 'DFA' : 'NFA';
};

export const simulateDFA = (fa: FiniteAutomaton, input: string): SimulationResult => {
  let currentState = fa.startState;
  const path = [currentState];
  
  for (const symbol of input) {
    if (!fa.alphabet.includes(symbol)) {
      return { accepted: false, path };
    }
    
    const transition = fa.transitions.find(
      t => t.from === currentState && t.symbol === symbol
    );
    
    if (!transition) {
      return { accepted: false, path };
    }
    
    currentState = transition.to;
    path.push(currentState);
  }
  
  const accepted = fa.acceptStates.includes(currentState);
  return { accepted, path };
};

export const simulateNFA = (fa: FiniteAutomaton, input: string): SimulationResult => {
  // Get epsilon closure
  const getEpsilonClosure = (states: Set<string>): Set<string> => {
    const closure = new Set(states);
    let changed = true;
    
    while (changed) {
      changed = false;
      for (const state of closure) {
        const epsilonTransitions = fa.transitions.filter(
          t => t.from === state && (t.symbol === 'ε' || t.symbol === '')
        );
        
        for (const transition of epsilonTransitions) {
          if (!closure.has(transition.to)) {
            closure.add(transition.to);
            changed = true;
          }
        }
      }
    }
    
    return closure;
  };
  
  let currentStates = getEpsilonClosure(new Set([fa.startState]));
  const path = [Array.from(currentStates).join(',')];
  
  for (const symbol of input) {
    if (!fa.alphabet.includes(symbol)) {
      return { accepted: false, path, currentStates: Array.from(currentStates) };
    }
    
    const nextStates = new Set<string>();
    
    for (const state of currentStates) {
      const transitions = fa.transitions.filter(
        t => t.from === state && t.symbol === symbol
      );
      
      for (const transition of transitions) {
        nextStates.add(transition.to);
      }
    }
    
    currentStates = getEpsilonClosure(nextStates);
    path.push(Array.from(currentStates).join(','));
    
    if (currentStates.size === 0) {
      return { accepted: false, path, currentStates: Array.from(currentStates) };
    }
  }
  
  const accepted = Array.from(currentStates).some(state => fa.acceptStates.includes(state));
  return { accepted, path, currentStates: Array.from(currentStates) };
};

export const simulateAutomaton = (fa: FiniteAutomaton, input: string): SimulationResult => {
  return isDFA(fa) ? simulateDFA(fa, input) : simulateNFA(fa, input);
};

export const convertNFAToDFA = (nfa: FiniteAutomaton): FiniteAutomaton => {
  if (isDFA(nfa)) {
    return { ...nfa, name: `${nfa.name} (Already DFA)` };
  }
  
  // Get epsilon closure
  const getEpsilonClosure = (states: Set<string>): Set<string> => {
    const closure = new Set(states);
    let changed = true;
    
    while (changed) {
      changed = false;
      for (const state of closure) {
        const epsilonTransitions = nfa.transitions.filter(
          t => t.from === state && (t.symbol === 'ε' || t.symbol === '')
        );
        
        for (const transition of epsilonTransitions) {
          if (!closure.has(transition.to)) {
            closure.add(transition.to);
            changed = true;
          }
        }
      }
    }
    
    return closure;
  };
  
  const startStateClosure = Array.from(getEpsilonClosure(new Set([nfa.startState]))).sort().join(',');
  const dfaStates = new Set([startStateClosure]);
  const dfaTransitions: Transition[] = [];
  const workList = [startStateClosure];
  const dfaAcceptStates = new Set<string>();
  
  // Check if start state is accepting
  if (Array.from(getEpsilonClosure(new Set([nfa.startState]))).some(s => nfa.acceptStates.includes(s))) {
    dfaAcceptStates.add(startStateClosure);
  }
  
  while (workList.length > 0) {
    const currentDfaState = workList.pop()!;
    const currentNfaStates = currentDfaState.split(',');
    
    for (const symbol of nfa.alphabet) {
      if (symbol === 'ε' || symbol === '') continue;
      
      const nextStates = new Set<string>();
      
      for (const nfaState of currentNfaStates) {
        const transitions = nfa.transitions.filter(
          t => t.from === nfaState && t.symbol === symbol
        );
        
        for (const transition of transitions) {
          nextStates.add(transition.to);
        }
      }
      
      if (nextStates.size > 0) {
        const nextDfaState = Array.from(getEpsilonClosure(nextStates)).sort().join(',');
        
        dfaTransitions.push({
          from: currentDfaState,
          to: nextDfaState,
          symbol
        });
        
        if (!dfaStates.has(nextDfaState)) {
          dfaStates.add(nextDfaState);
          workList.push(nextDfaState);
          
          // Check if this new state is accepting
          if (Array.from(getEpsilonClosure(nextStates)).some(s => nfa.acceptStates.includes(s))) {
            dfaAcceptStates.add(nextDfaState);
          }
        }
      }
    }
  }
  
  return {
    id: `${nfa.id}_dfa`,
    name: `${nfa.name} (Converted to DFA)`,
    states: Array.from(dfaStates),
    alphabet: nfa.alphabet.filter(s => s !== 'ε' && s !== ''),
    startState: startStateClosure,
    acceptStates: Array.from(dfaAcceptStates),
    transitions: dfaTransitions,
    createdAt: new Date().toISOString()
  };
};

export const validateAutomaton = (fa: Partial<FiniteAutomaton>): string[] => {
  const errors: string[] = [];
  
  if (!fa.name?.trim()) {
    errors.push('Name is required');
  }
  
  if (!fa.states?.length) {
    errors.push('At least one state is required');
  }
  
  if (!fa.alphabet?.length) {
    errors.push('At least one symbol in alphabet is required');
  }
  
  if (!fa.startState) {
    errors.push('Start state is required');
  } else if (fa.states && !fa.states.includes(fa.startState)) {
    errors.push('Start state must be in the list of states');
  }
  
  if (fa.acceptStates?.some(state => fa.states && !fa.states.includes(state))) {
    errors.push('All accept states must be in the list of states');
  }
  
  if (fa.transitions?.some(t => 
    (fa.states && (!fa.states.includes(t.from) || !fa.states.includes(t.to))) ||
    (fa.alphabet && !fa.alphabet.includes(t.symbol) && t.symbol !== 'ε' && t.symbol !== '')
  )) {
    errors.push('All transitions must use valid states and symbols');
  }
  
  return errors;
};