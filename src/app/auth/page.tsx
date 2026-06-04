"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createClient,
  getClientUser,
  isSupabaseConfigured,
  SUPABASE_SETUP_MESSAGE,
} from "@/lib/supabase";
import Navbar from "@/components/navbar";

type Mode = "login" | "signup";

function getPostAuthPath(next: string | null) {
  if (next?.startsWith("/") && !next.startsWith("//")) return next;
  return "/dashboard";
}

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postAuthPath = getPostAuthPath(searchParams.get("next"));
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    if (supabase) void getClientUser(supabase);
  }, [configured]);

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
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${postAuthPath}`,
      },
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
        router.push(postAuthPath);
      }
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          practice_name: practiceName,
        });
        setSuccess("Account created! Please check your email to confirm.");
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-sm">
          <div className="flex bg-white border border-[#E2E0D8] rounded-xl p-1 mb-8">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all ${
                mode === "login" ? "bg-[#1A1A1A] text-white" : "text-[#6B6B6B] hover:text-[#1A1A1A]"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all ${
                mode === "signup" ? "bg-[#1A1A1A] text-white" : "text-[#6B6B6B] hover:text-[#1A1A1A]"
              }`}
            >
              Sign up
            </button>
          </div>

          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-[#6B6B6B] mb-6">
            {mode === "login"
              ? "Sign in to manage your denture cases."
              : "Start ordering dentures online in minutes."}
          </p>

          {!configured && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
              <p className="text-sm text-amber-900 font-medium mb-1">Auth not configured yet</p>
              <p className="text-[13px] text-amber-800 leading-relaxed">{SUPABASE_SETUP_MESSAGE}</p>
              <p className="text-[12px] text-amber-700 mt-2">
                Use the same values as PrintCrown in Vercel → Settings → Environment Variables.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || !configured}
            className="w-full h-11 rounded-xl border border-[#E2E0D8] bg-white flex items-center justify-center gap-3 text-sm font-medium text-[#1A1A1A] hover:bg-[#F8F7F4] transition mb-4 disabled:opacity-50"
          >
            {googleLoading ? (
              <span className="text-sm text-[#6B6B6B]">Redirecting...</span>
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

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#E2E0D8]" />
            <span className="text-xs text-[#9B9B9B]">or</span>
            <div className="flex-1 h-px bg-[#E2E0D8]" />
          </div>

          <div className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                      First name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#0F6E56] placeholder:text-[#C8C6BE]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                      Last name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Smith"
                      className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#0F6E56] placeholder:text-[#C8C6BE]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                    Practice name
                  </label>
                  <input
                    type="text"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="Smith Family Dentistry"
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#0F6E56] placeholder:text-[#C8C6BE]"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="doctor@practice.com"
                className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#0F6E56] placeholder:text-[#C8C6BE]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="••••••••"
                className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#0F6E56] placeholder:text-[#C8C6BE]"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <button
              type="button"
              className="w-full h-11 bg-[#0F6E56] hover:bg-[#085041] text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
              onClick={handleSubmit}
              disabled={loading || !email || !password || !configured}
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </div>

          {mode === "login" && (
            <p className="text-center text-sm text-[#9B9B9B] mt-6">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-[#0F6E56] hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          )}

          <p className="text-center text-[11px] text-[#9B9B9B] mt-6 leading-relaxed">
            Uses the same account as PrintCrown when your lab shares one Supabase project.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
          <p className="text-sm text-[#9B9B9B]">Loading...</p>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
