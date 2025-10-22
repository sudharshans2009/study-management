import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Computer Science Student",
    avatar: "SC",
    content: "Assist completely changed how I approach studying. The focus tracking helps me identify when I'm most productive, and the streak system keeps me motivated every day.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Medical Student",
    avatar: "MJ",
    content: "The goal-setting feature is a game-changer. I can track my daily study targets for different subjects and the analytics show me exactly where I need to focus more.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Law Student",
    avatar: "ER",
    content: "I love the Pomodoro timer and the detailed statistics. Being able to see my progress over time motivates me to keep going, even during tough study sessions.",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Engineering Student",
    avatar: "DK",
    content: "The achievement system makes studying fun! I find myself wanting to unlock more badges and climb the leaderboard. It's like gamifying my education.",
    rating: 5,
  },
  {
    name: "Aisha Patel",
    role: "Business Student",
    avatar: "AP",
    content: "Best study tracker I've used. The interface is clean, the features are powerful, and the analytics help me optimize my study schedule. Highly recommend!",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Graduate Student",
    avatar: "JW",
    content: "The streak tracking keeps me accountable. I haven't missed a study day in 3 months thanks to Assist. The visualizations are also incredibly helpful.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 flex justify-center lg:py-32 bg-background border-b">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Loved by Students
            <span className="text-primary"> Everywhere</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Don&apos;t just take our word for it. Here&apos;s what students are saying about Assist.
          </p>
        </div>

        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="group relative overflow-hidden border-2 transition-all hover:shadow-lg hover:border-primary/50">
              <div className="absolute inset-0 bg-linear-to-br from-primary/0 to-primary/0 opacity-0 group-hover:from-primary/5 group-hover:to-transparent group-hover:opacity-100 transition-all duration-300" />
              <CardContent className="p-6">
                <div className="relative z-10">
                  {/* Star rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  {/* Testimonial content */}
                  <p className="text-muted-foreground mb-6">
                    &quot;{testimonial.content}&quot;
                  </p>
                  
                  {/* Author info */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
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
