import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { BRAND_LIBRARY, type BrandEntry } from "../src/shared/brand-library";

function quote(value: string) {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function formatBrandEntry(entry: BrandEntry) {
  const namesParts: string[] = [];
  if (entry.names.zh) namesParts.push(`zh: ${quote(entry.names.zh)}`);
  namesParts.push(`en: ${quote(entry.names.en)}`);
  if (entry.names.local) namesParts.push(`local: ${quote(entry.names.local)}`);

  const aliasesPart =
    entry.aliases && entry.aliases.length
      ? `, aliases: [${entry.aliases.map((alias) => quote(alias)).join(", ")}]`
      : "";

  return `  { key: ${quote(entry.key)}, names: { ${namesParts.join(", ")} }${aliasesPart} },`;
}

function main() {
  const targetPath = resolve(process.cwd(), "src/shared/brand-library.ts");
  const content = readFileSync(targetPath, "utf8");

  const startToken = "export const BRAND_LIBRARY: BrandEntry[] = [";
  const endToken = "];";
  const startIndex = content.indexOf(startToken);
  if (startIndex < 0) {
    throw new Error("找不到 BRAND_LIBRARY 起始标记。");
  }
  const arrayStart = startIndex + startToken.length;
  const endIndex = content.indexOf(endToken, arrayStart);
  if (endIndex < 0) {
    throw new Error("找不到 BRAND_LIBRARY 结束标记。");
  }

  const sorted = [...BRAND_LIBRARY].sort((a, b) => a.key.localeCompare(b.key));
  const generatedBlock = `\n${sorted.map(formatBrandEntry).join("\n")}\n`;
  const nextContent = `${content.slice(0, arrayStart)}${generatedBlock}${content.slice(endIndex)}`;

  writeFileSync(targetPath, nextContent, "utf8");
  console.log(`已排序并写回: ${targetPath}`);
}

main();
