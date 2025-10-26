import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | SS.Study",
  description: "View and manage your study notifications and alerts",
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
