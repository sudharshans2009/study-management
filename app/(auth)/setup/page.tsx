"use client";

import { SetupProfileForm } from "@/components/auth/setup-profile-form";
import { BackToHomeButton } from "@/components/auth/back-to-home-button";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, LogIn } from "lucide-react";
import Link from "next/link";

export default function SetupPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Not logged in - show sign in prompt
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="p-4">
          <BackToHomeButton />
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                Complete Your Profile
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to personalize your study experience
              </p>
            </div>

            <Alert>
              <LogIn className="h-4 w-4" />
              <AlertDescription>
                <strong>Sign in required</strong>
                <p className="mt-2">
                  Please sign in to complete your profile setup.
                </p>
              </AlertDescription>
            </Alert>

            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged in - show setup form
  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4">
        <BackToHomeButton />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Complete Your Profile
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Let&apos;s personalize your study experience
            </p>
          </div>

          {/* Email Verification Alert */}
          {user && !user.emailVerified && (
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <Mail className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>Email verification pending.</strong> We&apos;ve sent a verification email to{" "}
                <strong>{user.email}</strong>. You can complete your profile setup now, but you&apos;ll
                need to verify your email to unlock all features.
              </AlertDescription>
            </Alert>
          )}

          {user && user.emailVerified && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Email verified!</strong> Your account is fully activated.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-card border rounded-lg p-6">
            <SetupProfileForm />
          </div>
        </div>
      </div>
    </div>
  );
}



