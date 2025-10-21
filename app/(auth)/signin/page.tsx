import { SignInForm } from "@/components/auth/sign-in-form";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { AuthLayout, AuthDivider } from "@/components/auth/auth-layout";
import { BackToHomeButton } from "@/components/auth/back-to-home-button";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto p-4">
        <BackToHomeButton />
      </div>
      
      <div className="flex-1">
        <AuthLayout
          title="Welcome back"
          description="Sign in to your account to continue"
          footer={{
            text: "Don't have an account?",
            linkText: "Sign up",
            linkHref: "/signup",
          }}
        >
          <SocialAuthButtons />
          
          <AuthDivider />
          
          <SignInForm />

          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Forgot your password?
            </Link>
          </div>
        </AuthLayout>
      </div>
    </div>
  );
}

