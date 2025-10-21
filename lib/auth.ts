/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/database/drizzle";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/database/schema";
import config from "./config";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/services/email";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  baseURL: config.env.url,
  basePath: "/api/auth",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Email verification required for dashboard access
    async sendResetPassword(data, _request) {
      try {
        const result = await sendPasswordResetEmail(
          data.user.email,
          data.user.name || data.user.email,
          data.url,
        );

        if (!result.success) {
          console.error("Failed to send password reset email:", result.error);
          throw new Error("Failed to send password reset email");
        }

        console.log(
          "Password reset email sent successfully to:",
          data.user.email,
        );
      } catch (error) {
        console.error("Error sending password reset email:", error);
        throw error;
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true, // Send verification email on signup
    autoSignInAfterVerification: false, // Don't auto-login - redirect to setup instead
    async sendVerificationEmail(data, _request) {
      console.log("📧 Attempting to send verification email to:", data.user.email);
      
      const result = await sendVerificationEmail(
        data.user.email,
        data.user.name || data.user.email,
        data.url,
      );

      if (!result.success) {
        console.error("⚠️ Failed to send verification email:", result.error);
        console.log("ℹ️ User can still sign up, but won't receive verification email");
        // Don't throw - allow signup to continue even if email fails
        return;
      }

      console.log("✅ Verification email sent successfully to:", data.user.email);
    },
    async onVerificationSuccess(user: { id: string; email: string; name: string }) {
      // Update user's onboarding status to pending_setup after successful verification
      console.log(`✅ Email verified for user ${user.id}, updating onboarding status to pending_setup`);
      
      try {
        await db
          .update(schema.user)
          .set({
            emailVerified: true,
            onboardingStatus: "pending_setup",
            updatedAt: new Date(),
          })
          .where(eq(schema.user.id, user.id));
        
        console.log(`✅ Onboarding status updated to pending_setup`);
      } catch (error) {
        console.error("❌ Failed to update onboarding status:", error);
      }
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  socialProviders: {
    google: {
      clientId: config.env.oauth.google.clientId,
      clientSecret: config.env.oauth.google.clientSecret,
      redirectURI: `${config.env.url}/api/auth/callback/google`,
    },
    github: {
      clientId: config.env.oauth.github.clientId,
      clientSecret: config.env.oauth.github.clientSecret,
      redirectURI: `${config.env.url}/api/auth/callback/github`,
    },
  },
  user: {
    additionalFields: {
      onboardingStatus: {
        type: "string",
        required: true,
        defaultValue: "pending_verification",
      },
    },
  },
  rateLimit: {
    window: 60, // 1 minute
    max: 10, // 10 requests per minute
    storage: "database",
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
