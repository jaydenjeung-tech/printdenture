"use client";

import { useState } from "react";
import { createAppClient } from "@/lib/supabase";
import { isPracticeProfileComplete } from "@/lib/profile-requirements";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY",
  "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND",
  "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export type CompleteProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  practice_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
};

type Props = {
  profile: CompleteProfile | null;
  userId: string;
  title?: string;
  description?: string;
  onComplete: (profile: CompleteProfile) => void;
};

export default function CompleteProfileModal({
  profile,
  userId,
  title = "Complete your practice profile",
  description = "We need your practice name, phone, and shipping address before you can place orders or manage cases.",
  onComplete,
}: Props) {
  const [form, setForm] = useState({
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
    practice_name: profile?.practice_name ?? "",
    phone: profile?.phone ?? "",
    address: profile?.address ?? "",
    city: profile?.city ?? "",
    state: profile?.state ?? "",
    zip: profile?.zip ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const complete = isPracticeProfileComplete(form);

  async function handleSave() {
    if (!complete) {
      setError("Practice name, phone, and full address are required.");
      return;
    }

    setSaving(true);
    setError("");
    const supabase = createAppClient();
    const payload = {
      id: userId,
      first_name: form.first_name.trim() || null,
      last_name: form.last_name.trim() || null,
      practice_name: form.practice_name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zip: form.zip.trim(),
    };

    const { data, error: saveError } = await supabase
      .from("profiles")
      .upsert(payload)
      .select()
      .single();

    setSaving(false);

    if (saveError || !data) {
      setError(saveError?.message ?? "Could not save profile. Please try again.");
      return;
    }

    onComplete(data as CompleteProfile);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden />
      <div className="relative bg-white rounded-2xl border border-[#E2E0D8] p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">{title}</h3>
        <p className="text-sm text-[#6B6B6B] mb-5 leading-relaxed">{description}</p>

        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider block mb-1">
                First name
              </label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                placeholder="John"
                className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-[#F8F7F4] text-sm focus:outline-none focus:border-[#0F6E56]"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider block mb-1">
                Last name
              </label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                placeholder="Smith"
                className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-[#F8F7F4] text-sm focus:outline-none focus:border-[#0F6E56]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider block mb-1">
              Practice name *
            </label>
            <input
              type="text"
              value={form.practice_name}
              onChange={(e) => update("practice_name", e.target.value)}
              placeholder="Smith Family Dentistry"
              className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-[#F8F7F4] text-sm focus:outline-none focus:border-[#0F6E56]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider block mb-1">
              Phone *
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="(555) 000-0000"
              className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-[#F8F7F4] text-sm focus:outline-none focus:border-[#0F6E56]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider block mb-1">
              Street address *
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="123 Main St"
              className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-[#F8F7F4] text-sm focus:outline-none focus:border-[#0F6E56]"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider block mb-1">
                City *
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Los Angeles"
                className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-[#F8F7F4] text-sm focus:outline-none focus:border-[#0F6E56]"
              />
            </div>
            <div className="w-24">
              <label className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider block mb-1">
                State *
              </label>
              <select
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                className="w-full h-10 px-2 rounded-lg border border-[#E2E0D8] bg-[#F8F7F4] text-sm focus:outline-none focus:border-[#0F6E56]"
              >
                <option value="">—</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider block mb-1">
                ZIP *
              </label>
              <input
                type="text"
                value={form.zip}
                onChange={(e) => update("zip", e.target.value)}
                placeholder="90001"
                className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-[#F8F7F4] text-sm focus:outline-none focus:border-[#0F6E56]"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !complete}
          className="mt-5 w-full h-11 rounded-xl bg-[#0F6E56] hover:bg-[#085041] text-white text-sm font-semibold disabled:opacity-40 transition-colors"
        >
          {saving ? "Saving..." : "Save & continue"}
        </button>
      </div>
    </div>
  );
}
