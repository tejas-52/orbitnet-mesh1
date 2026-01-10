import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Zap,
  Shield,
  Target,
  TrendingUp
} from 'lucide-react';

const CompetitiveComparison = () => {
  const competitors = [
    {
      name: "Traditional Ground Systems",
      type: "Legacy",
      features: [
        { name: "Real-time Validation", supported: false, note: "Post-processing only" },
        { name: "Blackout Resilience", supported: false, note: "45% data loss" },
        { name: "Corruption Detection", supported: false, note: "Manual inspection" },
        { name: "Multi-path Redundancy", supported: false, note: "Single point failure" },
        { name: "AI-powered Analytics", supported: false, note: "Not available" }
      ],
      marketShare: "78%",
      reliability: "67%",
      cost: "High",
      color: "red"
    },
    {
      name: "Basic Satellite Relays",
      type: "Current Gen",
      features: [
        { name: "Real-time Validation", supported: false, note: "No validation" },
        { name: "Blackout Resilience", supported: true, note: "Limited coverage" },
        { name: "Corruption Detection", supported: false, note: "Blind forwarding" },
        { name: "Multi-path Redundancy", supported: true, note: "Basic redundancy" },
        { name: "AI-powered Analytics", supported: false, note: "Not implemented" }
      ],
      marketShare: "18%",
      reliability: "78%",
      cost: "Medium",
      color: "orange"
    },
    {
      name: "ORBITNET-MESH",
      type: "Next Gen",
      features: [
        { name: "Real-time Validation", supported: true, note: "99.2% detection rate" },
        { name: "Blackout Resilience", supported: true, note: "2.3% data loss" },
        { name: "Corruption Detection", supported: true, note: "27% caught pre-analytics" },
        { name: "Multi-path Redundancy", supported: true, note: "Mesh architecture" },
        { name: "AI-powered Analytics", supported: true, note: "Predictive insights" }
      ],
      marketShare: "4%",
      reliability: "94%",
      cost: "Competitive",
      color: "green"
    }
  ];

  const whyNowFactors = [
    {
      factor: "Satellite Explosion",
      stat: "12,000+",
      description: "New satellites launched in 2024 alone",
      impact: "3x growth creates congestion and interference"
    },
    {
      factor: "Private Space Race",
      stat: "47",
      description: "Private space companies active in 2024",
      impact: "More players = more complexity = more failures"
    },
    {
      factor: "Mission Complexity",
      stat: "$4.2B",
      description: "Annual losses from communication failures",
      impact: "Mars, Moon missions can't afford data loss"
    },
    {
      factor: "AI Maturity",
      stat: "99.2%",
      description: "Real-time validation accuracy achieved",
      impact: "Finally possible to validate at satellite scale"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Why Now Section */}
      <Card className="card-glow bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold">Why ORBITNET-MESH? Why Now?</div>
              <div className="text-sm text-muted-foreground">The perfect storm creating the need for next-gen satellite communication</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyNowFactors.map((factor, index) => (
              <motion.div
                key={factor.factor}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center space-y-3"
              >
                <div className="text-3xl font-bold text-primary">{factor.stat}</div>
                <div className="font-semibold">{factor.factor}</div>
                <div className="text-sm text-muted-foreground">{factor.description}</div>
                <div className="text-xs text-primary font-medium">{factor.impact}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Matrix */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Target className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <div className="text-xl font-bold">Competitive Landscape</div>
              <div className="text-sm text-muted-foreground">How ORBITNET-MESH compares to existing solutions</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {competitors.map((competitor, index) => (
              <motion.div
                key={competitor.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`p-6 rounded-lg border ${
                  competitor.color === 'green' ? 'border-green-500/20 bg-green-500/5' :
                  competitor.color === 'orange' ? 'border-orange-500/20 bg-orange-500/5' :
                  'border-red-500/20 bg-red-500/5'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold">{competitor.name}</h3>
                    <Badge variant={
                      competitor.type === 'Next Gen' ? 'default' :
                      competitor.type === 'Current Gen' ? 'secondary' : 'destructive'
                    }>
                      {competitor.type}
                    </Badge>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">Market Share</div>
                    <div className="text-2xl font-bold">{competitor.marketShare}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {competitor.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {feature.supported ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium">{feature.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{feature.note}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Reliability: </span>
                        <span className={`font-bold ${
                          competitor.color === 'green' ? 'text-green-500' :
                          competitor.color === 'orange' ? 'text-orange-500' : 'text-red-500'
                        }`}>
                          {competitor.reliability}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Cost: </span>
                        <span className="font-medium">{competitor.cost}</span>
                      </div>
                    </div>
                    {competitor.name === 'ORBITNET-MESH' && (
                      <Badge variant="default" className="bg-green-500">
                        <Zap className="w-3 h-3 mr-1" />
                        Our Solution
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Differentiators */}
      <Card className="card-glow bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <div className="text-xl font-bold">What Makes Us Different</div>
              <div className="text-sm text-muted-foreground">Unique advantages that competitors can't match</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-4"
            >
              <div className="p-3 bg-green-500/10 rounded-full w-fit mx-auto">
                <Zap className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-bold">Real-time Algorithmic Validation</h3>
              <p className="text-sm text-muted-foreground">
                First system designed to validate data integrity at the satellite level, 
                targeting 27% of corrupted packets before they reach Earth.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center space-y-4"
            >
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold">Mesh Architecture</h3>
              <p className="text-sm text-muted-foreground">
                Self-healing network that automatically routes around failures, 
                reducing data loss from 45% to 2.3% during blackouts.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center space-y-4"
            >
              <div className="p-3 bg-orange-500/10 rounded-full w-fit mx-auto">
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="font-bold">Predictive Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Algorithms designed to predict communication failures 14 minutes before they happen, 
                allowing proactive mission adjustments.
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitiveComparison;