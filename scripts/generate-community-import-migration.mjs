#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const IMPORT_DIR = path.resolve("data/imports");
const OUTPUT_MIGRATION = path.resolve(
  "supabase/migrations/20260423100000_refresh_packhacker_rei_from_cdp.sql",
);

const TARGET_FILES = new Set([
  "packhacker-digital-nomad.csv",
  "packhacker-sustainable-packing-list.csv",
  "packhacker-road-trip-essentials.csv",
  "rei-backpacking-checklist.csv",
  "rei-festival-camping-checklist.csv",
  "rei-family-camping-checklist.csv",
  "rei-camp-kitchen-checklist.csv",
  "rei-first-aid-checklist.csv",
  "rei-sup-checklist.csv",
  "rei-kayak-day-touring-checklist.csv",
  "rei-canoe-multiday-touring-checklist.csv",
  "rei-backcountry-ski-snowboard-checklist.csv",
  "rei-snowshoe-checklist.csv",
  "rei-travel-preparation-checklist.csv",
]);

function toCanonicalStem(fileName) {
  return fileName.replace(/-cdp\.csv$/, "").replace(/\.csv$/, "");
}

function pickPreferredFiles(importDir) {
  const all = fs.readdirSync(importDir).filter((name) => name.endsWith(".csv"));
  const out = new Map();
  for (const base of TARGET_FILES) {
    const stem = base.replace(/\.csv$/, "");
    const cdpName = `${stem}-cdp.csv`;
    if (all.includes(cdpName)) {
      out.set(stem, cdpName);
    } else if (all.includes(base)) {
      out.set(stem, base);
    }
  }
  return Array.from(out.values()).sort();
}

const VALID_CATEGORIES = new Set([
  "clothing",
  "footwear",
  "electronics",
  "toiletries",
  "documents",
  "nutrition",
  "camping",
  "first_aid",
  "bags",
  "accessories",
  "disposable",
  "other",
]);

const CATEGORY_ALIAS = {
  shelter: "camping",
  sleep: "camping",
  safety: "first_aid",
  tools: "accessories",
  hydration: "nutrition",
  navigation: "accessories",
  camp_kitchen: "camping",
};

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

function toSlug(input) {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toSafeCategory(raw) {
  const normalized = String(raw ?? "")
    .trim()
    .toLowerCase();
  const aliased = CATEGORY_ALIAS[normalized] ?? normalized;
  return VALID_CATEGORIES.has(aliased) ? aliased : "other";
}

function toSafeStatus(raw) {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (value === "to_buy") return "buy";
  if (value === "optional") return "opt";
  return "must";
}

function extractSection(sourceQuote) {
  const raw = String(sourceQuote ?? "");
  const m = raw.match(/(?:来源章节|來源章節|source section)\s*[:：]\s*([^|]+)/i);
  const section = (m?.[1] ?? "").trim();
  return section || "Recommended";
}

function shouldSkipName(rawName) {
  const name = String(rawName ?? "").trim().toLowerCase();
  if (!name) return true;
  if (name === "deal" || name === "expand_more") return true;
  if (name === "source_overview" || name === "blocked_dynamic_no_public_items") return true;
  if (name.startsWith("http://") || name.startsWith("https://")) return true;
  return false;
}

function shouldSkipRow(row, get) {
  const sourceUrl = get(row, "source_url_or_ref");
  const reason = get(row, "reason_raw");
  const quote = get(row, "source_quote_or_timecode");
  const status = get(row, "record_status");
  const badSignals = `${sourceUrl} ${reason} ${quote}`.toLowerCase();
  if (badSignals.includes("fetch_failed") || badSignals.includes("blocked")) return true;
  if (status && String(status).toLowerCase() === "invalid") return true;
  return false;
}

function scenesFromTripStyle(styleRaw, sourceTitle) {
  const haystack = `${styleRaw ?? ""} ${sourceTitle ?? ""}`.toLowerCase();
  const out = new Set();
  if (haystack.includes("backpacking")) out.add("backpacking");
  if (haystack.includes("camp")) out.add("camping");
  if (haystack.includes("hiking")) out.add("hiking");
  if (haystack.includes("ski") || haystack.includes("snow")) out.add("hiking");
  if (haystack.includes("travel") || haystack.includes("city")) out.add("city_explore");
  if (!out.size) out.add("city_explore");
  return Array.from(out);
}

function arraySql(values) {
  if (!values.length) return "ARRAY[]::text[]";
  return `ARRAY[${values.map((v) => sqlQuote(v)).join(",")}]::text[]`;
}

function dateSql(value) {
  const raw = String(value ?? "").trim();
  if (!raw || raw.startsWith("FETCH_FAILED")) return "null";
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!m) return "null";
  return `${sqlQuote(m[1])}::date`;
}

