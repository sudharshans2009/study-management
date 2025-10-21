"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setupProfileSchema, type SetupProfileFormData } from "@/lib/validations/auth";
import { setupProfileAction } from "@/actions/setup-actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

const PRESET_COLORS = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#10B981", // green
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
];

export function SetupProfileForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<SetupProfileFormData>({
    resolver: zodResolver(setupProfileSchema),
    defaultValues: {
      fullName: "",
      subjects: [{ name: "", color: PRESET_COLORS[0] }],
      dailyGoal: 120, // 2 hours default
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subjects",
  });

  const setupMutation = useMutation({
    mutationFn: async (data: SetupProfileFormData) => {
      const result = await setupProfileAction(data);
      if (!result.success) {
        throw new Error(result.error || "Failed to setup profile");
      }
      return result;
    },
    onSuccess: async () => {
      // Invalidate session to refetch with updated onboarding status
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      
      console.log("✅ Setup completed, redirecting to dashboard...");
      
      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  async function onSubmit(data: SetupProfileFormData) {
    setError(null);
    setupMutation.mutate(data);
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof SetupProfileFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ["fullName"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["subjects"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["dailyGoal"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center ${step < 4 ? "flex-1" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  currentStep >= step
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    currentStep > step ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between mb-6 text-xs text-muted-foreground">
          <span className={currentStep === 1 ? "text-foreground font-medium" : ""}>Name</span>
          <span className={currentStep === 2 ? "text-foreground font-medium" : ""}>Subjects</span>
          <span className={currentStep === 3 ? "text-foreground font-medium" : ""}>Time</span>
          <span className={currentStep === 4 ? "text-foreground font-medium" : ""}>Summary</span>
        </div>

        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Tell us a bit about yourself</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        disabled={setupMutation.isPending}
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be displayed on your profile
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 2: Subjects */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Study Subjects</CardTitle>
              <CardDescription>
                Add the subjects you want to track
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`subjects.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="e.g., Mathematics, Physics"
                              disabled={setupMutation.isPending}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`subjects.${index}.color`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-1">
                            {PRESET_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-8 h-8 rounded-full border-2 ${
                                  field.value === color
                                    ? "border-foreground"
                                    : "border-transparent"
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => field.onChange(color)}
                              >
                                <p className="sr-only">{color}</p>
                              </button>
                            ))}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={setupMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    name: "",
                    color: PRESET_COLORS[fields.length % PRESET_COLORS.length],
                  })
                }
                disabled={setupMutation.isPending}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Daily Goal */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Daily Study Goal</CardTitle>
              <CardDescription>
                Set your daily study time target
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="dailyGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Daily Goal: {Math.floor(field.value / 60)}h{" "}
                      {field.value % 60 > 0 ? `${field.value % 60}m` : ""}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="range"
                        min="15"
                        max="480"
                        step="15"
                        disabled={setupMutation.isPending}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Recommended: 2-4 hours per day for optimal learning
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 4: Summary */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Profile</CardTitle>
              <CardDescription>
                Make sure everything looks good before finishing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Full Name</h3>
                <p className="text-lg font-medium">{form.getValues("fullName")}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Study Subjects</h3>
                <div className="flex flex-wrap gap-2">
                  {form.getValues("subjects").map((subject, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-card"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="text-sm font-medium">{subject.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Daily Study Goal</h3>
                <p className="text-lg font-medium">
                  {Math.floor(form.getValues("dailyGoal") / 60)}h{" "}
                  {form.getValues("dailyGoal") % 60 > 0 ? `${form.getValues("dailyGoal") % 60}m` : ""} per day
                </p>
              </div>

              <Alert>
                <AlertDescription>
                  You can update these settings anytime from your profile page.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={setupMutation.isPending}
            >
              Previous
            </Button>
          )}

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={setupMutation.isPending}
              className="ml-auto"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={setupMutation.isPending}
              className="ml-auto"
            >
              {setupMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Setup
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
