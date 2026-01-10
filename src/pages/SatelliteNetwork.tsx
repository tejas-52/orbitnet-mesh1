import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Rocket,
    Satellite,
    Radio,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    Database,
    Globe,
    Zap,
    Shield,
    Activity,
    Signal,
    Wifi,
    RefreshCw,
    Eye,
    Brain,
    Target,
    Sparkles,
    TrendingUp,
    Clock,
    MapPin,
    Orbit
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { ParticleField } from '@/components/ui/ParticleField';

const API_BASE_URL = 'http://localhost:8001/api';

interface NetworkStatus {
    linkType: string;
    linkName: string;
    satelliteVisible: boolean;
    groundVisible: boolean;
    queueSize: number;
    transmissionActive: boolean;
    dataFlowStatus: 'live' | 'stored' | 'forwarding';
    signalStrength: number;
    latency: number;
    throughput: number;
}

interface SatelliteData {
    id: string;
    name: string;
    position: { lat: number; lng: number; alt: number };
    status: 'active' | 'standby' | 'maintenance';
    signalStrength: number;
    dataRate: number;
    coverage: number;
}

interface NetworkMetrics {
    totalSatellites: number;
    activeSatellites: number;
    globalCoverage: number;
    dataTransmitted: number;
    packetsBuffered: number;
    networkUptime: number;
    threatLevel: string;
}

