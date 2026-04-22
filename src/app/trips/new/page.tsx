import Link from "next/link";
import { requireUser } from "@/features/trips/server";
import { NewTripForm } from "@/features/trips/new-trip-form";
import { HeaderIconMenus } from "@/components/header-icon-menus";
import { resolveLang, texts } from "@/shared/i18n";

export default async function NewTripPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; error?: string }>;
}) {
  const { lang: rawLang, error } = await searchParams;
  const lang = resolveLang(rawLang);
  const t = texts[lang];
  const { supabase } = await requireUser();
  const { data: templates } = await supabase
    .from("scene_templates")
    .select("id,name_zh,icon,category")
    .order("category")
    .order("name_zh");

  const errorMessage =
    error === "invalid_date_range"
      ? (lang === "en" ? "Invalid date range. Please check start and end dates." : lang === "zh-TW" ? "日期範圍無效，請檢查開始與結束日期。" : "日期范围无效，请检查开始和结束日期。")
      : error;

  return (
    <main className="packlog-page mx-auto w-full max-w-[980px] p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href={`/?lang=${lang}`} className="text-sm underline">
          {t.backList}
        </Link>
        <HeaderIconMenus lang={lang} />
      </div>
      <h1 className="mb-4 text-3xl text-[#1c1c18]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>{t.createTrip}</h1>
      <NewTripForm templates={templates ?? []} lang={lang} error={errorMessage} />
    </main>
  );
}
