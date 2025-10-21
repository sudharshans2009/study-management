import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SS.Study",
  description: "Track your study sessions, compete with friends, and unlock achievements.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
