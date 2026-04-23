import Link from "next/link";
import { CommunityExploreClient } from "@/components/community-explore-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveLang, texts, type Lang } from "@/shared/i18n";
import { hasCjkText } from "@/shared/localized-text";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; preview?: string }>;
}) {
  const { lang: rawLang, preview } = await searchParams;
  const lang = resolveLang(rawLang);
  const supabase = await createSupabaseServerClient();
  const [{ data: userData }, { data: templates }, { data: sceneTemplates }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("community_templates")
      .select(
        "id,slug,title,author_name,source_name,source_logo_url,region,country,scenes,days_min,days_max,copy_count,item_add_count,description,note,trip_style,source_language,source_type,source_published_at,created_at,community_template_items(id,name,name_zh,name_en,section,category,status,note,note_zh,note_en,tags_zh,tags_en,image_url,added_to_trip_count,added_to_locker_count,sort_order)",
      )
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("scene_templates").select("id,name_zh,name_en,category").order("is_system", { ascending: false }).order("name_zh"),
  ]);
  const tripOptions = userData?.user
    ? (await supabase.from("trips").select("id,title").order("created_at", { ascending: false }).limit(30)).data
    : [];
  const itemIds = (templates ?? []).flatMap((template) => (template.community_template_items ?? []).map((row) => row.id));
  const { data: priceRows } = itemIds.length
    ? await supabase
        .from("community_item_price_refs")
        .select("item_id,amount,currency,amount_text,source_name,source_url,captured_at,is_estimate")
        .in("item_id", itemIds)
        .order("captured_at", { ascending: false })
    : { data: [] };
  const latestPriceByItemId = new Map<string, NonNullable<typeof priceRows>[number]>();
  for (const row of priceRows ?? []) {
    if (!latestPriceByItemId.has(row.item_id)) latestPriceByItemId.set(row.item_id, row);
  }
  const shouldAutoDetectLang = !rawLang;
  const autoZh = shouldAutoDetectLang && lang === "en" && (templates ?? []).some((template) => {
    if (hasCjkText(template.title) || hasCjkText(template.description) || hasCjkText(template.note)) return true;
    const rows = template.community_template_items ?? [];
    return rows.some((row) => hasCjkText(row.name_zh) || hasCjkText(row.note_zh) || hasCjkText(row.name) || hasCjkText(row.note));
  });
  const uiLang: Lang = autoZh ? "zh-CN" : lang;
  const t = texts[uiLang];
  const contributionCount = templates?.length ?? 0;

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
        {uiLang === "en"
          ? `${contributionCount} CONTRIBUTIONS · UPDATED DAILY`
          : uiLang === "zh-TW"
            ? `${contributionCount} 份投稿 · 每日更新`
            : `${contributionCount} 份投稿 · 每日更新`}
      </p>
      <CommunityExploreClient
        templates={(templates ?? []).map((template) => ({
          ...template,
          items: (template.community_template_items ?? [])
            .map((item) => {
              const price = latestPriceByItemId.get(item.id);
              return {
                ...item,
                price_ref: price
                  ? {
                      amount: price.amount,
                      currency: price.currency,
                      amount_text: price.amount_text,
                      source_name: price.source_name,
                      source_url: price.source_url,
                      captured_at: price.captured_at,
                      is_estimate: price.is_estimate,
                    }
                  : null,
              };
            })
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
        }))}
        trips={tripOptions ?? []}
        sceneTemplates={sceneTemplates ?? []}
        canMutate={Boolean(userData?.user)}
        lang={uiLang}
        initialPreview={preview}
      />
    </main>
  );
}
