"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type Lang, supportedLangs } from "@/shared/i18n";

const labels: Record<Lang, string> = {
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  en: "English",
};

export function LanguageSwitcher({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  return (
    <select
      aria-label="language"
      className="h-10 rounded-[10px] border-[0.5px] border-[#d8d0c4] bg-[#fefcf8] px-3 text-sm text-[#2f2d29]"
      value={lang}
      onChange={(event) => {
        const nextLang = event.target.value as Lang;
        if (!supportedLangs.includes(nextLang)) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set("lang", nextLang);
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      {supportedLangs.map((item) => (
        <option key={item} value={item}>
          {labels[item]}
        </option>
      ))}
    </select>
  );
}
