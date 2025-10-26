import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Sessions | SS.Study",
  description: "View and analyze your completed study sessions with detailed statistics and insights",
};

export default function SessionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
