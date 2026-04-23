"use client";

import { ChevronDown, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  addCommunityItemToTrip,
  addCommunityItemToLocker,
  copyCommunityTemplateToTrip,
  type ExploreMutationResult,
} from "@/features/explore/actions";
import { texts, type Lang } from "@/shared/i18n";
import { getItemCategoryLabel } from "@/shared/item-categories";
import { defaultZhNameFallback, defaultZhNoteFallback, pickLangText, resolveLocalizedText } from "@/shared/localized-text";

type CommunityItem = {
  id: string;
  name: string;
  name_zh?: string | null;
  name_en?: string | null;
  category: string | null;
  status: string;
  note: string | null;
  note_zh?: string | null;
  note_en?: string | null;
  tags_zh?: string[] | null;
  tags_en?: string[] | null;
  image_url?: string | null;
  added_to_trip_count?: number | null;
  added_to_locker_count?: number | null;
  section?: string | null;
  price_ref?: {
    amount?: number | null;
    currency?: string | null;
    amount_text?: string | null;
    source_name?: string | null;
    source_url?: string | null;
    captured_at?: string | null;
    is_estimate?: boolean | null;
  } | null;
};

type CommunityTemplate = {
  id: string;
  slug: string;
  title: string;
  author_name: string;
  source_name?: string | null;
  source_logo_url?: string | null;
  description?: string | null;
  note?: string | null;
  trip_style?: string | null;
  source_language?: string | null;
  source_type?: string | null;
  source_published_at?: string | null;
  created_at?: string | null;
  region: string | null;
  country: string | null;
  scenes: string[] | null;
  days_min: number | null;
  days_max: number | null;
  copy_count: number | null;
  item_add_count?: number | null;
  items: CommunityItem[];
};

type TripOption = {
  id: string;
  title: string;
};

type SceneTemplateOption = {
  id: string;
  name_zh: string;
  name_en?: string | null;
  category?: string | null;
};

const LEGACY_SCENE_TO_ZH: Record<string, string> = {
  hiking: "徒步",
  camping: "露营",
  backpacking: "徒步",
  trail_race: "越野跑",
  trail_race_mandatory: "越野跑",
  diving: "潜水",
  camp_festival: "音乐节",
  music_festival: "音乐节",
  city_explore: "城市漫游",
};

const ITEM_STATUS_LABEL_MAP: Record<string, string> = {
  must: "推荐",
  opt: "再说",
  buy: "待购",
};

const ITEM_STATUS_LABEL_MAP_EN: Record<string, string> = {
  must: "Recommended",
  opt: "Optional",
  buy: "To buy",
};

function parseItemInsights(note: string | null) {
  const text = (note ?? "").trim();
  if (!text) return { sourceSection: "", priceRef: "", highlights: [] as string[] };
  const priceMatch = text.match(/(?:价格参考|價格參考|price(?: reference)?)\s*[:：]\s*([^\n]+)/i);
  const bulletMatches = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => /^[-•·\d]+[).、\s]+/.test(line))
    .map((line) => line.replace(/^[-•·\d]+[).、\s]+/, "").trim())
    .filter(Boolean);
  const sentenceMatches = text
    .split(/[。！？.!?]/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/(来源章节|來源章節|source section|价格参考|價格參考|price)/i.test(line));
  const highlights = (bulletMatches.length ? bulletMatches : sentenceMatches).slice(0, 3);
  return {
    sourceSection: "",
    priceRef: priceMatch?.[1]?.trim() || "",
    highlights,
  };
}

function inferPriceSource(priceRef: string) {
  const raw = String(priceRef ?? "").toLowerCase();
  const sources = [];
  if (raw.includes("amazon")) sources.push("Amazon");
  if (raw.includes("taobao") || raw.includes("天猫") || raw.includes("tmall")) sources.push("Taobao/Tmall");
  if (raw.includes("official") || raw.includes("官网")) sources.push("Official");
  return sources.join(" + ");
}

function formatPriceMini(item: CommunityItem) {
  const price = item.price_ref;
  if (!price) return "";
  if (price.amount_text?.trim()) return price.amount_text.trim();
  if (typeof price.amount === "number" && price.currency) return `${price.currency} ${price.amount}`;
  return "";
}

function inferItemKeywords(name: string, note: string | null, lang: Lang) {
  const l = (en: string, zhTW: string, zhCN: string) => pickLangText(lang, { en, zhTW, zhCN });
  const raw = `${name} ${note ?? ""}`.toLowerCase();
  const tags: string[] = [];
  const liter = raw.match(/(\d+(?:\.\d+)?)l\b/);
  if (liter) tags.push(l(`${liter[1]}L capacity`, `${liter[1]}L容量`, `${liter[1]}L容量`));
  const packCount = raw.match(/\(x(\d+)\)/);
  if (packCount) tags.push(l(`${packCount[1]}-pack`, `${packCount[1]}件装`, `${packCount[1]}件装`));
  if (raw.includes("waterproof")) tags.push(l("waterproof", "防水", "防水"));
  if (raw.includes("ultralight") || raw.includes("lightweight")) tags.push(l("lightweight", "轻量", "轻量"));
  if (raw.includes("merino") || raw.includes("wool")) tags.push(l("wool", "羊毛", "羊毛"));
  if (raw.includes("no-show")) tags.push(l("no-show", "隐形袜", "隐形袜"));
  if (raw.includes("quick dry") || raw.includes("dri") || raw.includes("performance")) tags.push(l("quick-dry", "速干", "速干"));
  if (raw.includes("running")) tags.push(l("running", "跑步", "跑步"));
  if (raw.includes("travel")) tags.push(l("travel-friendly", "旅行友好", "旅行友好"));
  return tags.slice(0, 4);
}

