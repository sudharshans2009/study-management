"use server";

import { Resend } from "resend";
import config from "@/lib/config";

const resend = new Resend(config.env.resendToken);

interface EmailResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Send verification email to user
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationUrl: string,
): Promise<EmailResult> {
  try {
    console.log(`📧 Sending verification email to: ${to}`);
    const { data, error } = await resend.emails.send({
      from: "SS.Study <contact@sudharshans2009.live>", // Using verified email for testing
      to: [to],
      subject: "Verify your email address",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify your email</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to right, #4f46e5, #7c3aed); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to SS.Study!</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Thanks for signing up! We're excited to have you on board. 
                Please verify your email address to get started.
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${verificationUrl}" 
                   style="background: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                If you didn't create an account, you can safely ignore this email.
              </p>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                Or copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #4f46e5; word-break: break-all;">${verificationUrl}</a>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} SS.Study. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send password reset email to user
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string,
): Promise<EmailResult> {
  try {
    console.log(`📧 Sending password reset email to: ${to}`);
    const { data, error } = await resend.emails.send({
      from: "SS.Study <sudharshans2009@gmail.com>", // Using verified email for testing
      to: [to],
      subject: "Reset your password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset your password</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to right, #4f46e5, #7c3aed); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                We received a request to reset your password for your SS.Study account.
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" 
                   style="background: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                This link will expire in 1 hour for security reasons.
              </p>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                If you didn't request a password reset, you can safely ignore this email. 
                Your password will remain unchanged.
              </p>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #4f46e5; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} SS.Study. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("✅ Password reset email sent successfully!", data);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send welcome email after successful signup
 */
export async function sendWelcomeEmail(
  to: string,
  name: string,
): Promise<EmailResult> {
  try {
    console.log(`📧 Sending welcome email to: ${to}`);
    const { data, error } = await resend.emails.send({
      from: "SS.Study <sudharshans2009@gmail.com>", // Using verified email for testing
      to: [to],
      subject: "Welcome to SS.Study!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to SS.Study</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to right, #4f46e5, #7c3aed); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to SS.Study!</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Welcome aboard! We're thrilled to have you join the SS.Study community.
              </p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Here's what you can do with SS.Study:
              </p>
              
              <ul style="font-size: 16px; margin-bottom: 30px; padding-left: 20px;">
                <li style="margin-bottom: 10px;">⏱️ Track your study sessions with our built-in timer</li>
                <li style="margin-bottom: 10px;">📊 View detailed statistics about your progress</li>
                <li style="margin-bottom: 10px;">🎯 Set and achieve your learning goals</li>
                <li style="margin-bottom: 10px;">🏆 Compete with friends on the leaderboard</li>
                <li style="margin-bottom: 10px;">👥 Join study rooms for collaborative learning</li>
              </ul>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${config.env.url}/dashboard" 
                   style="background: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Get Started
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Need help getting started? Check out our 
                <a href="${config.env.url}/help" style="color: #4f46e5;">Help Center</a> 
                or reply to this email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} SS.Study. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("✅ Welcome email sent successfully!", data);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send goal reminder email
 */
export async function sendGoalReminderEmail(
  userEmail: string,
  userName: string,
  goalName: string
): Promise<EmailResult> {
  try {
    console.log(`📧 Sending goal reminder email to: ${userEmail}`);
    const { data, error } = await resend.emails.send({
      from: "SS.Study <sudharshans2009@gmail.com>",
      to: [userEmail],
      subject: "Goal Reminder - SS.Study",
      html: `
        <h1>Hi ${userName}!</h1>
        <p>This is a reminder about your goal: <strong>${goalName}</strong></p>
        <p>Keep up the great work!</p>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send streak reminder email
 */
export async function sendStreakReminderEmail(
  userEmail: string,
  userName: string,
  streakDays: number
): Promise<EmailResult> {
  try {
    console.log(`📧 Sending streak reminder email to: ${userEmail}`);
    const { data, error } = await resend.emails.send({
      from: "SS.Study <sudharshans2009@gmail.com>",
      to: [userEmail],
      subject: "Don't Break Your Streak! - SS.Study",
      html: `
        <h1>Hi ${userName}!</h1>
        <p>You have a ${streakDays}-day streak going! Don't break it today.</p>
        <p>Start a study session to keep your streak alive.</p>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
