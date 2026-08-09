export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Prompt AI Studio
          </span>
        </div>
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
        {footer ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        ) : null}
      </div>
    </main>
  );
}