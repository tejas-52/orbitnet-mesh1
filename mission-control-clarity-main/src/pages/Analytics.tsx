import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Eye
} from 'lucide-react';
import Navigation from '@/components/Navigation';

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

const Analytics = () => {
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch database status first
      const statusResponse = await fetch('/api/database/status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.success) {
          setDbStatus(statusData);
        }
      }

      // Fetch analytics summary
      const analyticsResponse = await fetch('/api/database/analytics/summary');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        if (analyticsData.success) {
          setAnalytics(analyticsData.summary);
        } else {
          throw new Error('Analytics API returned success=false');
        }
      } else {
        throw new Error(`Analytics API failed: HTTP ${analyticsResponse.status}`);
      }

      // Fetch all sessions
      const sessionsResponse = await fetch('/api/database/sessions');
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        if (sessionsData.success) {
          setSessions(sessionsData.sessions);
        } else {
          throw new Error('Sessions API returned success=false');
        }
      } else {
        throw new Error(`Sessions API failed: HTTP ${sessionsResponse.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics data';
      setError(errorMessage);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/database/sessions/${sessionId}`);
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
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchSessionDetails(selectedSession);
    }
  }, [selectedSession]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background starfield">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background starfield">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="w-5 h-5" />
                Error Loading Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchAnalytics} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background starfield">
      <div className="fixed inset-0 grid-overlay pointer-events-none" />
      <Navigation />

      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2">
                Testing Analytics
              </h1>
              <p className="text-muted-foreground">
                Comprehensive analysis of ORBITNET-MESH testing data and performance metrics
              </p>
              {/* Firebase Status Indicator */}
              {dbStatus && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={dbStatus.database_status === 'connected' ? 'default' : 'destructive'}>
                    💾 Database: {dbStatus.database_status}
                  </Badge>
                  {dbStatus.firebase_enabled ? (
                    <Badge variant={dbStatus.firebase?.connected ? 'default' : 'secondary'}>
                      🔥 Firebase: {dbStatus.firebase?.connected ? 'Connected' : 'Configured'}
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      🔥 Firebase: Not configured
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <Button onClick={fetchAnalytics} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Test Sessions</TabsTrigger>
            <TabsTrigger value="details">Session Details</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {analytics && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="card-glow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.total_sessions}</div>
                      <p className="text-xs text-muted-foreground">
                        {analytics.completed_sessions} completed
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-glow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-success">
                        {analytics.success_rate.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analytics.passed_sessions} passed tests
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-glow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Data Loss Rate</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">
                        {analytics.average_data_loss_percentage.toFixed(2)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Average across all tests
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-glow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Test Score</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics.average_test_score.toFixed(1)}/100
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Average performance score
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Data Transfer Statistics */}
                <Card className="card-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Data Transfer Statistics
                    </CardTitle>
                    <CardDescription>
                      Overall packet transmission performance across all tests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {analytics.total_packets_generated.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Packets Generated</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-success mb-2">
                          {analytics.total_packets_transmitted.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Packets Transmitted</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-warning mb-2">
                          {analytics.overall_transmission_rate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Transmission Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Link Performance */}
                <Card className="card-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Link Performance
                    </CardTitle>
                    <CardDescription>
                      Communication link availability and quality metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Average Link Availability</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${analytics.average_link_availability_percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono">
                            {analytics.average_link_availability_percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Test Sessions
                </CardTitle>
                <CardDescription>
                  All testing sessions with performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No test sessions found
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <div 
                        key={session.session_id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedSession(session.session_id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{session.test_name}</h3>
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
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDateTime(session.start_time)} • {formatDuration(session.duration_seconds)} • {session.test_type}
                          </div>
                        </div>
                        <div className="text-right">
                          {session.test_score !== undefined && (
                            <div className="text-lg font-bold mb-1">
                              {session.test_score.toFixed(1)}/100
                            </div>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Session Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {selectedSession && sessionDetails ? (
              <SessionDetailsView 
                sessionId={selectedSession}
                sessionDetails={sessionDetails}
              />
            ) : (
              <Card className="card-glow">
                <CardContent className="text-center py-12">
                  <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Session Selected</h3>
                  <p className="text-muted-foreground">
                    Select a test session from the Sessions tab to view detailed metrics
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Session Details Component
const SessionDetailsView = ({ sessionId, sessionDetails }: { sessionId: string, sessionDetails: any }) => {
  const session = sessionDetails.session;
  const transmissionHistory = sessionDetails.transmission_history || [];
  const linkEvents = sessionDetails.link_events || [];

  const exportSession = async () => {
    try {
      const response = await fetch(`/api/database/sessions/${sessionId}/export`);
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session_${sessionId}_${Date.now()}.json`;
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
    <div className="space-y-6">
      {/* Session Info */}
      <Card className="card-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                {session.test_name}
              </CardTitle>
              <CardDescription>Session ID: {sessionId}</CardDescription>
            </div>
            <Button onClick={exportSession} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Generated</div>
              <div className="text-2xl font-bold">{session.total_packets_generated || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Transmitted</div>
              <div className="text-2xl font-bold text-success">{session.total_packets_transmitted || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Data Loss</div>
              <div className="text-2xl font-bold text-primary">{(session.overall_data_loss_percentage || 0).toFixed(2)}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Test Score</div>
              <div className="text-2xl font-bold">{(session.test_score || 0).toFixed(1)}/100</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transmission Timeline */}
      {transmissionHistory.length > 0 && (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Transmission Timeline</CardTitle>
            <CardDescription>{transmissionHistory.length} data points collected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Timeline visualization would go here (requires charting library)
            </div>
          </CardContent>
        </Card>
      )}

      {/* Link Events */}
      {linkEvents.length > 0 && (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Link Events</CardTitle>
            <CardDescription>{linkEvents.length} communication events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {linkEvents.slice(-10).map((event: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 border border-border rounded">
                  <div>
                    <span className="font-medium">{event.event_type}</span>
                    <span className="text-muted-foreground ml-2">{event.link_name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;