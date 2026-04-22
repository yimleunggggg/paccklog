/**
 * LOADOUT 第三方清单录入校验脚本（Google Apps Script）
 *
 * 用法：
 * 1) 在 Google Sheets -> 扩展程序 -> Apps Script 新建项目
 * 2) 粘贴本文件内容并保存
 * 3) 回到表格，执行 custom menu: LOADOUT -> 校验当前表
 */

const ALLOWED_CATEGORY = new Set([
  "clothing",
  "footwear",
  "electronics",
  "toiletries",
  "documents",
  "nutrition",
  "first_aid",
  "bags",
  "accessories",
  "disposable",
  "camping",
  "other",
]);

const ALLOWED_STATUS = new Set(["to_pack", "to_buy", "optional", "packed"]);
const ALLOWED_CONTAINER = new Set(["undecided", "suitcase", "backpack", "carry_on", "wear"]);

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("LOADOUT")
    .addItem("从 CSV URL 导入（覆盖当前表）", "importCsvFromUrlPrompt")
    .addItem("校验当前表", "validateCurrentSheet")
    .addItem("清除高亮", "clearValidationMarks")
    .addToUi();
}

function importCsvFromUrlPrompt() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.prompt(
    "从 CSV URL 导入",
    "请输入可公开访问的 CSV 链接（会覆盖当前工作表）",
    ui.ButtonSet.OK_CANCEL,
  );
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  const url = String(resp.getResponseText() || "").trim();
  if (!url) {
    ui.alert("URL 为空，已取消。");
    return;
  }
  importCsvFromUrl(url);
}

function importCsvFromUrl(url) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const text = UrlFetchApp.fetch(url).getContentText();
  const rows = Utilities.parseCsv(text);
  if (!rows.length) {
    SpreadsheetApp.getUi().alert("CSV 为空，未导入。");
    return;
  }
  sheet.clearContents();
  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  SpreadsheetApp.getUi().alert(`导入完成：${rows.length - 1} 条记录。`);
}

function validateCurrentSheet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length < 2) return;

  const headers = values[0].map((h) => String(h).trim());
  const idx = indexByHeader(headers);

  const requiredHeaders = ["item_name_raw", "category", "status_recommend", "container_recommend"];
  const missing = requiredHeaders.filter((h) => idx[h] === -1);
  if (missing.length) {
    SpreadsheetApp.getUi().alert(`缺少必需列：${missing.join(", ")}`);
    return;
  }

  clearValidationMarks();

  let errorCount = 0;
  for (let row = 1; row < values.length; row += 1) {
    const rowVals = values[row];
    const rowNum = row + 1;

    const itemName = normalizeCell(rowVals[idx.item_name_raw]);
    const category = normalizeCell(rowVals[idx.category]);
    const status = normalizeCell(rowVals[idx.status_recommend]);
    const container = normalizeCell(rowVals[idx.container_recommend]);
    const publishedAt = idx.published_at >= 0 ? normalizeCell(rowVals[idx.published_at]) : "";

    if (!itemName) {
      markCell(sheet, rowNum, idx.item_name_raw + 1, "#fde2e2");
      errorCount += 1;
    }
    if (category && !ALLOWED_CATEGORY.has(category)) {
      markCell(sheet, rowNum, idx.category + 1, "#fde2e2");
      errorCount += 1;
    }
    if (status && !ALLOWED_STATUS.has(status)) {
      markCell(sheet, rowNum, idx.status_recommend + 1, "#fde2e2");
      errorCount += 1;
    }
    if (container && !ALLOWED_CONTAINER.has(container)) {
      markCell(sheet, rowNum, idx.container_recommend + 1, "#fde2e2");
      errorCount += 1;
    }
    if (publishedAt && !/^(\d{4}-\d{2}-\d{2}|\d{4}-\d{2})$/.test(publishedAt)) {
      if (idx.published_at >= 0) {
        markCell(sheet, rowNum, idx.published_at + 1, "#fff1d6");
        errorCount += 1;
      }
    }
  }

  SpreadsheetApp.getUi().alert(
    errorCount === 0
      ? "校验通过：未发现非法枚举或必填缺失。"
      : `校验完成：发现 ${errorCount} 个问题单元格（已高亮）。`,
  );
}

function clearValidationMarks() {
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.getDataRange().setBackground(null);
}

function indexByHeader(headers) {
  const map = {};
  headers.forEach((h, i) => {
    map[h] = i;
  });
  return new Proxy(map, {
    get(target, prop) {
      return Object.prototype.hasOwnProperty.call(target, prop) ? target[prop] : -1;
    },
  });
}

function normalizeCell(value) {
  return String(value ?? "").trim();
}

function markCell(sheet, row, col, color) {
  sheet.getRange(row, col).setBackground(color);
}

