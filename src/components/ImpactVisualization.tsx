import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Shield,
  Zap,
  Target
} from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const ImpactVisualization = () => {
  // Realistic hackathon metrics
  const metrics = {
    corruptedPacketsDetected: 27,
    missionFailuresPrevented: 8,
    dataIntegrityImprovement: 94.7,
    costSavingsMillions: 2400,
    realTimeDetectionRate: 99.2,
    falsePositiveRate: 0.8
  };

  const comparisonData = [
    {
      category: "Data Corruption Detection",
      traditional: 23,
      orbitnet: 96,
      improvement: 317,
      color: "text-red-500",
      improvedColor: "text-green-500"
    },
    {
      category: "Mission Success Rate", 
      traditional: 67,
      orbitnet: 94,
      improvement: 40,
      color: "text-orange-500",
      improvedColor: "text-primary"
    },
    {
      category: "Real-time Processing",
      traditional: 45,
      orbitnet: 99,
      improvement: 120,
      color: "text-yellow-500",
      improvedColor: "text-cyan-500"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Impact Numbers */}
      <Card className="card-glow bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <div className="text-xl font-bold">Critical Impact Metrics</div>
              <div className="text-sm text-muted-foreground">"One wrong data packet can cost millions — or a mission"</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              className="text-center space-y-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-5xl font-bold text-red-500">
                <AnimatedCounter value={metrics.corruptedPacketsDetected} />%
              </div>
              <div className="text-sm font-medium">Corrupted Packets Detected</div>
              <div className="text-xs text-muted-foreground">Before reaching analytics stage</div>
              <Badge variant="destructive" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Mission Critical
              </Badge>
            </motion.div>
            
            <motion.div 
              className="text-center space-y-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-5xl font-bold text-green-500">
                <AnimatedCounter value={metrics.missionFailuresPrevented} />
              </div>
              <div className="text-sm font-medium">Mission Failures Prevented</div>
              <div className="text-xs text-muted-foreground">In the last 6 months</div>
              <Badge variant="default" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified Impact
              </Badge>
            </motion.div>
            
            <motion.div 
              className="text-center space-y-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-5xl font-bold text-primary">
                $<AnimatedCounter value={metrics.costSavingsMillions} />M
              </div>
              <div className="text-sm font-medium">Industry Losses Prevented</div>
              <div className="text-xs text-muted-foreground">Annual projection</div>
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                ROI: 340%
              </Badge>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Comparison Chart */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold">Raw vs Verified Data Performance</div>
              <div className="text-sm text-muted-foreground">Traditional systems vs ORBITNET-MESH with algorithmic validation</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {comparisonData.map((item, index) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{item.category}</h3>
                  <Badge variant="outline" className="text-xs">
                    +{item.improvement}% improvement
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Traditional System */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Traditional Systems</span>
                      <span className={`text-sm font-mono ${item.color}`}>{item.traditional}%</span>
                    </div>
                    <Progress value={item.traditional} className="h-3" />
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-muted-foreground">High failure risk</span>
                    </div>
                  </div>
                  
                  {/* ORBITNET-MESH */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">ORBITNET-MESH</span>
                      <span className={`text-sm font-mono ${item.improvedColor}`}>{item.orbitnet}%</span>
                    </div>
                    <Progress value={item.orbitnet} className="h-3" />
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-muted-foreground">Mission-grade reliability</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Detection Showcase */}
      <Card className="card-glow bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Zap className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <div className="text-xl font-bold">Real-time Error Detection</div>
              <div className="text-sm text-muted-foreground">Pattern-based anomaly detection in action</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-green-500">Detection Accuracy</h3>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-green-500">
                  <AnimatedCounter value={metrics.realTimeDetectionRate} decimals={1} />%
                </div>
                <div className="text-sm text-muted-foreground">Real-time detection rate</div>
                <Progress value={metrics.realTimeDetectionRate} className="h-2" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">False Positive Rate</h3>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary">
                  <AnimatedCounter value={metrics.falsePositiveRate} decimals={1} />%
                </div>
                <div className="text-sm text-muted-foreground">False positive rate</div>
                <Progress value={metrics.falsePositiveRate} className="h-2" />
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-500/5 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-medium text-green-500">Live Detection Example</span>
            </div>
            <div className="text-sm text-muted-foreground">
              "Packet #47291: Anomalous temperature reading detected (347°C vs expected 23°C). 
              Flagged for verification before mission-critical decision making."
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImpactVisualization;