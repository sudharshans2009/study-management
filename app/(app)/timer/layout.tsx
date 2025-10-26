import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Timer | SS.Study",
  description: "Focus timer with Pomodoro technique and stopwatch modes - track your study sessions in real-time",
};

export default function TimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
