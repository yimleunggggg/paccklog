#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const PROXY = "http://localhost:3456";
const IMPORT_DIR = path.resolve("data/imports");

const TARGETS = [
  { slug: "rei-camp-kitchen-checklist", url: "https://www.rei.com/learn/expert-advice/camp-kitchen-checklist.html" },
  { slug: "rei-first-aid-checklist", url: "https://www.rei.com/learn/expert-advice/first-aid-checklist.html" },
  { slug: "rei-snowshoe-checklist", url: "https://www.rei.com/learn/expert-advice/snowshoe-checklist.html" },
  { slug: "rei-family-camping-checklist", url: "https://www.rei.com/learn/expert-advice/family-camping-checklist.html" },
  { slug: "rei-festival-camping-checklist", url: "https://www.rei.com/learn/expert-advice/festival-camping-checklist.html" },
  { slug: "rei-sup-checklist", url: "https://www.rei.com/learn/expert-advice/stand-up-paddleboarding-sup-checklist.html" },
  { slug: "rei-kayak-day-touring-checklist", url: "https://www.rei.com/learn/expert-advice/kayak-day-touring-checklist.html" },
  { slug: "rei-canoe-multiday-touring-checklist", url: "https://www.rei.com/learn/expert-advice/canoe-multiday-touring-checklist.html" },
  {
    slug: "rei-backcountry-ski-snowboard-checklist",
    url: "https://www.rei.com/learn/expert-advice/backcountry-skiing-snowboarding-checklist.html",
  },
];

const CATEGORY_RULES = [
  [/passport|ticket|permit|reservation|itinerary|map|compass|check-?in|boarding/i, "documents"],
  [/first[- ]aid|medicine|medical|prescription|blister|sunscreen|repellent/i, "first_aid"],
  [/stove|fuel|cook|kitchen|mug|bowl|utensil|soap|cooler|food|water|bottle|filter/i, "nutrition"],
  [/sleep|tent|pad|camp|lantern|firewood|charcoal|grill/i, "camping"],
  [/boot|shoe|sock|gaiter|snowshoe/i, "footwear"],
  [/jacket|pants|shirt|glove|hat|underwear|rainwear|clothing/i, "clothing"],
  [/headlamp|battery|gps|phone|charger|beacon|electronics|watch/i, "electronics"],
  [/backpack|bag|duffel|dry bag/i, "bags"],
];

function csvEscape(value) {
  const s = String(value ?? "");
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replaceAll('"', '""')}"`;
  }
  return s;
}

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
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function loadExistingMeta(slug) {
  const file = path.join(IMPORT_DIR, `${slug}.csv`);
  if (!fs.existsSync(file)) return { tripStyle: "travel / checklist", summaryZh: "REI 清单来源（CDP 提取）" };
  const rows = parseCsv(fs.readFileSync(file, "utf8"));
  if (rows.length < 2) return { tripStyle: "travel / checklist", summaryZh: "REI 清单来源（CDP 提取）" };
  const header = rows[0];
  const first = rows[1];
  const idx = Object.fromEntries(header.map((k, i) => [k, i]));
  return {
    tripStyle: first[idx.trip_style] || "travel / checklist",
    summaryZh: first[idx.summary_zh] || "REI 清单来源（CDP 提取）",
  };
}

async function apiGet(pathname) {
  const res = await fetch(`${PROXY}${pathname}`);
  if (!res.ok) throw new Error(`GET ${pathname} failed: ${res.status}`);
  return res.json();
}

async function apiEval(targetId, script) {
  const res = await fetch(`${PROXY}/eval?target=${targetId}`, { method: "POST", body: script });
  if (!res.ok) throw new Error(`eval failed: ${res.status}`);
  const data = await res.json();
  return data.value;
}

