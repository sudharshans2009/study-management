import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | SS.Study",
  description: "Manage your profile, avatar, subjects, daily goals, and timezone settings",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
