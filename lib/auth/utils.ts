/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  strength: "weak" | "medium" | "strong";
  feedback: string[];
} {
  const feedback: string[] = [];
  let strength: "weak" | "medium" | "strong" = "weak";

  if (password.length < 8) {
    feedback.push("Password must be at least 8 characters long");
    return { isValid: false, strength, feedback };
  }

  let score = 0;

  // Check for lowercase
  if (/[a-z]/.test(password)) score++;

  // Check for uppercase
  if (/[A-Z]/.test(password)) score++;

  // Check for numbers
  if (/\d/.test(password)) score++;

  // Check for special characters
  if (/[^a-zA-Z\d]/.test(password)) score++;

  // Check length
  if (password.length >= 12) score++;

  if (score < 3) {
    strength = "weak";
    feedback.push("Add uppercase letters, numbers, or special characters");
  } else if (score < 4) {
    strength = "medium";
    feedback.push("Good! Consider making it even stronger");
  } else {
    strength = "strong";
  }

  return {
    isValid: score >= 3,
    strength,
    feedback,
  };
}

/**
 * Format user display name
 */
export function formatDisplayName(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
