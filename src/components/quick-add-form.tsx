"use client";

import { useFormStatus } from "react-dom";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addTripItem } from "@/features/trips/actions";
import { BrandSelect } from "@/components/brand-select";

function QuickAddFormBusy({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <div className={pending ? "opacity-65 pointer-events-none transition-opacity duration-150" : "transition-opacity"} aria-busy={pending}>
      {children}
    </div>
  );
}

type QuickAddFormProps = {
  tripId: string;
  quickAddPlaceholder: string;
  addLabel: string;
  defaultStatus: "to_pack" | "to_buy" | "optional" | "packed";
  brandLabel: string;
  brandOptionalHint: string;
  noteLabel: string;
  categories: Array<{ value: string; label: string }>;
};

export function QuickAddForm({
  tripId,
  quickAddPlaceholder,
  addLabel,
  defaultStatus,
  brandLabel,
  brandOptionalHint,
  noteLabel,
  categories,
}: QuickAddFormProps) {
  const [category, setCategory] = useState(categories[0]?.value ?? "other");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [note, setNote] = useState("");
  const [lastAdded, setLastAdded] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const currentLabel = categories.find((item) => item.value === category)?.label ?? categories[0]?.label ?? "Other";

  const canAdd = name.trim().length > 0;

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const result = await addTripItem(formData);
          if (!result.ok || !result.item) {
            setLastAdded("添加失败，请重试");
            return;
          }
          setLastAdded(`已添加：${result.item.name}`);
          setName("");
          setBrand("");
          setNote("");
          router.refresh();
        });
      }}
      className="flex flex-col gap-2"
    >
      <QuickAddFormBusy>
        <input type="hidden" name="trip_id" value={tripId} />
        <input type="hidden" name="status" value={defaultStatus} />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_130px_minmax(0,1fr)_minmax(0,1fr)_120px] lg:items-end">
          <input
            required
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={`+ ${quickAddPlaceholder}...`}
            className="ui-control-input h-11 rounded-xl sm:col-span-2 lg:col-span-1"
          />
          <div className="relative">
            <input type="hidden" name="category" value={category} />
            <button
              type="button"
              className="ui-control-trigger flex h-11 w-full items-center justify-between rounded-xl"
              onClick={() => setCategoryOpen((prev) => !prev)}
            >
              <span className="truncate">{currentLabel}</span>
              <span>▾</span>
            </button>
            {categoryOpen ? (
              <div className="ui-dropdown-panel absolute z-30 max-h-56 w-full overflow-auto p-1">
                {categories.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`ui-dropdown-option block w-full text-left ${category === item.value ? "ui-dropdown-option-active" : ""}`}
                    onClick={() => {
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
          <BrandSelect
            name="brand"
            value={brand}
            onChange={setBrand}
            placeholder={brandLabel}
            optionalHint={brandOptionalHint}
            className="ui-control-trigger flex h-11 w-full items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-xl"
          />
          <input
            name="note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={noteLabel}
            className="ui-control-input h-11 w-full rounded-[10px] text-[13px] sm:col-span-2 lg:col-span-1"
          />
          <div className="w-full sm:max-w-[220px] lg:max-w-none">
            <button
              type="submit"
              disabled={!canAdd || isPending}
              className="brand-btn-primary h-11 w-full px-4 text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "添加中..." : addLabel}
            </button>
          </div>
        </div>
        <p className="text-[12px] text-[#6f6b62]">{lastAdded}</p>
      </QuickAddFormBusy>
    </form>
  );
}
