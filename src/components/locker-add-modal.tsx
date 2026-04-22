"use client";

import { useState } from "react";
import { LockerAddForm } from "@/components/locker-add-form";

type LockerAddModalProps = {
  title: string;
  closeText: string;
  openText: string;
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

export function LockerAddModal(props: LockerAddModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="brand-btn-primary px-4 py-2 text-[12px]">
        {props.openText}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 md:items-center md:justify-center" onClick={() => setOpen(false)}>
          <div
            className="w-full rounded-t-[18px] border border-[#d8d0c4] bg-[#fefcf8] p-4 md:w-[760px] md:rounded-[18px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[20px] text-[#1c1c18]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>
                {props.title}
              </p>
              <button type="button" className="brand-btn-soft px-3 py-1.5 text-[12px]" onClick={() => setOpen(false)}>
                {props.closeText}
              </button>
            </div>
            <LockerAddForm
              itemNameLabel={props.itemNameLabel}
              brandLabel={props.brandLabel}
              brandOptionalHint={props.brandOptionalHint}
              categoryLabel={props.categoryLabel}
              categoryOptions={props.categoryOptions}
              noteLabel={props.noteLabel}
              addLabel={props.addLabel}
              ownedLabel={props.ownedLabel}
              wishlistLabel={props.wishlistLabel}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
