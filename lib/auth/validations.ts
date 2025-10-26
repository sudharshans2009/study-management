import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const setupProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  subjects: z.array(z.object({
    name: z.string().min(1, "Subject name is required"),
    color: z.string().optional(),
  })).min(1, "Add at least one subject"),
  dailyGoal: z.number().min(15, "Daily goal must be at least 15 minutes").max(1440, "Daily goal cannot exceed 24 hours"),
  timezone: z.string().min(1, "Please select your timezone"),
});

export type SetupProfileFormData = z.infer<typeof setupProfileSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
