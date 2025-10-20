"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
}

interface UseAuthReturn {
  user: User | null;
  session: null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Client-side hook for accessing authentication state using Better Auth's built-in session management
 */
export function useAuth(): UseAuthReturn {
  // Use Better Auth's built-in useSession hook
  const { data: session, isPending, refetch } = authClient.useSession();

  const signOut = async () => {
    await authClient.signOut();
    await refetch();
  };

  const refetchSession = async () => {
    await refetch();
  };

  return {
    user: session?.user ?? null,
    session: null, // Deprecated - use user instead
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    refetch: refetchSession,
    signOut,
  };
}

/**
 * Hook to protect routes - redirects to signin if not authenticated
 */
export function useRequireAuth(redirectTo = "/signin") {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook to redirect authenticated users (e.g., from signin/signup pages)
 */
export function useRedirectIfAuthenticated(redirectTo = "/dashboard") {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

