import { motion } from 'framer-motion';
import { MissionHeader } from '@/components/MissionHeader';
import { MissionSummaryBar } from '@/components/MissionSummaryBar';
import { SatelliteMissionState } from '@/components/SatelliteMissionState';
import { CommunicationAvailability } from '@/components/CommunicationAvailability';
import { DataHandlingSafety } from '@/components/DataHandlingSafety';
import { SystemDecisionAI } from '@/components/SystemDecisionAI';
import { DataFlowVisualization } from '@/components/DataFlowVisualization';
import { NetworkTopologyVisualization } from '@/components/NetworkTopologyVisualization';
import { AnimatedDataFlowExplainer } from '@/components/AnimatedDataFlowExplainer';
import { SystemHealthDashboard } from '@/components/SystemHealthDashboard';
import { TelemetryPanel } from '@/components/TelemetryPanel';
import { LinkStatusPanel } from '@/components/LinkStatusPanel';
import { MissionStats } from '@/components/MissionStats';
import { GroundCoverage } from '@/components/GroundCoverage';
import { DataQueueVisualization } from '@/components/DataQueueVisualization';
import { SystemArchitecture } from '@/components/SystemArchitecture';
import { DatabaseStatus } from '@/components/DatabaseStatus';
import { AIExplanation } from '@/components/AIExplanation';
import { SatelliteEmulatorPanel } from '@/components/SatelliteEmulatorPanel';
import { useBackendSimulation } from '@/hooks/useBackendSimulation';
import Navigation from '@/components/Navigation';
import { ParticleField } from '@/components/ui/ParticleField';

const Index = () => {
  const {
    isRunning,
    missionTime,
    orbitnetEnabled,
    telemetry,
    linkStatus,
    storedPackets,
    transmittedPackets,
    stats,
    apiError,
    toggleRunning,
    toggleOrbitnet,
    reset,
  } = useBackendSimulation();

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 starfield" />
      <div className="fixed inset-0 grid-overlay pointer-events-none opacity-50" />
      <ParticleField count={40} color="primary" />

      <Navigation />

      {/* Layer 1: Mission Summary Bar - What's happening NOW? */}
      <MissionSummaryBar />

      <MissionHeader
        isRunning={isRunning}
        onToggleRunning={toggleRunning}
        onReset={reset}
        missionTime={missionTime}
        orbitnetEnabled={orbitnetEnabled}
        onToggleOrbitnet={toggleOrbitnet}
      />

      <main className="container mx-auto px-4 py-8">
        {/* API Error Banner */}
        {apiError && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive">
              <span className="text-sm font-medium">⚠️ Connection Error:</span>
              <span className="text-sm">{apiError}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Make sure the backend server is running on http://localhost:8000
            </p>
          </div>
        )}

        {/* Hero Section */}
        <div className="mb-8">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Smart, low-cost satellite-assisted communication relay system by Beyond Gravity.
              Ensuring zero data loss from LEO to deep space missions.
            </p>
          </div>
        </div>

        {/* Layer 2: Progressive Understanding - Grouped by MEANING */}
        <div className="space-y-8">
          
          {/* Group 1: Satellite & Mission State */}
          <section>
            <SatelliteMissionState 
              telemetry={telemetry} 
              isRunning={isRunning} 
              missionTime={missionTime} 
            />
          </section>

          {/* Group 2: Communication Availability */}
          <section>
            <CommunicationAvailability />
          </section>

          {/* Group 3: Data Handling & Safety */}
          <section>
            <DataHandlingSafety />
          </section>

          {/* NEW: Animated Data Flow Explainer - Visual demonstration */}
          <section>
            <AnimatedDataFlowExplainer />
          </section>

          {/* Group 4: System Decision (AI Explanation) */}
          <section>
            <SystemDecisionAI />
          </section>

          {/* NEW: Visual Data Flow & Network Topology */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataFlowVisualization />
            <NetworkTopologyVisualization />
          </section>

          {/* NEW: System Health Dashboard */}
          <section>
            <SystemHealthDashboard />
          </section>

          {/* Layer 3: Advanced Demo Settings (Collapsible) */}
          <section>
            <details className="group">
              <summary className="cursor-pointer p-4 bg-secondary/20 rounded-lg border border-border/50 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">⚙️ Advanced Demo Settings</span>
                  <span className="text-xs text-muted-foreground ml-auto group-open:hidden">
                    Click to expand emulator controls
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto hidden group-open:inline">
                    Click to collapse
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used to simulate real satellite communication delays for demonstration.
                </p>
              </summary>
              <div className="mt-4">
                <SatelliteEmulatorPanel />
              </div>
            </details>
          </section>

          {/* Layer 3: Testing & Proof (Advanced) */}
          <section>
            <details className="group">
              <summary className="cursor-pointer p-4 bg-secondary/20 rounded-lg border border-border/50 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">📊 Testing & Validation (Proof)</span>
                  <span className="text-xs text-muted-foreground ml-auto group-open:hidden">
                    Click to expand detailed analytics
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto hidden group-open:inline">
                    Click to collapse
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This section proves the system's reliability through measured test sessions.
                </p>
              </summary>
              <div className="mt-4 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TelemetryPanel telemetry={telemetry} />
                  <LinkStatusPanel
                    linkStatus={linkStatus}
                    storedPackets={storedPackets.length}
                    transmittedPackets={transmittedPackets.length}
                  />
                </div>

                <DataQueueVisualization
                  storedPackets={storedPackets}
                  recentTransmitted={transmittedPackets}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <GroundCoverage telemetry={telemetry} />
                  <MissionStats stats={stats} orbitnetEnabled={orbitnetEnabled} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <DatabaseStatus />
                  <SystemArchitecture />
                </div>
              </div>
            </details>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border/50">
          <div className="text-center">
            <div className="font-display text-sm text-muted-foreground mb-2">
              ORBITNET-MESH v1.0
            </div>
            <p className="text-xs text-muted-foreground/70">
              Beyond Gravity • Satellite Communication Relay System
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
