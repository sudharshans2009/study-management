"use client";

import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, AlertTriangle, LogIn } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  // Not logged in - show sign in prompt
  if (!user) {
    return (
      <div className="container py-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          
          <Alert>
            <LogIn className="h-4 w-4" />
            <AlertDescription>
              <strong>Sign in required</strong>
              <p className="mt-2">
                Please sign in to access your dashboard.
              </p>
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Logged in but email not verified - show warning but allow access
  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      
      {!user.emailVerified && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Email Verification Pending</strong>
            <p className="mt-2">
              Please verify your email address to unlock all features.
              We&apos;ve sent a verification email to <strong>{user.email}</strong>.
            </p>
            <p className="mt-2 text-sm">
              Check your inbox and click the verification link. If you haven&apos;t
              received the email, check your spam folder.
            </p>
            <div className="flex gap-3 mt-4">
              <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                <Mail className="mr-2 h-4 w-4" />
                I&apos;ve Verified My Email
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <p className="text-muted-foreground mb-6">
        Welcome back, {user.name}! {user.emailVerified && "Your account is fully verified."}
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Study Timer</h2>
          <p className="text-sm text-muted-foreground">
            Start tracking your study sessions
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Study Goals</h2>
          <p className="text-sm text-muted-foreground">
            Set and track your daily goals
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Subjects</h2>
          <p className="text-sm text-muted-foreground">
            Manage your study subjects
          </p>
        </div>
      </div>
    </div>
  );
}


