"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BackToHomeButtonProps {
  className?: string;
  variant?: "default" | "ghost" | "link" | "outline";
}

export function BackToHomeButton({ 
  className = "", 
  variant = "ghost" 
}: BackToHomeButtonProps) {
  return (
    <Button
      asChild
      variant={variant}
      size="sm"
      className={className}
    >
      <Link href="/">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
    </Button>
  );
}