const SatelliteNetwork = () => {
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        linkType: 'none',
        linkName: 'Initializing',
        satelliteVisible: false,
        groundVisible: false,
        queueSize: 0,
        transmissionActive: false,
        dataFlowStatus: 'stored',
        signalStrength: 0,
        latency: 0,
        throughput: 0
    });

    const [satellites, setSatellites] = useState<SatelliteData[]>([]);
    const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics | null>(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [selectedSatellite, setSelectedSatellite] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNetworkStatus = async () => {
            try {
                const [linkRes, statusRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/link/status`),
                    fetch(`${API_BASE_URL}/status`),
                ]);

                if (linkRes.ok && statusRes.ok) {
                    const linkData = await linkRes.json();
                    const statusData = await statusRes.json();

                    const groundVisible = linkData.type === 'ground';
                    const satelliteVisible = linkData.type === 'satellite';
                    const transmitting = linkData.available;
                    const stored = statusData.stats?.bufferedPackets || 0;

                    let flowStatus: 'live' | 'stored' | 'forwarding' = 'stored';
                    let message = '';

                    if (linkData.type === 'ground') {
                        flowStatus = stored > 0 ? 'forwarding' : 'live';
                        message = stored > 0
                            ? `🔗 Direct ground link established. Forwarding ${stored} buffered packets at ${Math.floor(Math.random() * 500 + 1000)} Mbps.`
                            : '🚀 Direct ground link active. Live transmission in progress with zero latency buffering.';
                    } else if (linkData.type === 'satellite') {
                        flowStatus = 'live';
                        message = `🛰️ Satellite relay active via ${linkData.name}. Multi-hop routing through ORBITNET-MESH constellation. Ground station acquisition in progress.`;
                    } else {
                        flowStatus = 'stored';
                        message = `⚠️ Communication blackout detected. ORBITNET-MESH store-and-forward protocol engaged. ${stored} packets secured in quantum-encrypted buffer.`;
                    }

                    setNetworkStatus({
                        linkType: linkData.type,
                        linkName: linkData.name || 'Unknown',
                        satelliteVisible,
                        groundVisible,
                        queueSize: stored,
                        transmissionActive: transmitting,
                        dataFlowStatus: flowStatus,
                        signalStrength: linkData.signal_strength || Math.floor(Math.random() * 40 + 60),
                        latency: linkData.latency_ms || Math.floor(Math.random() * 200 + 50),
                        throughput: Math.floor(Math.random() * 800 + 200)
                    });

                    setStatusMessage(message);
                }

                // Generate mock satellite constellation data
                const mockSatellites: SatelliteData[] = [
                    {
                        id: 'ORBITNET-1',
                        name: 'ORBITNET Alpha',
                        position: { lat: 45.2, lng: -122.6, alt: 550 },
                        status: satelliteVisible ? 'active' : 'standby',
                        signalStrength: Math.floor(Math.random() * 30 + 70),
                        dataRate: Math.floor(Math.random() * 500 + 1000),
                        coverage: Math.floor(Math.random() * 10 + 85)
                    },
                    {
                        id: 'ORBITNET-2',
                        name: 'ORBITNET Beta',
                        position: { lat: 52.5, lng: 13.4, alt: 575 },
                        status: 'active',
                        signalStrength: Math.floor(Math.random() * 25 + 75),
                        dataRate: Math.floor(Math.random() * 600 + 900),
                        coverage: Math.floor(Math.random() * 8 + 87)
                    },
                    {
                        id: 'ORBITNET-3',
                        name: 'ORBITNET Gamma',
                        position: { lat: 35.7, lng: 139.7, alt: 525 },
                        status: 'active',
                        signalStrength: Math.floor(Math.random() * 20 + 80),
                        dataRate: Math.floor(Math.random() * 700 + 800),
                        coverage: Math.floor(Math.random() * 12 + 83)
                    },
                    {
                        id: 'ORBITNET-4',
                        name: 'ORBITNET Delta',
                        position: { lat: -33.9, lng: 151.2, alt: 600 },
                        status: 'standby',
                        signalStrength: Math.floor(Math.random() * 35 + 65),
                        dataRate: Math.floor(Math.random() * 400 + 600),
                        coverage: Math.floor(Math.random() * 15 + 80)
                    }
                ];

                setSatellites(mockSatellites);

                // Generate network metrics
                setNetworkMetrics({
                    totalSatellites: mockSatellites.length,
                    activeSatellites: mockSatellites.filter(s => s.status === 'active').length,
                    globalCoverage: Math.floor(Math.random() * 5 + 94),
                    dataTransmitted: Math.floor(Math.random() * 1000 + 15000),
                    packetsBuffered: stored,
                    networkUptime: 99.97,
                    threatLevel: Math.random() > 0.9 ? 'elevated' : 'normal'
                });

                setIsLoading(false);
            } catch (error) {
                console.error('Failed to fetch network status:', error);
                setIsLoading(false);
            }
        };

        fetchNetworkStatus();
        const interval = setInterval(fetchNetworkStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    const getFlowColor = () => {
        switch (networkStatus.dataFlowStatus) {
            case 'live': return 'text-green-500';
            case 'forwarding': return 'text-blue-500';
            case 'stored': return 'text-yellow-500';
            default: return 'text-gray-500';
        }
    };

    const getFlowLabel = () => {
        switch (networkStatus.dataFlowStatus) {
            case 'live': return 'Live Transmission Active';
            case 'forwarding': return 'Store-and-Forward Mode';
            case 'stored': return 'Data Buffering Active';
            default: return 'System Initializing';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background relative overflow-hidden">
                <div className="fixed inset-0 starfield" />
                <div className="fixed inset-0 grid-overlay pointer-events-none opacity-30" />
                <ParticleField count={30} color="primary" />
                <Navigation />
                <div className="container mx-auto px-4 py-24">
                    <motion.div 
                        className="flex flex-col items-center justify-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="mb-6"
                        >
                            <Satellite className="w-16 h-16 text-primary" />
                        </motion.div>
                        <h2 className="text-2xl font-bold mb-2">Scanning Satellite Constellation</h2>
                        <p className="text-muted-foreground mb-6">Establishing connection to ORBITNET-MESH network...</p>
                        <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-primary to-cyan-400"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 starfield" />
            <div className="fixed inset-0 grid-overlay pointer-events-none opacity-20" />
            <ParticleField count={50} color="primary" />
            
            <Navigation />

            <div className="container mx-auto px-4 py-24 relative z-10">
                {/* Hero Header */}
                <motion.div 
                    className="mb-12 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm rounded-full border border-primary/20 mb-6">
                        <Orbit className="w-4 h-4" />
                        <span className="font-medium">SATELLITE NETWORK COMMAND</span>
                    </div>
                    
                    <h1 className="font-display text-4xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
                        <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                            ORBITNET-MESH
                        </span>
                        <br />
                        <span className="text-2xl lg:text-3xl">Constellation Status</span>
                    </h1>
                    
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Real-time monitoring of the world's most advanced satellite communication network. 
                        Zero data loss guaranteed through intelligent mesh routing.
                    </p>
                </motion.div>

                {/* Network Status Alert */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <Card className={`border-2 ${
                        networkStatus.dataFlowStatus === 'live' ? 'border-green-500/50 bg-green-500/5' :
                        networkStatus.dataFlowStatus === 'forwarding' ? 'border-blue-500/50 bg-blue-500/5' :
                        'border-yellow-500/50 bg-yellow-500/5'
                    }`}>
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Activity className={`w-6 h-6 mt-1 ${getFlowColor()}`} />
                                </motion.div>
                                <div className="flex-1">
                                    <div className="font-semibold text-lg mb-1 flex items-center gap-2">
                                        {getFlowLabel()}
                                        <Badge variant={networkStatus.dataFlowStatus === 'live' ? 'default' : 'secondary'}>
                                            {networkStatus.dataFlowStatus.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <p className="text-muted-foreground">{statusMessage}</p>
                                    
                                    {/* Real-time metrics */}
                                    <div className="flex items-center gap-6 mt-3 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Signal className="w-4 h-4 text-primary" />
                                            <span>Signal: {networkStatus.signalStrength}%</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-cyan-500" />
                                            <span>Latency: {networkStatus.latency}ms</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Zap className="w-4 h-4 text-green-500" />
                                            <span>Throughput: {networkStatus.throughput} Mbps</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Network Metrics Dashboard */}
                {networkMetrics && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                        <motion.div whileHover={{ scale: 1.02 }}>
                            <Card className="card-glow bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Satellite className="w-5 h-5 text-primary" />
                                        <Badge variant="outline">{networkMetrics.activeSatellites}/{networkMetrics.totalSatellites}</Badge>
                                    </div>
                                    <div className="text-2xl font-bold text-primary mb-1">
                                        <AnimatedCounter value={networkMetrics.activeSatellites} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Active Satellites</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }}>
                            <Card className="card-glow bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Globe className="w-5 h-5 text-green-500" />
                                        <Badge variant="outline" className="border-green-500 text-green-500">GLOBAL</Badge>
                                    </div>
                                    <div className="text-2xl font-bold text-green-500 mb-1">
                                        <AnimatedCounter value={networkMetrics.globalCoverage} />%
                                    </div>
                                    <p className="text-xs text-muted-foreground">Earth Coverage</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }}>
                            <Card className="card-glow bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Database className="w-5 h-5 text-cyan-500" />
                                        <Badge variant="outline" className="border-cyan-500 text-cyan-500">LIVE</Badge>
                                    </div>
                                    <div className="text-2xl font-bold text-cyan-500 mb-1">
                                        <AnimatedCounter value={networkMetrics.dataTransmitted} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">GB Transmitted</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }}>
                            <Card className="card-glow bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Shield className="w-5 h-5 text-orange-500" />
                                        <Badge variant={networkMetrics.threatLevel === 'normal' ? 'default' : 'destructive'}>
                                            {networkMetrics.threatLevel.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="text-2xl font-bold text-orange-500 mb-1">
                                        <AnimatedCounter value={networkMetrics.networkUptime} decimals={2} />%
                                    </div>
                                    <p className="text-xs text-muted-foreground">Network Uptime</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}

                {/* Data Flow Architecture */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <Card className="card-glow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Activity className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold">Data Flow Architecture</div>
                                    <div className="text-sm text-muted-foreground">End-to-end communication path visualization</div>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between py-12 px-4">
                                <NetworkNode
                                    icon={<Rocket className="w-12 h-12" />}
                                    label="Space Vehicle"
                                    sublabel="LEO Orbit • 550km"
                                    status={networkStatus.transmissionActive ? 'active' : 'standby'}
                                    metrics={{
                                        dataRate: `${networkStatus.throughput} Mbps`,
                                        packets: `${networkStatus.queueSize} buffered`
                                    }}
                                />

                                <DataFlowArrow
                                    active={networkStatus.satelliteVisible}
                                    label="Mesh Uplink"
                                    color={networkStatus.satelliteVisible ? 'green' : 'gray'}
                                    dataRate={networkStatus.satelliteVisible ? `${Math.floor(Math.random() * 500 + 500)} Mbps` : '0 Mbps'}
                                />

                                <NetworkNode
                                    icon={<Satellite className="w-12 h-12" />}
                                    label="ORBITNET Relay"
                                    sublabel={networkStatus.satelliteVisible ? networkStatus.linkName : 'Acquiring Signal'}
                                    status={networkStatus.satelliteVisible ? 'active' : 'inactive'}
                                    metrics={{
                                        signal: `${networkStatus.signalStrength}%`,
                                        coverage: '94% Global'
                                    }}
                                />

                                <DataFlowArrow
                                    active={networkStatus.satelliteVisible || networkStatus.groundVisible}
                                    label="Ground Downlink"
                                    color={networkStatus.groundVisible ? 'green' : networkStatus.satelliteVisible ? 'blue' : 'gray'}
                                    dataRate={networkStatus.groundVisible ? `${Math.floor(Math.random() * 800 + 700)} Mbps` : networkStatus.satelliteVisible ? `${Math.floor(Math.random() * 400 + 300)} Mbps` : '0 Mbps'}
                                />

                                <NetworkNode
                                    icon={<Radio className="w-12 h-12" />}
                                    label="Ground Station"
                                    sublabel={networkStatus.groundVisible ? networkStatus.linkName : 'Out of Range'}
                                    status={networkStatus.groundVisible ? 'active' : 'inactive'}
                                    metrics={{
                                        latency: `${networkStatus.latency}ms`,
                                        uptime: '99.97%'
                                    }}
                                />
                            </div>

                            {/* Store-and-Forward Queue Visualization */}
                            <AnimatePresence>
                                {networkStatus.queueSize > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-8 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Database className="w-6 h-6 text-yellow-600" />
                                            </motion.div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-yellow-700 text-lg">ORBITNET Store-and-Forward Protocol Active</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Quantum-encrypted buffer maintaining data integrity during communication blackouts
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="border-yellow-600 text-yellow-700 px-3 py-1">
                                                <AnimatedCounter value={networkStatus.queueSize} /> Packets Secured
                                            </Badge>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="text-center p-3 bg-yellow-500/5 rounded-lg">
                                                <div className="text-2xl font-bold text-yellow-600">
                                                    <AnimatedCounter value={networkStatus.queueSize * 1.2} decimals={1} />MB
                                                </div>
                                                <div className="text-xs text-muted-foreground">Data Buffered</div>
                                            </div>
                                            <div className="text-center p-3 bg-yellow-500/5 rounded-lg">
                                                <div className="text-2xl font-bold text-yellow-600">0%</div>
                                                <div className="text-xs text-muted-foreground">Data Loss</div>
                                            </div>
                                            <div className="text-center p-3 bg-yellow-500/5 rounded-lg">
                                                <div className="text-2xl font-bold text-yellow-600">
                                                    <AnimatedCounter value={Math.floor(Math.random() * 30 + 120)} />s
                                                </div>
                                                <div className="text-xs text-muted-foreground">Est. Transmission</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Satellite Constellation Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8"
                >
                    <Card className="card-glow">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        ORBITNET Constellation Status
                                    </CardTitle>
                                    <CardDescription>
                                        Real-time monitoring of all satellites in the mesh network
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="sm">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {satellites.map((satellite, index) => (
                                    <motion.div
                                        key={satellite.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                                            selectedSatellite === satellite.id 
                                                ? 'border-primary/50 bg-primary/5' 
                                                : 'border-border hover:border-primary/30'
                                        }`}
                                        onClick={() => setSelectedSatellite(selectedSatellite === satellite.id ? null : satellite.id)}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    animate={satellite.status === 'active' ? { rotate: 360 } : {}}
                                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                                >
                                                    <Satellite className={`w-5 h-5 ${
                                                        satellite.status === 'active' ? 'text-green-500' :
                                                        satellite.status === 'standby' ? 'text-yellow-500' :
                                                        'text-gray-500'
                                                    }`} />
                                                </motion.div>
                                                <div>
                                                    <div className="font-semibold">{satellite.name}</div>
                                                    <div className="text-xs text-muted-foreground">{satellite.id}</div>
                                                </div>
                                            </div>
                                            <Badge variant={satellite.status === 'active' ? 'default' : 'secondary'}>
                                                {satellite.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-3 text-xs">
                                            <div className="text-center">
                                                <div className="font-bold text-primary">
                                                    <AnimatedCounter value={satellite.signalStrength} />%
                                                </div>
                                                <div className="text-muted-foreground">Signal</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-bold text-cyan-500">
                                                    <AnimatedCounter value={satellite.dataRate} />
                                                </div>
                                                <div className="text-muted-foreground">Mbps</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-bold text-green-500">
                                                    <AnimatedCounter value={satellite.coverage} />%
                                                </div>
                                                <div className="text-muted-foreground">Coverage</div>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {selectedSatellite === satellite.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-3 pt-3 border-t border-border/50"
                                                >
                                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-3 h-3 text-muted-foreground" />
                                                            <span>Lat: {satellite.position.lat.toFixed(1)}°</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-3 h-3 text-muted-foreground" />
                                                            <span>Lng: {satellite.position.lng.toFixed(1)}°</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Target className="w-3 h-3 text-muted-foreground" />
                                                            <span>Alt: {satellite.position.alt}km</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-3 h-3 text-muted-foreground" />
                                                            <span>Orbit: 90min</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Network Performance Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <StatusCard
                        title="Satellite Visibility"
                        value={networkStatus.satelliteVisible ? 'ACQUIRED' : 'SEARCHING'}
                        status={networkStatus.satelliteVisible ? 'success' : 'inactive'}
                        icon={<Satellite className="w-5 h-5" />}
                        progress={networkStatus.satelliteVisible ? 100 : 45}
                    />
                    <StatusCard
                        title="Ground Station Link"
                        value={networkStatus.groundVisible ? 'CONNECTED' : 'OUT OF RANGE'}
                        status={networkStatus.groundVisible ? 'success' : 'inactive'}
                        icon={<Radio className="w-5 h-5" />}
                        progress={networkStatus.groundVisible ? 100 : 0}
                    />
                    <StatusCard
                        title="Data Flow Mode"
                        value={networkStatus.linkType === 'ground' ? 'DIRECT' : networkStatus.linkType === 'satellite' ? 'RELAY' : 'BUFFERED'}
                        status={networkStatus.transmissionActive ? 'success' : 'warning'}
                        icon={<ArrowRight className="w-5 h-5" />}
                        progress={networkStatus.transmissionActive ? 100 : 75}
                    />
                    <StatusCard
                        title="Buffer Status"
                        value={`${networkStatus.queueSize} PACKETS`}
                        status={networkStatus.queueSize > 0 ? 'warning' : 'success'}
                        icon={<Database className="w-5 h-5" />}
                        progress={networkStatus.queueSize > 0 ? 75 : 100}
                    />
                </motion.div>
            </div>
        </div>
    );
};

// Enhanced Helper Components
interface NetworkNodeProps {
    icon: React.ReactNode;
    label: string;
    sublabel: string;
    status: 'active' | 'inactive' | 'standby';
    metrics?: {
        [key: string]: string;
    };
}

const NetworkNode = ({ icon, label, sublabel, status, metrics }: NetworkNodeProps) => {
    const colorClasses = {
        active: 'border-green-500 bg-green-500/10 text-green-600',
        inactive: 'border-gray-500 bg-gray-500/10 text-gray-500',
        standby: 'border-blue-500 bg-blue-500/10 text-blue-600',
    };

    return (
        <motion.div 
            className={`flex flex-col items-center p-6 rounded-lg border-2 ${colorClasses[status]} transition-all min-w-[200px]`}
            whileHover={{ scale: 1.05 }}
            animate={status === 'active' ? {
                boxShadow: [
                    '0 0 20px 0 rgba(34, 197, 94, 0.3)',
                    '0 0 40px 5px rgba(34, 197, 94, 0.1)',
                    '0 0 20px 0 rgba(34, 197, 94, 0.3)',
                ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
        >
            <motion.div 
                className="mb-3"
                animate={status === 'active' ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 4, repeat: Infinity }}
            >
                {icon}
            </motion.div>
            <div className="font-semibold text-center text-lg">{label}</div>
            <div className="text-sm text-muted-foreground text-center mb-3">{sublabel}</div>
            
            {metrics && (
                <div className="text-xs space-y-1 text-center">
                    {Object.entries(metrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between gap-2">
                            <span className="capitalize">{key}:</span>
                            <span className="font-mono">{value}</span>
                        </div>
                    ))}
                </div>
            )}
            
            {status === 'active' && (
                <motion.div 
                    className="mt-3"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Badge variant="outline" className="border-green-600 text-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> ONLINE
                    </Badge>
                </motion.div>
            )}
        </motion.div>
    );
};

interface DataFlowArrowProps {
    active: boolean;
    label: string;
    color: 'green' | 'blue' | 'yellow' | 'gray';
    dataRate?: string;
}

const DataFlowArrow = ({ active, label, color, dataRate }: DataFlowArrowProps) => {
    const colorClasses = {
        green: 'text-green-500',
        blue: 'text-blue-500',
        yellow: 'text-yellow-500',
        gray: 'text-gray-400',
    };

    return (
        <div className="flex flex-col items-center px-6">
            <motion.div
                animate={active ? { x: [0, 10, 0] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                <ArrowRight className={`w-8 h-8 ${colorClasses[color]} ${active ? 'drop-shadow-lg' : ''}`} />
            </motion.div>
            <span className={`text-xs mt-1 font-medium ${colorClasses[color]}`}>{label}</span>
            {dataRate && (
                <span className={`text-xs font-mono ${colorClasses[color]} opacity-75`}>{dataRate}</span>
            )}
            
            {active && (
                <motion.div
                    className={`w-1 h-8 ${colorClasses[color].replace('text-', 'bg-')} rounded-full mt-2 opacity-50`}
                    animate={{ scaleY: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
            )}
        </div>
    );
};

interface StatusCardProps {
    title: string;
    value: string;
    status: 'success' | 'warning' | 'inactive';
    icon: React.ReactNode;
    progress?: number;
}

const StatusCard = ({ title, value, status, icon, progress }: StatusCardProps) => {
    const colorClasses = {
        success: 'border-green-500/30 bg-green-500/5',
        warning: 'border-yellow-500/30 bg-yellow-500/5',
        inactive: 'border-gray-500/30 bg-gray-500/5',
    };

    const textColors = {
        success: 'text-green-600',
        warning: 'text-yellow-600',
        inactive: 'text-gray-600',
    };

    return (
        <motion.div whileHover={{ scale: 1.02 }}>
            <Card className={`${colorClasses[status]} card-glow`}>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={textColors[status]}>{icon}</div>
                        <div className="text-sm font-medium text-muted-foreground">{title}</div>
                    </div>
                    <div className={`text-xl font-bold ${textColors[status]} mb-2`}>{value}</div>
                    {progress !== undefined && (
                        <Progress value={progress} className="h-1" />
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default SatelliteNetwork;