function getLocalizedItemName(item: CommunityItem, lang: Lang) {
  return resolveLocalizedText({
    lang,
    preferred: lang === "en" ? item.name_en : item.name_zh,
    secondary: item.name,
    enFallback: item.name_en,
    zhFallback: (raw) => defaultZhNameFallback(raw),
  });
}

function getLocalizedItemNote(item: CommunityItem, lang: Lang) {
  return resolveLocalizedText({
    lang,
    preferred: lang === "en" ? item.note_en : item.note_zh,
    secondary: item.note,
    enFallback: item.note_en,
    zhFallbackSource: item.name_zh?.trim() || item.name_en?.trim() || item.name || "",
    zhFallback: (raw, nameSource) => defaultZhNoteFallback(raw, nameSource || ""),
  });
}

function getLocalizedItemTags(item: CommunityItem, lang: Lang) {
  const preferred = lang === "en" ? item.tags_en : item.tags_zh;
  const fallback = lang === "en" ? item.tags_zh : item.tags_en;
  const list = (preferred && preferred.length ? preferred : fallback) ?? [];
  return list.filter(Boolean).slice(0, 6);
}

function normalizeRegion(region: string | null | undefined) {
  if (!region) return "asia";
  if (region === "EUROPE") return "europe";
  if (region === "CHINA") return "china";
  if (region === "GLOBAL") return "global";
  return "asia";
}

function sceneLabel(scene: SceneTemplateOption, lang: Lang) {
  if (lang === "en") return scene.name_en?.trim() || scene.name_zh;
  return scene.name_zh;
}

function normalizeSceneToZh(rawScene: string | null | undefined, sceneTemplates: SceneTemplateOption[]) {
  const raw = (rawScene ?? "").trim();
  if (!raw) return "";
  if (LEGACY_SCENE_TO_ZH[raw]) return LEGACY_SCENE_TO_ZH[raw];
  const lower = raw.toLowerCase();
  if (lower.includes("hiking") || lower.includes("backpacking") || lower.includes("trek")) return "徒步";
  if (lower.includes("camping") || lower.includes("camp")) return "露营";
  if (lower.includes("trail") || lower.includes("race") || lower.includes("running")) return "越野跑";
  if (lower.includes("diving") || lower.includes("snorkel")) return "潜水";
  if (lower.includes("festival")) return "音乐节";
  if (lower.includes("city") || lower.includes("road trip") || lower.includes("travel")) return "城市漫游";
  const byName = sceneTemplates.find(
    (scene) =>
      scene.name_zh === raw ||
      scene.name_en?.toLowerCase() === lower ||
      scene.name_zh.toLowerCase() === lower,
  );
  return byName?.name_zh ?? raw;
}

function templateSceneLabels(template: CommunityTemplate, sceneTemplates: SceneTemplateOption[], lang: Lang) {
  const normalized = (template.scenes ?? [])
    .map((item) => normalizeSceneToZh(item, sceneTemplates))
    .filter(Boolean);
  return normalized.map((nameZh) => {
    const ref = sceneTemplates.find((scene) => scene.name_zh === nameZh);
    return lang === "en" ? ref?.name_en?.trim() || nameZh : nameZh;
  });
}

function deriveTemplateKeyword(template: CommunityTemplate, sceneTemplates: SceneTemplateOption[], lang: Lang) {
  const country = (template.country ?? "").trim();
  if (country && !/^(global|全球)$/i.test(country)) return country;
  const region = (template.region ?? "").trim();
  if (region && !/^(global|全球)$/i.test(region)) return region;
  const labels = templateSceneLabels(template, sceneTemplates, lang);
  if (labels.length) return labels[0];
  const title = normalizeTemplateTitle(template.title);
  const candidate = title.split("·")[0]?.trim() ?? "";
  if (candidate && !/^社区清单$/i.test(candidate)) return candidate;
  return template.source_name?.trim() || "GLOBAL";
}

function matchesScene(template: CommunityTemplate, activeScene: string, sceneTemplates: SceneTemplateOption[]) {
  if (activeScene === "all") return true;
  const normalized = (template.scenes ?? []).map((item) => normalizeSceneToZh(item, sceneTemplates));
  return normalized.includes(activeScene);
}

function formatDays(template: CommunityTemplate) {
  if (!template.days_min && !template.days_max) return "";
  if (template.days_min === template.days_max) return `${template.days_min}日`;
  return `${template.days_min ?? ""}-${template.days_max ?? ""}日`;
}

function normalizeTemplateTitle(title: string | null | undefined) {
  const raw = (title ?? "").trim();
  if (!raw) return "";
  const parts = raw
    .split("·")
    .map((item) => item.trim())
    .filter(Boolean);
  if (parts.length <= 2) return parts.join(" · ");
  return `${parts[0]} · ${parts[1]}`;
}

