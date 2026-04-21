"use client";

import { useState } from "react";
import { addLockerItem } from "@/features/locker/actions";

type LockerAddFormProps = {
  itemNameLabel: string;
  brandLabel: string;
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
  categoryLabel,
  categoryOptions,
  noteLabel,
  addLabel,
  ownedLabel,
  wishlistLabel,
}: LockerAddFormProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [status, setStatus] = useState<"owned" | "wishlist">("owned");
  const [category, setCategory] = useState(categoryOptions[0]?.value ?? "other");
  const currentCategoryLabel = categoryOptions.find((item) => item.value === category)?.label ?? categoryLabel;

  return (
    <form action={addLockerItem} className="grid gap-2 md:grid-cols-[1fr_140px_140px_120px_100px]">
      <input name="name" required placeholder={itemNameLabel} className="h-10 rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] px-3 text-sm" />
      <input name="brand" placeholder={brandLabel} className="h-10 rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] px-3 text-sm" />
      <div className="relative">
        <input type="hidden" name="category" value={category} />
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] px-3 text-sm text-[#2f2d29]"
          onClick={() => setCategoryOpen((prev) => !prev)}
        >
          <span>{currentCategoryLabel}</span>
          <span>▾</span>
        </button>
        {categoryOpen ? (
          <div className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] p-1 shadow-sm">
            {categoryOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`block w-full rounded px-2 py-2 text-left text-sm ${category === item.value ? "bg-[#e8f2e4] text-[#243d1f]" : "text-[#2f2d29] hover:bg-[#f2eee6]"}`}
                onMouseDown={() => {
                  setCategory(item.value);
                  setCategoryOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="relative">
        <input type="hidden" name="status" value={status} />
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] px-3 text-sm text-[#2f2d29]"
          onClick={() => setStatusOpen((prev) => !prev)}
        >
          <span>{status === "owned" ? ownedLabel : wishlistLabel}</span>
          <span>▾</span>
        </button>
        {statusOpen ? (
          <div className="absolute z-30 mt-1 w-full rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] p-1 shadow-sm">
            <button
              type="button"
              className={`block w-full rounded px-2 py-2 text-left text-sm ${status === "owned" ? "bg-[#e8f2e4] text-[#243d1f]" : "text-[#2f2d29] hover:bg-[#f2eee6]"}`}
              onMouseDown={() => {
                setStatus("owned");
                setStatusOpen(false);
              }}
            >
              {ownedLabel}
            </button>
            <button
              type="button"
              className={`block w-full rounded px-2 py-2 text-left text-sm ${status === "wishlist" ? "bg-[#f5ecd8] text-[#9b6a2a]" : "text-[#2f2d29] hover:bg-[#f2eee6]"}`}
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
      <button type="submit" className="brand-btn-primary h-10 px-3 text-sm">
        {addLabel}
      </button>
      <input name="note" placeholder={noteLabel} className="h-10 rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] px-3 text-sm md:col-span-5" />
    </form>
  );
}
