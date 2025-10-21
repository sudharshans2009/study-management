"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function VerifyEmailContent() {
  const { user, isLoading, refetch } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already verified (check emailVerified property)
  useEffect(() => {
    if (!isLoading && user) {
      if (user.emailVerified) {
        // Email verified, check if setup is completed
        if (user.onboardingStatus === "completed") {
          router.push("/dashboard");
        } else {
          router.push("/setup");
        }
      }
    }
  }, [user, isLoading, router]);

  const checkVerificationStatus = async () => {
    setChecking(true);
    setError(null);
    
    try {
      await refetch();
      
      // The useEffect above will handle the redirect
      setTimeout(() => {
        if (user && !user.emailVerified) {
          setError("Email not verified yet. Please check your inbox and click the verification link.");
        }
        setChecking(false);
      }, 1000);
    } catch {
      setError("Failed to check verification status. Please try again.");
      setChecking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="w-full md:max-w-[50%] lg:max-w-[33.333%]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification link to{" "}
            <span className="font-semibold">{user?.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Click the verification link in your email to continue setting up your account.
            </p>
            <p>
              Can&apos;t find the email? Check your spam folder.
            </p>
          </div>

          <Button
            onClick={checkVerificationStatus}
            disabled={checking}
            className="w-full"
          >
            {checking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                I&apos;ve Verified My Email
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <button
              onClick={() => router.push("/signin")}
              className="text-primary hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
