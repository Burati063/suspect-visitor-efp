"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";
import Link from "next/link";

function SignupForm() {
  const t = useTranslation();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !phone.trim() || !password) {
      setError(t("missingFields"));
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    // Derive a stable email from the phone number.
    // We strip spaces/dashes so "091 100 0000" → "0911000000@svs.local"
    const cleanPhone = phone.trim().replace(/[\s\-]/g, "");
    const email = cleanPhone.includes("@")
      ? cleanPhone
      : `${cleanPhone}@svs.local`;

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Pass extra profile data for the DB trigger
        data: {
          full_name: fullName.trim(),
          phone: cleanPhone,
        },
        // No email redirect needed — we use phone-derived fake emails
        emailRedirectTo: undefined,
      },
    });

    if (signUpError) {
      setLoading(false);
      // Show the real error so users/admins can diagnose
      if (signUpError.message.includes("already registered")) {
        setError("This phone number is already registered. Please login instead.");
      } else {
        setError(`${t("signupError")} (${signUpError.message})`);
      }
      return;
    }

    if (!data.user) {
      setLoading(false);
      setError(t("signupError") + " (no user returned)");
      return;
    }

    // Upsert profile — the DB trigger should handle this, but we do it
    // here too in case the trigger hasn't run yet (race condition on cold start)
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name: fullName.trim(),
      phone: cleanPhone,
      role: "visitor",
    });

    if (profileError) {
      // Non-fatal — the trigger will have created it. Log and continue.
      console.warn("Profile upsert warning:", profileError.message);
    }

    setLoading(false);
    setSuccess(true);

    // If Supabase email confirmation is disabled, we can log them in directly.
    // If it's enabled, they need to confirm first (but our email is fake, so
    // the admin MUST disable email confirmation — see README Step 3b).
    setTimeout(() => router.push("/login"), 1800);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy to-navy-700 flex flex-col">
      <header className="w-full max-w-md mx-auto pt-8 px-4 flex justify-end">
        <LanguageToggle dark />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <Image
              src="/logo.png"
              alt="Federal Police logo"
              width={72}
              height={72}
              priority
            />
            <h1 className="mt-3 text-lg font-bold text-navy">
              {t("createAccount")}
            </h1>
            <p className="text-sm text-slate-500">{t("visitor")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("fullName")} *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy"
                placeholder={t("fullName")}
                autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("phone")} * <span className="text-xs text-slate-400">(used as username)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy"
                placeholder="0911000000"
                autoComplete="tel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("password")} * <span className="text-xs text-slate-400">(min 6 characters)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy"
                placeholder="••••••"
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                ✓ {t("signupSuccess")}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-navy text-white font-semibold py-3 hover:bg-navy-600 transition-colors disabled:opacity-60"
            >
              {loading ? t("loading") : t("createAccount")}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href="/login"
              className="font-semibold text-navy hover:underline"
            >
              {t("login")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy" />}>
      <SignupForm />
    </Suspense>
  );
}
