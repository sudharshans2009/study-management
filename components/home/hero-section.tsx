import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32">
      <div className="container px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
            Study Smarter, Not Harder
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl mb-6">
            Master Your Time,
            <br />
            <span className="text-primary">Achieve Your Goals</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8">
            Track your study sessions, compete with friends, and unlock achievements 
            as you build productive habits that last a lifetime.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/timer">
                <Play className="mr-2 h-5 w-5" />
                Start Studying Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="#features">
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl opacity-30">
          <div className="aspect-1155/678 w-288.75 bg-linear-to-tr from-primary to-primary" />
        </div>
      </div>
    </section>
  );
}
