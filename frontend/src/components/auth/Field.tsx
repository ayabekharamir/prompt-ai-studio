export function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  autoComplete,
  placeholder,
  disabled,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  autoComplete?: string | undefined;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/40 disabled:opacity-60 ${
          error ? "border-destructive" : "border-input focus:border-ring"
        }`}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SubmitButton({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading?: boolean | undefined;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

export function FormAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
    >
      {message}
    </div>
  );
}