function resolveSourceMeta(template: CommunityTemplate) {
  const platform = (template.source_name ?? "").trim();
  const authorRaw = (template.author_name ?? "").trim();
  if (!authorRaw) return { platform, author: "" };
  const platformLower = platform.toLowerCase();
  const authorLower = authorRaw.toLowerCase();
  const isCrossSourceConflict =
    (platformLower.includes("pack hacker") && authorLower.includes("rei")) ||
    (platformLower.includes("rei") && authorLower.includes("pack hacker"));
  if (isCrossSourceConflict) return { platform, author: "" };
  if (platform && platformLower === authorLower) return { platform, author: "" };
  return { platform, author: authorRaw };
}

function exploreFailureHint(lang: Lang, failed: Extract<ExploreMutationResult, { ok: false }>): string {
  const l = (en: string, zhTW: string, zhCN: string) => pickLangText(lang, { en, zhTW, zhCN });
  const { code } = failed;
  if (code === "empty_template") {
    return l("This template has no items.", "這份模板沒有項目。", "这份模板没有条目。");
  }
  if (code === "copy_failed") {
    return l("Copy failed. Try again.", "複製失敗，請重試。", "复制失败，请重试。");
  }
  if (code === "item_missing") {
    return l("Item not found.", "找不到該項目。", "找不到该条目。");
  }
  if (code === "trip_insert_failed") {
    return l("Could not add to trip.", "無法加入行程。", "无法加入行程。");
  }
  return l("Something went wrong.", "發生錯誤。", "出错了。");
}

