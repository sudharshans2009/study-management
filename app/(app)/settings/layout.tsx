import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | SS.Study",
  description: "Manage your account settings, security preferences, and notifications",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
