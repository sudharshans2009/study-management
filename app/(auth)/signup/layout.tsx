import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | SS.Study",
  description: "Create your SS.Study account and start building better study habits today",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
