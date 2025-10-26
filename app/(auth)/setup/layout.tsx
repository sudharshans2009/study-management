import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup Profile | SS.Study",
  description: "Complete your profile setup to get started with SS.Study",
};

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
