"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteLockerItem, updateLockerItem } from "@/features/locker/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { BrandSelect } from "@/components/brand-select";

type LockerItemEditorProps = {
  item: {
    id: string;
    name: string;
    category: string | null;
    brand: string | null;
    note: string | null;
    status: string;
    times_used: number | null;
  };
  editText: string;
  saveText: string;
  cancelText: string;
  deleteText: string;
  confirmText: string;
  ownedText: string;
  wishlistText: string;
  itemNameLabel: string;
  brandLabel: string;
  brandOptionalHint: string;
  categoryLabel: string;
  categoryOptions: Array<{ value: string; label: string }>;
  noteLabel: string;
  statusLabel: string;
};

export function LockerItemEditor({
  item,
  editText,
  saveText,
  cancelText,
  deleteText,
  confirmText,
  ownedText,
  wishlistText,
  itemNameLabel,
  brandLabel,
  brandOptionalHint,
  categoryLabel,
  categoryOptions,
  noteLabel,
  statusLabel,
}: LockerItemEditorProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"owned" | "wishlist">(item.status === "wishlist" ? "wishlist" : "owned");
  const [category, setCategory] = useState(item.category ?? "other");
  const [brand, setBrand] = useState(item.brand ?? "");

  return (
    <div className="flex items-center gap-1">
      <button type="button" className="locker-item-action-icon" aria-label={editText} title={editText} onClick={() => setOpen((v) => !v)}>
        <Pencil size={13} strokeWidth={1.5} className="text-[#6f6b62]" aria-hidden />
      </button>
      <form action={deleteLockerItem}>
        <input type="hidden" name="id" value={item.id} />
        <ConfirmSubmitButton className="locker-item-action-icon text-[#9b6a2a]" ariaLabel={deleteText} confirmText={confirmText} cancelText={cancelText} okText={deleteText}>
          <span className="inline-flex items-center justify-center" aria-label={deleteText}>
            <Trash2 size={13} strokeWidth={1.5} aria-hidden />
          </span>
        </ConfirmSubmitButton>
      </form>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={() => setOpen(false)}>
          <div className="w-full rounded-t-[18px] border border-[#d8d0c4] bg-[#fefcf8] p-4" onClick={(e) => e.stopPropagation()}>
            <form
              action={async (formData) => {
                await updateLockerItem(formData);
                setOpen(false);
              }}
              className="space-y-2"
            >
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="status" value={status} />
              <input type="hidden" name="category" value={category} />
              <div className="space-y-1">
                <p className="text-[12px] text-[#7a766d]">{itemNameLabel}</p>
                <input name="name" defaultValue={item.name} required placeholder={itemNameLabel} className="ui-control-input w-full" />
              </div>
              <div className="space-y-1">
                <p className="text-[12px] text-[#7a766d]">{brandLabel}</p>
                <BrandSelect
                  name="brand"
                  value={brand}
                  onChange={setBrand}
                  placeholder={brandLabel}
                  optionalHint={brandOptionalHint}
                  className="ui-control-trigger h-10 w-full rounded-[10px] px-3 text-[13px]"
                />
              </div>
              <div className="space-y-1">
                <p className="text-[12px] text-[#7a766d]">{categoryLabel}</p>
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
              <div className="space-y-1">
                <p className="text-[12px] text-[#7a766d]">{noteLabel}</p>
                <input name="note" defaultValue={item.note ?? ""} placeholder={noteLabel} className="ui-control-input w-full" />
              </div>
              <div className="space-y-1">
                <p className="text-[12px] text-[#7a766d]">{statusLabel}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStatus("owned")} className={`brand-chip ${status === "owned" ? "brand-chip-active" : ""}`}>
                  {ownedText}
                </button>
                <button type="button" onClick={() => setStatus("wishlist")} className={`brand-chip ${status === "wishlist" ? "brand-chip-active" : ""}`}>
                  {wishlistText}
                </button>
              </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="brand-btn-soft px-3 py-2 text-[12px]" onClick={() => setOpen(false)}>
                  {cancelText}
                </button>
                <button type="submit" className="brand-btn-primary px-3 py-2 text-[12px]">
                  {saveText}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
