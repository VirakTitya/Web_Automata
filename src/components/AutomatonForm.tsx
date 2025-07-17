import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { FiniteAutomaton, Transition } from '@/types/automaton';
import { validateAutomaton } from '@/utils/automatonUtils';
import { saveAutomaton } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';

interface AutomatonFormProps {
  onSuccess?: () => void;
  initialData?: FiniteAutomaton;
}

export const AutomatonForm = ({ onSuccess, initialData }: AutomatonFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState(initialData?.name || '');
  const [states, setStates] = useState<string[]>(initialData?.states || []);
  const [alphabet, setAlphabet] = useState<string[]>(initialData?.alphabet || []);
  const [startState, setStartState] = useState(initialData?.startState || '');
  const [acceptStates, setAcceptStates] = useState<string[]>(initialData?.acceptStates || []);
  const [transitions, setTransitions] = useState<Transition[]>(initialData?.transitions || []);
  
  const [newState, setNewState] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newTransition, setNewTransition] = useState<Partial<Transition>>({});

  const addState = () => {
    if (newState.trim() && !states.includes(newState.trim())) {
      setStates([...states, newState.trim()]);
      setNewState('');
    }
  };

  const removeState = (state: string) => {
    setStates(states.filter(s => s !== state));
    if (startState === state) setStartState('');
    setAcceptStates(acceptStates.filter(s => s !== state));
    setTransitions(transitions.filter(t => t.from !== state && t.to !== state));
  };

  const addSymbol = () => {
    if (newSymbol.trim() && !alphabet.includes(newSymbol.trim())) {
      setAlphabet([...alphabet, newSymbol.trim()]);
      setNewSymbol('');
    }
  };

  const removeSymbol = (symbol: string) => {
    setAlphabet(alphabet.filter(s => s !== symbol));
    setTransitions(transitions.filter(t => t.symbol !== symbol));
  };

  const toggleAcceptState = (state: string) => {
    if (acceptStates.includes(state)) {
      setAcceptStates(acceptStates.filter(s => s !== state));
    } else {
      setAcceptStates([...acceptStates, state]);
    }
  };

  const addTransition = () => {
    if (newTransition.from && newTransition.to && newTransition.symbol !== undefined) {
      const transition: Transition = {
        from: newTransition.from,
        to: newTransition.to,
        symbol: newTransition.symbol
      };
      
      // Check if transition already exists
      const exists = transitions.some(t => 
        t.from === transition.from && 
        t.to === transition.to && 
        t.symbol === transition.symbol
      );
      
      if (!exists) {
        setTransitions([...transitions, transition]);
        setNewTransition({});
      }
    }
  };

  const removeTransition = (index: number) => {
    setTransitions(transitions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const fa: FiniteAutomaton = {
      id: initialData?.id || `fa_${Date.now()}`,
      name,
      states,
      alphabet,
      startState,
      acceptStates,
      transitions,
      createdAt: initialData?.createdAt || new Date().toISOString()
    };
    
    const errors = validateAutomaton(fa);
    
    if (errors.length > 0) {
      toast({
        title: 'Validation Error',
        description: errors.join(', '),
        variant: 'destructive'
      });
      return;
    }
    
    saveAutomaton(fa);
    toast({
      title: 'Success',
      description: `Finite Automaton "${name}" ${initialData ? 'updated' : 'created'} successfully!`
    });
    
    if (!initialData) {
      // Reset form
      setName('');
      setStates([]);
      setAlphabet([]);
      setStartState('');
      setAcceptStates([]);
      setTransitions([]);
    }
    
    onSuccess?.();
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit' : 'Create'} Finite Automaton</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter automaton name"
            />
          </div>

          {/* States */}
          <div className="space-y-2">
            <Label>States</Label>
            <div className="flex gap-2">
              <Input
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                placeholder="Add state (e.g., q0, q1, q2)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addState())}
              />
              <Button type="button" onClick={addState}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {states.map((state) => (
                <Badge key={state} variant="secondary" className="flex items-center gap-1">
                  {state}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeState(state)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Alphabet */}
          <div className="space-y-2">
            <Label>Alphabet</Label>
            <div className="flex gap-2">
              <Input
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder="Add symbol (e.g., 0, 1, a, b, ε)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymbol())}
              />
              <Button type="button" onClick={addSymbol}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {alphabet.map((symbol) => (
                <Badge key={symbol} variant="outline" className="flex items-center gap-1">
                  {symbol}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeSymbol(symbol)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Start State */}
          <div className="space-y-2">
            <Label>Start State</Label>
            <Select value={startState} onValueChange={setStartState}>
              <SelectTrigger>
                <SelectValue placeholder="Select start state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Accept States */}
          <div className="space-y-2">
            <Label>Accept States</Label>
            <div className="flex flex-wrap gap-2">
              {states.map((state) => (
                <Badge
                  key={state}
                  variant={acceptStates.includes(state) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleAcceptState(state)}
                >
                  {state}
                </Badge>
              ))}
            </div>
          </div>

          {/* Transitions */}
          <div className="space-y-2">
            <Label>Transitions</Label>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
              <Select 
                value={newTransition.from || ''} 
                onValueChange={(value) => setNewTransition({...newTransition, from: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="From" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={newTransition.symbol || ''} 
                onValueChange={(value) => setNewTransition({...newTransition, symbol: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Symbol" />
                </SelectTrigger>
                <SelectContent>
                  {alphabet.map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol}
                    </SelectItem>
                  ))}
                  <SelectItem value="ε">ε (epsilon)</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={newTransition.to || ''} 
                onValueChange={(value) => setNewTransition({...newTransition, to: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="To" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="button" onClick={addTransition} className="w-full">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-1">
              {transitions.map((transition, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span>
                    {transition.from} → {transition.to} on "{transition.symbol}"
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTransition(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full">
            {initialData ? 'Update' : 'Create'} Automaton
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};