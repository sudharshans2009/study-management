import Link from "next/link";
import { Timer } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Timer className="h-6 w-6 text-primary" />
      <span className="font-bold text-xl">StudyFlow</span>
    </Link>
  );
}