function normalizeAuthorName(sourceName, authorRaw) {
  const source = String(sourceName ?? "").trim();
  const author = String(authorRaw ?? "").trim();
  if (!author) return "";
  const sourceLower = source.toLowerCase();
  const authorLower = author.toLowerCase();
  if (sourceLower && sourceLower === authorLower) return "";
  const isCrossSourceConflict =
    (sourceLower.includes("pack hacker") && authorLower.includes("rei")) ||
    (sourceLower.includes("rei") && authorLower.includes("pack hacker"));
  if (isCrossSourceConflict) return "";
  if (sourceLower.includes("rei") && /(rei|co-op|official)/i.test(authorLower)) return "";
  if (sourceLower.includes("pack hacker") && /pack hacker/i.test(authorLower)) return "";
  return author;
}

function main() {
  const files = pickPreferredFiles(IMPORT_DIR);

  const lines = [];
  lines.push("-- Auto-generated by scripts/generate-community-import-migration.mjs");
  lines.push("begin;");

  for (const fileName of files) {
    const abs = path.join(IMPORT_DIR, fileName);
    const csv = fs.readFileSync(abs, "utf8");
    const rows = parseCsv(csv);
    if (rows.length < 2) continue;
    const header = rows[0];
    const idx = Object.fromEntries(header.map((key, i) => [key, i]));
    const get = (r, key) => (idx[key] === undefined ? "" : r[idx[key]] ?? "");

    const first = rows[1];
    const sourceTitle = get(first, "source_title") || fileName.replace(/\.csv$/, "");
    const sourceUrl = get(first, "source_url_or_ref");
    const authorNameRaw = get(first, "author_name");
    const sourceLanguage = get(first, "source_language") || "en";
    const sourceType = get(first, "source_type") || "article";
    const sourcePublishedAt = get(first, "published_at");
    const tripStyle = get(first, "trip_style");
    const summaryZh = get(first, "summary_zh");
    const sourceLogoUrl = get(first, "source_logo_url");
    const scenes = scenesFromTripStyle(tripStyle, sourceTitle);
    const fileStem = toCanonicalStem(fileName);
    const slug = toSlug(fileStem);
    const titleEn = sourceTitle;
    const titleZh = `社区清单 · ${sourceTitle}`;
    const note = sourceUrl ? `来源：${sourceUrl}` : "";
    const sourceName = sourceTitle.toLowerCase().includes("rei") ? "REI" : "Pack Hacker";
    const authorName = normalizeAuthorName(sourceName, authorNameRaw);

    const templateSql = `
delete from public.community_template_items where template_id in (select id from public.community_templates where slug = ${sqlQuote(slug)});
delete from public.community_templates where slug = ${sqlQuote(slug)};

insert into public.community_templates (
  slug, title, title_en, author_name, region, country, scenes, days_min, days_max, season, difficulty,
  description, note, is_featured, likes, copy_count, item_add_count, is_system,
  source_url, source_language, source_type, source_published_at, trip_style, source_name, source_logo_url
)
values (
  ${sqlQuote(slug)},
  ${sqlQuote(titleZh)},
  ${sqlQuote(titleEn)},
  ${sqlQuote(authorName)},
  'GLOBAL',
  null,
  ${arraySql(scenes)},
  null,
  null,
  null,
  null,
  ${sqlQuote(summaryZh)},
  ${sqlQuote(note)},
  false,
  0,
  0,
  0,
  true,
  ${sqlQuote(sourceUrl)},
  ${sqlQuote(sourceLanguage)},
  ${sqlQuote(sourceType)},
  ${dateSql(sourcePublishedAt)},
  ${sqlQuote(tripStyle)},
  ${sqlQuote(sourceName)},
  nullif(${sqlQuote(sourceLogoUrl)}, '')
)
on conflict (slug) do update
set
  title = excluded.title,
  title_en = excluded.title_en,
  author_name = excluded.author_name,
  scenes = excluded.scenes,
  description = excluded.description,
  note = excluded.note,
  source_url = excluded.source_url,
  source_language = excluded.source_language,
  source_type = excluded.source_type,
  source_published_at = excluded.source_published_at,
  trip_style = excluded.trip_style,
  source_name = excluded.source_name,
  source_logo_url = excluded.source_logo_url;`;

    const itemLines = [];
    let sortOrder = 1;
    for (const row of rows.slice(1)) {
      if (shouldSkipRow(row, get)) continue;
      const nameRaw = get(row, "item_name_raw");
      const nameEn = get(row, "item_name_en");
      const nameZh = get(row, "item_name_zh");
      const reasonRaw = get(row, "reason_raw");
      const category = toSafeCategory(get(row, "category"));
      const status = toSafeStatus(get(row, "status_recommend"));
      const container = get(row, "container_recommend");
      const brand = get(row, "brand_normalized") || get(row, "brand_raw");
      const section = extractSection(get(row, "source_quote_or_timecode"));
      const imageUrl = get(row, "image_url");
      const noteEn = get(row, "note_en") || reasonRaw;
      const noteZh = get(row, "note_zh");
      const tagsZhRaw = get(row, "tags_zh");
      const tagsEnRaw = get(row, "tags_en");

      const name = nameRaw || nameEn;
      if (shouldSkipName(name)) continue;

      const tagsZh = tagsZhRaw
        .split("|")
        .map((v) => v.trim())
        .filter(Boolean);
      const tagsEn = tagsEnRaw
        .split("|")
        .map((v) => v.trim())
        .filter(Boolean);

      itemLines.push(`(
  (select id from public.community_templates where slug = ${sqlQuote(slug)}),
  ${sqlQuote(section)},
  ${sqlQuote(name)},
  nullif(${sqlQuote(nameEn)}, ''),
  nullif(${sqlQuote(nameZh)}, ''),
  ${sqlQuote(category)},
  ${sqlQuote(status)},
  nullif(${sqlQuote(container)}, ''),
  nullif(${sqlQuote(brand)}, ''),
  nullif(${sqlQuote(reasonRaw)}, ''),
  nullif(${sqlQuote(noteEn)}, ''),
  nullif(${sqlQuote(noteZh)}, ''),
  ${arraySql(tagsZh)},
  ${arraySql(tagsEn)},
  nullif(${sqlQuote(imageUrl)}, ''),
  ${sortOrder}
)`);
      sortOrder += 1;
    }

    if (!itemLines.length) continue;

    lines.push(templateSql);

    lines.push(`
insert into public.community_template_items (
  template_id, section, name, name_en, name_zh, category, status, container, brand, note, note_en, note_zh, tags_zh, tags_en, image_url, sort_order
)
values
${itemLines.join(",\n")}
on conflict (template_id, name) do update
set
  section = excluded.section,
  name_en = excluded.name_en,
  name_zh = excluded.name_zh,
  category = excluded.category,
  status = excluded.status,
  container = excluded.container,
  brand = excluded.brand,
  note = excluded.note,
  note_en = excluded.note_en,
  note_zh = excluded.note_zh,
  tags_zh = excluded.tags_zh,
  tags_en = excluded.tags_en,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;`);
  }

  lines.push("commit;");
  fs.writeFileSync(OUTPUT_MIGRATION, lines.join("\n"), "utf8");
  console.log(`Generated migration: ${path.relative(process.cwd(), OUTPUT_MIGRATION)}`);
}

main();
