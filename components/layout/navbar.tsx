"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavigationLinks } from "./navigation-links";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu-client";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left: Logo/App Name */}
        <Logo />

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 flex-1 justify-center">
          <NavigationLinks />
        </nav>

        {/* Right: User Menu & Mobile Menu */}
        <div className="flex items-center gap-2">
          <UserMenu />
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                <NavigationLinks mobile />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
