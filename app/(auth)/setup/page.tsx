"use client";

import { SetupProfileForm } from "@/components/auth/setup-profile-form";
import { BackToHomeButton } from "@/components/auth/back-to-home-button";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SetupPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect based on email verification and onboarding status
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/signin");
      return;
    }

    // Check email verification first (using emailVerified property)
    if (!user.emailVerified) {
      router.push("/verify-email");
      return;
    }
    
    // Check if already completed (using onboardingStatus property)
    if (user.onboardingStatus === "completed") {
      router.push("/dashboard");
    }
    // If verified but not completed, stay on this page
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Not logged in - show sign in prompt
  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Not verified yet (check emailVerified property)
  if (!user.emailVerified) {
    return null; // Will redirect via useEffect
  }

  // Already completed (check onboardingStatus property)
  if (user.onboardingStatus === "completed") {
    return null; // Will redirect via useEffect
  }

  // Logged in and verified - show setup form
  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4">
        <BackToHomeButton />
      </div>
      
      <div className="flex-1 container mx-auto flex items-center justify-center p-4">
        <div className="w-full md:max-w-[66.666%] lg:max-w-[50%] space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Complete Your Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Let&apos;s personalize your study experience in 4 simple steps
            </p>
          </div>

          {/* Email Verified Success */}
          <Alert className="border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Email verified!</strong> Complete your profile to get started.
            </AlertDescription>
          </Alert>

          <div className="bg-card border rounded-lg shadow-sm p-8">
            <SetupProfileForm />
          </div>
        </div>
      </div>
    </div>
  );
}



