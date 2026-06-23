import { cn } from "@/lib/utils";

const inputClass =
  "w-full h-11 px-3 border border-[var(--pd-border)] bg-white text-[14px] text-[var(--pd-navy)] focus:outline-none focus:border-[var(--pd-teal)] placeholder:text-[var(--pd-muted)]/60";

export function AuthField({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  onKeyDown,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-[var(--pd-navy)] mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
    </div>
  );
}

export function AuthSelect({
  label,
  id,
  value,
  onChange,
  options,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-[var(--pd-navy)] mb-1.5">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AuthModeToggle({
  mode,
  onLogin,
  onSignup,
}: {
  mode: "login" | "signup";
  onLogin: () => void;
  onSignup: () => void;
}) {
  return (
    <div className="flex border border-[var(--pd-border)] bg-white mb-8">
      <button
        type="button"
        onClick={onLogin}
        className={cn(
          "flex-1 h-11 text-[14px] font-medium transition-colors",
          mode === "login"
            ? "bg-[var(--pd-navy)] text-white"
            : "text-[var(--pd-muted)] hover:text-[var(--pd-navy)] hover:bg-[var(--pd-surface)]"
        )}
      >
        Provider login
      </button>
      <button
        type="button"
        onClick={onSignup}
        className={cn(
          "flex-1 h-11 text-[14px] font-medium border-l border-[var(--pd-border)] transition-colors",
          mode === "signup"
            ? "bg-[var(--pd-navy)] text-white"
            : "text-[var(--pd-muted)] hover:text-[var(--pd-navy)] hover:bg-[var(--pd-surface)]"
        )}
      >
        Register practice
      </button>
    </div>
  );
}

export function AuthAlert({ variant, children }: { variant: "error" | "success" | "warning"; children: React.ReactNode }) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-[var(--pd-teal)]/30 bg-[var(--pd-teal)]/5 text-[var(--pd-teal-dark)]",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  };
  return (
    <div className={cn("p-4 border text-[13px] leading-relaxed", styles[variant])}>{children}</div>
  );
}

export function AuthPanelAside() {
  return (
    <aside className="hidden lg:flex flex-col justify-between bg-[var(--pd-navy)] text-white p-12 xl:p-16 relative overflow-hidden">
      <div className="absolute inset-0 pd-grid-bg opacity-[0.07]" aria-hidden />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-light)] mb-6">
          Provider portal
        </p>
        <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-semibold tracking-[-0.03em] leading-tight mb-4">
          Manage cases. Track workflow. Deliver in two visits.
        </h1>
        <p className="text-[15px] text-[#A8C4D4] leading-relaxed max-w-md">
          Sign in to submit denture cases, upload scans, and track try-in and delivery status through
          the PrintDenture provider portal.
        </p>
      </div>
      <ul className="relative space-y-4 mt-12">
        {[
          "Submit and track lab cases online",
          "Upload scans and case files securely",
          "Printed try-in workflow before final delivery",
        ].map((item) => (
          <li key={item} className="flex gap-3 text-[14px] text-[#8BB3C8]">
            <span className="text-[var(--pd-teal-light)] shrink-0">✓</span>
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function AuthSubmitButton({
  loading,
  disabled,
  onClick,
  children,
}: {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-11 bg-[var(--pd-teal)] hover:bg-[var(--pd-teal-dark)] text-white text-[14px] font-medium disabled:opacity-50 transition-colors"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
