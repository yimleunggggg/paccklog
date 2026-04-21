"use client";

import { useMemo, useState } from "react";
import { addLockerItemsToTrip } from "@/features/trips/actions";

type LockerItem = {
  id: string;
  name: string;
  category: string | null;
  brand: string | null;
};

type LockerPickerSheetProps = {
  tripId: string;
  buttonLabel: string;
  submitLabel: string;
  items: LockerItem[];
};

export function LockerPickerSheet({ tripId, buttonLabel, submitLabel, items }: LockerPickerSheetProps) {
  const [open, setOpen] = useState(false);
  const grouped = useMemo(() => {
    return items.reduce<Record<string, LockerItem[]>>((acc, item) => {
      const key = item.category || "other";
      acc[key] = [...(acc[key] ?? []), item];
      return acc;
    }, {});
  }, [items]);

  return (
    <>
      <button type="button" className="text-[13px] text-[#3a5c33] underline-offset-2 hover:underline" onClick={() => setOpen(true)}>
        {buttonLabel}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={() => setOpen(false)}>
          <div className="max-h-[75vh] w-full overflow-auto rounded-t-[18px] border border-[#d8d0c4] bg-[#fefcf8] p-4" onClick={(e) => e.stopPropagation()}>
            <form
              action={async (formData) => {
                await addLockerItemsToTrip(formData);
                setOpen(false);
              }}
              className="space-y-4"
            >
              <input type="hidden" name="trip_id" value={tripId} />
              {Object.entries(grouped).map(([group, groupItems], index) => (
                <section key={group}>
                  <div className="section-head">
                    <span className="section-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="section-name">{group.toUpperCase()}</span>
                    <span className="section-count">{groupItems.length}</span>
                  </div>
                  <ul>
                    {groupItems.map((item) => (
                      <li key={item.id} className="item-row item-row-flat">
                        <label className="flex items-start gap-3">
                          <input type="checkbox" name="locker_ids" value={item.id} className="mt-1 h-[17px] w-[17px]" />
                          <span className="min-w-0">
                            <span className="item-title block">{item.name}</span>
                            {item.brand ? (
                              <span className="text-[12px] italic text-[#7b7770]" style={{ fontFamily: "EB Garamond, serif" }}>
                                {item.brand}
                              </span>
                            ) : null}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              <div className="flex justify-end">
                <button type="submit" className="brand-btn-primary px-3 py-2 text-sm">
                  {submitLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
