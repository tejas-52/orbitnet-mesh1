import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Rocket,
    Satellite,
    Radio,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    Database
} from 'lucide-react';
import Navigation from '@/components/Navigation';

const API_BASE_URL = 'http://localhost:8000/api';

interface NetworkStatus {
    linkType: string;
    linkName: string;
    satelliteVisible: boolean;
    groundVisible: boolean;
    queueSize: number;
    transmissionActive: boolean;
    dataFlowStatus: 'live' | 'stored' | 'forwarding';
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
    });

    const [statusMessage, setStatusMessage] = useState('');

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
                    const stored = statusData.stats?.totalStored || 0;

                    let flowStatus: 'live' | 'stored' | 'forwarding' = 'stored';
                    let message = '';

                    if (linkData.type === 'ground') {
                        flowStatus = stored > 0 ? 'forwarding' : 'live';
                        message = stored > 0
                            ? `Direct ground link active. Forwarding ${stored} buffered packets.`
                            : 'Direct ground link active. Live transmission in progress.';
                    } else if (linkData.type === 'satellite') {
                        flowStatus = 'live';
                        message = `Satellite relay active via ${linkData.name}. Ground station not directly visible. Data relayed through satellite network.`;
                    } else {
                        flowStatus = 'stored';
                        message = `Communication blackout detected. Buffering data in onboard store-and-forward queue. ${stored} packets stored.`;
                    }

                    setNetworkStatus({
                        linkType: linkData.type,
                        linkName: linkData.name,
                        satelliteVisible,
                        groundVisible,
                        queueSize: stored,
                        transmissionActive: transmitting,
                        dataFlowStatus: flowStatus,
                    });

                    setStatusMessage(message);
                }
            } catch (error) {
                console.error('Failed to fetch network status:', error);
            }
        };

        fetchNetworkStatus();
        const interval = setInterval(fetchNetworkStatus, 1500);
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
            case 'live': return 'Live Transmission';
            case 'forwarding': return 'Forwarding Stored Data';
            case 'stored': return 'Data Buffered';
            default: return 'Unknown';
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 pt-24">
            <Navigation />

            <div className="container mx-auto max-w-7xl">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Satellite className="w-8 h-8 text-primary" />
                        <h1 className="text-4xl font-bold">Satellite Network View</h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Real-time visualization of ORBITNET-MESH communication architecture
                    </p>
                </div>

                <Card className="mb-8 border-2 border-primary/50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <AlertCircle className={`w-6 h-6 mt-1 ${getFlowColor()}`} />
                            <div className="flex-1">
                                <div className="font-semibold text-lg mb-1">{getFlowLabel()}</div>
                                <p className="text-muted-foreground">{statusMessage}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Data Flow Architecture</CardTitle>
                        <CardDescription>End-to-end communication path from spacecraft to ground station</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between py-12 px-4">
                            <NetworkNode
                                icon={<Rocket className="w-12 h-12" />}
                                label="Space Vehicle"
                                sublabel="LEO Orbit"
                                status={networkStatus.transmissionActive ? 'active' : 'standby'}
                            />

                            <DataFlowArrow
                                active={networkStatus.satelliteVisible}
                                label="Uplink"
                                color={networkStatus.satelliteVisible ? 'green' : 'gray'}
                            />

                            <NetworkNode
                                icon={<Satellite className="w-12 h-12" />}
                                label="Relay Satellite"
                                sublabel={networkStatus.satelliteVisible ? networkStatus.linkName : 'Standby'}
                                status={networkStatus.satelliteVisible ? 'active' : 'inactive'}
                            />

                            <DataFlowArrow
                                active={networkStatus.satelliteVisible || networkStatus.groundVisible}
                                label="Downlink"
                                color={networkStatus.groundVisible ? 'green' : networkStatus.satelliteVisible ? 'blue' : 'gray'}
                            />

                            <NetworkNode
                                icon={<Radio className="w-12 h-12" />}
                                label="Ground Station"
                                sublabel={networkStatus.groundVisible ? networkStatus.linkName : 'Out of Range'}
                                status={networkStatus.groundVisible ? 'active' : 'inactive'}
                            />
                        </div>

                        {networkStatus.queueSize > 0 && (
                            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Database className="w-5 h-5 text-yellow-600" />
                                    <div className="flex-1">
                                        <div className="font-semibold text-yellow-700">Store-and-Forward Queue Active</div>
                                        <div className="text-sm text-muted-foreground">{networkStatus.queueSize} packets buffered, awaiting transmission</div>
                                    </div>
                                    <Badge variant="outline" className="border-yellow-600 text-yellow-700">{networkStatus.queueSize} Packets</Badge>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatusCard
                        title="Satellite Visibility"
                        value={networkStatus.satelliteVisible ? 'YES' : 'NO'}
                        status={networkStatus.satelliteVisible ? 'success' : 'inactive'}
                        icon={<Satellite className="w-5 h-5" />}
                    />
                    <StatusCard
                        title="Ground Visibility"
                        value={networkStatus.groundVisible ? 'YES' : 'NO'}
                        status={networkStatus.groundVisible ? 'success' : 'inactive'}
                        icon={<Radio className="w-5 h-5" />}
                    />
                    <StatusCard
                        title="Active Link Type"
                        value={networkStatus.linkType === 'ground' ? 'Direct Ground' : networkStatus.linkType === 'satellite' ? 'Satellite Relay' : 'None'}
                        status={networkStatus.transmissionActive ? 'success' : 'warning'}
                        icon={<ArrowRight className="w-5 h-5" />}
                    />
                    <StatusCard
                        title="Queue Size"
                        value={`${networkStatus.queueSize} packets`}
                        status={networkStatus.queueSize > 0 ? 'warning' : 'success'}
                        icon={<Database className="w-5 h-5" />}
                    />
                </div>
            </div>
        </div>
    );
};

