import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Rooms | SS.Study",
  description: "Join study rooms and collaborate with other learners in real-time",
};

export default function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
