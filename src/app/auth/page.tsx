"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createClient,
  getClientUser,
  isSupabaseConfigured,
  SUPABASE_SETUP_MESSAGE,
} from "@/lib/supabase";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import {
  AuthAlert,
  AuthDivider,
  AuthField,
  AuthGoogleButton,
  AuthModeToggle,
  AuthPanelAside,
  AuthSelect,
  AuthSubmitButton,
} from "@/components/marketing/auth-ui";
import { getClientAppOrigin } from "@/lib/app-url";
import { isPracticeProfileComplete } from "@/lib/profile-requirements";
import { accountStatusMessage, type AccountStatus } from "@/lib/account-status";

type Mode = "login" | "signup";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY",
  "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND",
  "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

function getPostAuthPath(next: string | null) {
  if (next?.startsWith("/") && !next.startsWith("//")) return next;
  return "/dashboard";
}

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postAuthPath = getPostAuthPath(searchParams.get("next"));
  const initialMode: Mode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const configured = isSupabaseConfigured();

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setSuccess("");
  };

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "pending") {
      setError("Your practice registration is pending admin approval.");
    } else if (status === "rejected") {
      setError("Your practice registration was not approved. Contact support for assistance.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("mode") === "signup") {
      setMode("signup");
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("error") === "oauth") {
      setError("Google sign-in could not be completed. Please try again.");
      setCheckingSession(false);
      return;
    }
    if (!configured) {
      setCheckingSession(false);
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      setCheckingSession(false);
      return;
    }
    void (async () => {
      const { user } = await getClientUser(supabase);
      if (user) {
        router.replace(postAuthPath);
        return;
      }
      setCheckingSession(false);
    })();
  }, [configured, postAuthPath, router, searchParams]);

  async function handleGoogleSignIn() {
    if (!configured) {
      setError(SUPABASE_SETUP_MESSAGE);
      return;
    }
    setError("");
    setGoogleLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setError(SUPABASE_SETUP_MESSAGE);
      setGoogleLoading(false);
      return;
    }
    const callbackUrl = `${getClientAppOrigin()}/auth/callback?next=${encodeURIComponent(postAuthPath)}`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
  }

  async function handleSubmit() {
    if (!configured) {
      setError(SUPABASE_SETUP_MESSAGE);
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setError(SUPABASE_SETUP_MESSAGE);
      setLoading(false);
      return;
    }

    if (mode === "login") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
      } else {
        const { user } = await getClientUser(supabase);
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("account_status, role, is_admin")
            .eq("id", user.id)
            .single();

          const status = profile?.account_status as AccountStatus | undefined;
          const isAdmin = profile?.role === "admin" || profile?.is_admin;
          const blockMessage = !isAdmin ? accountStatusMessage(status ?? "approved") : null;

          if (blockMessage) {
            await supabase.auth.signOut();
            setError(blockMessage);
            setLoading(false);
            return;
          }
        }
        router.push(postAuthPath);
      }
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user) {
        if (
          !isPracticeProfileComplete({
            practice_name: practiceName,
            phone,
            address,
            city,
            state,
            zip,
          })
        ) {
          setError("Practice name, phone, and full address are required to sign up.");
          setLoading(false);
          return;
        }
        await supabase.from("profiles").insert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          practice_name: practiceName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          zip: zip.trim(),
          account_status: "approved",
        });
        if (data.session) {
          router.push(postAuthPath);
        } else {
          setSuccess("Account created. Check your email to confirm, then sign in to start submitting cases.");
        }
      }
    }
    setLoading(false);
  }

  const signupIncomplete =
    mode === "signup" &&
    (!firstName ||
      !lastName ||
      !isPracticeProfileComplete({
        practice_name: practiceName,
        phone,
        address,
        city,
        state,
        zip,
      }));

  const submitDisabled = loading || !email || !password || !configured || signupIncomplete;

  return (
    <div className="pt-[4.25rem] min-h-[calc(100vh-4.25rem)] grid lg:grid-cols-2">
      <AuthPanelAside />

      <div className="flex items-center justify-center px-6 py-12 lg:py-16 bg-[var(--pd-bg)]">
        {checkingSession ? (
          <p className="text-[14px] text-[var(--pd-muted)]">Checking session…</p>
        ) : (
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 pb-8 border-b border-[var(--pd-border)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-2">
                Provider portal
              </p>
              <h1 className="text-[1.5rem] font-semibold text-[var(--pd-navy)] tracking-[-0.02em]">
                {mode === "login" ? "Provider login" : "Register your practice"}
              </h1>
            </div>

            <AuthModeToggle
              mode={mode}
              onLogin={() => switchMode("login")}
              onSignup={() => switchMode("signup")}
            />

            <div className="hidden lg:block mb-6">
              <h2 className="text-[1.5rem] font-semibold text-[var(--pd-navy)] tracking-[-0.02em] mb-2">
                {mode === "login" ? "Sign in to your account" : "Register your practice"}
              </h2>
              <p className="text-[14px] text-[var(--pd-slate)] leading-relaxed">
                {mode === "login"
                  ? "Access your dashboard to manage cases and track workflow status."
                  : "Create your practice account to submit cases and track orders."}
              </p>
            </div>

            {!configured && (
              <div className="mb-6">
                <AuthAlert variant="warning">
                  <p className="font-medium mb-1">Auth not configured yet</p>
                  <p>{SUPABASE_SETUP_MESSAGE}</p>
                  <p className="mt-2 text-[12px] opacity-90">
                    Use the same values as PrintCrown in Vercel → Settings → Environment Variables.
                  </p>
                </AuthAlert>
              </div>
            )}

            <AuthGoogleButton
              loading={googleLoading}
              disabled={!configured}
              onClick={handleGoogleSignIn}
            />

            <AuthDivider />

            <div className="space-y-4">
              {mode === "signup" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <AuthField
                      label="First name"
                      id="firstName"
                      value={firstName}
                      onChange={setFirstName}
                      placeholder="John"
                    />
                    <AuthField
                      label="Last name"
                      id="lastName"
                      value={lastName}
                      onChange={setLastName}
                      placeholder="Smith"
                    />
                  </div>
                  <AuthField
                    label="Practice name *"
                    id="practiceName"
                    value={practiceName}
                    onChange={setPracticeName}
                    placeholder="Smith Family Dentistry"
                  />
                  <AuthField
                    label="Phone *"
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={setPhone}
                    placeholder="(555) 000-0000"
                  />
                  <AuthField
                    label="Street address *"
                    id="address"
                    value={address}
                    onChange={setAddress}
                    placeholder="123 Main St"
                  />
                  <div className="grid grid-cols-[1fr_5rem_5rem] gap-3">
                    <AuthField
                      label="City *"
                      id="city"
                      value={city}
                      onChange={setCity}
                      placeholder="Los Angeles"
                    />
                    <AuthSelect
                      label="State *"
                      id="state"
                      value={state}
                      onChange={setState}
                      options={[{ value: "", label: "—" }, ...US_STATES.map((s) => ({ value: s, label: s }))]}
                    />
                    <AuthField
                      label="ZIP *"
                      id="zip"
                      value={zip}
                      onChange={setZip}
                      placeholder="90001"
                    />
                  </div>
                </>
              )}

              <AuthField
                label="Email"
                id="email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="doctor@practice.com"
                onKeyDown={(e) => e.key === "Enter" && !submitDisabled && handleSubmit()}
              />
              <AuthField
                label="Password"
                id="password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && !submitDisabled && handleSubmit()}
              />

              {error && <AuthAlert variant="error">{error}</AuthAlert>}
              {success && <AuthAlert variant="success">{success}</AuthAlert>}

              <AuthSubmitButton loading={loading} disabled={!!submitDisabled} onClick={handleSubmit}>
                {mode === "login" ? "Sign in" : "Submit registration"}
              </AuthSubmitButton>
            </div>

            {mode === "login" && (
              <p className="text-center text-[14px] text-[var(--pd-muted)] mt-6">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-[var(--pd-teal-dark)] hover:underline font-medium"
                >
                  Register your practice
                </button>
              </p>
            )}

            {mode === "signup" && (
              <p className="text-center text-[14px] text-[var(--pd-muted)] mt-6">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-[var(--pd-teal-dark)] hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            )}

            <p className="text-center text-[11px] text-[var(--pd-muted)] mt-6 leading-relaxed">
              Uses the same account as PrintCrown when your lab shares one Supabase project.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <MarketingShell>
          <div className="min-h-[60vh] flex items-center justify-center">
            <p className="text-[14px] text-[var(--pd-muted)]">Loading…</p>
          </div>
        </MarketingShell>
      }
    >
      <MarketingShell>
        <AuthContent />
      </MarketingShell>
    </Suspense>
  );
}
