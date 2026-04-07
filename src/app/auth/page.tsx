"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";
import PrintCrownLogo from "@/components/logo";

type Mode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
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

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  async function handleSubmit() {
    setError("");
    setSuccess("");
    setLoading(true);
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
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
      {/* Top bar */}
      <div className="h-14 border-b border-[#E2E0D8] bg-white flex items-center px-6">
        <Link href="/">
          <PrintCrownLogo size={28} />
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Tab switcher */}
          <div className="flex bg-white border border-[#E2E0D8] rounded-xl p-1 mb-8">
            <button
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all
                ${mode === "login" ? "bg-[#1A1A1A] text-white" : "text-[#6B6B6B] hover:text-[#1A1A1A]"}`}
            >
              Sign in
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
              className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all
                ${mode === "signup" ? "bg-[#1A1A1A] text-white" : "text-[#6B6B6B] hover:text-[#1A1A1A]"}`}
            >
              Sign up
            </button>
          </div>

          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-[#6B6B6B] mb-6">
            {mode === "login"
              ? "Sign in to manage your cases."
              : "Start ordering restorations in minutes."}
          </p>

          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full h-11 rounded-xl border border-[#E2E0D8] bg-white flex items-center justify-center gap-3 text-sm font-medium text-[#1A1A1A] hover:bg-[#F8F7F4] transition mb-4 disabled:opacity-50"
          >
            {googleLoading ? (
              <span className="text-sm text-[#6B6B6B]">Redirecting...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#E2E0D8]" />
            <span className="text-xs text-[#9B9B9B]">or</span>
            <div className="flex-1 h-px bg-[#E2E0D8]" />
          </div>

          <div className="space-y-4">
            {/* Signup extra fields */}
            {mode === "signup" && (
              <>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">First name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Last name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Smith"
                      className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Practice name</label>
                  <input
                    type="text"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="Smith Family Dentistry"
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                 onKeyDown={(e) => e.key === "Enter" && handleSubmit()}  // ← 추가
                placeholder="doctor@practice.com"
                className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}  // ← 이것만 추가
                placeholder="••••••••"
                className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]"
              />
            </div>

            {/* Error / Success */}
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

            <Button
              className="w-full h-11 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-xl text-sm font-semibold"
              onClick={handleSubmit}
              disabled={loading || !email || !password}
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </div>

          {mode === "login" && (
            <p className="text-center text-sm text-[#9B9B9B] mt-6">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-[#2563EB] hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}