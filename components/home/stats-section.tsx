import { Clock, Users, Target, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { 
    icon: Clock,
    value: "10M+", 
    label: "Study Hours", 
    description: "Tracked globally",
    gradient: "from-blue-500 to-cyan-500" 
  },
  { 
    icon: Users,
    value: "50K+", 
    label: "Active Students", 
    description: "Learning every day",
    gradient: "from-purple-500 to-pink-500" 
  },
  { 
    icon: Target,
    value: "95%", 
    label: "Success Rate", 
    description: "Meeting their goals",
    gradient: "from-orange-500 to-red-500" 
  },
  { 
    icon: Star,
    value: "4.9/5", 
    label: "User Rating", 
    description: "From satisfied users",
    gradient: "from-yellow-500 to-orange-500" 
  },
];

export function StatsSection() {
  return (
    <section className="py-20 flex justify-center bg-muted/30 border-b">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Trusted by Students
            <span className="text-primary"> Worldwide</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of students who are achieving their academic goals with Assist.
          </p>
        </div>

        <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="group relative overflow-hidden border-2 transition-all hover:shadow-lg hover:border-primary/50">
              <div className="absolute inset-0 bg-linear-to-br from-primary/0 to-primary/0 opacity-0 group-hover:from-primary/5 group-hover:to-transparent group-hover:opacity-100 transition-all duration-300" />
              <CardContent className="p-6 text-center">
                <div className="relative z-10">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br ${stat.gradient} mb-4`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold mb-1">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
