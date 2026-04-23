import Link from "next/link";
import { requireUser } from "@/features/trips/server";
import { NewTripForm } from "@/features/trips/new-trip-form";
import { resolveLang, texts } from "@/shared/i18n";
import { pickLangText } from "@/shared/localized-text";

export default async function NewTripPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; error?: string }>;
}) {
  const { lang: rawLang, error } = await searchParams;
  const lang = resolveLang(rawLang);
  const t = texts[lang];
  const l = (en: string, zhTW: string, zhCN: string) => pickLangText(lang, { en, zhTW, zhCN });
  const { supabase } = await requireUser();
  const { data: templates } = await supabase
    .from("scene_templates")
    .select("id,name_zh,icon,category")
    .order("category")
    .order("name_zh");

  const errorMessage =
    error === "invalid_date_range"
      ? l("Invalid date range. Please check start and end dates.", "日期範圍無效，請檢查開始與結束日期。", "日期范围无效，请检查开始和结束日期。")
      : error;

  return (
    <main className="packlog-page mx-auto w-full max-w-[980px] p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href={`/?lang=${lang}`} className="text-sm underline">
          {t.backList}
        </Link>
      </div>
      <h1 className="mb-4 text-3xl text-[#1c1c18]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>{t.createTrip}</h1>
      <NewTripForm templates={templates ?? []} lang={lang} error={errorMessage} />
    </main>
  );
}
