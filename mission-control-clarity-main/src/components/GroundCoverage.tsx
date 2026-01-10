import { groundStations, GroundStation, TelemetryData } from '@/lib/simulation';
import { MapPin, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroundCoverageProps {
  telemetry: TelemetryData | null;
}

export function GroundCoverage({ telemetry }: GroundCoverageProps) {
  // Simple map projection (Mercator-like)
  const projectToMap = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x, y };
  };

  const spacecraftPos = telemetry ? projectToMap(telemetry.position.lat, telemetry.position.lng) : null;

  return (
    <div className="card-glow bg-card rounded-lg border border-border p-6">
      <h3 className="panel-header mb-4">Ground Station Coverage</h3>

      {/* Map Container */}
      <div className="relative aspect-[2/1] bg-secondary/30 rounded-lg overflow-hidden border border-border/50">
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-overlay opacity-50" />
        
        {/* Continent outlines (simplified) */}
        <svg 
          viewBox="0 0 100 50" 
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Simple world outline - simplified continents */}
          <path
            d="M10,20 Q15,15 25,18 L30,15 Q35,12 45,15 L55,18 Q60,20 65,15 L75,12 Q85,15 90,20"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="0.3"
            opacity="0.3"
          />
          <path
            d="M20,25 Q25,28 35,26 L45,30 Q50,32 55,28 L65,25"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="0.3"
            opacity="0.3"
          />
          <path
            d="M70,30 Q75,35 80,32 L85,35"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="0.3"
            opacity="0.3"
          />
          <path
            d="M55,35 Q60,40 65,38 L70,42"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="0.3"
            opacity="0.3"
          />
        </svg>

        {/* Ground stations */}
        {groundStations.map((station) => {
          const pos = projectToMap(station.location.lat, station.location.lng);
          return (
            <div
              key={station.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {/* Coverage circle */}
              <div
                className="absolute rounded-full border border-success/30 bg-success/5 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: `${station.coverage * 2}px`,
                  height: `${station.coverage * 2}px`,
                  left: '50%',
                  top: '50%',
                }}
              />
              {/* Station marker */}
              <div className="relative z-10">
                <div className="w-3 h-3 bg-success rounded-full border-2 border-success/50 shadow-[0_0_10px_hsl(152_76%_45%_/_0.5)]" />
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                <div className="bg-background/95 backdrop-blur-sm border border-border rounded px-2 py-1 text-xs whitespace-nowrap">
                  <div className="font-medium text-foreground">{station.name}</div>
                  <div className="text-muted-foreground">
                    {station.location.lat.toFixed(1)}°, {station.location.lng.toFixed(1)}°
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Spacecraft position */}
        {spacecraftPos && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-1000"
            style={{ left: `${spacecraftPos.x}%`, top: `${spacecraftPos.y}%` }}
          >
            {/* Orbit trail effect */}
            <div className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <div className="absolute inset-0 rounded-full border border-primary/50 animate-ping" />
            </div>
            {/* Spacecraft marker */}
            <div className="relative">
              <div className="w-4 h-4 bg-primary rounded-sm transform rotate-45 border-2 border-primary shadow-[0_0_15px_hsl(192_95%_55%_/_0.6)]" />
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span className="text-muted-foreground">Ground Station</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-primary rounded-sm transform rotate-45" />
            <span className="text-muted-foreground">Spacecraft</span>
          </div>
        </div>
      </div>

      {/* Station List */}
      <div className="mt-4 space-y-2">
        {groundStations.slice(0, 3).map((station) => (
          <div
            key={station.id}
            className="flex items-center justify-between text-xs bg-secondary/30 rounded px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                station.status === 'online' ? 'bg-success' : 'bg-destructive'
              )} />
              <span className="text-foreground">{station.name}</span>
            </div>
            <span className="text-muted-foreground font-mono">
              {station.coverage}° coverage
            </span>
          </div>
        ))}
        <div className="text-xs text-muted-foreground text-center pt-1">
          +{groundStations.length - 3} more stations
        </div>
      </div>
    </div>
  );
}
