"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { PencilLine } from "lucide-react";
import { updateTripItem } from "@/features/trips/actions";
import { BrandFields } from "@/components/brand-fields";

type ItemEditSheetProps = {
  item: {
    id: string;
    name: string;
    category: string;
    status: string;
    container: string;
    brand: string | null;
    note: string | null;
  };
  tripId: string;
  statusMeta: Record<string, string>;
  containerMeta: Record<string, string>;
  saveText: string;
  cancelText: string;
  saveToLockerText: string;
  brandPlaceholder: string;
  brandAlternativesPlaceholder: string;
  notePlaceholder: string;
  editLabel: string;
};

export function ItemEditSheet({
  item,
  tripId,
  statusMeta,
  containerMeta,
  saveText,
  cancelText,
  saveToLockerText,
  brandPlaceholder,
  brandAlternativesPlaceholder,
  notePlaceholder,
  editLabel,
}: ItemEditSheetProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(item.status === "packed" ? "to_pack" : item.status);
  const [container, setContainer] = useState(item.container);
  const [saveToLocker, setSaveToLocker] = useState(false);

  return (
    <>
      <button
        type="button"
        className="item-edit-btn h-9 w-9 px-0 text-[#6f6b62]"
        aria-label={editLabel}
        title={editLabel}
        onClick={() => setOpen(true)}
      >
        <PencilLine size={14} />
      </button>
      {open && typeof window !== "undefined"
        ? createPortal(
        <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={() => setOpen(false)}>
          <div className="w-full rounded-t-[18px] border border-[#d8d0c4] bg-[#fefcf8] p-4" onClick={(e) => e.stopPropagation()}>
            <form
              action={async (formData) => {
                await updateTripItem(formData);
                setOpen(false);
              }}
              className="space-y-3"
            >
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="trip_id" value={tripId} />
              <input type="hidden" name="quantity" value="1" />
              <input type="hidden" name="category" value={item.category} />
              <input type="hidden" name="status" value={status} />
              <input type="hidden" name="container" value={container} />
              <input type="hidden" name="save_to_locker" value={saveToLocker ? "true" : "false"} />
              <input
                name="name"
                defaultValue={item.name}
                className="h-11 w-full rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] px-3 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                {(["to_pack", "to_buy", "optional"] as const).map((v) => (
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
              <BrandFields
                initialBrand={item.brand ?? ""}
                initialAlternatives={[]}
                brandPlaceholder={brandPlaceholder}
                alternativesPlaceholder={brandAlternativesPlaceholder}
              />
              <input
                name="note"
                defaultValue={item.note ?? ""}
                placeholder={notePlaceholder}
                className="h-10 w-full rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] px-3 text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-[#4a4840]">
                <input type="checkbox" checked={saveToLocker} onChange={(event) => setSaveToLocker(event.target.checked)} />
                {saveToLockerText}
              </label>
              <div className="flex items-center justify-end gap-2">
                <button type="button" className="brand-btn-soft px-3 py-2 text-sm" onClick={() => setOpen(false)}>
                  {cancelText}
                </button>
                <button type="submit" className="brand-btn-primary px-3 py-2 text-sm">
                  {saveText}
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
