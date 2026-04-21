"use client";

import { useMemo, useState } from "react";

const BRAND_OPTIONS = [
  "始祖鸟 / Arc'teryx",
  "巴塔哥尼亚 / Patagonia",
  "北面 / The North Face",
  "哥伦比亚 / Columbia",
  "猛犸象 / Mammut",
  "萨洛蒙 / Salomon",
  "凯乐石 / KAILAS",
  "探路者 / TOREAD",
  "伯希和 / PELLIOT",
  "骆驼 / CAMEL",
  "迪卡侬 / Decathlon",
  "HOKA",
  "MERRELL",
  "Black Diamond",
  "Snow Peak",
  "Montbell",
  "NEMO",
  "MSR",
  "小鹰 / Osprey",
  "Gregory",
] as const;

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

const BRAND_ALIAS: Record<string, string[]> = {
  "凯乐石 / KAILAS": ["kailas", "kls", "kailashi"],
  "萨洛蒙 / Salomon": ["salomon", "slm", "saluomeng"],
  "始祖鸟 / Arc'teryx": ["arcteryx", "arc", "shizuniao"],
  "小鹰 / Osprey": ["osprey", "xiaoying"],
};

export function BrandFields({
  initialBrand,
  initialAlternatives,
  brandPlaceholder,
  alternativesPlaceholder,
}: {
  initialBrand: string;
  initialAlternatives: string[];
  brandPlaceholder: string;
  alternativesPlaceholder: string;
}) {
  const [brand, setBrand] = useState(initialBrand);
  const [alternatives, setAlternatives] = useState(initialAlternatives.join(", "));
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const q = normalize(brand);
    if (!q) return BRAND_OPTIONS.slice(0, 8);
    return BRAND_OPTIONS.filter((item) => {
      const tokens = [item, ...(BRAND_ALIAS[item] ?? [])].map(normalize);
      return tokens.some((token) => token.includes(q));
    }).slice(0, 8);
  }, [brand]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          name="brand"
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder={brandPlaceholder}
          className="w-full rounded-[8px] border border-[#d8d0c4] bg-[#fefcf8] px-2 py-1 text-[12px] italic text-[#6c6961] outline-none"
          style={{ fontFamily: "EB Garamond, serif" }}
        />
        {open && suggestions.length ? (
          <div className="absolute z-40 mt-1 max-h-44 w-full overflow-auto rounded-[8px] border border-[#d8d0c4] bg-[#fefcf8] p-1 shadow-sm">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                className="block w-full rounded px-2 py-1.5 text-left text-[12px] text-[#2f2d29] hover:bg-[#ede8df]"
                onMouseDown={() => {
                  setBrand(item);
                  setOpen(false);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <input
        name="brand_alternatives"
        value={alternatives}
        onChange={(e) => setAlternatives(e.target.value)}
        placeholder={alternativesPlaceholder}
        className="w-full rounded-[8px] border border-[#d8d0c4] bg-[#fefcf8] px-2 py-1 text-[12px] text-[#6c6961] outline-none"
      />
    </div>
  );
}
