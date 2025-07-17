import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AutomatonForm } from '@/components/AutomatonForm';
import { AutomatonList } from '@/components/AutomatonList';
import { FiniteAutomaton } from '@/types/automaton';
import { Brain, FileText, GitBranch } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [editingAutomaton, setEditingAutomaton] = useState<FiniteAutomaton | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (fa: FiniteAutomaton) => {
    setEditingAutomaton(fa);
    setActiveTab('create');
  };

  const handleFormSuccess = () => {
    setEditingAutomaton(null);
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Finite Automaton Builder</h1>
              <p className="text-muted-foreground">Create, simulate, and visualize DFA and NFA</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {editingAutomaton ? 'Edit' : 'Create'} Automaton
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              My Automata
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="flex justify-center">
              <AutomatonForm 
                onSuccess={handleFormSuccess}
                initialData={editingAutomaton || undefined}
              />
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Saved Automata</h2>
              <AutomatonList 
                onEdit={handleEdit}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>About Finite Automaton Builder</CardTitle>
                  <CardDescription>
                    A comprehensive tool for creating and working with finite automata
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Features</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Create both Deterministic (DFA) and Non-deterministic (NFA) finite automata</li>
                      <li>Visual automaton builder with intuitive interface</li>
                      <li>String simulation to test input acceptance</li>
                      <li>Automatic DFA/NFA detection</li>
                      <li>NFA to DFA conversion</li>
                      <li>SVG visualization of automata</li>
                      <li>Local storage for persistence</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">How to Use</h3>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Go to the "Create Automaton" tab to build a new finite automaton</li>
                      <li>Define states, alphabet, start state, accept states, and transitions</li>
                      <li>Save your automaton and view it in "My Automata"</li>
                      <li>Use the Simulate button to test input strings</li>
                      <li>Visualize your automaton as an SVG diagram</li>
                      <li>Convert NFAs to DFAs when needed</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Notation</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>States:</strong> Named with strings like q0, q1, s1, etc.</li>
                      <li><strong>Alphabet:</strong> Input symbols like 0, 1, a, b, etc.</li>
                      <li><strong>Epsilon:</strong> Use 'ε' for epsilon transitions in NFAs</li>
                      <li><strong>Transitions:</strong> Defined as (from_state, symbol, to_state)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Future Enhancements</h3>
                    <p className="text-muted-foreground">
                      With backend integration via Supabase, this app could support persistent cloud storage, 
                      server-side Graphviz rendering for better visualizations, collaborative editing, 
                      and sharing of automata between users.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
