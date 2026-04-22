"use client";

import { useState } from "react";
import { BrandSelect } from "@/components/brand-select";

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
  const normalizedAlternatives = initialAlternatives.filter((item) => item && item !== initialBrand);
  const [alternatives, setAlternatives] = useState(normalizedAlternatives.join(", "));

  return (
    <div className="space-y-2">
      <BrandSelect
        name="brand"
        value={brand}
        onChange={setBrand}
        placeholder={brandPlaceholder}
        optionalHint="可选"
        className="ui-control-trigger h-10 w-full rounded-[10px] px-3 text-[13px] text-[#4a4840]"
      />
      <input type="hidden" name="brand_alternatives" value={alternatives} />
      <details className="px-0 py-0">
        <summary className="cursor-pointer text-[12px] text-[#6f6b62]">备选品牌（可选）</summary>
        <input
          value={alternatives}
          onChange={(e) => setAlternatives(e.target.value)}
          placeholder={alternativesPlaceholder}
          className="ui-control-input mt-1 h-10 w-full rounded-[10px] px-3 text-[13px]"
        />
      </details>
    </div>
  );
}
