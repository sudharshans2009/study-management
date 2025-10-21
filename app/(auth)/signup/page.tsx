import { SignUpForm } from "@/components/auth/sign-up-form";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { AuthLayout, AuthDivider } from "@/components/auth/auth-layout";
import { BackToHomeButton } from "@/components/auth/back-to-home-button";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto p-4">
        <BackToHomeButton />
      </div>
      
      <div className="flex-1">
        <AuthLayout
          title="Create an account"
          description="Start your journey to better study habits"
          footer={{
            text: "Already have an account?",
            linkText: "Sign in",
            linkHref: "/signin",
          }}
        >
          <SocialAuthButtons />
          
          <AuthDivider />
          
          <SignUpForm />
        </AuthLayout>
      </div>
    </div>
  );
}

