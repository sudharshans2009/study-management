"use client";

import Link from "next/link";
import { Timer } from "lucide-react";
import { UserMenu } from "./user-menu-client";

export function HomeNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Timer className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">StudyFlow</span>
        </Link>

        {/* User Menu or Auth Buttons */}
        <UserMenu />
      </div>
    </header>
  );
}
