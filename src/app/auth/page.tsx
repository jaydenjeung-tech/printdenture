"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        // 프로필 생성
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
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#1A1A1A] rounded-sm flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">PC</span>
          </div>
          <span className="font-semibold text-[#1A1A1A]">
            Print<span className="text-[#2563EB]">Crown</span>
          </span>
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
          <p className="text-sm text-[#6B6B6B] mb-8">
            {mode === "login"
              ? "Sign in to manage your cases."
              : "Start ordering restorations in minutes."}
          </p>

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