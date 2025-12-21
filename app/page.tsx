'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, ShieldCheck, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center space-y-8 text-center">

          {/* Hero Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            V 2.0 Now Live
          </motion.div>

          {/* Hero Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70"
          >
            Manage Variations <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              With Precision
            </span>
          </motion.h1>

          {/* Hero Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-[700px] text-muted-foreground md:text-xl"
          >
            The premium tool for Quantity Surveyors to track, manage, and report on construction project variations with unmatched clarity.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-x-4"
          >
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 rounded-full text-base bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="h-12 px-8 rounded-full text-base border-primary/20 hover:bg-primary/5">
                View Demo
              </Button>
            </Link>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-16 text-left"
          >
            <FeatureCard
              icon={BarChart3}
              title="Real-time Analytics"
              description="Track VO costs, approval status, and financial impact in real-time."
              gradient="from-blue-500/20 to-cyan-500/20"
              iconColor="text-blue-500"
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Secure Audit Trail"
              description="Keep a complete history of every change, approval, and comment."
              gradient="from-violet-500/20 to-purple-500/20"
              iconColor="text-violet-500"
            />
            <FeatureCard
              icon={Zap}
              title="Streamlined Workflow"
              description="Move variations from proposal to approval faster than ever."
              gradient="from-amber-500/20 to-orange-500/20"
              iconColor="text-amber-500"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}

function FeatureCard({ icon: Icon, title, description, gradient, iconColor }: FeatureCardProps) {
  return (
    <div className="neo-card p-6 rounded-2xl group hover:scale-[1.02] transition-transform duration-300">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
