import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container px-4">
        <div className="mx-auto max-w-3xl text-center rounded-2xl bg-primary/10 p-12 border-2">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to Transform Your Study Habits?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of students who are already achieving their goals with SS.Study.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
