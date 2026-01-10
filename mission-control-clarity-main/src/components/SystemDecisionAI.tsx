import { useEffect, useState } from 'react';
import { Brain, MessageSquare, Lightbulb, Zap, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SystemStatus {
  decision_explanation: string;
  system_mode: string;
  current_link: string;
  satellite_visible: boolean;
  ground_visible: boolean;
}

interface AIExplanation {
  explanation: string;
  timestamp: number;
  confidence?: number;
  reasoning_type?: string;
}

export function SystemDecisionAI() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [aiExplanation, setAIExplanation] = useState<AIExplanation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);

        // Get system status with AI explanation
        const systemResponse = await fetch('http://localhost:8000/system/status');
        if (systemResponse.ok) {
          const systemData = await systemResponse.json();
          setSystemStatus(systemData);
          
          // Extract AI explanation
          if (systemData.decision_explanation) {
            setAIExplanation({
              explanation: systemData.decision_explanation,
              timestamp: Date.now(),
              confidence: 95, // Mock confidence score
              reasoning_type: 'link_selection'
            });
          }
        }

        setError(null);
      } catch (err) {
        setError('AI explanation unavailable');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Slower update for AI
    return () => clearInterval(interval);
  }, []);

  const getDecisionContext = () => {
    if (!systemStatus) return null;

    const context = {
      mode: systemStatus.system_mode,
      communication: systemStatus.current_link,
      links_available: {
        satellite: systemStatus.satellite_visible,
        ground: systemStatus.ground_visible
      }
    };

    let contextDescription = '';
    let contextColor = 'text-muted-foreground';
    let contextIcon = MessageSquare;

    if (context.communication === 'NONE') {
      contextDescription = 'Communication blackout - system storing data safely';
      contextColor = 'text-warning';
      contextIcon = AlertCircle;
    } else if (context.communication === 'GROUND') {
      contextDescription = 'Direct ground communication active';
      contextColor = 'text-success';
      contextIcon = Zap;
    } else if (context.communication === 'SATELLITE') {
      contextDescription = 'Satellite relay communication active';
      contextColor = 'text-primary';
      contextIcon = Zap;
    }

    return {
      ...context,
      description: contextDescription,
      color: contextColor,
      icon: contextIcon
    };
  };

  const formatExplanation = (explanation: string) => {
    // Clean up technical jargon and make it human-readable
    return explanation
      .replace(/link_type/g, 'communication method')
      .replace(/telemetry/g, 'data')
      .replace(/packet/g, 'data packet')
      .replace(/buffer/g, 'storage')
      .replace(/ORBITNET/g, 'ORBITNET-MESH')
      .replace(/ground_only/g, 'ground-only mode');
  };

  if (error) {
    return (
      <div className="card-glow bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-muted-foreground" />
          <h3 className="panel-header">System Decision (AI Explanation)</h3>
        </div>
        <div className="text-sm text-muted-foreground">{error}</div>
      </div>
    );
  }

  if (!systemStatus || !aiExplanation) {
    return (
      <div className="card-glow bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-muted-foreground" />
          <h3 className="panel-header">System Decision (AI Explanation)</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isLoading && <div className="w-4 h-4 rounded-full bg-muted animate-pulse" />}
          {isLoading ? 'AI analyzing system decisions...' : 'Loading AI explanation...'}
        </div>
      </div>
    );
  }

  const decisionContext = getDecisionContext();
  if (!decisionContext) return null;

  const ContextIcon = decisionContext.icon;

  return (
    <div className="card-glow bg-card rounded-lg border border-border p-6">
      {/* Header with Helper Text */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="panel-header">System Decision (AI Explanation)</h3>
          <Badge variant="outline" className="text-xs">
            🤖 AI-Powered
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Human-readable explanation of system decisions.
        </p>
      </div>

      {/* Current Decision Context */}
      <div className="bg-secondary/30 rounded-lg p-4 border border-border/50 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-primary/10">
            <ContextIcon className={cn('w-4 h-4', decisionContext.color)} />
          </div>
          <div>
            <div className="text-sm font-medium">Current Situation</div>
            <div className={cn('text-xs', decisionContext.color)}>
              {decisionContext.description}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">System Mode:</span>
            <div className="font-medium">
              {systemStatus.system_mode === 'ORBITNET' ? 'ORBITNET-MESH' : 'Ground-Only'}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Communication:</span>
            <div className="font-medium capitalize">
              {systemStatus.current_link.toLowerCase()}
            </div>
          </div>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">AI Explanation</span>
          {aiExplanation.confidence && (
            <Badge variant="outline" className="text-xs">
              {aiExplanation.confidence}% confident
            </Badge>
          )}
        </div>

        <div className="text-sm leading-relaxed text-foreground/90">
          {formatExplanation(aiExplanation.explanation)}
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Updated {new Date(aiExplanation.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* System Capabilities */}
      <div className="space-y-3">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">
          System Capabilities
        </div>

        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between p-2 bg-secondary/20 rounded border border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs">Intelligent Link Selection</span>
            </div>
            <Badge variant="outline" className="text-xs">Active</Badge>
          </div>

          <div className="flex items-center justify-between p-2 bg-secondary/20 rounded border border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs">Store-and-Forward Buffer</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {systemStatus.system_mode === 'ORBITNET' ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-2 bg-secondary/20 rounded border border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs">Real-time Decision Making</span>
            </div>
            <Badge variant="outline" className="text-xs">Active</Badge>
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div className="mt-4 p-3 bg-success/5 rounded-lg border border-success/20">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-3 h-3 text-success" />
          <span className="text-xs font-medium text-success">Key Insight</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {systemStatus.system_mode === 'ORBITNET' 
            ? "The system automatically adapts to communication conditions while ensuring zero data loss."
            : "The system prioritizes direct ground communication but may lose data during blackouts."
          }
        </div>
      </div>
    </div>
  );
}