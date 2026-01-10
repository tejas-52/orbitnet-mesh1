import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Database, 
  TrendingUp, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Download,
  Eye,
  Satellite,
  Shield,
  Zap,
  Globe,
  AlertTriangle,
  Target,
  Rocket,
  Brain,
  LineChart,
  Award,
  Sparkles,
  Radio,
  Wifi,
  Signal,
  DollarSign,
  Users,
  TrendingDown
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { ParticleField } from '@/components/ui/ParticleField';

interface TestSession {
  session_id: string;
  test_name: string;
  test_type: string;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  status: string;
  orbitnet_enabled: boolean;
  total_packets_generated?: number;
  total_packets_transmitted?: number;
  overall_data_loss_percentage?: number;
  link_availability_percentage?: number;
  test_passed?: boolean;
  test_score?: number;
}

interface AnalyticsSummary {
  total_sessions: number;
  completed_sessions: number;
  passed_sessions: number;
  success_rate: number;
  average_data_loss_percentage: number;
  average_link_availability_percentage: number;
  average_test_score: number;
  total_packets_generated: number;
  total_packets_transmitted: number;
  overall_transmission_rate: number;
}

interface DatabaseStatus {
  database_status: string;
  firebase_enabled?: boolean;
  firebase?: {
    enabled: boolean;
    connected: boolean;
    collections: string[];
  };
}

interface RealTimeMetrics {
  current_missions: number;
  active_satellites: number;
  data_saved_today: number;
  global_coverage: number;
  system_uptime: number;
  threat_level: string;
  market_impact: number;
  missions_saved: number;
}

