"use server";

import { signInSchema, signUpSchema, forgotPasswordSchema } from "@/lib/auth/validations";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cookies } from "next/headers";

export async function signInAction(data: unknown) {
  try {
    const validatedData = signInSchema.parse(data);

    const response = await auth.api.signInEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
      },
      headers: await headers(),
    });

    if (!response) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Get the session token from the response and set it as a cookie
    if (response.token) {
      const cookieStore = await cookies();
      cookieStore.set("better-auth.session_token", response.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sign in",
    };
  }
}

export async function signUpAction(data: unknown) {
  try {
    const validatedData = signUpSchema.parse(data);

    // Step 1: Create the account
    const signUpResponse = await auth.api.signUpEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.name,
      },
      headers: await headers(),
    });

    if (!signUpResponse) {
      return {
        success: false,
        error: "Failed to create account",
      };
    }

    // Step 2: Automatically sign in the user to create a session
    const signInResponse = await auth.api.signInEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
      },
      headers: await headers(),
    });

    if (!signInResponse) {
      return {
        success: false,
        error: "Account created but failed to sign in. Please sign in manually.",
      };
    }

    // Set the session token cookie
    if (signInResponse.token) {
      const cookieStore = await cookies();
      cookieStore.set("better-auth.session_token", signInResponse.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }

    return {
      success: true,
      data: signInResponse,
      message: "Account created successfully! Please complete your profile setup.",
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create account",
    };
  }
}

export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Sign out error:", error);
    return {
      success: false,
      error: "Failed to sign out",
    };
  }
}

export async function forgotPasswordAction(data: unknown) {
  try {
    const validatedData = forgotPasswordSchema.parse(data);

    await auth.api.forgetPassword({
      body: {
        email: validatedData.email,
        redirectTo: "/reset-password",
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: "Password reset email sent! Check your inbox.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      error: "Failed to send reset email",
    };
  }
}

export async function getSessionAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        user: null,
      };
    }

    return {
      success: true,
      user: session.user,
    };
  } catch (error) {
    console.error("Get session error:", error);
    return {
      success: false,
      user: null,
    };
  }
}
