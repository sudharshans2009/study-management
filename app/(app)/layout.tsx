import { Navbar } from "@/components/layout/navbar";
import { FloatingTimerBadge } from "@/components/timer/floating-timer-badge";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <FloatingTimerBadge />
    </>
  );
}
