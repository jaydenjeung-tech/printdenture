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

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-[var(--pd-border)]" />
      <span className="text-[12px] text-[var(--pd-muted)] uppercase tracking-wider">or</span>
      <div className="flex-1 h-px bg-[var(--pd-border)]" />
    </div>
  );
}

export function AuthGoogleButton({
  loading,
  disabled,
  onClick,
}: {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-11 border border-[var(--pd-border)] bg-white flex items-center justify-center gap-3 text-[14px] font-medium text-[var(--pd-navy)] hover:bg-[var(--pd-surface)] transition-colors disabled:opacity-50"
    >
      {loading ? (
        <span className="text-[var(--pd-muted)]">Redirecting…</span>
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </>
      )}
    </button>
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
