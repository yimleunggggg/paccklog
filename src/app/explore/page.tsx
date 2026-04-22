import Link from "next/link";
import { CommunityExploreClient } from "@/components/community-explore-client";
import { requireUser } from "@/features/trips/server";
import { resolveLang, texts, type Lang } from "@/shared/i18n";

function hasCjk(text: string | null | undefined) {
  return /[\u4e00-\u9fff]/.test(text ?? "");
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; preview?: string }>;
}) {
  const { lang: rawLang, preview } = await searchParams;
  const lang = resolveLang(rawLang);
  const { supabase } = await requireUser();
  const [{ data: templates }, { data: tripOptions }] = await Promise.all([
    supabase
      .from("community_templates")
      .select(
        "id,slug,title,author_name,source_name,source_logo_url,region,country,scenes,days_min,days_max,copy_count,item_add_count,description,note,trip_style,source_language,source_type,source_published_at,created_at,community_template_items(id,name,name_zh,name_en,section,category,status,note,note_zh,note_en,tags_zh,tags_en,image_url,added_to_trip_count,added_to_locker_count,sort_order)",
      )
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("trips").select("id,title").order("created_at", { ascending: false }).limit(30),
  ]);
  const autoZh = lang === "en" && (templates ?? []).some((template) => {
    if (hasCjk(template.title) || hasCjk(template.description) || hasCjk(template.note)) return true;
    const rows = template.community_template_items ?? [];
    return rows.some((row) => hasCjk(row.name_zh) || hasCjk(row.note_zh) || hasCjk(row.name) || hasCjk(row.note));
  });
  const uiLang: Lang = autoZh ? "zh-CN" : lang;
  const t = texts[uiLang];

  return (
    <main className="packlog-page mx-auto w-full max-w-[660px] p-4 md:p-6">
      <div className="mb-3 flex items-center justify-between">
        <Link href={`/?lang=${uiLang}`} className="text-sm underline">
          {t.backList}
        </Link>
        <p className="text-sm text-[#78736a]">{t.explore}</p>
      </div>
      <h1 className="text-[36px] leading-[1.02] text-[#1f1c17]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>
        {uiLang === "en" ? "Checklist Community" : uiLang === "zh-TW" ? "清單廣場" : "清单广场"}
      </h1>
      <p className="mb-4 mt-1 text-xs tracking-[0.08em] text-[#8d887d]">
        {uiLang === "en" ? "1280 CONTRIBUTIONS · UPDATED DAILY" : uiLang === "zh-TW" ? "1280 份投稿 · 每日更新" : "1280 份投稿 · 每日更新"}
      </p>
      <CommunityExploreClient
        templates={(templates ?? []).map((template) => ({
          ...template,
          items: (template.community_template_items ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
        }))}
        trips={tripOptions ?? []}
        lang={uiLang}
        initialPreview={preview}
      />
    </main>
  );
}
