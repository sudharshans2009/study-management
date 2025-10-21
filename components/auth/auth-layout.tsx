import Link from "next/link";

export function AuthDivider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">
          Or continue with
        </span>
      </div>
    </div>
  );
}

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  footer?: {
    text: string;
    linkText: string;
    linkHref: string;
  };
}

export function AuthLayout({ children, title, description, footer }: AuthLayoutProps) {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <div className="w-full md:max-w-[50%] lg:max-w-[33.333%] space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="bg-card border rounded-lg shadow-sm p-8 space-y-6">
          {children}
        </div>

        {footer && (
          <p className="text-center text-sm text-muted-foreground">
            {footer.text}{" "}
            <Link
              href={footer.linkHref}
              className="font-semibold text-primary hover:underline transition-colors"
            >
              {footer.linkText}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
