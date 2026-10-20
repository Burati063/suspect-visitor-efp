import Header from "@/components/Header";
import Footer from "@/components/Footer";

// No auth check — visitor accesses /visitor directly on their phone
export default function VisitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 w-full max-w-md mx-auto p-4 pb-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
