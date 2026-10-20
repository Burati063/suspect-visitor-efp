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
    if (!fullName || !phone || !password) {
      setError(t("missingFields"));
      return;
    }
    setLoading(true);

    // Derive a stable email from the phone for Supabase email auth.
    const email = phone.includes("@") ? phone : `${phone}@svs.local`;

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        },
      },
    });

    if (signUpError || !data.user) {
      setLoading(false);
      setError(t("signupError"));
      return;
    }

    // The DB trigger (handle_new_user) creates the profile row.
    // Ensure full_name/phone are set even if the trigger lagged.
    await supabase
      .from("profiles")
      .upsert({
        id: data.user.id,
        full_name: fullName,
        phone,
        role: "visitor",
      });

    setLoading(false);
    setSuccess(true);
    setTimeout(() => router.push("/login"), 1500);
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
            <h1 className="mt-3 text-lg font-bold text-navy">{t("createAccount")}</h1>
            <p className="text-sm text-slate-500">{t("visitor")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("fullName")}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy"
                placeholder={t("fullName")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("phone")}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy"
                placeholder="+251 9.. ...."
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
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-700 bg-green-50 rounded-md px-3 py-2">
                {t("signupSuccess")}
              </p>
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
            <Link href="/login" className="font-semibold text-navy hover:underline">
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
