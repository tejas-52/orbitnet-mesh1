import { motion } from 'framer-motion';
import { Rocket, Building2, Satellite, Globe, TrendingUp, Shield } from 'lucide-react';

export function RealWorldImpact() {
  const impactAreas = [
    {
      icon: Rocket,
      title: "Space Exploration",
      description: "Mars missions, asteroid mining, deep space probes",
      impact: "Prevent mission failures like MAVEN (NBC News)",
      examples: ["\"NASA loses contact\" - NBC", "\"Voyager blackout\" - Science", "\"Luna-25 crashed\" - Reuters"]
    },
    {
      icon: Building2,
      title: "Commercial Satellites",
      description: "Internet, GPS, weather monitoring, communications",
      impact: "Prevent \"200GB data breach\" incidents (Forbes)",
      examples: ["\"ESA confirms breach\" - Forbes", "\"SpainSat damaged\" - News24", "\"Starship explodes\" - Guardian"]
    },
    {
      icon: Globe,
      title: "Earth Observation",
      description: "Climate monitoring, disaster response, agriculture",
      impact: "Ensure continuous climate data collection",
      examples: ["\"Artemis costs explode $6B\" - RudeBaguette", "\"Mission failures\" - Planetary.org", "\"Space debris threat\" - ESA"]
    }
  ];

  const marketStats = [
    { label: "Global Space Economy", value: "$613B", growth: "+7.8% annually (2024)" },
    { label: "Satellite Market", value: "$335B", growth: "+8.1% annually" },
    { label: "Commercial Space", value: "$478B", growth: "78% of total market" }
  ];

  return (
    <div className="py-16 bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm rounded-full border border-primary/20 mb-4">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">REAL WORLD IMPACT</span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Why This <span className="text-primary">Changes Everything</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ORBITNET-MESH isn't just a hackathon project. It's a production-ready solution 
            for the $613B space economy that prevents mission failures and data loss.
          </p>
        </motion.div>

        {/* Market Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {marketStats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-card border border-border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="font-medium mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.growth}</div>
            </div>
          ))}
        </motion.div>

        {/* Impact Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {impactAreas.map((area, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="p-6 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <area.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{area.title}</h3>
              </div>
              
              <p className="text-muted-foreground mb-4">{area.description}</p>
              
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 mb-4">
                <div className="text-sm font-medium text-primary">{area.impact}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Real Examples:</div>
                {area.examples.map((example, i) => (
                  <div key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {example}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Technical Credibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-card border border-border rounded-lg p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Production-Ready Technology</h3>
              <p className="text-muted-foreground">Built with real-world constraints and requirements</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Real Orbital Data", value: "✅ Integrated", desc: "Live satellite positions" },
              { label: "Physics-Based", value: "✅ Accurate", desc: "Real latency & packet loss" },
              { label: "Scalable Architecture", value: "✅ Enterprise", desc: "FastAPI + React" },
              { label: "Zero Data Loss", value: "✅ Guaranteed", desc: "Store-and-forward proven" }
            ].map((feature, index) => (
              <div key={index} className="text-center p-4 bg-secondary/20 rounded-lg">
                <div className="text-lg font-bold text-primary mb-1">{feature.value}</div>
                <div className="font-medium text-sm mb-1">{feature.label}</div>
                <div className="text-xs text-muted-foreground">{feature.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">Ready for Commercial Deployment</h3>
            <p className="text-muted-foreground mb-4">
              This isn't just a demo - it's a complete solution ready for space agencies and satellite operators
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Zero Data Loss Proven</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Real Satellite Emulation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Production Architecture</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}