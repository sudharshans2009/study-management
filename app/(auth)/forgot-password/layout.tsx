import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | SS.Study",
  description: "Reset your SS.Study account password",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
