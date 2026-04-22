"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Pencil } from "lucide-react";
import { updateTripItem } from "@/features/trips/actions";
import { BrandFields } from "@/components/brand-fields";

type ItemEditSheetProps = {
  item: {
    id: string;
    name: string;
    category: string;
    status: string;
    container: string;
    source_locker_id?: string | null;
    brand: string | null;
    brand_alternatives?: string[] | null;
    note: string | null;
  };
  tripId: string;
  statusMeta: Record<string, string>;
  containerMeta: Record<string, string>;
  categoryOptions: Array<{ value: string; label: string }>;
  saveText: string;
  cancelText: string;
  saveToLockerText: string;
  lockerLinkedHintText: string;
  brandPlaceholder: string;
  brandAlternativesPlaceholder: string;
  notePlaceholder: string;
  editLabel: string;
  savePendingText: string;
  saveSuccessText: string;
  saveFailedText: string;
  onSaved?: (item: {
    id: string;
    name: string;
    category: string;
    status: string;
    container: string;
    source_locker_id?: string | null;
    brand: string | null;
    brand_alternatives: string[] | null;
    note: string | null;
  }) => void;
};

export function ItemEditSheet({
  item,
  tripId,
  statusMeta,
  containerMeta,
  categoryOptions,
  saveText,
  cancelText,
  saveToLockerText,
  lockerLinkedHintText,
  brandPlaceholder,
  brandAlternativesPlaceholder,
  notePlaceholder,
  editLabel,
  savePendingText,
  saveSuccessText,
  saveFailedText,
  onSaved,
}: ItemEditSheetProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(item.status);
  const [container, setContainer] = useState(item.container);
  const [category, setCategory] = useState(item.category);
  const isLockerLinked = Boolean(item.source_locker_id);
  const [saveToLocker, setSaveToLocker] = useState(isLockerLinked);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        className="list-row-action-icon"
        aria-label={editLabel}
        title={editLabel}
        onClick={() => setOpen(true)}
      >
        <Pencil size={13} strokeWidth={1.5} className="text-[#6f6b62]" aria-hidden />
      </button>
      {open && typeof window !== "undefined"
        ? createPortal(
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 md:items-center md:justify-center" onClick={() => setOpen(false)}>
          <div className="w-full rounded-t-[18px] border border-[#d8d0c4] bg-[#fefcf8] p-4 md:w-[680px] md:rounded-[16px]" onClick={(e) => e.stopPropagation()}>
            <form
              action={(formData) => {
                setSaveState("idle");
                setSaveError("");
                startTransition(async () => {
                  const result = await updateTripItem(formData);
                  if (!result.ok) {
                    setSaveState("error");
                    setSaveError(result.error ?? "");
                    return;
                  }
                  if (result.item) {
                    onSaved?.(result.item);
                  }
                  setSaveState("saved");
                  window.setTimeout(() => setOpen(false), 260);
                });
              }}
              className="space-y-3"
            >
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="trip_id" value={tripId} />
              <input type="hidden" name="quantity" value="1" />
              <input type="hidden" name="category" value={category} />
              <input type="hidden" name="status" value={status} />
              <input type="hidden" name="container" value={container} />
              <input type="hidden" name="source_locker_id" value={item.source_locker_id ?? ""} />
              <input type="hidden" name="save_to_locker" value={saveToLocker ? "true" : "false"} />
              <input
                name="name"
                defaultValue={item.name}
                className="h-11 w-full rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] px-3 text-sm"
              />
              <div className="h-px w-full bg-[#e7e1d6]" />
              <div className="space-y-2">
                <p className="text-[12px] text-[#6f6b62]">行李状态</p>
              <div className="flex flex-wrap gap-2">
                {(["to_pack", "to_buy", "optional", "packed"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`brand-chip ${status === v ? "brand-chip-active" : ""}`}
                    onClick={() => setStatus(v)}
                  >
                    {statusMeta[v]}
                  </button>
                ))}
              </div>
              </div>
              <div className="space-y-2">
                <p className="text-[12px] text-[#6f6b62]">放置位置</p>
              <div className="flex flex-wrap gap-2">
                {(["suitcase", "backpack", "carry_on", "wear"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`brand-chip ${container === v ? "brand-chip-active" : ""}`}
                    onClick={() => setContainer(v)}
                  >
                    {containerMeta[v]}
                  </button>
                ))}
              </div>
              </div>
              <div className="space-y-2">
                <p className="text-[12px] text-[#6f6b62]">物品分类</p>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`brand-chip ${category === option.value ? "brand-chip-active" : ""}`}
                    onClick={() => setCategory(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              </div>
              <div className="h-px w-full bg-[#e7e1d6]" />
              <BrandFields
                initialBrand={item.brand ?? ""}
                initialAlternatives={item.brand_alternatives ?? []}
                brandPlaceholder={brandPlaceholder}
                alternativesPlaceholder={brandAlternativesPlaceholder}
              />
              <div className="space-y-1">
                <p className="text-[12px] text-[#6f6b62]">{notePlaceholder}</p>
                <input
                  name="note"
                  defaultValue={item.note ?? ""}
                  placeholder={notePlaceholder}
                  className="ui-control-input h-10 w-full rounded-[10px] px-3 text-[13px]"
                />
              </div>
              {isLockerLinked ? (
                <p className="text-[12px] text-[#3a5c33]">{lockerLinkedHintText}</p>
              ) : (
                <label className="flex items-center gap-2 text-sm text-[#4a4840]">
                  <input className="ui-round-check" type="checkbox" checked={saveToLocker} onChange={(event) => setSaveToLocker(event.target.checked)} />
                  {saveToLockerText}
                </label>
              )}
              <div className="flex items-center justify-end gap-2">
                <p className="mr-auto text-[12px] text-[#7a766d]">
                  {saveState === "saved"
                    ? (isPending ? "" : saveSuccessText)
                    : saveState === "error"
                      ? `${saveFailedText}${saveError ? `：${saveError}` : ""}`
                      : ""}
                </p>
                <button type="button" className="brand-btn-soft px-3 py-2 text-[12px]" onClick={() => setOpen(false)}>
                  {cancelText}
                </button>
                <button type="submit" className="brand-btn-primary px-3 py-2 text-[12px]" disabled={isPending}>
                  {isPending ? savePendingText : saveText}
                </button>
              </div>
            </form>
          </div>
        </div>
          , document.body)
        : null}
    </>
  );
}
