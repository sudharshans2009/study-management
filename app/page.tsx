import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { StatsSection } from "@/components/home/stats-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { CTASection } from "@/components/home/cta-section";
import { HomeNavbar } from "@/components/layout/home-navbar";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SS.Study - Track Your Study Progress & Build Better Habits",
  description: "A comprehensive study tracking platform with timer, goals, statistics, and leaderboards. Stay focused, track progress, and compete with learners worldwide.",
};

export default function Home() {
  return (
    <>
      <HomeNavbar />
      <main className="min-h-screen">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
