#!/usr/bin/env tsx

/**
 * Test Resend email integration
 * 
 * This script tests sending a welcome email using Resend.
 * 
 * Usage:
 *   bun run test:email your.email@example.com "Your Name"
 */

import { config } from "dotenv";
import { sendWelcomeEmail } from "../services/email";

// Load environment variables
config({ path: ".env.local" });

const email = process.argv[2];
const name = process.argv[3] || "Test User";

if (!email) {
  console.error("❌ Please provide an email address");
  console.error("\nUsage:");
  console.error('  bun run test:email your.email@example.com "Your Name"');
  console.error("\nExample:");
  console.error('  bun run test:email john@example.com "John Doe"\n');
  process.exit(1);
}

if (!process.env.RESEND_TOKEN) {
  console.error("❌ RESEND_TOKEN not found in environment variables");
  console.error("   Please add it to your .env.local file\n");
  process.exit(1);
}

async function testEmail() {
  console.log("📧 Testing Resend email integration...\n");
  console.log(`To: ${email}`);
  console.log(`Name: ${name}\n`);
  console.log("Sending welcome email...");

  try {
    const result = await sendWelcomeEmail(email, name);

    if (result.success) {
      console.log("\n✅ Email sent successfully!");
      console.log("\nDetails:");
      console.log(`  To: ${email}`);
      console.log(`  From: SS.Study <noreply@study.sudharshans.me>`);
      console.log(`  Subject: Welcome to SS.Study - Let's Get Started! 🎓\n`);
      console.log("📬 Check your inbox!");
    } else {
      console.error("\n❌ Failed to send email");
      console.error("\nError details:");
      console.error(result.error);
      console.error("\nTroubleshooting:");
      console.error("  1. Verify RESEND_TOKEN is correct");
      console.error("  2. Check if sender domain is verified in Resend");
      console.error("  3. Ensure recipient email is valid");
      console.error("  4. Check Resend dashboard for logs\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Exception occurred:");
    console.error(error);
    process.exit(1);
  }
}

testEmail();

