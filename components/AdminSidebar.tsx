"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export default function AdminSidebar() {
  const t = useTranslation();
  const pathname = usePathname();

  const links = [
    { href: "/admin",               label: t("dashboard"),    icon: "▦",  exact: true  },
    { href: "/admin/suspects",      label: t("suspects"),     icon: "👤", exact: true  },
    { href: "/admin/suspects/add",  label: t("addSuspect"),   icon: "➕", exact: false },
    { href: "/admin/visits",        label: t("visitHistory"), icon: "📋", exact: false },
  ];

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="flex md:flex-col gap-1 md:w-56 md:min-h-[calc(100vh-64px)] bg-navy md:bg-navy-700 md:border-r border-white/10 py-2 md:py-6 px-2 md:px-4 overflow-x-auto">
      {links.map((link) => {
        const active = isActive(link.href, link.exact);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              active
                ? "bg-gold text-navy font-bold"
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
