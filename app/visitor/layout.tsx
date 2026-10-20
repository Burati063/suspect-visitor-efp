import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function VisitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/visitor");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header showLogout />
      <main className="flex-1 w-full max-w-md mx-auto p-4 pb-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
