"use client";

import { useMemo, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { deleteTripItem, reorderTripItemsByIds, setTripItemReview, toggleTripItemPacked } from "@/features/trips/actions";
import { ItemEditSheet } from "@/components/item-edit-sheet";

type TripItem = {
  id: string;
  name: string;
  category: string;
  status: string;
  container: string;
  brand: string | null;
  brand_alternatives: string[] | null;
  note: string | null;
  review_result: string | null;
};

type SortableTripGroupProps = {
  items: TripItem[];
  tripId: string;
  group: string;
  scopeField: "category" | "container";
  mode: "detail" | "compact";
  lang: "zh-CN" | "zh-TW" | "en";
  statusMeta: Record<string, string>;
  containerMeta: Record<string, string>;
  priorityMeta: Record<string, string>;
  saveText: string;
  cancelText: string;
  saveToLockerText: string;
  brandPlaceholder: string;
  brandAlternativesPlaceholder: string;
  notePlaceholder: string;
  editLabel: string;
  tripStatus?: string | null;
  reviewLabels: Array<{ value: string; label: string }>;
};

export function SortableTripGroup({
  items,
  tripId,
  group,
  scopeField,
  mode,
  lang,
  statusMeta,
  containerMeta,
  priorityMeta,
  saveText,
  cancelText,
  saveToLockerText,
  brandPlaceholder,
  brandAlternativesPlaceholder,
  notePlaceholder,
  editLabel,
  tripStatus,
  reviewLabels,
}: SortableTripGroupProps) {
  const [orderedItems, setOrderedItems] = useState(items);
  const [draggingId, setDraggingId] = useState<string>("");
  const [swipedId, setSwipedId] = useState<string>("");
  const touchStartX = useRef(0);

  const canReview = tripStatus === "done" || tripStatus === "completed";

  const itemsById = useMemo(() => {
    return new Map(orderedItems.map((item) => [item.id, item]));
  }, [orderedItems]);

  return (
    <ul>
      {orderedItems.map((item) => (
        <li key={item.id} className={`item-row item-row-flat ${item.status === "packed" ? "item-row-packed" : "item-row-unpacked"} ${mode === "compact" ? "item-row-compact" : ""}`}>
          <div className="relative overflow-hidden">
            <form action={deleteTripItem} className="absolute inset-y-0 right-0 z-0 flex items-center pr-1">
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="trip_id" value={tripId} />
              <button type="submit" className="h-9 rounded-[10px] bg-[#9b6a2a] px-3 text-xs text-white">
                {lang === "en" ? "Delete" : lang === "zh-TW" ? "刪除" : "删除"}
              </button>
            </form>

            <div
              className="relative z-10 bg-[#f4f1ec] transition-transform"
              style={{ transform: swipedId === item.id ? "translateX(-84px)" : "translateX(0)" }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={async () => {
                if (!draggingId || draggingId === item.id) return;
                const next = [...orderedItems];
                const from = next.findIndex((v) => v.id === draggingId);
                const to = next.findIndex((v) => v.id === item.id);
                if (from < 0 || to < 0) return;
                const [moved] = next.splice(from, 1);
                next.splice(to, 0, moved);
                setOrderedItems(next);

                const formData = new FormData();
                formData.set("trip_id", tripId);
                formData.set("dragged_id", draggingId);
                formData.set("target_id", item.id);
                formData.set("scope_field", scopeField);
                formData.set("scope_value", group);
                await reorderTripItemsByIds(formData);
              }}
              onTouchStart={(e) => {
                touchStartX.current = e.touches[0]?.clientX ?? 0;
              }}
              onTouchEnd={(e) => {
                const endX = e.changedTouches[0]?.clientX ?? 0;
                const diff = endX - touchStartX.current;
                if (diff < -36) setSwipedId(item.id);
                if (diff > 24) setSwipedId("");
              }}
            >
              <div className="item-top">
                <form action={toggleTripItemPacked} className="item-main">
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="trip_id" value={tripId} />
                  <input type="hidden" name="next_status" value={item.status === "packed" ? "to_pack" : "packed"} />
                  <button type="submit" className="flex w-full min-w-0 items-center gap-2 text-left">
                    <span className={`inline-flex h-[17px] w-[17px] items-center justify-center rounded-full border text-[10px] ${item.status === "packed" ? "border-[#3a5c33] bg-[#3a5c33] text-white" : "border-[#c8c5bd] bg-transparent text-[#8c8880]"}`}>
                      {item.status === "packed" ? "✓" : ""}
                    </span>
                    <span className="item-title break-keep">{item.name}</span>
                  </button>
                </form>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    draggable
                    onDragStart={() => setDraggingId(item.id)}
                    className="item-edit-btn drag-handle-btn h-9 w-9 px-0 text-[#8c8880]"
                    aria-label={lang === "en" ? "Drag to reorder" : lang === "zh-TW" ? "拖曳排序" : "拖动排序"}
                    title={lang === "en" ? "Drag to reorder" : lang === "zh-TW" ? "拖曳排序" : "拖动排序"}
                  >
                    <GripVertical size={14} />
                  </button>
                  <ItemEditSheet
                    item={{ id: item.id, name: item.name, category: item.category, status: item.status, container: item.container, brand: item.brand, note: item.note }}
                    tripId={tripId}
                    statusMeta={statusMeta}
                    containerMeta={containerMeta}
                    saveText={saveText}
                    cancelText={cancelText}
                    saveToLockerText={saveToLockerText}
                    brandPlaceholder={brandPlaceholder}
                    brandAlternativesPlaceholder={brandAlternativesPlaceholder}
                    notePlaceholder={notePlaceholder}
                    editLabel={editLabel}
                  />
                </div>
              </div>

              <div className="item-meta-block w-full">
                {mode === "detail" && item.brand ? (
                  <p className="item-brand-line text-[13px] italic text-[#7b7770]" style={{ fontFamily: "EB Garamond, serif" }}>
                    {lang === "en" ? "Brand · " : lang === "zh-TW" ? "品牌 · " : "品牌 · "}
                    {item.brand}
                    {item.brand_alternatives?.length ? ` / ${item.brand_alternatives.join(" / ")}` : ""}
                  </p>
                ) : null}
                {mode === "detail" && item.note ? (
                  <p className="item-note-line text-[11px] text-[#6b695f]">
                    {lang === "en" ? "Note · " : lang === "zh-TW" ? "備註 · " : "备注 · "}
                    {item.note}
                  </p>
                ) : null}
                <div className="item-tag-row flex flex-wrap gap-2">
                  <span className={`status-tag ${item.status === "to_pack" || item.status === "packed" ? "status-tag-must" : item.status === "to_buy" ? "status-tag-buy" : "status-tag-optional"}`}>
                    {priorityMeta[item.status] ?? (lang === "en" ? "Priority" : lang === "zh-TW" ? "優先級" : "优先级")}
                  </span>
                  <span className="status-tag status-tag-container">
                    {containerMeta[item.container] ?? item.container}
                  </span>
                  <span className={`status-tag ${item.status === "to_pack" || item.status === "packed" ? "status-tag-must" : item.status === "to_buy" ? "status-tag-buy" : "status-tag-optional"}`}>
                    {item.status === "packed" ? `✓ ${statusMeta[item.status] ?? item.status}` : statusMeta[item.status] ?? item.status}
                  </span>
                </div>
                {canReview ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {reviewLabels.map((r) => (
                      <form key={r.value} action={setTripItemReview}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="trip_id" value={tripId} />
                        <button
                          type="submit"
                          name="review_result"
                          value={r.value}
                          className={`status-tag status-tag-container ${itemsById.get(item.id)?.review_result === r.value ? "ring-1 ring-[#6b9460]" : ""}`}
                        >
                          {r.label}
                        </button>
                      </form>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
