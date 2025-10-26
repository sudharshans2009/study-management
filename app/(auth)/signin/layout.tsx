import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | SS.Study",
  description: "Sign in to your SS.Study account to continue your learning journey",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
