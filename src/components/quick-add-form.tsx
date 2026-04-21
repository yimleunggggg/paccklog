"use client";

import Link from "next/link";
import { useState } from "react";
import { addTripItem } from "@/features/trips/actions";

type QuickAddFormProps = {
  tripId: string;
  quickAddPlaceholder: string;
  addLabel: string;
  statusToPack: string;
  statusToBuy: string;
  statusOptional: string;
  customCategoryLabel: string;
  customCategoryPlaceholder: string;
  viewToggleLabel: string;
  viewToggleHref: string;
  categories: Array<{ value: string; label: string }>;
};

export function QuickAddForm({
  tripId,
  quickAddPlaceholder,
  addLabel,
  statusToPack,
  statusToBuy,
  statusOptional,
  customCategoryLabel,
  customCategoryPlaceholder,
  viewToggleLabel,
  viewToggleHref,
  categories,
}: QuickAddFormProps) {
  const [category, setCategory] = useState(categories[0]?.value ?? "other");
  const [customCategory, setCustomCategory] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [name, setName] = useState("");
  const currentLabel =
    category === "__custom__"
      ? customCategoryLabel
      : categories.find((item) => item.value === category)?.label ?? categories[0]?.label ?? "Other";

  const canAdd = name.trim().length > 0;

  return (
    <form action={addTripItem} className="grid gap-2 md:grid-cols-[1fr_130px_110px_100px]">
      <input type="hidden" name="trip_id" value={tripId} />
      <input
        required
        name="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={`+ ${quickAddPlaceholder}...`}
        className="h-11 rounded-xl border px-3 text-sm"
      />
      <div className="relative">
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="custom_category" value={customCategory} />
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between rounded-xl border border-[#d8d0c4] bg-[#fefcf8] px-3 text-sm text-[#2f2d29]"
          onClick={() => setCategoryOpen((prev) => !prev)}
        >
          <span>{currentLabel}</span>
          <span>▾</span>
        </button>
        {categoryOpen ? (
          <div className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] p-1 shadow-sm">
            {categories.map((item) => (
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
            <button
              type="button"
              className={`block w-full rounded px-2 py-2 text-left text-sm ${category === "__custom__" ? "bg-[#e8f2e4] text-[#243d1f]" : "text-[#2f2d29] hover:bg-[#f2eee6]"}`}
              onMouseDown={() => {
                setCategory("__custom__");
                setCategoryOpen(false);
              }}
            >
              + {customCategoryLabel}
            </button>
          </div>
        ) : null}
        {category === "__custom__" ? (
          <input
            value={customCategory}
            onChange={(event) => setCustomCategory(event.target.value)}
            placeholder={customCategoryPlaceholder}
            className="mt-1 h-9 w-full rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] px-2 text-sm"
          />
        ) : null}
      </div>
      <div className="relative">
        <button
          type="button"
          disabled={!canAdd}
          onClick={() => setStatusOpen((prev) => (canAdd ? !prev : prev))}
          className="brand-btn-primary h-11 w-full px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {addLabel}
        </button>
        {statusOpen ? (
          <div className="absolute right-0 z-30 mt-1 w-40 rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] p-1 shadow-sm">
            <button
              type="submit"
              name="status"
              value="to_pack"
              className="block w-full rounded px-2 py-2 text-left text-sm text-[#2f2d29] hover:bg-[#e8f2e4] hover:text-[#243d1f]"
              onClick={() => setStatusOpen(false)}
            >
              {statusToPack}
            </button>
            <button
              type="submit"
              name="status"
              value="to_buy"
              className="block w-full rounded px-2 py-2 text-left text-sm text-[#2f2d29] hover:bg-[#f5ecd8] hover:text-[#9b6a2a]"
              onClick={() => setStatusOpen(false)}
            >
              {statusToBuy}
            </button>
            <button
              type="submit"
              name="status"
              value="optional"
              className="block w-full rounded px-2 py-2 text-left text-sm text-[#2f2d29] hover:bg-[#eae5da] hover:text-[#6b695f]"
              onClick={() => setStatusOpen(false)}
            >
              {statusOptional}
            </button>
          </div>
        ) : null}
      </div>
      <Link href={viewToggleHref} className="brand-btn-soft inline-flex h-11 items-center justify-center px-3 text-sm">
        {viewToggleLabel}
      </Link>
    </form>
  );
}
