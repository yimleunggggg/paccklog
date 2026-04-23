#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ALLOWED_CATEGORY = new Set([
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

const ALLOWED_STATUS = new Set(["to_pack", "to_buy", "optional", "packed"]);
const ALLOWED_CONTAINER = new Set(["suitcase", "backpack", "carry_on", "wear", "undecided", ""]);

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((v) => v.trim());
}

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]);
    const row = {};
    for (let j = 0; j < headers.length; j += 1) {
      row[headers[j]] = values[j] ?? "";
    }
    rows.push(row);
  }
  return rows;
}

function uniq(items) {
  return Array.from(new Set(items));
}

function toPercent(numerator, denominator) {
  if (!denominator) return "0.0%";
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function main() {
  const args = parseArgs(process.argv);
  const input = args.input || "data/imports/packhacker-hostel-essentials.csv";
  const output = args.output || "data/imports/packhacker-hostel-essentials.qc.md";
  const sourceName = args.source || "Unknown source";

  const inputAbs = path.resolve(process.cwd(), input);
  const outputAbs = path.resolve(process.cwd(), output);
  const csvRaw = fs.readFileSync(inputAbs, "utf8");
  const rows = parseCsv(csvRaw);

  const total = rows.length;
  const invalidCategory = [];
  const invalidStatus = [];
  const invalidContainer = [];
  const missingBrand = [];
  const missingReason = [];
  const missingImage = [];
  const missingNameEn = [];
  const missingNoteEn = [];
  const optionalMissingNameZh = [];
  const optionalMissingNoteZh = [];
  const duplicateNames = {};

  for (const row of rows) {
    const name = row.item_name_en || row.item_name_raw || "(empty)";
    const category = (row.category || "").trim();
    const status = (row.status_recommend || "").trim();
    const container = (row.container_recommend || "").trim();
    const brand = (row.brand_normalized || row.brand_raw || "").trim();
    const reason = (row.reason_raw || "").trim();
    const image = (row.image_url || "").trim();
    const itemNameEn = (row.item_name_en || "").trim();
    const itemNameZh = (row.item_name_zh || "").trim();
    const noteEn = (row.note_en || "").trim();
    const noteZh = (row.note_zh || "").trim();

    if (!ALLOWED_CATEGORY.has(category)) invalidCategory.push(name);
    if (!ALLOWED_STATUS.has(status)) invalidStatus.push(name);
    if (!ALLOWED_CONTAINER.has(container)) invalidContainer.push(name);
    if (!brand) missingBrand.push(name);
    if (!reason) missingReason.push(name);
    if (!image) missingImage.push(name);
    if (!itemNameEn) missingNameEn.push(name);
    if (!itemNameZh) optionalMissingNameZh.push(name);
    if (!noteEn) missingNoteEn.push(name);
    if (!noteZh) optionalMissingNoteZh.push(name);

    const key = name.toLowerCase();
    duplicateNames[key] = (duplicateNames[key] || 0) + 1;
  }

  const duplicated = Object.entries(duplicateNames)
    .filter(([, count]) => count > 1)
    .map(([name]) => name);

  const validCategoryCount = total - invalidCategory.length;
  const validStatusCount = total - invalidStatus.length;
  const validContainerCount = total - invalidContainer.length;
  const brandFilledCount = total - missingBrand.length;
  const reasonFilledCount = total - missingReason.length;
  const imageFilledCount = total - missingImage.length;

  const report = `# PACKLOG Import QC Report

## Summary

- Source: ${sourceName}
- Input: \`${input}\`
- Total rows: ${total}
- Generated at: ${new Date().toISOString()}

## Coverage

- Category valid: ${validCategoryCount}/${total} (${toPercent(validCategoryCount, total)})
- Status valid: ${validStatusCount}/${total} (${toPercent(validStatusCount, total)})
- Container valid: ${validContainerCount}/${total} (${toPercent(validContainerCount, total)})
- Brand filled: ${brandFilledCount}/${total} (${toPercent(brandFilledCount, total)})
- Reason filled: ${reasonFilledCount}/${total} (${toPercent(reasonFilledCount, total)})
- Image filled: ${imageFilledCount}/${total} (${toPercent(imageFilledCount, total)})

## Blocking Issues

- Invalid category rows: ${invalidCategory.length}
- Invalid status rows: ${invalidStatus.length}
- Invalid container rows: ${invalidContainer.length}

## Risk Checks

- Missing brand rows: ${missingBrand.length}
- Missing reason rows: ${missingReason.length}
- Missing image rows: ${missingImage.length}
- Missing item_name_en rows: ${missingNameEn.length}
- Optional missing item_name_zh rows: ${optionalMissingNameZh.length}
- Missing note_en rows: ${missingNoteEn.length}
- Optional missing note_zh rows: ${optionalMissingNoteZh.length}
- Duplicate item names: ${duplicated.length}

## Details (Top 20)

### Invalid Category
${uniq(invalidCategory).slice(0, 20).map((n) => `- ${n}`).join("\n") || "- none"}

### Invalid Status
${uniq(invalidStatus).slice(0, 20).map((n) => `- ${n}`).join("\n") || "- none"}

### Invalid Container
${uniq(invalidContainer).slice(0, 20).map((n) => `- ${n}`).join("\n") || "- none"}

### Missing Brand
${uniq(missingBrand).slice(0, 20).map((n) => `- ${n}`).join("\n") || "- none"}

### Missing Reason
${uniq(missingReason).slice(0, 20).map((n) => `- ${n}`).join("\n") || "- none"}

### Missing Image
${uniq(missingImage).slice(0, 20).map((n) => `- ${n}`).join("\n") || "- none"}

### Missing item_name_en
${uniq(missingNameEn).slice(0, 20).map((n) => `- ${n}`).join("\n") || "- none"}

### Optional Missing item_name_zh
${uniq(optionalMissingNameZh).slice(0, 20).map((n) => `- ${n}`).join("\n") || "- none"}

### Missing note_en
${uniq(missingNoteEn).slice(0, 20).map((n) => `- ${n}`).join("\n") || "- none"}

### Optional Missing note_zh
${uniq(optionalMissingNoteZh).slice(0, 20).map((n) => `- ${n}`).join("\n") || "- none"}

### Duplicate Names
${duplicated.slice(0, 20).map((n) => `- ${n}`).join("\n") || "- none"}
`;

  fs.writeFileSync(outputAbs, report, "utf8");
  console.log(`QC report generated: ${path.relative(process.cwd(), outputAbs)}`);
}

main();