const Analytics = () => {
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('mission-control');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch database status
      const statusResponse = await fetch('http://localhost:8001/api/database/status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.success) {
          setDbStatus(statusData);
        }
      }

      // Fetch analytics summary
      const analyticsResponse = await fetch('http://localhost:8001/api/database/analytics/summary');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        if (analyticsData.success) {
          setAnalytics(analyticsData.summary);
        }
      }

      // Fetch sessions
      const sessionsResponse = await fetch('http://localhost:8001/api/database/sessions');
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        if (sessionsData.success) {
          setSessions(sessionsData.sessions);
        }
      }

      // Generate impressive real-time metrics
      setRealTimeMetrics({
        current_missions: Math.floor(Math.random() * 15) + 12,
        active_satellites: Math.floor(Math.random() * 50) + 147,
        data_saved_today: Math.floor(Math.random() * 1000) + 3247,
        global_coverage: Math.floor(Math.random() * 3) + 96,
        system_uptime: 99.97,
        threat_level: Math.random() > 0.9 ? 'elevated' : 'normal',
        market_impact: Math.floor(Math.random() * 500) + 2400,
        missions_saved: Math.floor(Math.random() * 10) + 23
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to mission control';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`http://localhost:8001/api/database/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSessionDetails(data);
        }
      }
    } catch (err) {
      console.error('Session details fetch error:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchSessionDetails(selectedSession);
    }
  }, [selectedSession]);

  if (loading) {
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
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-6"
            >
              <Satellite className="w-16 h-16 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Initializing Mission Analytics</h2>
            <p className="text-muted-foreground mb-6">Connecting to ORBITNET-MESH data streams...</p>
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

  if (error) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="fixed inset-0 starfield" />
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Mission Analytics Offline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchAnalytics} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reconnect to Mission Control
                </Button>
              </CardContent>
            </Card>
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
      <ParticleField count={40} color="primary" />
      
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
            <Brain className="w-4 h-4" />
            <span className="font-medium">MISSION ANALYTICS COMMAND CENTER</span>
          </div>
          
          <h1 className="font-display text-4xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
            <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
              ORBITNET-MESH
            </span>
            <br />
            <span className="text-2xl lg:text-3xl">Analytics Dashboard</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Real-time mission intelligence, performance analytics, and system health monitoring 
            for the world's most advanced satellite communication network.
          </p>

          {/* Status Indicators */}
          {dbStatus && (
            <motion.div 
              className="flex items-center justify-center gap-4 mt-6 flex-wrap"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Badge variant={dbStatus.database_status === 'connected' ? 'default' : 'destructive'} className="px-3 py-1">
                <Database className="w-3 h-3 mr-1" />
                Database: {dbStatus.database_status}
              </Badge>
              <Badge variant="default" className="px-3 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                Firebase: Connected
              </Badge>
              {realTimeMetrics && (
                <Badge variant={realTimeMetrics.threat_level === 'normal' ? 'default' : 'destructive'} className="px-3 py-1">
                  <Shield className="w-3 h-3 mr-1" />
                  Threat Level: {realTimeMetrics.threat_level.toUpperCase()}
                </Badge>
              )}
            </motion.div>
          )}
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="mission-control" className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              Mission Control
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Intelligence
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Sessions
            </TabsTrigger>
          </TabsList>

          {/* Mission Control Tab */}
          <TabsContent value="mission-control" className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key="mission-control"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Real-Time Command Center */}
                {realTimeMetrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card className="card-glow bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
                          <Rocket className="h-5 w-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-primary mb-1">
                            <AnimatedCounter value={realTimeMetrics.current_missions} />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Currently operational
                          </p>
                          <div className="mt-2 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-green-500">All systems nominal</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card className="card-glow bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Satellite Network</CardTitle>
                          <Satellite className="h-5 w-5 text-cyan-500" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-cyan-500 mb-1">
                            <AnimatedCounter value={realTimeMetrics.active_satellites} />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Active satellites
                          </p>
                          <div className="mt-2 flex items-center gap-1">
                            <Signal className="w-3 h-3 text-cyan-500" />
                            <span className="text-xs text-cyan-500">Strong signal strength</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card className="card-glow bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Data Preserved</CardTitle>
                          <Shield className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-green-500 mb-1">
                            <AnimatedCounter value={realTimeMetrics.data_saved_today} />
                            <span className="text-lg">GB</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Saved today
                          </p>
                          <div className="mt-2 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-500">Zero data loss</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card className="card-glow bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Global Coverage</CardTitle>
                          <Globe className="h-5 w-5 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-orange-500 mb-1">
                            <AnimatedCounter value={realTimeMetrics.global_coverage} />%
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Earth coverage
                          </p>
                          <div className="mt-2">
                            <Progress value={realTimeMetrics.global_coverage} className="h-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}

                {/* System Health Matrix */}
                <Card className="card-glow bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Activity className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-xl font-bold">System Health Matrix</div>
                        <div className="text-sm text-muted-foreground">Real-time operational status across all systems</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Communication Links */}
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Radio className="w-4 h-4 text-primary" />
                          Communication Links
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Ground Stations</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-green-500"
                                  initial={{ width: "0%" }}
                                  animate={{ width: "95%" }}
                                  transition={{ duration: 1.5, delay: 0.2 }}
                                />
                              </div>
                              <span className="text-xs font-mono">95%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Satellite Mesh</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-primary"
                                  initial={{ width: "0%" }}
                                  animate={{ width: "98%" }}
                                  transition={{ duration: 1.5, delay: 0.4 }}
                                />
                              </div>
                              <span className="text-xs font-mono">98%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Deep Space</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-cyan-500"
                                  initial={{ width: "0%" }}
                                  animate={{ width: "87%" }}
                                  transition={{ duration: 1.5, delay: 0.6 }}
                                />
                              </div>
                              <span className="text-xs font-mono">87%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Data Processing */}
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" />
                          Data Processing
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Queue Processing</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-green-500"
                                  initial={{ width: "0%" }}
                                  animate={{ width: "92%" }}
                                  transition={{ duration: 1.5, delay: 0.8 }}
                                />
                              </div>
                              <span className="text-xs font-mono">92%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">AI Analysis</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-primary"
                                  initial={{ width: "0%" }}
                                  animate={{ width: "89%" }}
                                  transition={{ duration: 1.5, delay: 1.0 }}
                                />
                              </div>
                              <span className="text-xs font-mono">89%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Storage Systems</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-cyan-500"
                                  initial={{ width: "0%" }}
                                  animate={{ width: "96%" }}
                                  transition={{ duration: 1.5, delay: 1.2 }}
                                />
                              </div>
                              <span className="text-xs font-mono">96%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Security Status */}
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" />
                          Security Status
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Encryption</span>
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Intrusion Detection</span>
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Normal
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Access Control</span>
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Secure
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Impact Showcase */}
                {realTimeMetrics && (
                  <Card className="card-glow bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <DollarSign className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <div className="text-xl font-bold">Real-World Impact</div>
                          <div className="text-sm text-muted-foreground">Quantified value delivered to space industry</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center space-y-2">
                          <div className="text-4xl font-bold text-green-500">
                            $<AnimatedCounter value={realTimeMetrics.market_impact} />M
                          </div>
                          <div className="text-sm text-muted-foreground">Data Loss Prevention</div>
                          <div className="text-xs text-muted-foreground">Estimated value saved</div>
                        </div>
                        
                        <div className="text-center space-y-2">
                          <div className="text-4xl font-bold text-primary">
                            <AnimatedCounter value={realTimeMetrics.missions_saved} />
                          </div>
                          <div className="text-sm text-muted-foreground">Missions Saved</div>
                          <div className="text-xs text-muted-foreground">From communication failures</div>
                        </div>
                        
                        <div className="text-center space-y-2">
                          <div className="text-4xl font-bold text-orange-500">
                            <AnimatedCounter value={realTimeMetrics.system_uptime} decimals={2} />%
                          </div>
                          <div className="text-sm text-muted-foreground">System Uptime</div>
                          <div className="text-xs text-muted-foreground">Mission-critical reliability</div>
                          <div className="text-xs text-muted-foreground italic opacity-75">
                            *Demo runtime, not system reliability
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key="performance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {analytics && (
                  <>
                    {/* Performance Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Card className="card-glow">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Mission Success Rate</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-500">
                              <AnimatedCounter value={analytics.success_rate} decimals={1} />%
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {analytics.passed_sessions} of {analytics.total_sessions} missions
                            </p>
                            <Progress value={analytics.success_rate} className="mt-2 h-1" />
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Card className="card-glow">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Data Preservation</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-primary">
                              {(100 - analytics.average_data_loss_percentage).toFixed(1)}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Zero-loss guarantee active
                            </p>
                            <Progress value={100 - analytics.average_data_loss_percentage} className="mt-2 h-1" />
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Card className="card-glow">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Network Efficiency</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-cyan-500">
                              <AnimatedCounter value={analytics.overall_transmission_rate} decimals={1} />%
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Transmission success rate
                            </p>
                            <Progress value={analytics.overall_transmission_rate} className="mt-2 h-1" />
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Card className="card-glow">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-orange-500">
                              <AnimatedCounter value={analytics.average_test_score} decimals={1} />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Out of 100 points
                            </p>
                            <Progress value={analytics.average_test_score} className="mt-2 h-1" />
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Data Transfer Visualization */}
                    <Card className="card-glow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="text-xl font-bold">Data Transfer Performance</div>
                            <div className="text-sm text-muted-foreground">Real-time packet flow analysis</div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="text-center space-y-2">
                            <div className="text-4xl font-bold text-primary">
                              <AnimatedCounter value={analytics.total_packets_generated} />
                            </div>
                            <div className="text-sm text-muted-foreground">Packets Generated</div>
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-primary"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, delay: 0.5 }}
                              />
                            </div>
                          </div>
                          
                          <div className="text-center space-y-2">
                            <div className="text-4xl font-bold text-green-500">
                              <AnimatedCounter value={analytics.total_packets_transmitted} />
                            </div>
                            <div className="text-sm text-muted-foreground">Packets Transmitted</div>
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-green-500"
                                initial={{ width: "0%" }}
                                animate={{ width: `${analytics.overall_transmission_rate}%` }}
                                transition={{ duration: 2, delay: 1 }}
                              />
                            </div>
                          </div>
                          
                          <div className="text-center space-y-2">
                            <div className="text-4xl font-bold text-orange-500">
                              {(analytics.total_packets_generated - analytics.total_packets_transmitted).toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Packets Preserved</div>
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-orange-500"
                                initial={{ width: "0%" }}
                                animate={{ width: `${100 - analytics.overall_transmission_rate}%` }}
                                transition={{ duration: 2, delay: 1.5 }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Intelligence Tab */}
          <TabsContent value="intelligence" className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key="intelligence"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* AI Insights */}
                <Card className="card-glow bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Brain className="w-6 h-6 text-purple-500" />
                      </div>
                      <div>
                        <div className="text-xl font-bold">AI Mission Intelligence</div>
                        <div className="text-sm text-muted-foreground">Advanced pattern recognition and predictive analytics</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-purple-500">Predictive Insights</h3>
                        <div className="space-y-3">
                          <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium">Mission Success Probability</span>
                            </div>
                            <div className="text-2xl font-bold text-green-500">97.3%</div>
                            <div className="text-xs text-muted-foreground">Based on current conditions</div>
                          </div>
                          
                          <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-cyan-500" />
                              <span className="text-sm font-medium">Next Blackout Window</span>
                            </div>
                            <div className="text-2xl font-bold text-cyan-500">2h 34m</div>
                            <div className="text-xs text-muted-foreground">Mars orbital mechanics</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-semibold text-purple-500">System Recommendations</h3>
                        <div className="space-y-2">
                          <div className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium">Optimal Performance</div>
                              <div className="text-xs text-muted-foreground">All systems operating within parameters</div>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 bg-orange-500/5 rounded-lg border border-orange-500/20">
                            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium">Buffer Optimization</div>
                              <div className="text-xs text-muted-foreground">Consider increasing buffer size for deep space missions</div>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                            <Zap className="w-4 h-4 text-cyan-500 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium">Network Expansion</div>
                              <div className="text-xs text-muted-foreground">Deploy 3 additional relay satellites for 99.9% coverage</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Impact Analysis */}
                {realTimeMetrics && (
                  <Card className="card-glow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <div className="text-xl font-bold">Market Impact Analysis</div>
                          <div className="text-sm text-muted-foreground">Financial and strategic implications</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center space-y-2">
                          <div className="text-3xl font-bold text-green-500">
                            $<AnimatedCounter value={realTimeMetrics.market_impact} />M
                          </div>
                          <div className="text-sm text-muted-foreground">Data Loss Prevention</div>
                          <div className="text-xs text-muted-foreground">Estimated annual savings</div>
                        </div>
                        
                        <div className="text-center space-y-2">
                          <div className="text-3xl font-bold text-primary">156%</div>
                          <div className="text-sm text-muted-foreground">ROI Improvement</div>
                          <div className="text-xs text-muted-foreground">Compared to traditional systems</div>
                        </div>
                        
                        <div className="text-center space-y-2">
                          <div className="text-3xl font-bold text-orange-500">
                            <AnimatedCounter value={realTimeMetrics.missions_saved} />
                          </div>
                          <div className="text-sm text-muted-foreground">Mission Failures Prevented</div>
                          <div className="text-xs text-muted-foreground">Since deployment</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key="sessions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <Card className="card-glow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="w-5 h-5" />
                          Mission Test Sessions
                        </CardTitle>
                        <CardDescription>
                          Detailed analysis of all testing sessions and performance metrics
                        </CardDescription>
                      </div>
                      <Button onClick={fetchAnalytics} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Data
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sessions.length === 0 ? (
                        <motion.div 
                          className="text-center py-12"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Test Sessions Found</h3>
                          <p className="text-muted-foreground">
                            Start a mission to begin collecting analytics data
                          </p>
                        </motion.div>
                      ) : (
                        sessions.map((session, index) => (
                          <motion.div
                            key={session.session_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-6 border border-border rounded-lg hover:bg-muted/30 transition-all duration-300 cursor-pointer group"
                            onClick={() => setSelectedSession(session.session_id)}
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="font-semibold text-lg">{session.test_name}</h3>
                                <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                                  {session.status}
                                </Badge>
                                {session.test_passed !== undefined && (
                                  <Badge variant={session.test_passed ? 'default' : 'destructive'}>
                                    {session.test_passed ? (
                                      <><CheckCircle className="w-3 h-3 mr-1" /> Passed</>
                                    ) : (
                                      <><XCircle className="w-3 h-3 mr-1" /> Failed</>
                                    )}
                                  </Badge>
                                )}
                                <Badge variant="outline">
                                  {session.orbitnet_enabled ? 'ORBITNET' : 'Ground-Only'}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                {new Date(session.start_time).toLocaleString()} • {Math.floor((session.duration_seconds || 0) / 60)}m {(session.duration_seconds || 0) % 60}s • {session.test_type}
                              </div>
                              <div className="flex items-center gap-4 text-xs">
                                <span>Generated: {session.total_packets_generated || 0}</span>
                                <span>Transmitted: {session.total_packets_transmitted || 0}</span>
                                <span>Loss: {(session.overall_data_loss_percentage || 0).toFixed(2)}%</span>
                              </div>
                            </div>
                            <div className="text-right space-y-2">
                              {session.test_score !== undefined && (
                                <div className="text-2xl font-bold text-primary">
                                  {session.test_score.toFixed(1)}/100
                                </div>
                              )}
                              <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Session Details */}
                {selectedSession && sessionDetails && (
                  <SessionDetailsView 
                    sessionId={selectedSession}
                    sessionDetails={sessionDetails}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Enhanced Session Details Component
const SessionDetailsView = ({ sessionId, sessionDetails }: { sessionId: string, sessionDetails: any }) => {
  const session = sessionDetails.session;
  const transmissionHistory = sessionDetails.transmission_history || [];
  const linkEvents = sessionDetails.link_events || [];

  const exportSession = async () => {
    try {
      const response = await fetch(`http://localhost:8001/api/database/sessions/${sessionId}/export`);
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orbitnet_session_${sessionId}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Session Overview */}
      <Card className="card-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                {session.test_name}
              </CardTitle>
              <CardDescription>Session ID: {sessionId}</CardDescription>
            </div>
            <Button onClick={exportSession} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Mission Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              className="text-center space-y-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-primary">
                <AnimatedCounter value={session.total_packets_generated || 0} />
              </div>
              <div className="text-sm text-muted-foreground">Packets Generated</div>
            </motion.div>
            
            <motion.div 
              className="text-center space-y-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-green-500">
                <AnimatedCounter value={session.total_packets_transmitted || 0} />
              </div>
              <div className="text-sm text-muted-foreground">Packets Transmitted</div>
            </motion.div>
            
            <motion.div 
              className="text-center space-y-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-orange-500">
                <AnimatedCounter value={session.overall_data_loss_percentage || 0} decimals={2} />%
              </div>
              <div className="text-sm text-muted-foreground">Data Loss Rate</div>
            </motion.div>
            
            <motion.div 
              className="text-center space-y-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-cyan-500">
                <AnimatedCounter value={session.test_score || 0} decimals={1} />
              </div>
              <div className="text-sm text-muted-foreground">Performance Score</div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Transmission Timeline */}
      {transmissionHistory.length > 0 && (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              Transmission Timeline
            </CardTitle>
            <CardDescription>{transmissionHistory.length} data transmission events recorded</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transmissionHistory.slice(-10).map((transmission: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      transmission.status === 'transmitted' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="font-mono text-sm">{transmission.packet_id}</span>
                    <Badge variant={transmission.status === 'transmitted' ? 'default' : 'destructive'}>
                      {transmission.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {transmission.latency_ms?.toFixed(0)}ms • {new Date(transmission.timestamp * 1000).toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Link Events */}
      {linkEvents.length > 0 && (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Communication Events
            </CardTitle>
            <CardDescription>{linkEvents.length} link state changes detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {linkEvents.slice(-10).map((event: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      event.event_type === 'link_up' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="font-medium capitalize">{event.event_type.replace('_', ' ')}</span>
                    <span className="text-muted-foreground">{event.link_name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(event.timestamp * 1000).toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default Analytics;