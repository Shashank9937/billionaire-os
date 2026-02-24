import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

export function TopBar({ userName }: { userName: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/80 px-6 py-3 backdrop-blur">
      <div>
        <h1 className="text-sm uppercase tracking-widest text-muted-foreground">Founder Operating System</h1>
        <p className="text-sm font-semibold">Execution first. Leverage always.</p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <form action="/api/auth/logout" method="post">
          <Button variant="ghost" className="border">
            Logout ({userName})
          </Button>
        </form>
      </div>
    </header>
  );
}
