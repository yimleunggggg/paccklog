"use client";

import Link from "next/link";
import { Globe, User } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut } from "@/features/auth/actions";
import { type Lang, supportedLangs } from "@/shared/i18n";

const langShortLabel: Record<Lang, string> = {
  "zh-CN": "简",
  "zh-TW": "繁",
  en: "EN",
};

export function HeaderIconMenus({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const languageItems = supportedLangs.map((item) => ({
    value: item,
    label: langShortLabel[item],
  }));

  const accountLabels =
    lang === "en"
      ? {
          profile: "Profile",
          auth: "Password & Sign-in",
          register: "Use another account",
          signOut: "Sign out",
        }
      : lang === "zh-TW"
        ? {
            profile: "個人資訊",
            auth: "密碼與登入",
            register: "切換帳號",
            signOut: "登出",
          }
        : {
            profile: "个人信息",
            auth: "密码与登录",
            register: "切换账号",
            signOut: "退出",
          };

  return (
    <div className="header-icon-menus">
      <details className="header-menu">
        <summary className="header-icon-btn" aria-label="language">
          <Globe size={16} />
        </summary>
        <div className="header-menu-panel">
          {languageItems.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`header-menu-item ${lang === item.value ? "header-menu-item-active" : ""}`}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("lang", item.value);
                router.push(`${pathname}?${params.toString()}`);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </details>

      <details className="header-menu">
        <summary className="header-icon-btn" aria-label="account">
          <User size={16} />
        </summary>
        <div className="header-menu-panel header-menu-panel-wide">
          <Link href={`/profile?lang=${lang}`} className="header-menu-item">
            {accountLabels.profile}
          </Link>
          <Link href={`/login?lang=${lang}`} className="header-menu-item">
            {accountLabels.auth}
          </Link>
          <Link href={`/login?lang=${lang}`} className="header-menu-item">
            {accountLabels.register}
          </Link>
          <form action={signOut}>
            <button type="submit" className="header-menu-item w-full text-left">
              {accountLabels.signOut}
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}
