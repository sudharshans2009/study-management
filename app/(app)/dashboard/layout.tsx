import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | SS.Study",
  description: "Your personal study dashboard - overview of your study sessions, goals, and progress",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
