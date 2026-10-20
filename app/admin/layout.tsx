import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminSidebar from "@/components/AdminSidebar";

// No auth check — admin is accessed by URL only (/admin)
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
