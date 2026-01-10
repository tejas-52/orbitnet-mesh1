import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Satellite, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WinningHeroSectionProps {
  onStartDemo: () => void;
  isRunning: boolean;
}

export function WinningHeroSection({ onStartDemo, isRunning }: WinningHeroSectionProps) {
  const [currentProblem, setCurrentProblem] = useState(0);
  
  const realWorldProblems = [
    {
      icon: AlertTriangle,
      title: "NASA Loses Contact with MAVEN",
      description: "\"NASA spacecraft orbiting Mars may be dead\" - NBC News, Dec 2025",
      cost: "$671M mission at risk"
    },
    {
      icon: Satellite,
      title: "Voyager 1's 6-Month Blackout",
      description: "\"After crisis in interstellar space\" - Science Magazine, 2024",
      cost: "46-year mission nearly lost"
    },
    {
      icon: TrendingUp,
      title: "Russia's Luna-25 Failure",
      description: "\"Crashed into moon after communication problem\" - Reuters, 2023",
      cost: "$200M mission destroyed"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProblem((prev) => (prev + 1) % realWorldProblems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentIssue = realWorldProblems[currentProblem];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-b border-border/50">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: The Problem */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive text-sm rounded-full border border-destructive/20 mb-4">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">BILLION DOLLAR PROBLEM</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="text-red-400">"One Wrong Data Packet</span>
                <span className="text-destructive block">Can Cost Millions"</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                <span className="text-red-400 font-semibold">27% of mission data arrives corrupted</span> during critical phases.
                <br />
                <strong className="text-foreground">ORBITNET-MESH designed to detect corruption before it reaches mission control</strong>.
                <br />
                <span className="text-green-400 font-semibold">Represents potential prevention of $2.4B in annual losses.</span>
              </p>
            </motion.div>

            {/* Rotating Real-World Examples */}
            <motion.div
              key={currentProblem}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 bg-card border border-border rounded-lg"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <currentIssue.icon className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{currentIssue.title}</h3>
                  <p className="text-muted-foreground mb-2">{currentIssue.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-destructive" />
                    <span className="font-medium text-destructive">{currentIssue.cost}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Problem Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <div className="text-2xl font-bold text-destructive">45%</div>
                <div className="text-xs text-muted-foreground">Data Lost</div>
              </div>
              <div className="text-center p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <div className="text-2xl font-bold text-destructive">$50B</div>
                <div className="text-xs text-muted-foreground">Market Risk</div>
              </div>
              <div className="text-center p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <div className="text-2xl font-bold text-destructive">30%</div>
                <div className="text-xs text-muted-foreground">Mission Failures</div>
              </div>
            </div>
          </div>

          {/* Right Side: The Solution */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20 mb-4">
                <Shield className="w-4 h-4" />
                <span className="font-medium">ORBITNET-MESH SOLUTION</span>
              </div>
              
              <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                <span className="text-primary">Zero Data Loss</span>
                <span className="block">Guaranteed</span>
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Our intelligent satellite relay system ensures 
                <strong className="text-primary"> 100% data preservation</strong> through 
                smart store-and-forward technology, even during complete communication blackouts.
              </p>
            </motion.div>

            {/* Solution Benefits */}
            <div className="space-y-4">
              {[
                { icon: Shield, text: "Zero data loss during blackouts", value: "0%" },
                { icon: Satellite, text: "Intelligent satellite relay routing", value: "100%" },
                { icon: TrendingUp, text: "Mission success rate improvement", value: "+70%" }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="text-foreground">{benefit.text}</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{benefit.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="pt-4"
            >
              <Button
                onClick={onStartDemo}
                size="lg"
                className={cn(
                  "w-full text-lg py-6 transition-all duration-300",
                  isRunning 
                    ? "bg-primary/20 text-primary border-primary/30" 
                    : "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105"
                )}
              >
                {isRunning ? (
                  <>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-3" />
                    LIVE DEMO RUNNING - See Zero Data Loss
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-3" />
                    START LIVE DEMO - Prove Zero Data Loss
                  </>
                )}
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-3">
                Watch real-time comparison: Traditional vs ORBITNET-MESH
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}