export function CommunityExploreClient({
  templates,
  trips,
  sceneTemplates,
  canMutate,
  lang,
  initialPreview,
}: {
  templates: CommunityTemplate[];
  trips: TripOption[];
  sceneTemplates: SceneTemplateOption[];
  canMutate: boolean;
  lang: Lang;
  initialPreview?: string;
}) {
  const tx = texts[lang].exploreUi;
  const l = (en: string, zhTW: string, zhCN: string) => pickLangText(lang, { en, zhTW, zhCN });
  const sceneOptions: Array<{ key: string; label: string }> = [
    { key: "all", label: tx.all },
    ...(sceneTemplates ?? [])
      .filter((scene) => (scene.category ?? "activity") === "activity")
      .map((scene) => ({ key: scene.name_zh, label: sceneLabel(scene, lang) })),
  ];
  const regionOptions = [
    { key: "all", label: tx.all },
    { key: "asia", label: tx.regionAsia },
    { key: "europe", label: tx.regionEurope },
    { key: "china", label: tx.regionChina },
    { key: "global", label: tx.regionGlobal },
  ];
  const router = useRouter();
  const [exploreBusy, startExploreTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const [activeScene, setActiveScene] = useState("all");
  const [activeRegion, setActiveRegion] = useState("all");
  const [sortBy, setSortBy] = useState<"smart" | "copied" | "item_add" | "newest">("smart");
  const [previewId, setPreviewId] = useState(initialPreview ?? "");
  const [copySheetTemplateId, setCopySheetTemplateId] = useState("");
  const [copyButtonStateByTemplate, setCopyButtonStateByTemplate] = useState<Record<string, "idle" | "loading" | "done">>({});
  const [copyTripId, setCopyTripId] = useState("");
  const [copyBulkStatus, setCopyBulkStatus] = useState<"to_pack" | "to_buy" | "optional" | "packed">("to_pack");
  const [itemTripSheet, setItemTripSheet] = useState<{ itemId: string; templateId: string } | null>(null);
  const [itemLockerSheet, setItemLockerSheet] = useState<{ itemId: string; templateId: string } | null>(null);
  const [itemTripId, setItemTripId] = useState("");
  const [itemTripStatus, setItemTripStatus] = useState<"to_pack" | "to_buy" | "optional" | "packed">("to_pack");
  const [itemLockerStatus, setItemLockerStatus] = useState<"owned" | "wishlist" | "">("");
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [metricsByTemplate, setMetricsByTemplate] = useState<Record<string, { copy: number; itemAdd: number }>>(
    () =>
      Object.fromEntries(
        templates.map((template) => [
          template.id,
          {
            copy: template.copy_count ?? 0,
            itemAdd: template.item_add_count ?? 0,
          },
        ]),
      ),
  );
  const mutationBlockedText =
    pickLangText(lang, { en: "Create your personal trip first.", zhTW: "請先建立你的個人行程。", zhCN: "请先创建你的个人行程。" });
  const tripStatusOptions = [
    { value: "to_pack" as const, label: l("To pack", "待打包", "待打包") },
    { value: "to_buy" as const, label: l("To buy", "待购买", "待购买") },
    { value: "optional" as const, label: tx.statusOptional },
    { value: "packed" as const, label: l("Packed", "已打包", "已打包") },
  ];

  const filtered = useMemo(() => {
    const list = templates.filter((template) => {
      const regionOk = activeRegion === "all" || normalizeRegion(template.region) === activeRegion;
      const sceneOk = matchesScene(template, activeScene, sceneTemplates);
      return regionOk && sceneOk;
    });
    const score = (t: CommunityTemplate) => {
      const copy = t.copy_count ?? 0;
      const itemAdd = t.item_add_count ?? 0;
      const itemAddsFromRows = (t.items ?? []).reduce((acc, i) => acc + (i.added_to_trip_count ?? 0) + (i.added_to_locker_count ?? 0), 0);
      return copy * 3 + itemAdd * 2 + itemAddsFromRows;
    };
    if (sortBy === "copied") return list.sort((a, b) => (b.copy_count ?? 0) - (a.copy_count ?? 0));
    if (sortBy === "item_add")
      return list.sort(
        (a, b) =>
          ((b.item_add_count ?? 0) + (b.items ?? []).reduce((acc, i) => acc + (i.added_to_trip_count ?? 0) + (i.added_to_locker_count ?? 0), 0)) -
          ((a.item_add_count ?? 0) + (a.items ?? []).reduce((acc, i) => acc + (i.added_to_trip_count ?? 0) + (i.added_to_locker_count ?? 0), 0)),
      );
    if (sortBy === "newest")
      return list.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
    return list.sort((a, b) => score(b) - score(a));
  }, [templates, activeRegion, activeScene, sortBy, sceneTemplates]);
  const hasFilter = activeScene !== "all" || activeRegion !== "all";
  const filterHint =
    filtered.length === 0
      ? lang === "en"
        ? "No matching templates. Try different filters."
        : lang === "zh-TW"
          ? "未找到符合條件的清單，請調整篩選。"
          : "未找到符合条件的清单，请调整筛选。"
      : hasFilter
        ? lang === "en"
          ? `Filtered templates: ${filtered.length} / ${templates.length}`
          : lang === "zh-TW"
            ? `篩選結果：${filtered.length} / ${templates.length}`
            : `筛选结果：${filtered.length} / ${templates.length}`
        : lang === "en"
          ? `Showing all templates: ${templates.length}`
          : lang === "zh-TW"
            ? `顯示全部 ${templates.length} 份清單`
            : `显示全部 ${templates.length} 份清单`;

  const previewTemplate = templates.find((item) => item.id === previewId);
  const copyTemplate = templates.find((item) => item.id === copySheetTemplateId);
  const getCopyButtonState = (templateId: string) => copyButtonStateByTemplate[templateId] ?? "idle";
  const getCopyButtonLabel = (templateId: string) => {
    const state = getCopyButtonState(templateId);
    if (state === "loading") return "复制中…";
    if (state === "done") return "✓ 已复制";
    return "复制到我的";
  };
  const currentTripItem = previewTemplate?.items.find((item) => item.id === itemTripSheet?.itemId);
  const currentLockerItem = previewTemplate?.items.find((item) => item.id === itemLockerSheet?.itemId);
  const previewGroups = (() => {
    if (!previewTemplate) return [];
    const map = new Map<string, CommunityItem[]>();
    for (const item of previewTemplate.items) {
      const key = item.category ?? "other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(item);
    }
    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  })();

  const groupRecommendations = (() => {
    const result: Record<string, string[]> = {};
    for (const group of previewGroups) {
      const lines: string[] = [];
      for (const item of group.items) {
        const text = getLocalizedItemNote(item, lang);
        if (!text) continue;
        const first = text.split(/[.!?。！？]/)[0]?.trim();
        if (!first) continue;
        if (/(来源章节|來源章節|source section|价格参考|價格參考|price)/i.test(first)) continue;
        const localizedFirst = first;
        if (!lines.includes(localizedFirst)) lines.push(localizedFirst);
        if (lines.length >= 3) break;
      }
      result[group.category] = lines;
    }
    return result;
  })();

  return (
    <>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {sceneOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setActiveScene(option.key)}
            className={`brand-chip shrink-0 ${activeScene === option.key ? "brand-chip-active" : ""}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {regionOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setActiveRegion(option.key)}
            className={`brand-chip shrink-0 ${activeRegion === option.key ? "brand-chip-active" : ""}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[12px] text-[#7f7a71]">{tx.sort}</span>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as "smart" | "copied" | "item_add" | "newest")}
          className="ui-native-select h-8 min-w-[146px] rounded-md border border-[#d7cfc2] bg-[#fff] px-2.5 text-[12px] text-[#4a4840]"
        >
          <option value="smart">{tx.sortSmart}</option>
          <option value="copied">{tx.sortCopied}</option>
          <option value="item_add">{tx.sortItemAdd}</option>
          <option value="newest">{tx.sortNewest}</option>
        </select>
      </div>
      <p className={`ui-filter-hint mb-2 ${filtered.length === 0 ? "ui-filter-hint-empty" : ""}`}>{filterHint}</p>

      <ul className="divide-y divide-[#e2dbcf]">
        {filtered.map((template) => (
          <li key={template.id} className="py-3">
            <div className="rounded-2xl border border-[#ddd5c8] bg-[#fff] p-3">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewId(template.id)}
                  className="flex h-[116px] w-[88px] shrink-0 flex-col items-center justify-between rounded-xl bg-[#14361f] p-2 text-center text-[#d6d9cc]"
                >
                  <p className="text-[10px] opacity-0">.</p>
                  <p className="line-clamp-2 w-full break-words text-[16px] font-semibold leading-[1.12] text-[#f7f8f2]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>
                    {deriveTemplateKeyword(template, sceneTemplates, lang)}
                  </p>
                  <p className="text-[10px] uppercase">{template.region ?? "ASIA"}</p>
                </button>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-[#868177]">
                    {(() => {
                      const sourceMeta = resolveSourceMeta(template);
                      return (
                        <>
                    {template.source_logo_url ? (
                      <Image src={template.source_logo_url} alt={sourceMeta.platform || template.author_name} width={14} height={14} className="size-3.5 rounded-sm" />
                    ) : null}
                          {sourceMeta.platform ? <span>{sourceMeta.platform}</span> : null}
                          {sourceMeta.author ? <span>{`@${sourceMeta.author}`}</span> : null}
                        </>
                      );
                    })()}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewId(template.id)}
                    className="line-clamp-2 min-h-[42px] text-left text-[16px] leading-[1.3] text-[#1f1c17] md:text-[18px]"
                  >
                    {normalizeTemplateTitle(template.title)}
                  </button>
                  <p className="mt-1 text-[13px] text-[#706c63]">
                    {templateSceneLabels(template, sceneTemplates, lang).join(" · ")}{" "}
                    · {formatDays(template)}
                  </p>
                  {template.source_published_at ? (
                    <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-[#8a857c]">
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3a5c33", display: "inline-block" }} />
                      {tx.publishedAt} {template.source_published_at}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => setPreviewId(template.id)} className="explore-action-chip">
                      {tx.preview}
                    </button>
                    <div className="flex items-center gap-1.5">
                      {(() => {
                        const copyBtnState = getCopyButtonState(template.id);
                        return (
                      <button
                        type="button"
                        disabled={copyBtnState !== "idle"}
                        onClick={() => {
                          if (!canMutate) {
                            showToast(mutationBlockedText);
                            return;
                          }
                          setCopyButtonStateByTemplate((prev) => ({
                            ...prev,
                            [template.id]: "loading",
                          }));
                          setCopySheetTemplateId(template.id);
                          setCopyTripId("");
                          setCopyBulkStatus("to_pack");
                        }}
                        className="explore-action-chip explore-action-chip-active disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        {getCopyButtonLabel(template.id)}
                      </button>
                        );
                      })()}
                      {(metricsByTemplate[template.id]?.copy ?? template.copy_count ?? 0) > 0 ? (
                        <span
                          className="inline-flex items-center gap-0.5 rounded-full border border-[#dcd4c7] bg-[#f5f1e8] px-1.5 py-0.5 text-[10px] tabular-nums text-[#615c54]"
                          aria-label={`${(metricsByTemplate[template.id]?.copy ?? template.copy_count ?? 0) + (metricsByTemplate[template.id]?.itemAdd ?? template.item_add_count ?? 0)} ${tx.heat}`}
                        >
                          <Users className="size-3 shrink-0 opacity-65" aria-hidden />
                          {(metricsByTemplate[template.id]?.copy ?? template.copy_count ?? 0) + (metricsByTemplate[template.id]?.itemAdd ?? template.item_add_count ?? 0)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {previewTemplate ? (
        <div className="fixed inset-0 z-50 bg-black/34">
          <button type="button" className="absolute inset-0 h-full w-full" aria-label={tx.close} onClick={() => setPreviewId("")} />
          <div className="absolute inset-x-0 bottom-0 h-[83vh] w-full rounded-t-3xl border border-[#d8d0c4] bg-[#fefcf8] p-4 shadow-[0_-16px_42px_rgba(0,0,0,0.24)]">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[22px] leading-none text-[#1f1c17]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>
                {tx.fullList}
              </p>
              <button type="button" onClick={() => setPreviewId("")} className="rounded-full border px-3 py-1 text-xs">
                {tx.close}
              </button>
            </div>
            <div className="h-[calc(83vh-78px)] overflow-auto pr-1">
              {previewTemplate.description || previewTemplate.note ? (
                <section className="mb-3 rounded-xl border border-[#e1dacd] bg-white p-3">
                  <p className="text-[12px] font-medium tracking-[0.04em] text-[#4e493f]">{tx.reasonSection}</p>
                  {previewTemplate.description ? <p className="mt-1 text-[12px] leading-[1.45] text-[#4f4a40]">{previewTemplate.description}</p> : null}
                  {previewTemplate.note ? <p className="mt-1 text-[12px] leading-[1.45] text-[#4f4a40]">{previewTemplate.note}</p> : null}
                </section>
              ) : null}
              <div className="space-y-4">
              {previewGroups.map((group, index) => (
                <section key={group.category} className="space-y-2">
                  <div className={`flex items-center gap-2 ${index ? "pt-1" : ""}`}>
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#eaf2e7] px-2 text-[11px] font-medium text-[#2f4f2a]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[12px] font-medium tracking-[0.08em] text-[#5f5b53]">{getItemCategoryLabel(group.category, lang).toUpperCase()}</p>
                  </div>
                  {groupRecommendations[group.category]?.length ? (
                    <div className="rounded-lg border border-[#e8e1d5] bg-[#fffdf8] p-2.5">
                      <p className="text-[11px] font-medium tracking-[0.06em] text-[#625d54]">{tx.groupReco}</p>
                      <ul className="mt-1 space-y-1">
                        {groupRecommendations[group.category].map((line) => (
                          <li key={line} className="text-[12px] leading-[1.45] text-[#5a554b]">
                            · {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <ul className="space-y-2">
                    {group.items.map((item) => {
                      const expanded = expandedItemId === item.id;
                      return (
                        <li key={item.id} className="rounded-xl border border-[#e1dacd] bg-white p-3">
                          <div className="flex items-start justify-between gap-3">
                            <button
                              type="button"
                              className="min-w-0 flex-1 text-left"
                              onClick={() => setExpandedItemId((prev) => (prev === item.id ? null : item.id))}
                            >
                              <p className="truncate text-[14px] leading-[1.3] text-[#2e2b26]">{getLocalizedItemName(item, lang)}</p>
                              <p className="text-[12px] leading-[1.4] text-[#807b72]">
                                {l(ITEM_STATUS_LABEL_MAP_EN[item.status] ?? item.status, ITEM_STATUS_LABEL_MAP[item.status] ?? item.status, ITEM_STATUS_LABEL_MAP[item.status] ?? item.status)}
                              </p>
                              {(() => {
                                const insights = parseItemInsights(getLocalizedItemNote(item, lang));
                                const miniPrice = formatPriceMini(item);
                                if (!insights.priceRef && !miniPrice) return null;
                                return (
                                  <div className="mt-1 flex flex-wrap gap-1.5">
                                    {miniPrice || insights.priceRef ? (
                                      <span className="max-w-full break-words rounded-full border border-[#ddd4c7] bg-[#f7f2e9] px-2 py-0.5 text-[11px] leading-[1.35] text-[#5f584f]">
                                        {tx.priceRef}：{miniPrice || insights.priceRef}
                                      </span>
                                    ) : null}
                                    {miniPrice || insights.priceRef ? (
                                      <span className="max-w-full break-words rounded-full border border-[#ddd4c7] bg-white px-2 py-0.5 text-[10px] leading-[1.35] text-[#7a756c]">
                                        {tx.priceMeta}：{item.price_ref?.captured_at?.slice(0, 10) || "2026-04-22"} · {tx.priceMetaSource} {item.price_ref?.source_name || inferPriceSource(insights.priceRef) || tx.priceMetaDisclaimer}
                                      </span>
                                    ) : null}
                                  </div>
                                );
                              })()}
                            </button>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="h-9 w-[92px] rounded-full border border-[#d9d2c6] bg-white px-2 text-[12px] font-medium text-[#4c473f]"
                                onClick={() => {
                                  if (!canMutate) {
                                    showToast(mutationBlockedText);
                                    return;
                                  }
                                  setItemTripSheet({ itemId: item.id, templateId: previewTemplate.id });
                                  setItemTripId("");
                                  setItemTripStatus("to_pack");
                                }}
                              >
                                {tx.addTripShort}
                              </button>
                              <button
                                type="button"
                                className="h-9 w-[112px] rounded-full bg-[#214d20] px-2 text-[12px] font-medium text-white"
                                onClick={() => {
                                  if (!canMutate) {
                                    showToast(mutationBlockedText);
                                    return;
                                  }
                                  setItemLockerSheet({ itemId: item.id, templateId: previewTemplate.id });
                                  setItemLockerStatus("");
                                }}
                              >
                                {tx.addLockerShort}
                              </button>
                            </div>
                          </div>
                          <button type="button" className="mt-2 inline-flex items-center gap-1 text-[12px] text-[#6f6a61]" onClick={() => setExpandedItemId((prev) => (prev === item.id ? null : item.id))}>
                            <ChevronDown className={`size-3.5 transition ${expanded ? "rotate-180" : ""}`} />
                          </button>
                          {expanded ? (
                            <div className="mt-2 rounded-lg bg-[#f7f4ee] p-2.5">
                              {item.image_url ? (
                                <button
                                  type="button"
                                  className="mb-2 block overflow-hidden rounded-lg"
                                  onClick={() => setPreviewImageUrl(item.image_url ?? null)}
                                >
                                  <Image src={item.image_url} alt={item.name} width={640} height={224} className="h-28 w-full object-cover" />
                                </button>
                              ) : null}
                              {getLocalizedItemNote(item, lang) ? (
                                <div className="space-y-1.5 text-[12px] leading-[1.55] text-[#4f4a40]">
                                  {(() => {
                                    const note = getLocalizedItemNote(item, lang);
                                    const insights = parseItemInsights(note);
                                    return (
                                      <>
                                        <p>{l(`${tx.why}: ${note}`, `${tx.why}：${note}`, `${tx.why}：${note}`)}</p>
                                        {formatPriceMini(item) || insights.priceRef ? <p>{tx.priceRef}：{formatPriceMini(item) || insights.priceRef}</p> : null}
                                        {formatPriceMini(item) || insights.priceRef ? (
                                          <p className="text-[11px] text-[#6d685f]">
                                            {tx.priceMeta}：{item.price_ref?.captured_at?.slice(0, 10) || "2026-04-22"} · {tx.priceMetaSource} {item.price_ref?.source_name || inferPriceSource(insights.priceRef) || tx.priceMetaDisclaimer}
                                          </p>
                                        ) : null}
                                      </>
                                    );
                                  })()}
                                </div>
                              ) : (
                                <p className="text-[12px] text-[#7c766d]">{tx.noNotes}</p>
                              )}
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {(getLocalizedItemTags(item, lang).length
                                  ? getLocalizedItemTags(item, lang)
                                  : inferItemKeywords(getLocalizedItemName(item, lang), getLocalizedItemNote(item, lang), lang)
                                ).map((tag) => (
                                  <span key={tag} className="rounded-full border border-[#ddd4c7] bg-white px-2 py-0.5 text-[11px] text-[#5f584f]">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {copyTemplate ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/35 p-3 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="explore-copy-dialog-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setCopySheetTemplateId("");
          }}
        >
          <div className="w-full max-w-[min(92vw,380px)] rounded-2xl border border-[#d8d0c4] bg-[#fefcf8] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.12)]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p id="explore-copy-dialog-title" className="text-[17px] leading-tight text-[#1f1c17]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>
                  {tx.copyToTrip}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-[#7a766d]">{normalizeTemplateTitle(copyTemplate.title)}</p>
              </div>
              <button type="button" onClick={() => setCopySheetTemplateId("")} className="explore-action-chip shrink-0">
                {tx.close}
              </button>
            </div>
            <p className="mb-1.5 text-[11px] font-medium text-[#4a4840]">{tx.trip}</p>
            <div className="max-h-[min(40vh,220px)] space-y-1.5 overflow-auto rounded-xl border border-[#e8e0d5] bg-[#fffcf6] p-2">
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => setCopyTripId(trip.id)}
                  className={`w-full rounded-lg border px-2.5 py-2 text-left text-[12px] transition ${copyTripId === trip.id ? "border-[#3a5c33] bg-[#e8f2e4] text-[#243d1f]" : "border-transparent bg-transparent text-[#4a4840] hover:bg-[#f3eee5]"} ${trip.id !== trips[trips.length - 1]?.id ? "border-b border-[#ece5da]" : ""}`}
                >
                  {trip.title}
                </button>
              ))}
              {!trips.length ? <p className="px-1 py-2 text-[12px] text-[#8c8880]">{tx.noTrip}</p> : null}
            </div>
            <p className="mb-1.5 mt-3 text-[11px] font-medium text-[#4a4840]">{tx.statusBulk}</p>
            <div className="flex flex-wrap gap-1.5">
              {tripStatusOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCopyBulkStatus(item.value)}
                  className={`explore-action-chip text-[11px] ${copyBulkStatus === item.value ? "explore-action-chip-active" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <form
              className="mt-4 flex items-center justify-end gap-2 border-t border-[#ece5da] pt-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                startExploreTransition(async () => {
                  const result = await copyCommunityTemplateToTrip(fd);
                  if (result.ok) {
                    setCopySheetTemplateId("");
                    setCopyButtonStateByTemplate((prev) => ({
                      ...prev,
                      [copyTemplate.id]: "done",
                    }));
                    window.setTimeout(() => {
                      setCopyButtonStateByTemplate((prev) => ({
                        ...prev,
                        [copyTemplate.id]: "idle",
                      }));
                    }, 2000);
                    setMetricsByTemplate((prev) => ({
                      ...prev,
                      [copyTemplate.id]: {
                        copy: (prev[copyTemplate.id]?.copy ?? copyTemplate.copy_count ?? 0) + 1,
                        itemAdd: prev[copyTemplate.id]?.itemAdd ?? copyTemplate.item_add_count ?? 0,
                      },
                    }));
                    showToast(tx.toastCopiedToTrip);
                    router.refresh();
                  } else {
                    setCopyButtonStateByTemplate((prev) => ({
                      ...prev,
                      [copyTemplate.id]: "idle",
                    }));
                    showToast(exploreFailureHint(lang, result));
                  }
                });
              }}
            >
              <input type="hidden" name="template_id" value={copyTemplate.id} />
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="trip_id" value={copyTripId} />
              <input type="hidden" name="bulk_status" value={copyBulkStatus} />
              <button type="button" onClick={() => setCopySheetTemplateId("")} className="explore-action-chip">{tx.cancel}</button>
              <button type="submit" disabled={!copyTripId || exploreBusy} className="explore-action-chip explore-action-chip-active disabled:cursor-not-allowed disabled:opacity-45">
                {exploreBusy ? tx.processing : tx.confirmCopy}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {itemTripSheet && currentTripItem ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/35 p-3 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="explore-item-trip-dialog-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setItemTripSheet(null);
          }}
        >
          <div className="w-full max-w-[min(92vw,380px)] rounded-2xl border border-[#d8d0c4] bg-[#fefcf8] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.12)]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p id="explore-item-trip-dialog-title" className="text-[17px] leading-tight text-[#1f1c17]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>
                  {tx.addTrip}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-[#7a766d]">{currentTripItem.name}</p>
              </div>
              <button type="button" onClick={() => setItemTripSheet(null)} className="explore-action-chip shrink-0">
                {tx.close}
              </button>
            </div>
            <p className="mb-1.5 text-[11px] font-medium text-[#4a4840]">{tx.trip}</p>
            <div className="max-h-[min(40vh,220px)] space-y-1.5 overflow-auto rounded-xl border border-[#e8e0d5] bg-[#fffcf6] p-2">
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => setItemTripId(trip.id)}
                  className={`w-full rounded-lg border px-2.5 py-2 text-left text-[12px] transition ${itemTripId === trip.id ? "border-[#3a5c33] bg-[#e8f2e4] text-[#243d1f]" : "border-transparent bg-transparent text-[#4a4840] hover:bg-[#f3eee5]"} ${trip.id !== trips[trips.length - 1]?.id ? "border-b border-[#ece5da]" : ""}`}
                >
                  {trip.title}
                </button>
              ))}
              {!trips.length ? <p className="px-1 py-2 text-[12px] text-[#8c8880]">{tx.noTrip}</p> : null}
            </div>
            <p className="mb-1.5 mt-3 text-[11px] font-medium text-[#4a4840]">{tx.status}</p>
            <div className="flex flex-wrap gap-1.5">
              {tripStatusOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setItemTripStatus(item.value)}
                  className={`explore-action-chip text-[11px] ${itemTripStatus === item.value ? "explore-action-chip-active" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <form
              className="mt-4 flex items-center justify-end gap-2 border-t border-[#ece5da] pt-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                startExploreTransition(async () => {
                  const result = await addCommunityItemToTrip(fd);
                  if (result.ok) {
                    setItemTripSheet(null);
                    setMetricsByTemplate((prev) => {
                      const templateId = itemTripSheet.templateId;
                      const template = templates.find((t) => t.id === templateId);
                      return {
                        ...prev,
                        [templateId]: {
                          copy: prev[templateId]?.copy ?? template?.copy_count ?? 0,
                          itemAdd: (prev[templateId]?.itemAdd ?? template?.item_add_count ?? 0) + 1,
                        },
                      };
                    });
                    showToast(tx.toastAddedToTrip);
                    router.refresh();
                  } else {
                    showToast(exploreFailureHint(lang, result));
                  }
                });
              }}
            >
              <input type="hidden" name="item_id" value={currentTripItem.id} />
              <input type="hidden" name="trip_id" value={itemTripId} />
              <input type="hidden" name="trip_status" value={itemTripStatus} />
              <input type="hidden" name="lang" value={lang} />
              <button type="button" onClick={() => setItemTripSheet(null)} className="explore-action-chip">{tx.cancel}</button>
              <button type="submit" disabled={!itemTripId || exploreBusy} className="explore-action-chip explore-action-chip-active disabled:cursor-not-allowed disabled:opacity-45">
                {exploreBusy ? tx.processing : tx.confirmAdd}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {itemLockerSheet && currentLockerItem ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/35 p-3 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="explore-locker-dialog-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setItemLockerSheet(null);
          }}
        >
          <div className="w-full max-w-[min(92vw,380px)] rounded-2xl border border-[#d8d0c4] bg-[#fefcf8] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.12)]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p id="explore-locker-dialog-title" className="text-[17px] leading-tight text-[#1f1c17]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>
                  {tx.addLocker}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-[#7a766d]">{currentLockerItem.name}</p>
              </div>
              <button type="button" onClick={() => setItemLockerSheet(null)} className="explore-action-chip shrink-0">
                {tx.close}
              </button>
            </div>
            <p className="mb-2 text-[11px] text-[#7a766d]">{tx.optionalStatus}</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: "owned", label: tx.owned },
                { value: "wishlist", label: tx.wishlist },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setItemLockerStatus(item.value as "owned" | "wishlist")}
                  className={`explore-action-chip text-[11px] ${itemLockerStatus === item.value ? "explore-action-chip-active" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <form
              className="mt-4 flex items-center justify-end gap-2 border-t border-[#ece5da] pt-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                startExploreTransition(async () => {
                  const result = await addCommunityItemToLocker(fd);
                  if (result.ok) {
                    setItemLockerSheet(null);
                    setMetricsByTemplate((prev) => {
                      const templateId = itemLockerSheet.templateId;
                      const template = templates.find((t) => t.id === templateId);
                      return {
                        ...prev,
                        [templateId]: {
                          copy: prev[templateId]?.copy ?? template?.copy_count ?? 0,
                          itemAdd: (prev[templateId]?.itemAdd ?? template?.item_add_count ?? 0) + 1,
                        },
                      };
                    });
                    showToast(tx.toastSavedToLocker);
                    router.refresh();
                  } else {
                    showToast(exploreFailureHint(lang, result));
                  }
                });
              }}
            >
              <input type="hidden" name="item_id" value={currentLockerItem.id} />
              <input type="hidden" name="template_id" value={itemLockerSheet.templateId} />
              <input type="hidden" name="locker_status" value={itemLockerStatus} />
              <input type="hidden" name="lang" value={lang} />
              <button type="button" onClick={() => setItemLockerSheet(null)} className="explore-action-chip">{tx.cancel}</button>
              <button type="submit" disabled={exploreBusy} className="explore-action-chip explore-action-chip-active disabled:cursor-not-allowed disabled:opacity-45">
                {exploreBusy ? tx.processing : tx.confirmAdd}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[90] max-w-[min(92vw,360px)] -translate-x-1/2 rounded-full border border-[#d8d0c4] bg-[#fefcf8] px-4 py-2 text-center text-[12px] text-[#3a3329] shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
          {toast}
        </div>
      ) : null}
      {previewImageUrl ? (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewImageUrl(null)}
        >
          <Image src={previewImageUrl} alt={tx.imageAlt} width={1400} height={1000} className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain" />
        </div>
      ) : null}
    </>
  );
}
