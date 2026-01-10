import { Rocket, Satellite, Radio, Server, Monitor, Database, ArrowRight, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SystemArchitecture() {
  const components = [
    {
      icon: Rocket,
      title: 'Spacecraft',
      subtitle: 'Onboard System',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
      features: ['Telemetry Generation', 'Store & Forward', 'Link Selection'],
    },
    {
      icon: Satellite,
      title: 'Relay Satellites',
      subtitle: 'EDRS / TDRS',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      features: ['GEO Coverage', 'Data Relay', 'Optical/RF Links'],
    },
    {
      icon: Radio,
      title: 'Ground Stations',
      subtitle: 'ESTRACK Network',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      features: ['Direct Downlink', 'Command Uplink', 'Global Coverage'],
    },
    {
      icon: Server,
      title: 'Backend',
      subtitle: 'Cloud Processing',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/30',
      features: ['Data Processing', 'Path Optimization', 'Analytics'],
    },
    {
      icon: Monitor,
      title: 'Mission Control',
      subtitle: 'Dashboard',
      color: 'text-foreground',
      bgColor: 'bg-secondary/50',
      borderColor: 'border-border',
      features: ['Real-time Monitoring', 'Zero Loss Verify', 'Link Status'],
    },
  ];

  return (
    <div className="card-glow bg-card rounded-lg border border-border p-6">
      <h3 className="panel-header mb-6">System Architecture</h3>

      {/* Horizontal Flow */}
      <div className="hidden lg:flex items-center justify-between gap-4 overflow-x-auto pb-4">
        {components.map((comp, index) => (
          <div key={comp.title} className="flex items-center gap-4 flex-shrink-0">
            <div className={cn(
              'rounded-xl p-4 border transition-all hover:scale-105',
              comp.bgColor,
              comp.borderColor
            )}>
              <div className="flex flex-col items-center text-center">
                <div className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center mb-3',
                  comp.bgColor,
                  'border',
                  comp.borderColor
                )}>
                  <comp.icon className={cn('w-6 h-6', comp.color)} />
                </div>
                <div className={cn('font-display text-sm font-medium', comp.color)}>
                  {comp.title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {comp.subtitle}
                </div>
                <div className="mt-3 space-y-1">
                  {comp.features.map((feature) => (
                    <div
                      key={feature}
                      className="text-xs text-muted-foreground bg-background/50 rounded px-2 py-0.5"
                    >
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {index < components.length - 1 && (
              <ArrowRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Vertical Flow for Mobile */}
      <div className="lg:hidden space-y-4">
        {components.map((comp, index) => (
          <div key={comp.title}>
            <div className={cn(
              'rounded-xl p-4 border',
              comp.bgColor,
              comp.borderColor
            )}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                  comp.bgColor,
                  'border',
                  comp.borderColor
                )}>
                  <comp.icon className={cn('w-6 h-6', comp.color)} />
                </div>
                <div className="flex-1">
                  <div className={cn('font-display text-sm font-medium', comp.color)}>
                    {comp.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {comp.subtitle}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {comp.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs text-muted-foreground bg-background/50 rounded px-2 py-0.5"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {index < components.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Key Innovation */}
      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-display text-sm text-primary mb-1">
                Store-and-Forward Innovation
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When no communication link is available, telemetry data is securely buffered onboard.
                Once connectivity is restored via ground station or satellite relay, stored data is
                automatically forwarded to ensure <span className="text-success font-medium">zero data loss</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
