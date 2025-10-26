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
 * Send welcome email after successful signup or for batch onboarding
 */
export async function sendWelcomeEmail(
  to: string,
  name: string,
): Promise<EmailResult> {
  try {
    console.log(`📧 Sending welcome email to: ${to}`);
    const { data, error } = await resend.emails.send({
      from: "SS.Study <noreply@study.sudharshans.me>",
      to: [to],
      subject: "Welcome to SS.Study - Let's Get Started! 🎓",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SS.Study</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                � Welcome to SS.Study!
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                Hi <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                Welcome to SS.Study! We're excited to help you track your study time, achieve your goals, and stay motivated on your learning journey. 🚀
              </p>

              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.5;">
                Here's how to get started:
              </p>

              <!-- Features -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 10px;">
                    <div style="display: flex; align-items: start;">
                      <span style="font-size: 24px; margin-right: 12px;">⏱️</span>
                      <div>
                        <strong style="color: #333333; font-size: 16px;">Track Your Study Time</strong>
                        <p style="margin: 5px 0 0; color: #666666; font-size: 14px; line-height: 1.4;">
                          Use our timer to log your study sessions and see your progress over time.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
                    <div style="display: flex; align-items: start;">
                      <span style="font-size: 24px; margin-right: 12px;">🎯</span>
                      <div>
                        <strong style="color: #333333; font-size: 16px;">Set Your Goals</strong>
                        <p style="margin: 5px 0 0; color: #666666; font-size: 14px; line-height: 1.4;">
                          Create daily, weekly, or monthly goals to stay motivated and on track.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
                    <div style="display: flex; align-items: start;">
                      <span style="font-size: 24px; margin-right: 12px;">📊</span>
                      <div>
                        <strong style="color: #333333; font-size: 16px;">View Your Stats</strong>
                        <p style="margin: 5px 0 0; color: #666666; font-size: 14px; line-height: 1.4;">
                          Analyze your study patterns with detailed statistics and charts.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
                    <div style="display: flex; align-items: start;">
                      <span style="font-size: 24px; margin-right: 12px;">🏆</span>
                      <div>
                        <strong style="color: #333333; font-size: 16px;">Compete on Leaderboards</strong>
                        <p style="margin: 5px 0 0; color: #666666; font-size: 14px; line-height: 1.4;">
                          See how you rank against other learners and stay motivated!
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://study.sudharshans.me/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Start Studying Now →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.5;">
                Need help getting started? Check out our <a href="https://study.sudharshans.me/help" style="color: #667eea; text-decoration: none;">help center</a> or reply to this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 14px;">
                Happy studying! 📚
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © 2025 SS.Study. All rights reserved.
              </p>
              <p style="margin: 10px 0 0; color: #999999; font-size: 12px;">
                <a href="https://study.sudharshans.me" style="color: #667eea; text-decoration: none;">Visit Website</a> •
                <a href="https://study.sudharshans.me/settings" style="color: #667eea; text-decoration: none;">Settings</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
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
