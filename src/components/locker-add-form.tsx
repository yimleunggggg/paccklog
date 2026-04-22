"use client";

import { useState } from "react";
import { addLockerItem } from "@/features/locker/actions";
import { BrandSelect } from "@/components/brand-select";

type LockerAddFormProps = {
  itemNameLabel: string;
  brandLabel: string;
  brandOptionalHint: string;
  categoryLabel: string;
  categoryOptions: Array<{ value: string; label: string }>;
  noteLabel: string;
  addLabel: string;
  ownedLabel: string;
  wishlistLabel: string;
};

export function LockerAddForm({
  itemNameLabel,
  brandLabel,
  brandOptionalHint,
  categoryLabel,
  categoryOptions,
  noteLabel,
  addLabel,
  ownedLabel,
  wishlistLabel,
}: LockerAddFormProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [status, setStatus] = useState<"owned" | "wishlist">("owned");
  const [category, setCategory] = useState(categoryOptions[0]?.value ?? "other");
  const [brand, setBrand] = useState("");

  return (
    <form action={addLockerItem} className="grid gap-2 md:grid-cols-[1fr_140px_140px_120px_100px]">
      <input name="name" required placeholder={itemNameLabel} className="ui-control-input" />
      <BrandSelect
        name="brand"
        value={brand}
        onChange={setBrand}
        placeholder={brandLabel}
        optionalHint={brandOptionalHint}
        className="ui-control-trigger h-10 w-full rounded-[10px] px-3 text-[13px]"
      />
      <input type="hidden" name="category" value={category} />
      <div className="relative">
        <input type="hidden" name="status" value={status} />
        <button
          type="button"
          className="ui-control-trigger flex items-center justify-between"
          onClick={() => setStatusOpen((prev) => !prev)}
        >
          <span>{status === "owned" ? ownedLabel : wishlistLabel}</span>
          <span>▾</span>
        </button>
        {statusOpen ? (
          <div className="ui-dropdown-panel absolute z-30 w-full p-1">
            <button
              type="button"
              className={`ui-dropdown-option block w-full text-left ${status === "owned" ? "ui-dropdown-option-active" : ""}`}
              onMouseDown={() => {
                setStatus("owned");
                setStatusOpen(false);
              }}
            >
              {ownedLabel}
            </button>
            <button
              type="button"
              className={`ui-dropdown-option block w-full text-left ${status === "wishlist" ? "ui-dropdown-option-active" : ""}`}
              onMouseDown={() => {
                setStatus("wishlist");
                setStatusOpen(false);
              }}
            >
              {wishlistLabel}
            </button>
          </div>
        ) : null}
      </div>
      <button type="submit" className="brand-btn-primary h-10 px-3 text-[12px]">
        {addLabel}
      </button>
      <div className="md:col-span-5">
        <p className="mb-1 text-[12px] text-[#7a766d]">{categoryLabel}</p>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`brand-chip ${category === item.value ? "brand-chip-active" : ""}`}
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <input name="note" placeholder={noteLabel} className="ui-control-input md:col-span-5" />
    </form>
  );
}
