import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monitoring | Admin | SS.Study",
  description: "System monitoring dashboard for Redis, QStash, and application health",
};

export default function MonitoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
