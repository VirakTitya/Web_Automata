import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Trash2, GitBranch, Image } from 'lucide-react';
import { FiniteAutomaton } from '@/types/automaton';
import { getStoredAutomata, deleteAutomaton } from '@/utils/storage';
import { getAutomatonType, convertNFAToDFA } from '@/utils/automatonUtils';
import { useToast } from '@/hooks/use-toast';
import { SimulationModal } from './SimulationModal';
import { VisualizationModal } from './VisualizationModal';

interface AutomatonListProps {
  onEdit?: (fa: FiniteAutomaton) => void;
  refreshTrigger?: number;
}

export const AutomatonList = ({ onEdit, refreshTrigger }: AutomatonListProps) => {
  const { toast } = useToast();
  const [automata, setAutomata] = useState<FiniteAutomaton[]>([]);
  const [selectedForSimulation, setSelectedForSimulation] = useState<FiniteAutomaton | null>(null);
  const [selectedForVisualization, setSelectedForVisualization] = useState<FiniteAutomaton | null>(null);

  const loadAutomata = () => {
    setAutomata(getStoredAutomata());
  };

  useEffect(() => {
    loadAutomata();
  }, [refreshTrigger]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteAutomaton(id);
      loadAutomata();
      toast({
        title: 'Success',
        description: `Automaton "${name}" deleted successfully!`
      });
    }
  };

  const handleConvertToDFA = (fa: FiniteAutomaton) => {
    if (getAutomatonType(fa) === 'DFA') {
      toast({
        title: 'Info',
        description: 'This automaton is already a DFA!',
        variant: 'default'
      });
      return;
    }

    const dfa = convertNFAToDFA(fa);
    // Note: In a real app with backend, this would save to database
    // For now, we'll just show the converted DFA data
    toast({
      title: 'Conversion Complete',
      description: `NFA converted to DFA with ${dfa.states.length} states. Check console for details.`,
    });
    
    console.log('Converted DFA:', dfa);
    
    // Optionally, you could call onEdit to show the converted DFA in the form
    if (onEdit) {
      onEdit(dfa);
    }
  };

  if (automata.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No finite automata created yet. Create your first one above!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {automata.map((fa) => {
          const type = getAutomatonType(fa);
          
          return (
            <Card key={fa.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{fa.name}</CardTitle>
                  <Badge variant={type === 'DFA' ? 'default' : 'secondary'}>
                    {type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <div>States: {fa.states.length}</div>
                  <div>Alphabet: {fa.alphabet.join(', ')}</div>
                  <div>Start: {fa.startState}</div>
                  <div>Accept: {fa.acceptStates.join(', ')}</div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => setSelectedForSimulation(fa)}
                    className="flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    Simulate
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedForVisualization(fa)}
                    className="flex items-center gap-1"
                  >
                    <Image className="w-3 h-3" />
                    Visualize
                  </Button>
                  
                  {type === 'NFA' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleConvertToDFA(fa)}
                      className="flex items-center gap-1"
                    >
                      <GitBranch className="w-3 h-3" />
                      Convert
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit?.(fa)}
                  >
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(fa.id, fa.name)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedForSimulation && (
        <SimulationModal
          automaton={selectedForSimulation}
          open={!!selectedForSimulation}
          onClose={() => setSelectedForSimulation(null)}
        />
      )}

      {selectedForVisualization && (
        <VisualizationModal
          automaton={selectedForVisualization}
          open={!!selectedForVisualization}
          onClose={() => setSelectedForVisualization(null)}
        />
      )}
    </>
  );
};