function isSectionLine(line) {
  if (!line) return false;
  if (line.endsWith(":")) return true;
  if (/[(),/]/.test(line)) return false;
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 4) return false;
  if (!/^[A-Z][A-Za-z0-9&'\-\s]{2,40}$/.test(line)) return false;
  if (words.some((w) => w.toLowerCase() === "or" || w.toLowerCase() === "and")) return false;
  return true;
}

function categoryFor(item) {
  for (const [re, cat] of CATEGORY_RULES) {
    if (re.test(item)) return cat;
  }
  return "other";
}

function extractItems(mainText) {
  const rawLines = String(mainText ?? "")
    .split("\n")
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const startIdx = rawLines.findIndex((l) => /Printer-Friendly Version/i.test(l));
  const endIdx = rawLines.findIndex((l) => /Related Articles|Back to top/i.test(l));
  const scoped = rawLines.slice(startIdx >= 0 ? startIdx + 1 : 0, endIdx > 0 ? endIdx : rawLines.length);

  const items = [];
  let section = "Recommended";
  for (const line of scoped) {
    if (/^Optional:?$/i.test(line)) continue;
    if (line.length > 140) continue;
    if (/[.!?]$/.test(line) && line.split(" ").length > 8) continue;
    if (/^Print$|^Facebook$|^Pinterest$|^Expert Advice$|^Camping$/.test(line)) continue;
    if (isSectionLine(line)) {
      section = line.replace(/:$/, "");
      continue;
    }
    if (line.split(" ").length < 2) continue;
    if (items.some((x) => x.name.toLowerCase() === line.toLowerCase())) continue;
    items.push({ section, name: line });
  }
  return items.slice(0, 28);
}

function buildCsvRows({ slug, url, title, tripStyle, summaryZh, items }) {
  const header = [
    "record_id",
    "source_title",
    "source_url_or_ref",
    "author_name",
    "source_language",
    "source_type",
    "published_at",
    "trip_time_start",
    "trip_time_end",
    "trip_style",
    "summary_zh",
    "item_name_raw",
    "item_name_zh",
    "item_name_en",
    "category",
    "status_recommend",
    "container_recommend",
    "quantity_recommend",
    "brand_raw",
    "brand_normalized",
    "reason_raw",
    "source_quote_or_timecode",
    "confidence_item",
    "record_status",
    "source_logo_url",
  ];

  const rows = [header];
  items.forEach((item, i) => {
    rows.push([
      `${slug.toUpperCase().replaceAll("-", "_")}-CDP-${String(i + 1).padStart(3, "0")}`,
      title,
      url,
      "",
      "en",
      "article",
      "",
      "",
      "",
      tripStyle,
      summaryZh,
      item.name,
      "",
      item.name,
      categoryFor(item.name),
      "to_pack",
      "undecided",
      "1",
      "",
      "",
      `来源于 REI 官方清单，建议结合目的地天气和出行时长做二次筛选。`,
      item.section,
      "3",
      "draft",
      "https://www.rei.com/favicon.ico",
    ]);
  });
  return rows;
}

async function extractOne(target) {
  const { targetId } = await apiGet(`/new?url=${encodeURIComponent(target.url)}`);
  try {
    const title = await apiEval(targetId, "document.title");
    const mainText = await apiEval(targetId, "(document.querySelector('main')?.innerText || document.body.innerText)");
    const items = extractItems(mainText);
    const meta = loadExistingMeta(target.slug);
    if (!items.length) throw new Error(`no items extracted for ${target.slug}`);
    const rows = buildCsvRows({
      slug: target.slug,
      url: target.url,
      title: String(title).replace(/\s+\|\s*REI Expert Advice$/i, "").trim(),
      tripStyle: meta.tripStyle,
      summaryZh: meta.summaryZh,
      items,
    });
    const out = path.join(IMPORT_DIR, `${target.slug}-cdp.csv`);
    const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n") + "\n";
    fs.writeFileSync(out, csv, "utf8");
    return { slug: target.slug, count: items.length, out };
  } finally {
    await apiGet(`/close?target=${targetId}`);
  }
}

async function main() {
  const results = [];
  for (const t of TARGETS) {
    const result = await extractOne(t);
    results.push(result);
    console.log(`done: ${result.slug} -> ${result.count}`);
  }
  console.log("generated files:");
  for (const r of results) console.log(`- ${path.relative(process.cwd(), r.out)} (${r.count})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
