"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export default function AdminSidebar() {
  const t = useTranslation();
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: t("dashboard"), icon: "▦" },
    { href: "/admin/suspects", label: t("suspects"), icon: "👤" },
    { href: "/admin/suspects/add", label: t("addSuspect"), icon: "➕" },
    { href: "/admin/visits", label: t("visitHistory"), icon: "📋" },
  ];

  return (
    <nav className="flex md:flex-col gap-1 md:w-56 md:min-h-[calc(100vh-64px)] bg-navy-700 md:border-r border-white/10 md:py-6 px-2 md:px-4 overflow-x-auto">
      {links.map((link) => {
        const active =
          pathname === link.href ||
          (link.href !== "/admin" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              active
                ? "bg-gold text-navy"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
