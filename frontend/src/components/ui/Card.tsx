import { HTMLAttributes } from "react";
import { classNames } from "@/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames(
        "rounded-xl border border-border bg-surface p-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function Alert({
  variant = "error",
  children,
}: {
  variant?: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    error: "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400",
    success: "bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400",
    info: "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400",
  }[variant];

  return (
    <div className={classNames("rounded-lg border px-4 py-3 text-sm", styles)}>
      {children}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={classNames(
        "h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent",
        className
      )}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface-muted px-6 py-12 text-center">
      <p className="text-sm font-medium text-fg">{title}</p>
      {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
