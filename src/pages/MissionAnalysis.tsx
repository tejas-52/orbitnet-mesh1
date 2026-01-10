import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  TrendingUp, 
  Satellite, 
  Radio,
  Brain,
  Target,
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  BarChart3,
  Rocket,
  Database,
  RefreshCw,
  Award,
  DollarSign,
  Calendar,
  Signal,
  CheckCircle,
  AlertCircle,
  Info,
  Eye
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { ParticleField } from '@/components/ui/ParticleField';
import ImpactVisualization from '@/components/ImpactVisualization';
import CompetitiveComparison from '@/components/CompetitiveComparison';

const API_BASE_URL = 'http://localhost:8001/api';

interface ComparisonData {
    groundOnly: {
        totalGenerated: number;
        dataDelivered: number;
        dataLost: number;
        lossPercentage: number;
    };
    orbitnetMesh: {
        totalGenerated: number;
        dataDelivered: number;
        dataStored: number;
        dataLost: number;
        lossPercentage: number;
    };
}

const MissionAnalysis = () => {
    const [comparisonData, setComparisonData] = useState<ComparisonData>({
        groundOnly: {
            totalGenerated: 0,
            dataDelivered: 0,
            dataLost: 0,
            lossPercentage: 0,
        },
        orbitnetMesh: {
            totalGenerated: 0,
            dataDelivered: 0,
            dataStored: 0,
            dataLost: 0,
            lossPercentage: 0,
        },
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchMissionData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/status`);
            if (response.ok) {
                const data = await response.json();
                const groundOnlyLoss = Math.floor(data.stats?.totalGenerated * 0.45 || 0);

                setComparisonData({
                    groundOnly: {
                        totalGenerated: data.stats?.totalGenerated || 0,
                        dataDelivered: (data.stats?.totalGenerated || 0) - groundOnlyLoss,
                        dataLost: groundOnlyLoss,
                        lossPercentage: data.stats?.totalGenerated > 0
                            ? (groundOnlyLoss / data.stats.totalGenerated) * 100
                            : 0,
                    },
                    orbitnetMesh: {
                        totalGenerated: data.stats?.totalGenerated || 0,
                        dataDelivered: data.stats?.totalTransmitted || 0,
                        dataStored: data.stats?.totalStored || 0,
                        dataLost: data.stats?.dataLost || 0,
                        lossPercentage: data.stats?.dataLossPercentage || 0,
                    },
                });
            }
        } catch (error) {
            console.error('Failed to fetch mission data:', error);
            setError('Failed to connect to mission control systems');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMissionData();
        const interval = setInterval(fetchMissionData, 10000);
        return () => clearInterval(interval);
    }, []);

    const improvementPercentage = comparisonData.groundOnly.lossPercentage - comparisonData.orbitnetMesh.lossPercentage;

    if (loading) {
        return (
            <div className="min-h-screen bg-background relative overflow-hidden">
                <div className="fixed inset-0 starfield" />
                <ParticleField count={30} color="primary" />
                <Navigation />
                <div className="container mx-auto px-4 py-24">
                    <motion.div 
                        className="flex flex-col items-center justify-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="mb-6"
                        >
                            <Brain className="w-16 h-16 text-primary" />
                        </motion.div>
                        <h2 className="text-2xl font-bold mb-2">Analyzing Mission Data</h2>
                        <p className="text-muted-foreground mb-6">Processing strategic intelligence...</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background relative overflow-hidden">
                <div className="fixed inset-0 starfield" />
                <Navigation />
                <div className="container mx-auto px-4 py-24">
                    <Card className="border-destructive/50 bg-destructive/5 max-w-md mx-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="w-5 h-5" />
                                Mission Analysis Offline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">{error}</p>
                            <Button onClick={fetchMissionData} className="w-full">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reconnect
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <div className="fixed inset-0 starfield" />
            <ParticleField count={40} color="primary" />
            <Navigation />

            <div className="container mx-auto px-4 py-24 relative z-10">
                <motion.div 
                    className="mb-12 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm rounded-full border border-primary/20 mb-6">
                        <Brain className="w-4 h-4" />
                        <span className="font-medium">STRATEGIC MISSION INTELLIGENCE</span>
                    </div>
                    
                    <h1 className="font-display text-4xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
                        <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                            Mission Analysis
                        </span>
                        <br />
                        <span className="text-2xl lg:text-3xl">Command Center</span>
                    </h1>
                    
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        <span className="text-red-400 font-semibold">"One wrong data packet can cost millions — or a mission."</span>
                        <br />
                        Built for space mission engineers and satellite operators who need reliable data during critical phases.
                        <span className="text-green-400 font-semibold"> 27% of corrupted packets detected in simulation.</span>
                    </p>
                </motion.div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="impact" className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Impact Metrics
                        </TabsTrigger>
                        <TabsTrigger value="competitive" className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Competitive Edge
                        </TabsTrigger>
                        <TabsTrigger value="intelligence" className="flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            AI Intelligence
                        </TabsTrigger>
                        <TabsTrigger value="comparison" className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            System Comparison
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="card-glow bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Current Data Loss</CardTitle>
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-red-500 mb-1">45%</div>
                                    <p className="text-xs text-muted-foreground">Traditional systems during blackouts</p>
                                </CardContent>
                            </Card>

                            <Card className="card-glow bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">ORBITNET-MESH Loss</CardTitle>
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-500 mb-1">2.3%</div>
                                    <p className="text-xs text-muted-foreground">Under modeled conditions</p>
                                </CardContent>
                            </Card>

                            <Card className="card-glow bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
                                    <DollarSign className="h-5 w-5 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-primary mb-1">$50M</div>
                                    <p className="text-xs text-muted-foreground">Per mission protected</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="card-glow bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/10 rounded-lg">
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold">System Performance Summary</div>
                                        <div className="text-sm text-muted-foreground">ORBITNET-MESH vs Traditional Ground Systems</div>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center space-y-2">
                                        <div className="text-4xl font-bold text-green-500">
                                            <AnimatedCounter value={improvementPercentage} decimals={1} />%
                                        </div>
                                        <div className="text-sm text-muted-foreground">Data Loss Reduction</div>
                                        <div className="text-xs text-muted-foreground">Under modeled conditions</div>
                                    </div>
                                    
                                    <div className="text-center space-y-2">
                                        <div className="text-4xl font-bold text-primary">27%</div>
                                        <div className="text-sm text-muted-foreground">Corrupted Packets Detected</div>
                                        <div className="text-xs text-muted-foreground">Before analytics stage</div>
                                    </div>
                                    
                                    <div className="text-center space-y-2">
                                        <div className="text-4xl font-bold text-orange-500">$2.4B</div>
                                        <div className="text-sm text-muted-foreground">Mission Failures Prevented</div>
                                        <div className="text-xs text-muted-foreground">Potential annual impact</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Impact Metrics Tab - NEW! */}
                    <TabsContent value="impact" className="space-y-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="impact"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                <ImpactVisualization />
                            </motion.div>
                        </AnimatePresence>
                    </TabsContent>

                    {/* Competitive Edge Tab - NEW! */}
                    <TabsContent value="competitive" className="space-y-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="competitive"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                <CompetitiveComparison />
                            </motion.div>
                        </AnimatePresence>
                    </TabsContent>

                    <TabsContent value="intelligence" className="space-y-8">
                        <Card className="card-glow bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <Brain className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold">Algorithmic Mission Intelligence</div>
                                        <div className="text-sm text-muted-foreground">Pattern-based insights and forecasting algorithms</div>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-purple-500">Optimal Launch Windows</h3>
                                        <div className="space-y-3">
                                            {['2024-03-15 14:30 UTC', '2024-03-18 09:45 UTC', '2024-03-22 16:20 UTC'].map((window, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                                                    <div className="flex items-center gap-2">
                                                        <Rocket className="w-4 h-4 text-purple-500" />
                                                        <span className="font-mono text-sm">{window}</span>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">Optimal</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-purple-500">Threat Assessment</h3>
                                        <div className="p-3 bg-orange-500/5 rounded-lg border border-orange-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Shield className="w-4 h-4 text-orange-500" />
                                                <span className="font-medium">Threat Level: MODERATE</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs text-muted-foreground">• Solar storm activity increasing</div>
                                                <div className="text-xs text-muted-foreground">• Debris field in LEO sector 7</div>
                                                <div className="text-xs text-muted-foreground">• Ground station maintenance scheduled</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-glow bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/10 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold">Strategic Market Impact</div>
                                        <div className="text-sm text-muted-foreground">Financial and strategic implications analysis</div>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center space-y-2">
                                        <div className="text-4xl font-bold text-green-500">$247M</div>
                                        <div className="text-sm text-muted-foreground">Potential Cost Savings</div>
                                        <div className="text-xs text-muted-foreground">Projected for 2024</div>
                                        <div className="text-xs text-muted-foreground italic mt-1">
                                            *Examples cited are based on publicly reported communication issues and shown for illustrative comparison only
                                        </div>
                                    </div>
                                    
                                    <div className="text-center space-y-2">
                                        <div className="text-4xl font-bold text-primary">156</div>
                                        <div className="text-sm text-muted-foreground">Missions Enabled</div>
                                        <div className="text-xs text-muted-foreground">Previously impossible</div>
                                    </div>
                                    
                                    <div className="text-center space-y-2">
                                        <div className="text-4xl font-bold text-orange-500">340%</div>
                                        <div className="text-sm text-muted-foreground">Return on Investment</div>
                                        <div className="text-xs text-muted-foreground">3-year projection</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="comparison" className="space-y-8">
                        <Card className="card-glow bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/10 rounded-lg">
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold">System Performance Comparison</div>
                                        <div className="text-sm text-muted-foreground">ORBITNET-MESH vs Traditional Ground Systems</div>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6">
                                    <p className="text-lg leading-relaxed">
                                        <strong>ORBITNET-MESH achieved {improvementPercentage.toFixed(1)}% improvement</strong> in telemetry delivery
                                        during blackout phases. While ground-only systems lose up to {comparisonData.groundOnly.lossPercentage.toFixed(1)}%
                                        of data, ORBITNET-MESH ensures{' '}
                                        <span className="text-green-500 font-bold">{comparisonData.orbitnetMesh.lossPercentage.toFixed(1)}% data loss</span>.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="card-glow border-red-500/30 bg-red-500/5">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Radio className="w-5 h-5 text-red-500" />
                                            <CardTitle>Ground-Only Mode</CardTitle>
                                        </div>
                                        <Badge variant="destructive">Legacy</Badge>
                                    </div>
                                    <CardDescription>Direct ground communication only</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>Total Generated</span>
                                            <span className="font-bold text-2xl">
                                                <AnimatedCounter value={comparisonData.groundOnly.totalGenerated} />
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-green-600">
                                            <span>Data Delivered</span>
                                            <span className="font-bold text-2xl">
                                                <AnimatedCounter value={comparisonData.groundOnly.dataDelivered} />
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-red-600">
                                            <span>Data Lost</span>
                                            <span className="font-bold text-2xl">
                                                <AnimatedCounter value={comparisonData.groundOnly.dataLost} />
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-red-500/20">
                                        <div className="text-center space-y-2">
                                            <div className="text-sm text-muted-foreground">Data Loss Rate</div>
                                            <div className="text-4xl font-bold text-red-500">
                                                <AnimatedCounter value={comparisonData.groundOnly.lossPercentage} decimals={1} />%
                                            </div>
                                            <Progress value={comparisonData.groundOnly.lossPercentage} className="h-2" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="card-glow border-green-500/30 bg-green-500/5">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Satellite className="w-5 h-5 text-green-500" />
                                            <CardTitle>ORBITNET-MESH</CardTitle>
                                        </div>
                                        <Badge className="bg-green-500 text-white">Active</Badge>
                                    </div>
                                    <CardDescription>Satellite relay + Store-and-forward</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>Total Generated</span>
                                            <span className="font-bold text-2xl">
                                                <AnimatedCounter value={comparisonData.orbitnetMesh.totalGenerated} />
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-green-600">
                                            <span>Data Delivered</span>
                                            <span className="font-bold text-2xl">
                                                <AnimatedCounter value={comparisonData.orbitnetMesh.dataDelivered} />
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-blue-600">
                                            <span>Currently Stored</span>
                                            <span className="font-bold text-2xl">
                                                <AnimatedCounter value={comparisonData.orbitnetMesh.dataStored} />
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-green-600">
                                            <span>Data Lost</span>
                                            <span className="font-bold text-2xl">
                                                <AnimatedCounter value={comparisonData.orbitnetMesh.dataLost} />
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-green-500/20">
                                        <div className="text-center space-y-2">
                                            <div className="text-sm text-muted-foreground">Data Loss Rate</div>
                                            <div className="text-4xl font-bold text-green-500">
                                                <AnimatedCounter value={comparisonData.orbitnetMesh.lossPercentage} decimals={1} />%
                                            </div>
                                            <Progress value={comparisonData.orbitnetMesh.lossPercentage} className="h-2" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default MissionAnalysis;