// Helper Components
interface NetworkNodeProps {
    icon: React.ReactNode;
    label: string;
    sublabel: string;
    status: 'active' | 'inactive' | 'standby';
}

const NetworkNode = ({ icon, label, sublabel, status }: NetworkNodeProps) => {
    const colorClasses = {
        active: 'border-green-500 bg-green-500/10 text-green-600',
        inactive: 'border-gray-500 bg-gray-500/10 text-gray-500',
        standby: 'border-blue-500 bg-blue-500/10 text-blue-600',
    };

    return (
        <div className={`flex flex-col items-center p-6 rounded-lg border-2 ${colorClasses[status]} transition-all`}>
            <div className="mb-3">{icon}</div>
            <div className="font-semibold text-center">{label}</div>
            <div className="text-sm text-muted-foreground text-center">{sublabel}</div>
            {status === 'active' && (
                <div className="mt-2">
                    <Badge variant="outline" className="border-green-600 text-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                    </Badge>
                </div>
            )}
        </div>
    );
};

interface DataFlowArrowProps {
    active: boolean;
    label: string;
    color: 'green' | 'blue' | 'yellow' | 'gray';
}

const DataFlowArrow = ({ active, label, color }: DataFlowArrowProps) => {
    const colorClasses = {
        green: 'text-green-500',
        blue: 'text-blue-500',
        yellow: 'text-yellow-500',
        gray: 'text-gray-400',
    };

    return (
        <div className="flex flex-col items-center px-4">
            <ArrowRight className={`w-8 h-8 ${colorClasses[color]} ${active ? 'animate-pulse' : ''}`} />
            <span className={`text-xs mt-1 ${colorClasses[color]}`}>{label}</span>
        </div>
    );
};

interface StatusCardProps {
    title: string;
    value: string;
    status: 'success' | 'warning' | 'inactive';
    icon: React.ReactNode;
}

const StatusCard = ({ title, value, status, icon }: StatusCardProps) => {
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
        <Card className={colorClasses[status]}>
            <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className={textColors[status]}>{icon}</div>
                    <div className="text-sm font-medium text-muted-foreground">{title}</div>
                </div>
                <div className={`text-xl font-bold ${textColors[status]}`}>{value}</div>
            </CardContent>
        </Card>
    );
};

export default SatelliteNetwork;
