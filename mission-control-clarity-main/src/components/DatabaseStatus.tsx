import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Activity, TrendingUp, RefreshCw, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DatabaseStatus {
  database_status: string;
  data_collection: {
    active: boolean;
    current_session_id?: string;
  };
  statistics: {
    total_sessions: number;
    completed_sessions: number;
    latest_session?: any;
  };
}

interface AnalyticsSummary {
  total_sessions: number;
  success_rate: number;
  average_data_loss_percentage: number;
  total_packets_generated: number;
  total_packets_transmitted: number;
}

export function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setError(null);
      
      // Fetch database status
      const statusResponse = await fetch('/api/database/status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.success) {
          setStatus(statusData);
        }
      }

      // Fetch analytics summary
      const analyticsResponse = await fetch('/api/database/analytics/summary');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        if (analyticsData.success) {
          setAnalytics(analyticsData.summary);
        }
      }
    } catch (err) {
      setError('Database not available');
      console.error('Database status error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="card-glow bg-card rounded-lg border border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2">Loading database status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !status) {
    return (
      <Card className="card-glow bg-card rounded-lg border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-destructive mb-2">Database Unavailable</div>
            <p className="text-sm text-muted-foreground mb-4">
              Testing analytics are not available
            </p>
            <Button onClick={fetchStatus} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-glow bg-card rounded-lg border border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Testing Analytics
            </CardTitle>
            <CardDescription>
              Database status and testing metrics
            </CardDescription>
          </div>
          <Link to="/analytics">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Analytics
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Database Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Database Status</span>
          <Badge variant={status.database_status === 'connected' ? 'default' : 'destructive'}>
            {status.database_status === 'connected' ? '✅ Connected' : '❌ Disconnected'}
          </Badge>
        </div>

        {/* Data Collection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Data Collection</span>
          <div className="flex items-center gap-2">
            <Badge variant={status.data_collection.active ? 'default' : 'secondary'}>
              {status.data_collection.active ? (
                <>
                  <Activity className="w-3 h-3 mr-1" />
                  Active
                </>
              ) : (
                'Inactive'
              )}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        {analytics && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {analytics.total_sessions}
              </div>
              <div className="text-xs text-muted-foreground">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success">
                {analytics.success_rate.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-warning">
                {analytics.average_data_loss_percentage.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Avg Data Loss</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {analytics.total_packets_generated.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Packets Generated</div>
            </div>
          </div>
        )}

        {/* Current Session Info */}
        {status.data_collection.active && status.data_collection.current_session_id && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Active Test Session</span>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {status.data_collection.current_session_id}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center pt-2">
          <Button onClick={fetchStatus} variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}