import { Timer, Trophy, BarChart3, Users, Target, Zap } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Timer,
    title: "Smart Timer",
    description: "Pomodoro, stopwatch, and custom timers to fit your study style.",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Track your progress with comprehensive statistics and insights.",
  },
  {
    icon: Trophy,
    title: "Achievements & Levels",
    description: "Unlock badges and level up as you reach your study goals.",
  },
  {
    icon: Users,
    title: "Study Rooms",
    description: "Join virtual study rooms and stay motivated with others.",
  },
  {
    icon: Target,
    title: "Goal Setting",
    description: "Set daily, weekly, and monthly goals to stay on track.",
  },
  {
    icon: Zap,
    title: "Streak Tracking",
    description: "Build consistency with daily streak tracking and reminders.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/50">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything You Need to Excel
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Powerful features designed to help you focus, track progress, and achieve your academic goals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
