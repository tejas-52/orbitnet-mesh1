import { MissionHeader } from '@/components/MissionHeader';
import { useBackendSimulation } from '@/hooks/useBackendSimulation';
import Navigation from '@/components/Navigation';
import { ParticleField } from '@/components/ui/ParticleField';
import { WinningHeroSection } from '@/components/WinningHeroSection';
import { RealWorldImpact } from '@/components/RealWorldImpact';
import { HowItWorks } from '@/components/HowItWorks';
import { MissionCommandBar } from '@/components/MissionCommandBar';
import { MissionControlPanel } from '@/components/MissionControlPanel';
import { DataFlowPipeline } from '@/components/DataFlowPipeline';
import { useState, useCallback, useEffect } from 'react';

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

  // Blackout simulation state - shared across all components
  const [blackoutActive, setBlackoutActive] = useState(false);
  
  // Fetch blackout status from backend
  const fetchBlackoutStatus = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8001/api/blackout/status');
      if (response.ok) {
        const data = await response.json();
        setBlackoutActive(data.blackout_active);
      }
    } catch (error) {
      // Ignore errors - blackout simulation is optional
    }
  }, []);
  
  // Toggle blackout simulation via backend API
  const toggleBlackout = async () => {
    try {
      const endpoint = blackoutActive ? 'clear' : 'simulate';
      const response = await fetch(`http://localhost:8001/api/blackout/${endpoint}`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setBlackoutActive(data.blackout_active);
        console.log('🔴 Blackout simulation:', data.message);
      }
    } catch (error) {
      console.error('Failed to toggle blackout simulation:', error);
      // Fallback to local state if backend is unavailable
      setBlackoutActive(!blackoutActive);
    }
  };
  
  // Sync blackout status with backend
  useEffect(() => {
    fetchBlackoutStatus();
    const interval = setInterval(fetchBlackoutStatus, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, [fetchBlackoutStatus]);
  
  // Calculate effective communication availability (now handled by backend)
  const effectiveCommunicationAvailable = (linkStatus?.available || false);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 starfield" />
      <div className="fixed inset-0 grid-overlay pointer-events-none opacity-50" />
      <ParticleField count={40} color="primary" />

      <Navigation />

      {/* WINNING HERO SECTION - Grabs attention immediately */}
      <WinningHeroSection 
        onStartDemo={toggleRunning}
        isRunning={isRunning}
      />

      {/* REAL WORLD IMPACT - Shows why this matters */}
      <RealWorldImpact />

      {/* HOW IT WORKS - Simple explanation */}
      <HowItWorks />

      {/* Layer 1: Mission Summary Bar - What's happening NOW? */}

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
              Make sure the backend server is running on http://localhost:8001
            </p>
          </div>
        )}

        {/* 🏗️ STRUCTURED DASHBOARD - 2 CLEAR SECTIONS */}
        <div className="space-y-12">

          {/* 📊 SECTION 1: Mission Command Bar */}
          <section className="space-y-4">
            <MissionCommandBar
              isRunning={isRunning}
              orbitnetEnabled={orbitnetEnabled}
              communicationAvailable={effectiveCommunicationAvailable}
              storedPackets={storedPackets.length}
              dataLossRate={stats.dataLossRate}
              blackoutActive={blackoutActive}
              onToggleBlackout={toggleBlackout}
            />
          </section>

          {/* 🎛️ SECTION 2: Unified Mission Control Panel */}
          <section className="space-y-4">
            <MissionControlPanel
              isRunning={isRunning}
              communicationAvailable={effectiveCommunicationAvailable}
              orbitnetEnabled={orbitnetEnabled}
              storedPackets={storedPackets.length}
              transmittedPackets={transmittedPackets.length}
              totalPackets={stats.totalPackets}
              lostPackets={stats.lostPackets}
              telemetry={telemetry}
              isBlackoutMode={blackoutActive}
            />
          </section>

          {/* 🚀 SECTION 3: Data Flow Pipeline */}
          <section className="space-y-4">
            <DataFlowPipeline
              isRunning={isRunning}
              communicationAvailable={effectiveCommunicationAvailable}
              orbitnetEnabled={orbitnetEnabled}
              storedPackets={storedPackets.length}
              transmittedPackets={transmittedPackets.length}
              totalPackets={stats.totalPackets}
              lostPackets={stats.lostPackets}
              telemetry={telemetry}
            />
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
