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
    label: "Leaderboard",
    href: "/leaderboard",
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
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === route.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
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
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === route.href
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
    </>
  );
}
