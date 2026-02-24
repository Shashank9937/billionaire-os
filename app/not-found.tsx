import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md rounded-lg border bg-card p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">404</p>
        <h1 className="mt-2 text-2xl font-bold">Route Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This module does not exist yet or you do not have access.</p>
        <Link className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" href="/dashboard">
          Back to Command Center
        </Link>
      </div>
    </main>
  );
}
