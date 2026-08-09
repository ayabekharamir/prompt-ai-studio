import { HTMLAttributes } from "react";
import { classNames } from "@/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames(
        "rounded-xl border border-gray-200 bg-white p-6 shadow-sm",
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
    error: "bg-red-50 text-red-700 border-red-200",
    success: "bg-green-50 text-green-700 border-green-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
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
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
