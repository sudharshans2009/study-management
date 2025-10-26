import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Goals | SS.Study",
  description: "Track your study and subject goals, monitor progress, and build streaks",
};

export default function GoalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
