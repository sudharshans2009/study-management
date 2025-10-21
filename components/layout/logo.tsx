import Link from "next/link";
import { Timer } from "lucide-react";

export function Logo() {
  return (
    <Link 
      href="/" 
      className="flex items-center space-x-2.5 transition-opacity hover:opacity-80"
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Timer className="h-5 w-5" />
      </div>
      <span className="font-bold text-xl tracking-tight">SS.Study</span>
    </Link>
  );
}
