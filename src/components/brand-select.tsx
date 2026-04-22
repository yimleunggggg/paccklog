"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BRAND_CATEGORY_LABELS, BRAND_OPTIONS } from "@/shared/brand-library";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

export function BrandSelect({
  name,
  value,
  onChange,
  placeholder,
  optionalHint,
  className,
}: {
  name: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  optionalHint: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (wrapperRef.current?.contains(target)) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const filtered = useMemo(() => {
    const q = normalize(query || value);
    if (!q) return BRAND_OPTIONS;
    return BRAND_OPTIONS.filter((option) => option.searchTokens.some((token) => token.includes(q)));
  }, [query, value]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, typeof filtered>>((acc, option) => {
      const key = option.category;
      acc[key] = [...(acc[key] ?? []), option];
      return acc;
    }, {});
  }, [filtered]);

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        className={className ?? "ui-control-trigger flex w-full items-center overflow-hidden text-ellipsis whitespace-nowrap"}
        onClick={() => {
          setOpen((prev) => !prev);
          setQuery(value);
        }}
      >
        {value || `${placeholder}（${optionalHint}）`}
      </button>
      {open ? (
        <div className="ui-dropdown-panel absolute z-40 w-full p-2">
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onChange(e.target.value);
            }}
            placeholder={`搜索${placeholder}`}
            className="ui-dropdown-search mb-2 w-full"
          />
          <div className="max-h-64 overflow-auto">
            {Object.entries(grouped).map(([category, options]) => (
              <div key={category} className="mb-2">
                <p className="px-1 py-1 text-[11px] tracking-[0.06em] text-[#8c8880]">{BRAND_CATEGORY_LABELS[category as keyof typeof BRAND_CATEGORY_LABELS]}</p>
                <div className="space-y-0.5">
                  {options.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      className="ui-dropdown-option block w-full text-left"
                      onMouseDown={() => {
                        onChange(option.label);
                        setQuery(option.label);
                        setOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!filtered.length ? <p className="px-1 py-2 text-xs text-[#8c8880]">未命中品牌，可直接输入后保存。</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
