import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Play } from 'lucide-react';
import { FiniteAutomaton, SimulationResult } from '@/types/automaton';
import { simulateAutomaton, getAutomatonType } from '@/utils/automatonUtils';

interface SimulationModalProps {
  automaton: FiniteAutomaton;
  open: boolean;
  onClose: () => void;
}

export const SimulationModal = ({ automaton, open, onClose }: SimulationModalProps) => {
  const [inputString, setInputString] = useState('');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = () => {
    setIsSimulating(true);
    
    // Simulate with a small delay for better UX
    setTimeout(() => {
      const simulationResult = simulateAutomaton(automaton, inputString);
      setResult(simulationResult);
      setIsSimulating(false);
    }, 300);
  };

  const resetSimulation = () => {
    setInputString('');
    setResult(null);
  };

  const automatonType = getAutomatonType(automaton);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Simulate: {automaton.name}</DialogTitle>
          <DialogDescription>
            Test input strings against this {automatonType}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Automaton Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <div className="text-sm font-medium">Type</div>
              <Badge variant={automatonType === 'DFA' ? 'default' : 'secondary'}>
                {automatonType}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium">Alphabet</div>
              <div className="text-sm">{automaton.alphabet.join(', ')}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Start State</div>
              <div className="text-sm">{automaton.startState}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Accept States</div>
              <div className="text-sm">{automaton.acceptStates.join(', ')}</div>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <Label htmlFor="input-string">Input String</Label>
            <div className="flex gap-2">
              <Input
                id="input-string"
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                placeholder="Enter string to test (e.g., 101, abab)"
                onKeyPress={(e) => e.key === 'Enter' && handleSimulate()}
              />
              <Button 
                onClick={handleSimulate} 
                disabled={isSimulating}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isSimulating ? 'Simulating...' : 'Simulate'}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Valid symbols: {automaton.alphabet.join(', ')}
              {automatonType === 'NFA' && ', ε (epsilon)'}
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                {result.accepted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">
                  {result.accepted ? 'ACCEPTED' : 'REJECTED'}
                </span>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Execution Path:</div>
                <div className="text-sm bg-muted p-2 rounded font-mono">
                  {result.path.join(' → ')}
                </div>
              </div>

              {automatonType === 'NFA' && result.currentStates && (
                <div>
                  <div className="text-sm font-medium mb-1">Final States:</div>
                  <div className="flex gap-1">
                    {result.currentStates.map((state, idx) => (
                      <Badge 
                        key={idx} 
                        variant={automaton.acceptStates.includes(state) ? 'default' : 'outline'}
                      >
                        {state}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={resetSimulation}>
              Reset
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};