"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Timer,
  BarChart3,
  Target,
  Users,
  Trophy,
  BookOpen,
} from "lucide-react";

const routes = [
  {
    label: "Timer",
    href: "/timer",
    icon: Timer,
  },
  {
    label: "Sessions",
    href: "/sessions",
    icon: BookOpen,
  },
  {
    label: "Stats",
    href: "/stats",
    icon: BarChart3,
  },
  {
    label: "Goals",
    href: "/goals",
    icon: Target,
  },
  {
    label: "Rooms",
    href: "/rooms",
    icon: Users,
  },
  {
    label: "Leaderboards",
    href: "/leaderboards",
    icon: Trophy,
  },
];

interface NavigationLinksProps {
  mobile?: boolean;
}

export function NavigationLinks({ mobile = false }: NavigationLinksProps) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <>
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {route.label}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <>
      {routes.map((route) => {
        const isActive = pathname === route.href;
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-all relative px-1 py-1.5",
              isActive
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {route.label}
          </Link>
        );
      })}
    </>
  );
}
