"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";
import Link from "next/link";

function LoginForm() {
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!phone || !password) {
      setError(t("missingFields"));
      return;
    }
    setLoading(true);

    // Sign in with phone + password. Supabase supports phone auth via email-like
    // alias only if configured. We use an email derived from phone as a fallback.
    const email = phone.includes("@") ? phone : `${phone}@svs.local`;

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setLoading(false);
      setError(t("loginError"));
      return;
    }

    // Fetch role and route accordingly
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const role = profile?.role ?? "visitor";
    const target =
      redirectPath && redirectPath !== "/"
        ? redirectPath
        : role === "admin"
        ? "/admin"
        : "/visitor";
    router.push(target);
    router.refresh();
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
              width={84}
              height={84}
              priority
            />
            <h1 className="mt-3 text-lg font-bold text-navy">
              {t("police")}
            </h1>
            <p className="text-sm text-gold-dark font-semibold">
              {t("bureau")}
            </p>
            <p className="mt-3 text-xs text-slate-500">{t("loginPrompt")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("phone")} / {t("email")}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy"
                placeholder={t("phone")}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy"
                placeholder={t("password")}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-navy text-white font-semibold py-3 hover:bg-navy-600 transition-colors disabled:opacity-60"
            >
              {loading ? t("signingIn") : t("login")}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            {t("noAccount")}{" "}
            <Link href="/signup" className="font-semibold text-navy hover:underline">
              {t("signup")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy" />}>
      <LoginForm />
    </Suspense>
  );
}
