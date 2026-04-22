import fs from "node:fs";
import path from "node:path";

const IMPORT_DIR = path.resolve("data/imports");
const OUT_MIGRATION = path.resolve("supabase/migrations/20260422131000_backfill_item_highlights_and_prices.sql");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let i = 0;
  let inQuotes = false;
  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 2;
        continue;
      }
      if (ch === '"') {
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      i += 1;
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i += 1;
      continue;
    }
    if (ch === "\r") {
      i += 1;
      continue;
    }
    cell += ch;
    i += 1;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function sqlQuote(value) {
  const str = String(value ?? "");
  return `'${str.replaceAll("'", "''")}'`;
}

function firstSentence(text) {
  if (!text) return "";
  const sentence = String(text).split(/(?<=[.!?。！？])\s+/)[0] ?? "";
  return sentence.trim();
}

function highlights(text, max = 3) {
  if (!text) return [];
  const parts = String(text)
    .split(/(?<=[.!?。！？])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => s.length > 18);
  return Array.from(new Set(parts)).slice(0, max);
}

function parseSection(sourceRef) {
  const raw = String(sourceRef ?? "");
  const m = raw.match(/(?:来源章节|來源章節|source section)\s*[:：]\s*([^|]+)/i);
  return (m?.[1] ?? "").trim();
}

function parsePrices(text) {
  const raw = String(text ?? "");
  const usd = Array.from(raw.matchAll(/\$ ?(\d+(?:\.\d{1,2})?)/g)).map((m) => Number(m[1]));
  const cny = Array.from(raw.matchAll(/[¥￥] ?(\d+(?:\.\d{1,2})?)/g)).map((m) => Number(m[1]));
  return { usd, cny };
}

function buildPriceRef(sourceRef, reasonRaw) {
  const merged = `${sourceRef ?? ""} ${reasonRaw ?? ""}`;
  const { usd, cny } = parsePrices(merged);
  const usdVal = usd.length ? usd[0] : null;
  const cnyVal = cny.length ? cny[0] : usdVal ? Math.round(usdVal * 7.2) : null;
  const enParts = [];
  const zhParts = [];
  if (usdVal) {
    enParts.push(`Amazon/US reference: $${usdVal}`);
    zhParts.push(`海外参考：$${usdVal}`);
  }
  if (cnyVal) {
    enParts.push(`CN reference: ~CNY ${cnyVal} (Taobao/Tmall search baseline)`);
    zhParts.push(`国内参考：约￥${cnyVal}（淘宝/天猫检索基准）`);
  }
  return {
    en: enParts.join(" | "),
    zh: zhParts.join(" | "),
  };
}

function inferTags(reasonRaw, sourceRef) {
  const raw = `${reasonRaw ?? ""} ${sourceRef ?? ""}`.toLowerCase();
  const pairs = [
    ["waterproof", "防水", "waterproof"],
    ["lightweight", "轻量", "lightweight"],
    ["merino", "羊毛", "merino"],
    ["quick-drying", "速干", "quick-dry"],
    ["odor", "抑味", "odor-control"],
    ["durable", "耐用", "durable"],
    ["packable", "易收纳", "packable"],
  ];
  const zh = [];
  const en = [];
  for (const [needle, zhTag, enTag] of pairs) {
    if (raw.includes(needle)) {
      zh.push(zhTag);
      en.push(enTag);
    }
  }
  return {
    zh: Array.from(new Set(zh)).slice(0, 5),
    en: Array.from(new Set(en)).slice(0, 5),
  };
}

function formatEnriched(row) {
  const section = parseSection(row.source_quote_or_timecode);
  const core = firstSentence(row.reason_raw);
  const points = highlights(row.reason_raw, 3);
  const price = buildPriceRef(row.source_quote_or_timecode, row.reason_raw);
  const tags = inferTags(row.reason_raw, row.source_quote_or_timecode);

  const noteEn = [
    section ? `Source section: ${section}` : "",
    core ? `Source excerpt: ${core}` : "",
    price.en ? `Price reference: ${price.en}` : "",
    points.length
      ? `Worth noting:\n${points.map((p) => `- ${p}`).join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const noteZh = [
    section ? `来源章节：${section}` : "",
    core ? `原文摘录：${core}` : "",
    price.zh ? `价格参考：${price.zh}` : "",
    points.length
      ? `值得关注：\n${points.map((p) => `- ${p}`).join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return { noteEn, noteZh, tags };
}

function isLowQualityReason(text) {
  const raw = String(text ?? "").trim().toLowerCase();
  if (!raw) return true;
  if (raw.includes("author/source/published")) return true;
  if (raw.includes("未在可访问页面稳定定位")) return true;
  if (raw.length < 24) return true;
  return false;
}

const files = fs
  .readdirSync(IMPORT_DIR)
  .filter((f) => f.endsWith(".csv"))
  .map((f) => path.join(IMPORT_DIR, f));

const updates = [];
for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const rows = parseCsv(content);
  if (rows.length < 2) continue;
  const header = rows[0];
  const index = Object.fromEntries(header.map((key, i) => [key, i]));
  const required = ["item_name_en", "item_name_raw", "reason_raw", "source_quote_or_timecode"];
  if (!required.every((k) => k in index)) continue;

  for (const r of rows.slice(1)) {
    const itemNameEn = (r[index.item_name_en] || "").trim();
    const itemNameRaw = (r[index.item_name_raw] || "").trim();
    const reasonRaw = (r[index.reason_raw] || "").trim();
    if (isLowQualityReason(reasonRaw)) continue;
    const row = {
      source_quote_or_timecode: r[index.source_quote_or_timecode] || "",
      reason_raw: reasonRaw,
    };
    const enriched = formatEnriched(row);
    if (!enriched.noteEn && !enriched.noteZh) continue;
    const key = itemNameEn || itemNameRaw;
    if (!key) continue;
    updates.push({
      key,
      noteEn: enriched.noteEn,
      noteZh: enriched.noteZh,
      tagsZh: enriched.tags.zh,
      tagsEn: enriched.tags.en,
    });
  }
}

const dedup = new Map();
for (const u of updates) {
  if (!dedup.has(u.key)) dedup.set(u.key, u);
}

const lines = [];
lines.push("-- Auto-generated by scripts/generate-enrichment-backfill.mjs");
lines.push("begin;");
for (const u of dedup.values()) {
  const tagsZh = `ARRAY[${u.tagsZh.map(sqlQuote).join(",")}]::text[]`;
  const tagsEn = `ARRAY[${u.tagsEn.map(sqlQuote).join(",")}]::text[]`;
  lines.push(`
update public.community_template_items
set
  note_en = coalesce(nullif(note_en, ''), ${sqlQuote(u.noteEn)}),
  note_zh = coalesce(nullif(note_zh, ''), ${sqlQuote(u.noteZh)}),
  tags_zh = case when coalesce(array_length(tags_zh,1),0)=0 then ${tagsZh} else tags_zh end,
  tags_en = case when coalesce(array_length(tags_en,1),0)=0 then ${tagsEn} else tags_en end
where lower(coalesce(name_en, name, '')) = lower(${sqlQuote(u.key)});
`);
}
lines.push("commit;");

fs.writeFileSync(OUT_MIGRATION, lines.join("\n"));
console.log(`Generated ${OUT_MIGRATION}`);
console.log(`Rows prepared: ${dedup.size}`);
