import { BRAND_LIBRARY, brandDisplayName } from "../src/shared/brand-library";

type Issue = {
  type: "duplicate-key" | "duplicate-display" | "alias-conflict" | "missing-en";
  message: string;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function main() {
  const issues: Issue[] = [];
  const keyMap = new Map<string, number>();
  const displayMap = new Map<string, number>();
  const aliasOwner = new Map<string, string>();

  BRAND_LIBRARY.forEach((brand, index) => {
    if (!brand.names.en?.trim()) {
      issues.push({
        type: "missing-en",
        message: `第 ${index + 1} 项缺少英文名（key=${brand.key}）`,
      });
    }

    keyMap.set(brand.key, (keyMap.get(brand.key) ?? 0) + 1);

    const display = brandDisplayName(brand);
    displayMap.set(display, (displayMap.get(display) ?? 0) + 1);

    const tokens = [
      brand.key,
      brand.names.en,
      brand.names.zh ?? "",
      brand.names.local ?? "",
      ...(brand.aliases ?? []),
    ]
      .map((token) => normalize(token))
      .filter(Boolean);

    tokens.forEach((token) => {
      const owner = aliasOwner.get(token);
      if (owner && owner !== brand.key) {
        issues.push({
          type: "alias-conflict",
          message: `别名冲突: "${token}" 同时属于 ${owner} 和 ${brand.key}`,
        });
      } else {
        aliasOwner.set(token, brand.key);
      }
    });
  });

  keyMap.forEach((count, key) => {
    if (count > 1) {
      issues.push({
        type: "duplicate-key",
        message: `重复 key: ${key}（${count} 次）`,
      });
    }
  });

  displayMap.forEach((count, name) => {
    if (count > 1) {
      issues.push({
        type: "duplicate-display",
        message: `重复显示名: ${name}（${count} 次）`,
      });
    }
  });

  const sorted = [...BRAND_LIBRARY].sort((a, b) => a.key.localeCompare(b.key));
  const sortedOk = sorted.every((item, i) => item.key === BRAND_LIBRARY[i]?.key);

  console.log(`品牌库条目数: ${BRAND_LIBRARY.length}`);
  console.log(`按 key 排序: ${sortedOk ? "是" : "否"}`);

  if (!sortedOk) {
    console.log("建议：将 brand-library.ts 中 BRAND_LIBRARY 按 key 排序。");
  }

  if (issues.length > 0) {
    console.log("\n发现问题：");
    issues.forEach((issue) => console.log(`- [${issue.type}] ${issue.message}`));
    process.exitCode = 1;
    return;
  }

  console.log("品牌库校验通过。");
}

main();
