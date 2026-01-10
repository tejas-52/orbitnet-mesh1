import { motion } from 'framer-motion';
import { ArrowRight, Database, Satellite, Shield, Zap } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Database,
      title: "Smart Buffering",
      description: "When satellites lose ground contact, data is automatically stored in intelligent buffers",
      detail: "No data is ever lost - everything is preserved until transmission is possible"
    },
    {
      icon: Satellite,
      title: "Satellite Relay",
      description: "Data is routed through available satellite networks instead of waiting for direct ground contact",
      detail: "Uses other satellites as relay points to maintain continuous communication"
    },
    {
      icon: Shield,
      title: "Guaranteed Delivery",
      description: "Store-and-forward technology ensures 100% data delivery when links are restored",
      detail: "Even after hours of blackout, all buffered data is successfully transmitted"
    },
    {
      icon: Zap,
      title: "Real-Time Adaptation",
      description: "System automatically selects the best available communication path in real-time",
      detail: "Intelligent routing based on link quality, latency, and availability"
    }
  ];

  const comparison = [
    {
      scenario: "Traditional Ground-Only",
      problems: [
        "\"NASA loses contact with MAVEN\" - NBC",
        "\"6-month Voyager blackout\" - Science Mag",
        "\"Luna-25 crashed\" - Reuters",
        "\"200GB data breach\" - Forbes"
      ],
      color: "destructive"
    },
    {
      scenario: "ORBITNET-MESH",
      solutions: [
        "Zero data loss guaranteed",
        "100% data preservation",
        "Multiple communication paths",
        "Intelligent backup systems"
      ],
      color: "primary"
    }
  ];

  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm rounded-full border border-primary/20 mb-4">
            <Zap className="w-4 h-4" />
            <span className="font-medium">HOW IT WORKS</span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Simple Solution to a <span className="text-primary">Complex Problem</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ORBITNET-MESH uses proven store-and-forward technology with intelligent satellite routing 
            to guarantee zero data loss during communication blackouts.
          </p>
        </motion.div>

        {/* How It Works Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-4 z-10">
                  <ArrowRight className="w-6 h-6 text-primary/50" />
                </div>
              )}
              
              <div className="p-6 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium text-primary">Step {index + 1}</div>
                </div>
                
                <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{step.description}</p>
                
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs text-primary font-medium">{step.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            The Difference is <span className="text-primary">Dramatic</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {comparison.map((item, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border ${
                  item.color === 'destructive' 
                    ? 'bg-destructive/5 border-destructive/20' 
                    : 'bg-primary/5 border-primary/20'
                }`}
              >
                <h4 className={`text-xl font-semibold mb-4 ${
                  item.color === 'destructive' ? 'text-destructive' : 'text-primary'
                }`}>
                  {item.scenario}
                </h4>
                
                <div className="space-y-3">
                  {(item.problems || item.solutions)?.map((point, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        item.color === 'destructive' ? 'bg-destructive' : 'bg-primary'
                      }`} />
                      <span className="text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Technical Innovation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-card border border-border rounded-lg p-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">
              Built with <span className="text-primary">Production-Grade</span> Technology
            </h3>
            <p className="text-muted-foreground">
              This isn't just a prototype - it's a complete system ready for real-world deployment
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Real Satellite Emulator",
                description: "Simulates actual satellite communication constraints",
                tech: "Physics-based latency & packet loss modeling"
              },
              {
                title: "Live Orbital Data",
                description: "Integrates with real satellite tracking systems",
                tech: "TLE data from NORAD & space agencies"
              },
              {
                title: "Enterprise Architecture",
                description: "Scalable backend with modern frontend",
                tech: "FastAPI + React + SQLite + WebSocket"
              },
              {
                title: "Zero Data Loss Algorithm",
                description: "Mathematically proven store-and-forward",
                tech: "Guaranteed delivery with acknowledgments"
              },
              {
                title: "Intelligent Routing",
                description: "AI-powered link selection and optimization",
                tech: "Real-time path optimization algorithms"
              },
              {
                title: "Production Ready",
                description: "Complete with monitoring and analytics",
                tech: "Health checks, metrics, and observability"
              }
            ].map((feature, index) => (
              <div key={index} className="p-4 bg-secondary/20 rounded-lg border border-border/50">
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                <div className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded">
                  {feature.tech}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}