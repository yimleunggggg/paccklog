"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { HeaderIconMenus } from "@/components/header-icon-menus";
import { resolveLang, texts } from "@/shared/i18n";

export function GlobalNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lang = resolveLang(searchParams.get("lang") ?? undefined);
  const t = texts[lang];
  const isAuthLikePage = pathname.startsWith("/login") || pathname.startsWith("/auth/");

  const navItems = [
    { href: "/", label: t.navTripList },
    { href: "/explore", label: t.navExplore },
    { href: "/locker", label: t.gearLocker },
    { href: "/trips/new", label: t.newTrip },
  ];
  const visibleNavItems = isAuthLikePage ? navItems.filter((item) => item.href === "/explore") : navItems;

  const withLang = (href: string) => {
    const query = new URLSearchParams(searchParams.toString());
    query.set("lang", lang);
    return `${href}?${query.toString()}`;
  };

  return (
    <header
      className={`global-top-nav border-b border-[#ddd5c8] backdrop-blur supports-[backdrop-filter]:bg-[#f4f1ec]/80 ${
        isAuthLikePage ? "global-top-nav-auth bg-[#f4f1ec]/78" : "bg-[#f4f1ec]/92"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between gap-3 px-4 py-2.5 md:px-6">
        <nav className="flex min-w-0 items-center gap-1.5 overflow-x-auto pr-1">
          {visibleNavItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={withLang(item.href)}
                className={`brand-chip shrink-0 ${active ? "brand-chip-active" : ""} ${isAuthLikePage ? "global-nav-chip-auth" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <HeaderIconMenus lang={lang} />
      </div>
    </header>
  );
}
