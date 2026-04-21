"use client";

import { useState } from "react";
import { deleteLockerItem, updateLockerItem } from "@/features/locker/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

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
  categoryLabel: string;
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
  categoryLabel,
  noteLabel,
  statusLabel,
}: LockerItemEditorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <button type="button" className="item-edit-btn px-2 py-1 text-xs" onClick={() => setOpen((v) => !v)}>
        {editText}
      </button>
      <form action={deleteLockerItem}>
        <input type="hidden" name="id" value={item.id} />
        <ConfirmSubmitButton className="item-edit-btn px-2 py-1 text-xs text-[#9b6a2a]" confirmText={confirmText} cancelText={cancelText} okText={deleteText}>
          🗑
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
              <div className="space-y-1">
                <p className="text-[12px] text-[#7a766d]">{itemNameLabel}</p>
                <input name="name" defaultValue={item.name} required placeholder={itemNameLabel} className="h-10 w-full rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <p className="text-[12px] text-[#7a766d]">{brandLabel}</p>
                <input name="brand" defaultValue={item.brand ?? ""} placeholder={brandLabel} className="h-10 w-full rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <p className="text-[12px] text-[#7a766d]">{categoryLabel}</p>
                <input name="category" defaultValue={item.category ?? ""} placeholder={categoryLabel} className="h-10 w-full rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <p className="text-[12px] text-[#7a766d]">{noteLabel}</p>
                <input name="note" defaultValue={item.note ?? ""} placeholder={noteLabel} className="h-10 w-full rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <p className="text-[12px] text-[#7a766d]">{statusLabel}</p>
              <div className="flex gap-2">
                <button type="submit" name="status" value="owned" className={`brand-chip ${item.status === "owned" ? "brand-chip-active" : ""}`}>
                  {ownedText}
                </button>
                <button type="submit" name="status" value="wishlist" className={`brand-chip ${item.status === "wishlist" ? "brand-chip-active" : ""}`}>
                  {wishlistText}
                </button>
              </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
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
      ) : null}
    </div>
  );
}
