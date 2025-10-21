"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export type OnboardingStatus = "pending_verification" | "pending_setup" | "completed";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  onboardingStatus: OnboardingStatus;
  createdAt: Date;
}

interface UseAuthReturn {
  user: User | null;
  session: null;
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingStatus: OnboardingStatus | null;
  needsVerification: boolean;
  needsSetup: boolean;
  isOnboarded: boolean;
  refetch: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Client-side hook for accessing authentication state using Better Auth's built-in session management
 */
export function useAuth(): UseAuthReturn {
  // Use Better Auth's built-in useSession hook
  const { data: session, isPending, refetch } = authClient.useSession();

  const user = (session?.user ?? null) as User | null;
  const onboardingStatus = user?.onboardingStatus ?? null;

  const signOut = async () => {
    await authClient.signOut();
    await refetch();
  };

  const refetchSession = async () => {
    await refetch();
  };

  return {
    user,
    session: null, // Deprecated - use user instead
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    onboardingStatus,
    needsVerification: !user?.emailVerified, // Check emailVerified property
    needsSetup: (user?.emailVerified && onboardingStatus !== "completed") || false, // Verified but not completed
    isOnboarded: onboardingStatus === "completed", // Check onboarding status
    refetch: refetchSession,
    signOut,
  };
}

/**
 * Hook to protect routes - redirects based on email verification and onboarding status
 */
export function useRequireAuth(requireOnboarded = true) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated - go to signin
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    // If we require full onboarding, check status
    if (requireOnboarded && user) {
      // Check email verification first
      if (!user.emailVerified) {
        router.push("/verify-email");
        return;
      }
      
      // Then check if setup is completed
      if (user.onboardingStatus !== "completed") {
        router.push("/setup");
      }
      // If both verified and completed, user can access the route
    }
  }, [isAuthenticated, isLoading, user, requireOnboarded, router]);

  return { isAuthenticated, isLoading, onboardingStatus: user?.onboardingStatus ?? null };
}

/**
 * Hook to redirect authenticated users (e.g., from signin/signup pages)
 */
export function useRedirectIfAuthenticated() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;

    // Check email verification first
    if (!user.emailVerified) {
      router.push("/verify-email");
      return;
    }
    
    // Then check onboarding completion
    if (user.onboardingStatus !== "completed") {
      router.push("/setup");
    } else {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, user, router]);

  return { isAuthenticated, isLoading };
}

