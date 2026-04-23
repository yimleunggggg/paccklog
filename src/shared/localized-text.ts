import type { Lang } from "@/shared/i18n";

export function hasCjkText(text: string | null | undefined) {
  return /[\u4e00-\u9fff]/.test(text ?? "");
}

export function defaultZhNameFallback(raw: string) {
  const text = (raw ?? "").trim();
  if (!text) return "";
  const pairs: Array<[RegExp, string]> = [
    [/\bbackpack\b/gi, "背包"],
    [/\bsling\b/gi, "斜挎包"],
    [/\bpack\b/gi, "包"],
    [/\btent\b/gi, "帐篷"],
    [/\bsleeping bag\b/gi, "睡袋"],
    [/\bsleeping pad\b/gi, "睡垫"],
    [/\bstove\b/gi, "炉具"],
    [/\bfuel\b/gi, "燃料"],
    [/\bwater bottle\b/gi, "水壶"],
    [/\bfilter\b/gi, "净水器"],
    [/\bjacket\b/gi, "外套"],
    [/\bpants\b/gi, "裤子"],
    [/\bshirt\b/gi, "上衣"],
    [/\bsocks?\b/gi, "袜子"],
    [/\bshoes?\b/gi, "鞋"],
    [/\bhat\b/gi, "帽子"],
    [/\bgloves?\b/gi, "手套"],
    [/\bfirst-aid kit\b/gi, "急救包"],
    [/\bheadlamp\b/gi, "头灯"],
  ];
  let out = text;
  for (const [re, zh] of pairs) out = out.replace(re, zh);
  return out;
}

export function defaultZhNoteFallback(note: string, itemName: string) {
  const raw = (note ?? "").trim();
  if (!raw) return "";
  const low = raw.toLowerCase();
  const tags: string[] = [];
  if (/(lightweight|ultralight|packable)/i.test(low)) tags.push("轻量易收纳");
  if (/(durable|sturdy|tough)/i.test(low)) tags.push("耐用");
  if (/(waterproof|water-resistant)/i.test(low)) tags.push("防水");
  if (/(quick-dry|quick drying|dry)/i.test(low)) tags.push("速干");
  if (/(warm|insulat|cold weather)/i.test(low)) tags.push("保暖");
  if (/(organize|organization|pocket)/i.test(low)) tags.push("收纳方便");
  if (/(comfort|comfortable|cushion)/i.test(low)) tags.push("舒适");
  if (/(travel|trip|daily carry)/i.test(low)) tags.push("旅行场景适配");
  const head = defaultZhNameFallback(itemName) || "该装备";
  if (!tags.length) return `${head}：该条目原文为英文，建议按你的行程场景与天气做二次筛选。`;
  return `${head}：推荐理由（中文摘要）- ${Array.from(new Set(tags)).slice(0, 4).join("、")}。`;
}

type ResolveLocalizedTextParams = {
  lang: Lang;
  preferred?: string | null;
  secondary?: string | null;
  source?: string | null;
  enFallback?: string | null;
  zhFallbackSource?: string | null;
  zhFallback?: (raw: string, source?: string) => string;
};

export function resolveLocalizedText(params: ResolveLocalizedTextParams) {
  const {
    lang,
    preferred,
    secondary,
    source,
    enFallback,
    zhFallbackSource,
    zhFallback,
  } = params;
  const p = preferred?.trim() || "";
  const s = secondary?.trim() || "";
  const src = source?.trim() || "";
  const en = enFallback?.trim() || "";

  if (lang === "en") return p || s || src || en || "";
  if (p) return p;
  const base = s || src || en || "";
  if (!base) return "";
  if (hasCjkText(base)) return base;
  return zhFallback ? zhFallback(base, zhFallbackSource ?? undefined) : base;
}

export function pickLangText(lang: string, values: { en: string; zhTW: string; zhCN: string }) {
  if (lang === "en") return values.en;
  if (lang === "zh-TW") return values.zhTW;
  return values.zhCN;
}

export function localeForLang(lang: string) {
  return lang === "en" ? "en-US" : lang === "zh-TW" ? "zh-TW" : "zh-CN";
}

