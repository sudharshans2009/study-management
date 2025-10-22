import { Timer, Trophy, BarChart3, Users, Target, Zap, BookOpen, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Timer,
    title: "Flexible Study Timers",
    description: "Pomodoro, stopwatch, and custom timers to match your study style.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Target,
    title: "Smart Goal Tracking",
    description: "Set daily, weekly, or monthly goals and track your progress automatically.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Visualize your study patterns, focus scores, and productivity trends.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: TrendingUp,
    title: "Streak System",
    description: "Build consistent habits with daily streaks and milestone celebrations.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: BookOpen,
    title: "Subject Organization",
    description: "Organize your study sessions by subject with custom colors and tags.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Clock,
    title: "Timezone-Aware",
    description: "Goals reset at your local midnight. Study anywhere, anytime.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Trophy,
    title: "Achievement System",
    description: "Unlock achievements and compete on leaderboards with friends.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Zap,
    title: "Focus Tracking",
    description: "Rate your focus after each session and identify your peak hours.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Users,
    title: "Study Rooms",
    description: "Join virtual study rooms and stay motivated with others.",
    gradient: "from-violet-500 to-purple-500",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-b flex justify-center bg-muted/30 py-20 lg:py-32">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Everything You Need to
            <span className="text-primary"> Excel</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features designed to help you build better study habits
            and achieve your academic goals.
          </p>
        </div>

        <div className="mx-auto max-w-6xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group relative overflow-hidden border-2 transition-all hover:shadow-lg hover:border-primary/50"
            >
              <div className="absolute inset-0 bg-linear-to-br from-primary/0 to-primary/0 opacity-0 group-hover:from-primary/5 group-hover:to-transparent group-hover:opacity-100 transition-all duration-300" />
              <CardHeader>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br ${feature.gradient} mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
