import { DataPacket } from '@/lib/simulation';
import { cn } from '@/lib/utils';
import { Database, Send, Clock, CheckCircle } from 'lucide-react';

interface DataQueueVisualizationProps {
  storedPackets: DataPacket[];
  recentTransmitted: DataPacket[];
}

export function DataQueueVisualization({ storedPackets, recentTransmitted }: DataQueueVisualizationProps) {
  const displayedStored = storedPackets.slice(-10);
  const displayedTransmitted = recentTransmitted.slice(-10);

  return (
    <div className="card-glow bg-card rounded-lg border border-border p-6">
      <h3 className="panel-header mb-4">Store-and-Forward Queue</h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Stored Queue */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Buffered ({storedPackets.length})
            </span>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {displayedStored.length === 0 ? (
              <div className="text-xs text-muted-foreground italic py-4 text-center">
                No packets in buffer
              </div>
            ) : (
              displayedStored.map((packet) => (
                <div
                  key={packet.id}
                  className="flex items-center gap-2 bg-warning/10 border border-warning/20 rounded px-2 py-1.5 text-xs"
                >
                  <Clock className="w-3 h-3 text-warning flex-shrink-0" />
                  <span className="font-mono text-warning truncate">{packet.id}</span>
                  {packet.retries > 0 && (
                    <span className="text-warning/70 ml-auto">×{packet.retries}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transmitted Queue */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Send className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Transmitted ({recentTransmitted.length})
            </span>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {displayedTransmitted.length === 0 ? (
              <div className="text-xs text-muted-foreground italic py-4 text-center">
                No recent transmissions
              </div>
            ) : (
              displayedTransmitted.map((packet) => (
                <div
                  key={packet.id}
                  className={cn(
                    'flex items-center gap-2 rounded px-2 py-1.5 text-xs',
                    packet.status === 'forwarded'
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-success/10 border border-success/20'
                  )}
                >
                  <CheckCircle className={cn(
                    'w-3 h-3 flex-shrink-0',
                    packet.status === 'forwarded' ? 'text-primary' : 'text-success'
                  )} />
                  <span className={cn(
                    'font-mono truncate',
                    packet.status === 'forwarded' ? 'text-primary' : 'text-success'
                  )}>
                    {packet.id}
                  </span>
                  <span className={cn(
                    'text-xs ml-auto',
                    packet.status === 'forwarded' ? 'text-primary/70' : 'text-success/70'
                  )}>
                    {packet.status === 'forwarded' ? 'FWD' : 'TX'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Visual Data Flow */}
      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-warning/10 border border-warning/30 flex items-center justify-center">
              <Database className="w-4 h-4 text-warning" />
            </div>
            <div className="text-xs">
              <div className="text-foreground">Buffer</div>
              <div className="text-muted-foreground">{storedPackets.length} pkts</div>
            </div>
          </div>

          <div className="flex-1 mx-4 h-1 bg-secondary/50 rounded-full overflow-hidden relative">
            {storedPackets.length > 0 && (
              <div className="absolute inset-0 data-stream" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-success/10 border border-success/30 flex items-center justify-center">
              <Send className="w-4 h-4 text-success" />
            </div>
            <div className="text-xs">
              <div className="text-foreground">Sent</div>
              <div className="text-muted-foreground">{recentTransmitted.length} pkts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
