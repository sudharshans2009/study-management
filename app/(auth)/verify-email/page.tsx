import { Metadata } from "next";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";

export const metadata: Metadata = {
  title: "Verify Email - SS.Study",
  description: "Verify your email address to continue",
};

export default function VerifyEmailPage() {
  return <VerifyEmailContent />;
}
