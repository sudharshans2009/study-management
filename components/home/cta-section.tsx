import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 flex justify-center lg:py-32 bg-muted/30">
      <div className="container px-4">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border-2 bg-linear-to-br from-primary/10 via-background to-primary/5 p-12 lg:p-16 shadow-xl">
          {/* Decorative grid overlay */}
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_70%)]" />
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-primary/10 px-4 py-1.5 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Start Your Journey Today</span>
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
              Ready to Transform Your
              <br />
              <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Study Habits?
              </span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already achieving their academic goals.
              Start tracking your study sessions for free today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base" asChild>
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base" asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • Free forever • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
