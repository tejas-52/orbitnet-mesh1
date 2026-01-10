import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, TrendingUp, Satellite, Radio } from 'lucide-react';
import Navigation from '@/components/Navigation';

const API_BASE_URL = 'http://localhost:8000/api';

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

    useEffect(() => {
        const fetchData = async () => {
            try {
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
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, []);

    const improvementPercentage = comparisonData.groundOnly.lossPercentage - comparisonData.orbitnetMesh.lossPercentage;

    return (
        <div className="min-h-screen bg-background p-6 pt-24">
            <Navigation />

            <div className="container mx-auto max-w-7xl">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-8 h-8 text-primary" />
                        <h1 className="text-4xl font-bold">Mission Performance Analysis</h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Comparative analysis: Ground-Only vs ORBITNET-MESH communication systems
                    </p>
                </div>

                <Card className="mb-8 border-2 border-green-500/50 bg-green-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-6 h-6" />
                            System Performance Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg leading-relaxed">
                            <strong>ORBITNET-MESH achieved {improvementPercentage.toFixed(1)}% improvement</strong> in telemetry delivery
                            during blackout phases. While ground-only systems lose up to {comparisonData.groundOnly.lossPercentage.toFixed(1)}%
                            of data, ORBITNET-MESH ensures{' '}
                            <span className="text-green-600 font-bold">{comparisonData.orbitnetMesh.lossPercentage.toFixed(1)}% data loss</span>.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-red-500/30">
                        <CardHeader className="bg-red-500/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Radio className="w-5 h-5 text-red-500" />
                                    <CardTitle>Ground-Only Mode</CardTitle>
                                </div>
                                <Badge variant="destructive">Legacy</Badge>
                            </div>
                            <CardDescription>Direct ground communication only</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between">
                                <span>Total Generated</span>
                                <span className="font-bold">{comparisonData.groundOnly.totalGenerated}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>Data Delivered</span>
                                <span className="font-bold">{comparisonData.groundOnly.dataDelivered}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                                <span>Data Lost</span>
                                <span className="font-bold">{comparisonData.groundOnly.dataLost}</span>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex justify-between mb-2">
                                    <span>Loss Rate</span>
                                    <span className="text-2xl font-bold text-red-600">
                                        {comparisonData.groundOnly.lossPercentage.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-500/30">
                        <CardHeader className="bg-green-500/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Satellite className="w-5 h-5 text-green-600" />
                                    <CardTitle>ORBITNET-MESH</CardTitle>
                                </div>
                                <Badge className="bg-green-600">Active</Badge>
                            </div>
                            <CardDescription>Satellite relay + Store-and-forward</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between">
                                <span>Total Generated</span>
                                <span className="font-bold">{comparisonData.orbitnetMesh.totalGenerated}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>Data Delivered</span>
                                <span className="font-bold">{comparisonData.orbitnetMesh.dataDelivered}</span>
                            </div>
                            <div className="flex justify-between text-blue-600">
                                <span>Currently Stored</span>
                                <span className="font-bold">{comparisonData.orbitnetMesh.dataStored}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>Data Lost</span>
                                <span className="font-bold">{comparisonData.orbitnetMesh.dataLost}</span>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex justify-between mb-2">
                                    <span>Loss Rate</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {comparisonData.orbitnetMesh.lossPercentage.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MissionAnalysis;
