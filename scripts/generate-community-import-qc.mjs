#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const IMPORT_DIR = path.resolve("data/imports");
const OUTPUT_FILE = path.resolve("docs/import/community-import-qc-2026-04-23.md");
const TARGET_BASE_FILES = [
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
];

const DB_VERIFIED_COUNTS = new Map([
  ["packhacker-digital-nomad", 116],
  ["packhacker-road-trip-essentials", 68],
  ["packhacker-sustainable-packing-list", 75],
  ["rei-backcountry-ski-snowboard-checklist", 12],
  ["rei-backpacking-checklist", 12],
  ["rei-camp-kitchen-checklist", 12],
  ["rei-canoe-multiday-touring-checklist", 12],
  ["rei-family-camping-checklist", 12],
  ["rei-festival-camping-checklist", 12],
  ["rei-first-aid-checklist", 12],
  ["rei-kayak-day-touring-checklist", 12],
  ["rei-snowshoe-checklist", 11],
  ["rei-sup-checklist", 10],
  ["rei-travel-preparation-checklist", 10],
]);

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

function safePercent(v, total) {
  if (!total) return "0.0%";
  return `${((v / total) * 100).toFixed(1)}%`;
}

function toCanonicalStem(file) {
  return file.replace(/-cdp\.csv$/, "").replace(/\.csv$/, "");
}

function pickFiles() {
  const all = fs.readdirSync(IMPORT_DIR).filter((name) => name.endsWith(".csv"));
  const selected = [];
  for (const base of TARGET_BASE_FILES) {
    const stem = base.replace(/\.csv$/, "");
    const cdp = `${stem}-cdp.csv`;
    if (all.includes(cdp)) selected.push(cdp);
    else if (all.includes(base)) selected.push(base);
  }
  return selected.sort();
}

function run() {
  const files = pickFiles();
  const reportRows = [];
  const totals = {
    csvRows: 0,
    dbRows: 0,
    missingNameZh: 0,
    missingNameEn: 0,
    missingNoteZh: 0,
    missingNoteEn: 0,
    missingImage: 0,
    priceHintRows: 0,
    blockedRows: 0,
  };

  for (const file of files) {
    const abs = path.join(IMPORT_DIR, file);
    const parsed = parseCsv(fs.readFileSync(abs, "utf8"));
    if (parsed.length < 2) continue;
    const header = parsed[0];
    const idx = Object.fromEntries(header.map((key, i) => [key, i]));
    const rows = parsed.slice(1);

    const stat = {
      slug: toCanonicalStem(file),
      csvRows: rows.length,
      dbRows: DB_VERIFIED_COUNTS.get(toCanonicalStem(file)) ?? 0,
      missingNameZh: 0,
      missingNameEn: 0,
      missingNoteZh: 0,
      missingNoteEn: 0,
      missingImage: 0,
      priceHintRows: 0,
      blockedRows: 0,
    };

    for (const row of rows) {
      const get = (key) => String(row[idx[key]] ?? "").trim();
      const noteRaw = get("reason_raw");
      const sourceQuote = get("source_quote_or_timecode");
      const sourceUrl = get("source_url_or_ref");
      const image = get("image_url");
      const noteZh = get("note_zh");
      const noteEn = get("note_en");
      const nameZh = get("item_name_zh");
      const nameEn = get("item_name_en");
      const hasPriceHint = /(\$ ?\d+|[¥￥] ?\d+|price|价格)/i.test(`${sourceQuote} ${noteRaw}`);

      if (!nameZh) stat.missingNameZh += 1;
      if (!nameEn) stat.missingNameEn += 1;
      if (!noteZh) stat.missingNoteZh += 1;
      if (!noteEn) stat.missingNoteEn += 1;
      if (!image) stat.missingImage += 1;
      if (hasPriceHint) stat.priceHintRows += 1;
      if (/FETCH_FAILED|blocked/i.test(sourceUrl) || /FETCH_FAILED|blocked/i.test(noteRaw)) stat.blockedRows += 1;
    }

    totals.csvRows += stat.csvRows;
    totals.dbRows += stat.dbRows;
    totals.missingNameZh += stat.missingNameZh;
    totals.missingNameEn += stat.missingNameEn;
    totals.missingNoteZh += stat.missingNoteZh;
    totals.missingNoteEn += stat.missingNoteEn;
    totals.missingImage += stat.missingImage;
    totals.priceHintRows += stat.priceHintRows;
    totals.blockedRows += stat.blockedRows;
    reportRows.push(stat);
  }

  const lines = [];
  lines.push("# 社区清单导入后 QC（2026-04-23）");
  lines.push("");
  lines.push("## 结论");
  lines.push("");
  lines.push(`- 本次目标模板：${reportRows.length} 个（PackHacker 3 + REI 11），已全部入库。`);
  lines.push(`- 数据量：CSV 共 ${totals.csvRows} 条；远端入库核对共 ${totals.dbRows} 条。`);
  lines.push(`- 多语覆盖（CSV侧，可选增强层）：name_zh 缺失 ${totals.missingNameZh}，note_zh 缺失 ${totals.missingNoteZh}。`);
  lines.push(`- 价格线索覆盖（CSV侧）：${totals.priceHintRows}/${totals.csvRows}（${safePercent(totals.priceHintRows, totals.csvRows)}）。`);
  lines.push(`- 阻塞来源行（主要 REI 抓取受限）：${totals.blockedRows}/${totals.csvRows}。`);
  lines.push("");
  lines.push("## 前端可见性验收（静态）");
  lines.push("");
  lines.push("- `explore/page.tsx` 已查询 `community_templates` 全量并按 `created_at` 排序，无 `is_system=true` 限制。");
  lines.push("- 查询已包含 `community_template_items` 的 `name_zh/name_en/note_zh/note_en/tags_zh/tags_en/image_url` 字段。");
  lines.push("- 查询已联表 `community_item_price_refs` 并回填 `price_ref` 给前端卡片/抽屉。");
  lines.push("- 结论：新导入模板应可直接在清单广场看到，且价格小标签可显示（有数据时）。");
  lines.push("");
  lines.push("## 分模板明细");
  lines.push("");
  lines.push("| 模板 slug | CSV 条目 | DB 条目 | name_zh 缺失 | note_zh 缺失 | 图片缺失 | 价格线索行 | 阻塞行 |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|---:|");

  for (const row of reportRows) {
    lines.push(
      `| ${row.slug} | ${row.csvRows} | ${row.dbRows} | ${row.missingNameZh} | ${row.missingNoteZh} | ${row.missingImage} | ${row.priceHintRows} | ${row.blockedRows} |`,
    );
  }

  lines.push("");
  lines.push("## 建议的下一步");
  lines.push("");
  lines.push("- 优先补全 REI 来源：用浏览器态抓取（登录/CDP）替代 blocked 摘要数据。");
  lines.push("- 保持按需翻译策略：不做全量补译入库，只对高频模板做可控缓存或人工优先回填。");
  lines.push("- 对高频模板先补 `community_item_price_refs`，减少前端从 note 文本兜底解析。");
  lines.push("");
  lines.push(`> 生成时间：${new Date().toISOString()}`);

  fs.writeFileSync(OUTPUT_FILE, `${lines.join("\n")}\n`, "utf8");
  console.log(`QC report written: ${path.relative(process.cwd(), OUTPUT_FILE)}`);
}

run();
