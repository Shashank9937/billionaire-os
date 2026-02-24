type LoginPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : {};
  const error = params?.error;

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden border-r bg-gradient-to-br from-secondary to-accent p-10 lg:block">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Billionaire Execution OS</p>
        <h1 className="mt-4 max-w-lg text-4xl font-bold leading-tight">
          Strategic operating system for building a ₹100 Cr+ company in 36 months.
        </h1>
        <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
          <li>- Strategic clarity and ruthless capital discipline</li>
          <li>- Real-time execution and validation tracking</li>
          <li>- Founder performance loop tied to enterprise value creation</li>
        </ul>
      </section>

      <section className="flex items-center justify-center p-6">
        <form action="/api/auth/login" method="post" className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Secure Access</p>
            <h2 className="text-2xl font-bold">Sign in</h2>
            <p className="text-xs text-muted-foreground">Default seed credentials are in README.</p>
          </div>

          {error ? (
            <p className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs text-red-500">
              Invalid credentials. Try again.
            </p>
          ) : null}

          <label className="block space-y-1">
            <span className="text-xs font-medium">Email</span>
            <input name="email" type="email" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium">Password</span>
            <input name="password" type="password" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>

          <button type="submit" className="h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            Enter OS
          </button>

          <p className="text-center text-xs text-muted-foreground">Need setup help? See README in project root.</p>
        </form>
      </section>
    </main>
  );
}
