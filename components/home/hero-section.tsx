import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Brain, Target, TrendingUp } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
      
      <div className="container relative">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 py-20 text-center lg:py-32">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-3 py-1 text-sm backdrop-blur-sm">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-muted-foreground">Track. Focus. Achieve.</span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Master Your Study
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Habits
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Transform your study routine with intelligent tracking, goal setting, 
              and analytics. Build consistent habits that lead to success.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="gap-2">
              <Link href="/sign-up">
                <Play className="h-4 w-4" />
                Get Started Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">
                Learn More
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-primary/40"
                  />
                ))}
              </div>
              <span>50,000+ active learners</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-yellow-500">★</span>
                ))}
              </div>
              <span>4.9/5 rating</span>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Brain, label: "Smart Tracking" },
              { icon: Target, label: "Goal Setting" },
              { icon: TrendingUp, label: "Analytics" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 backdrop-blur-sm"
              >
                <item.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
