"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/auth/validations";
import { forgotPasswordAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { BackToHomeButton } from "@/components/auth/back-to-home-button";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      return await forgotPasswordAction(data);
    },
    onSuccess: (result) => {
      if (!result.success) {
        setError(result.error || "Failed to send reset email");
        setSuccess(null);
        return;
      }

      setSuccess(result.message || "Password reset email sent!");
      setError(null);
      form.reset();
    },
    onError: () => {
      setError("An unexpected error occurred");
      setSuccess(null);
    },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setError(null);
    setSuccess(null);
    forgotPasswordMutation.mutate(data);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4">
        <BackToHomeButton />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <AuthLayout
          title="Forgot Password"
          description="Enter your email to receive a password reset link"
          footer={{
            text: "Remember your password?",
            linkText: "Sign in",
            linkHref: "/signin",
          }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={forgotPasswordMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
                {forgotPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </form>
          </Form>
        </AuthLayout>
      </div>
    </div>
  );
}

