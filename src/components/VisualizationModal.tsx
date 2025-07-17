import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw } from 'lucide-react';
import { FiniteAutomaton } from '@/types/automaton';
import { getAutomatonType } from '@/utils/automatonUtils';

interface VisualizationModalProps {
  automaton: FiniteAutomaton;
  open: boolean;
  onClose: () => void;
}

export const VisualizationModal = ({ automaton, open, onClose }: VisualizationModalProps) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateGraphvizDot = (fa: FiniteAutomaton): string => {
    const lines = ['digraph FA {'];
    lines.push('  rankdir=LR;');
    lines.push('  node [shape=circle];');
    
    // Add start state indicator
    lines.push('  start [shape=point];');
    lines.push(`  start -> "${fa.startState}";`);
    
    // Add accept states with double circles
    if (fa.acceptStates.length > 0) {
      lines.push(`  node [shape=doublecircle]; ${fa.acceptStates.map(s => `"${s}"`).join(' ')};`);
    }
    
    // Regular states
    const regularStates = fa.states.filter(s => !fa.acceptStates.includes(s));
    if (regularStates.length > 0) {
      lines.push(`  node [shape=circle]; ${regularStates.map(s => `"${s}"`).join(' ')};`);
    }
    
    // Add transitions
    const transitionMap = new Map<string, string[]>();
    
    fa.transitions.forEach(t => {
      const key = `"${t.from}" -> "${t.to}"`;
      if (!transitionMap.has(key)) {
        transitionMap.set(key, []);
      }
      transitionMap.get(key)!.push(t.symbol);
    });
    
    transitionMap.forEach((symbols, transition) => {
      const label = symbols.join(', ');
      lines.push(`  ${transition} [label="${label}"];`);
    });
    
    lines.push('}');
    return lines.join('\n');
  };

  const generateSVG = async () => {
    setIsGenerating(true);
    
    try {
      // Since we can't run Graphviz server-side, we'll create a simple SVG representation
      const dot = generateGraphvizDot(automaton);
      
      // For now, we'll show the DOT source and a simple text-based diagram
      // In a real implementation with backend, this would be sent to a Graphviz service
      const simpleSvg = createSimpleSVG(automaton);
      setSvgContent(simpleSvg);
      
      console.log('Graphviz DOT notation:');
      console.log(dot);
      
    } catch (error) {
      console.error('Error generating visualization:', error);
      setSvgContent('<text x="10" y="30" fill="red">Error generating visualization</text>');
    } finally {
      setIsGenerating(false);
    }
  };

  const createSimpleSVG = (fa: FiniteAutomaton): string => {
    const width = 800;
    const height = 400;
    const stateRadius = 25;
    const states = fa.states;
    
    // Position states in a circle
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    const statePositions = states.map((state, index) => {
      const angle = (2 * Math.PI * index) / states.length;
      return {
        state,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += '<defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#333" /></marker></defs>';
    
    // Draw transitions
    fa.transitions.forEach(transition => {
      const fromPos = statePositions.find(p => p.state === transition.from);
      const toPos = statePositions.find(p => p.state === transition.to);
      
      if (fromPos && toPos) {
        // Calculate edge points on circle circumference
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const fromX = fromPos.x + (dx / distance) * stateRadius;
          const fromY = fromPos.y + (dy / distance) * stateRadius;
          const toX = toPos.x - (dx / distance) * stateRadius;
          const toY = toPos.y - (dy / distance) * stateRadius;
          
          // Self-loop handling
          if (transition.from === transition.to) {
            const loopX = fromPos.x;
            const loopY = fromPos.y - stateRadius - 20;
            svg += `<path d="M ${fromX} ${fromY - stateRadius} Q ${loopX} ${loopY} ${fromX + 1} ${fromY - stateRadius}" stroke="#333" fill="none" marker-end="url(#arrowhead)" />`;
            svg += `<text x="${loopX}" y="${loopY - 5}" text-anchor="middle" font-size="12" fill="#333">${transition.symbol}</text>`;
          } else {
            svg += `<line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}" stroke="#333" marker-end="url(#arrowhead)" />`;
            
            // Label position
            const midX = (fromX + toX) / 2;
            const midY = (fromY + toY) / 2;
            svg += `<text x="${midX}" y="${midY - 5}" text-anchor="middle" font-size="12" fill="#333">${transition.symbol}</text>`;
          }
        }
      }
    });
    
    // Draw start arrow
    const startPos = statePositions.find(p => p.state === fa.startState);
    if (startPos) {
      const startArrowX = startPos.x - stateRadius - 30;
      const endArrowX = startPos.x - stateRadius;
      svg += `<line x1="${startArrowX}" y1="${startPos.y}" x2="${endArrowX}" y2="${startPos.y}" stroke="#333" marker-end="url(#arrowhead)" stroke-width="2" />`;
      svg += `<text x="${startArrowX - 10}" y="${startPos.y + 5}" text-anchor="end" font-size="12" fill="#333">start</text>`;
    }
    
    // Draw states
    statePositions.forEach(({ state, x, y }) => {
      const isAcceptState = fa.acceptStates.includes(state);
      
      // Outer circle for accept states
      if (isAcceptState) {
        svg += `<circle cx="${x}" cy="${y}" r="${stateRadius + 3}" fill="none" stroke="#333" stroke-width="2" />`;
      }
      
      // Main circle
      svg += `<circle cx="${x}" cy="${y}" r="${stateRadius}" fill="white" stroke="#333" stroke-width="2" />`;
      
      // State label
      svg += `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="14" fill="#333">${state}</text>`;
    });
    
    svg += '</svg>';
    return svg;
  };

  useEffect(() => {
    if (open) {
      generateSVG();
    }
  }, [open, automaton]);

  const downloadSVG = () => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${automaton.name}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const automatonType = getAutomatonType(automaton);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Visualization: {automaton.name}</DialogTitle>
          <DialogDescription>
            Graphical representation of this {automatonType}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info */}
          <div className="flex items-center gap-4">
            <Badge variant={automatonType === 'DFA' ? 'default' : 'secondary'}>
              {automatonType}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {automaton.states.length} states, {automaton.transitions.length} transitions
            </span>
          </div>

          {/* Visualization */}
          <div className="border rounded-lg p-4 bg-white">
            {isGenerating ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span className="ml-2">Generating visualization...</span>
              </div>
            ) : svgContent ? (
              <div 
                className="w-full overflow-auto"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No visualization available
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Double circles represent accept states</div>
            <div>• Arrow from "start" indicates the start state</div>
            <div>• Transitions are labeled with their input symbols</div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={generateSVG}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
              <Button 
                variant="outline" 
                onClick={downloadSVG}
                disabled={!svgContent || isGenerating}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download SVG
              </Button>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};