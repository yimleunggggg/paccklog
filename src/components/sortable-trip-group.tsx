"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { bulkOperateTripItems, deleteTripItem, reorderTripItemsByIds, setTripItemReview, toggleTripItemPacked } from "@/features/trips/actions";
import { ItemEditSheet } from "@/components/item-edit-sheet";
import { pickLangText } from "@/shared/localized-text";

type TripItem = {
  id: string;
  name: string;
  category: string;
  status: string;
  last_status_before_packed?: string | null;
  source_locker_id?: string | null;
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
  scopeField: "category" | "container" | "all";
  mode: "detail" | "compact";
  lang: "zh-CN" | "zh-TW" | "en";
  statusMeta: Record<string, string>;
  containerMeta: Record<string, string>;
  categoryMeta: Record<string, string>;
  categoryOptions: Array<{ value: string; label: string }>;
  showCategoryTag?: boolean;
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
  categoryMeta,
  categoryOptions,
  showCategoryTag = false,
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
  tripStatus,
  reviewLabels,
}: SortableTripGroupProps) {
  const router = useRouter();
  const [, startRefresh] = useTransition();
  const [orderedItems, setOrderedItems] = useState(items);
  const [draggingId, setDraggingId] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [togglingPackedIds, setTogglingPackedIds] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ mode: "single"; itemId: string } | { mode: "bulk" } | null>(null);
  const validSelectedIds = useMemo(
    () => selectedIds.filter((id) => orderedItems.some((item) => item.id === id)),
    [selectedIds, orderedItems],
  );

  const softRefresh = () => {
    startRefresh(() => router.refresh());
  };
  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const canReview = tripStatus === "done" || tripStatus === "completed";
  const l = (en: string, zhTW: string, zhCN: string) => pickLangText(lang, { en, zhTW, zhCN });

  const itemsById = useMemo(() => {
    return new Map(orderedItems.map((item) => [item.id, item]));
  }, [orderedItems]);

  async function handleTogglePacked(row: TripItem) {
    if (togglingPackedIds.includes(row.id)) return;
    const nextStatus = row.status === "packed" ? (row.last_status_before_packed || "to_pack") : "packed";
    const snapshot = orderedItems;
    setTogglingPackedIds((prev) => [...prev, row.id]);
    setOrderedItems((prev) =>
      prev.map((entry) => (entry.id === row.id ? { ...entry, status: nextStatus } : entry)),
    );
    const fd = new FormData();
    fd.set("id", row.id);
    fd.set("trip_id", tripId);
    fd.set("next_status", nextStatus);
    const result = await toggleTripItemPacked(fd);
    if (!result.ok) {
      setOrderedItems(snapshot);
    } else {
      if (result.item) {
        setOrderedItems((prev) =>
          prev.map((entry) =>
            entry.id === row.id
              ? {
                  ...entry,
                  status: result.item?.status ?? entry.status,
                  last_status_before_packed: result.item?.last_status_before_packed ?? entry.last_status_before_packed ?? null,
                }
              : entry,
          ),
        );
      }
    }
    setTogglingPackedIds((prev) => prev.filter((id) => id !== row.id));
  }

  async function confirmSingleDelete(itemId: string) {
    const row = orderedItems.find((entry) => entry.id === itemId);
    if (!row) return;
    const snapshot = orderedItems;
    setOrderedItems((prev) => prev.filter((entry) => entry.id !== row.id));
    const fd = new FormData();
    fd.set("id", row.id);
    fd.set("trip_id", tripId);
    const result = await deleteTripItem(fd);
    if (!result.ok) setOrderedItems(snapshot);
    else softRefresh();
  }

  async function handleReviewPick(row: TripItem, reviewValue: string) {
    setOrderedItems((prev) =>
      prev.map((entry) => (entry.id === row.id ? { ...entry, review_result: reviewValue } : entry)),
    );
    const fd = new FormData();
    fd.set("id", row.id);
    fd.set("trip_id", tripId);
    fd.set("review_result", reviewValue);
    await setTripItemReview(fd);
    softRefresh();
  }

  async function handleBulk(action: "delete" | "set_container" | "set_status" | "save_to_locker", value?: string) {
    if (!validSelectedIds.length) return;
    const fd = new FormData();
    fd.set("trip_id", tripId);
    fd.set("action", action);
    validSelectedIds.forEach((id) => fd.append("item_ids", id));
    if (action === "set_container" && value) fd.set("container", value);
    if (action === "set_status" && value) fd.set("status", value);
    const result = await bulkOperateTripItems(fd);
    if (result.ok) {
      setSelectedIds([]);
      softRefresh();
    }
  }

  async function handleDeleteConfirm() {
    const pending = deleteConfirm;
    setDeleteConfirm(null);
    if (!pending) return;
    if (pending.mode === "single") {
      await confirmSingleDelete(pending.itemId);
      return;
    }
    await handleBulk("delete");
  }

  const deleteConfirmText =
    deleteConfirm?.mode === "bulk"
      ? l("Delete selected items?", "確定刪除選中物品？", "确认删除选中物品？")
      : l("Delete this item?", "確定刪除這個物品？", "确认删除这个物品？");

  return (
    <>
    <ul>
      {orderedItems.length > 0 ? (
        <li className="trip-bulk-bar mb-2 flex flex-wrap items-center gap-2 text-[12px] text-[#6f6b62]">
          <button
            type="button"
            className="brand-chip"
            onClick={() =>
              setSelectedIds(() =>
                validSelectedIds.length === orderedItems.length ? [] : orderedItems.map((item) => item.id),
              )
            }
          >
            {l("Select all", "全選", "全选")}
          </button>
          <button type="button" className="brand-chip" onClick={() => setSelectedIds([])}>
            {l("Clear", "清除", "清空")}
          </button>
          <span>{l(`Selected ${validSelectedIds.length}`, `已選 ${validSelectedIds.length}`, `已选 ${validSelectedIds.length}`)}</span>
          <button type="button" className="brand-chip" onClick={() => setDeleteConfirm({ mode: "bulk" })}>
            {l("Delete", "刪除", "删除")}
          </button>
          <button type="button" className="brand-chip" onClick={() => handleBulk("save_to_locker")}>
            {l("Save to locker", "加入裝備庫", "加入装备库")}
          </button>
          <div className="ml-auto flex items-center gap-2">
          <select className="ui-control-input ui-native-select h-8 min-w-[150px] text-[12px]" defaultValue="" onChange={(e) => { if (e.target.value) void handleBulk("set_status", e.target.value); }}>
            <option value="">{l("Set status...", "狀態批量...", "状态批量...")}</option>
            <option value="to_pack">{statusMeta.to_pack ?? "to_pack"}</option>
            <option value="to_buy">{statusMeta.to_buy ?? "to_buy"}</option>
            <option value="optional">{statusMeta.optional ?? "optional"}</option>
            <option value="packed">{statusMeta.packed ?? "packed"}</option>
          </select>
          <select className="ui-control-input ui-native-select h-8 min-w-[146px] text-[12px]" defaultValue="" onChange={(e) => { if (e.target.value) void handleBulk("set_container", e.target.value); }}>
            <option value="">{l("Move to...", "移動到...", "移动到...")}</option>
            <option value="undecided">{containerMeta.undecided ?? "undecided"}</option>
            <option value="suitcase">{containerMeta.suitcase ?? "suitcase"}</option>
            <option value="backpack">{containerMeta.backpack ?? "backpack"}</option>
            <option value="carry_on">{containerMeta.carry_on ?? "carry_on"}</option>
            <option value="wear">{containerMeta.wear ?? "wear"}</option>
          </select>
          </div>
        </li>
      ) : null}
      {orderedItems.map((item) => (
        <li
          key={item.id}
          className={`item-row item-row-flat trip-item-row ${item.status === "packed" ? "item-row-packed" : "item-row-unpacked"} ${mode === "compact" ? "item-row-compact" : ""} ${validSelectedIds.includes(item.id) ? "ring-1 ring-[#6b9460]" : ""}`}
        >
          <div className="trip-checklist-surface relative bg-transparent" onDragOver={(e) => e.preventDefault()} onDrop={async () => {
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
              formData.set("scope_value", group === "all_items" ? "" : group);
            await reorderTripItemsByIds(formData);
            softRefresh();
          }}>
              <div className="item-top">
                <div className="item-main">
                  <div className="flex w-full min-w-0 items-center gap-2 text-left">
                    <input
                      type="checkbox"
                      checked={validSelectedIds.includes(item.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelected(item.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="ui-round-check"
                      aria-label={l("Select item", "選擇物品", "选择物品")}
                    />
                    <button type="button" className="item-title break-keep text-left" onClick={() => toggleSelected(item.id)}>
                      {item.name}
                    </button>
                  </div>
                </div>
                <div className="trip-item-actions flex items-center gap-1">
                  <button
                    type="button"
                    draggable
                    onDragStart={() => setDraggingId(item.id)}
                    className="list-row-action-icon drag-handle-btn"
                    aria-label={l("Drag to reorder", "拖曳排序", "拖动排序")}
                    title={l("Drag to reorder", "拖曳排序", "拖动排序")}
                  >
                    <GripVertical size={13} strokeWidth={1.5} className="text-[#8a8680]" aria-hidden />
                  </button>
                  <ItemEditSheet
                    item={{ id: item.id, name: item.name, category: item.category, status: item.status, container: item.container, source_locker_id: item.source_locker_id, brand: item.brand, brand_alternatives: item.brand_alternatives, note: item.note }}
                    tripId={tripId}
                    statusMeta={statusMeta}
                    containerMeta={containerMeta}
                    categoryOptions={categoryOptions}
                    saveText={saveText}
                    cancelText={cancelText}
                    saveToLockerText={saveToLockerText}
                    lockerLinkedHintText={lockerLinkedHintText}
                    brandPlaceholder={brandPlaceholder}
                    brandAlternativesPlaceholder={brandAlternativesPlaceholder}
                    notePlaceholder={notePlaceholder}
                    editLabel={editLabel}
                    savePendingText={savePendingText}
                    saveSuccessText={saveSuccessText}
                    saveFailedText={saveFailedText}
                    onSaved={(updatedItem) => {
                      setOrderedItems((prev) =>
                        prev.map((entry) => (entry.id === updatedItem.id ? { ...entry, ...updatedItem } : entry)),
                      );
                    }}
                  />
                  <button
                    type="button"
                    className="list-row-action-icon"
                    onClick={() => setDeleteConfirm({ mode: "single", itemId: item.id })}
                    aria-label={l("Delete item", "刪除物品", "删除物品")}
                    title={l("Delete item", "刪除物品", "删除物品")}
                  >
                    <Trash2 size={13} strokeWidth={1.5} className="text-[#8a4f39]" aria-hidden />
                  </button>
                </div>
              </div>

              <div className="item-meta-block w-full">
                {mode === "detail" && item.brand ? (
                  <p className="item-brand-line text-[13px] italic text-[#7b7770]" style={{ fontFamily: "EB Garamond, serif" }}>
                    {item.brand}
                    {item.brand_alternatives?.length ? ` / ${item.brand_alternatives.join(" / ")}` : ""}
                  </p>
                ) : null}
                {mode === "detail" && item.note ? (
                  <p className="item-note-line item-manual-note-line text-[11px]">
                    {item.note}
                  </p>
                ) : null}
                <div className="item-tag-row flex flex-wrap gap-2">
                  {item.source_locker_id ? (
                    <span className="status-tag status-tag-container">
                      {l("Source: Gear locker", "來源：裝備庫", "来源：装备库")}
                    </span>
                  ) : null}
                  {showCategoryTag ? (
                    <span className="status-tag status-tag-container">
                      {l("Category: ", "分類：", "分类：")}
                      {categoryMeta[item.category] ?? item.category}
                    </span>
                  ) : null}
                  <span className="status-tag status-tag-container">
                    {l("Location: ", "位置：", "位置：")}
                    {containerMeta[item.container] ?? item.container}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTogglePacked(item)}
                    className={`status-tag ${item.status === "to_pack" || item.status === "packed" ? "status-tag-must" : item.status === "to_buy" ? "status-tag-buy" : "status-tag-optional"}`}
                  >
                    {l("Status: ", "狀態：", "状态：")}
                    {item.status === "packed" ? `✓ ${statusMeta[item.status] ?? item.status}` : statusMeta[item.status] ?? item.status}
                  </button>
                </div>
                {canReview ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {reviewLabels.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => handleReviewPick(item, r.value)}
                        className={`status-tag status-tag-container ${itemsById.get(item.id)?.review_result === r.value ? "ring-1 ring-[#6b9460]" : ""}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
          </div>
        </li>
      ))}
    </ul>
    {deleteConfirm ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4" role="dialog" aria-modal="true">
        <div className="w-full max-w-sm rounded-[14px] border border-[#d8d0c4] bg-[#fefcf8] p-4">
          <p className="text-[16px] text-[#1f1f1b]">{deleteConfirmText}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className="brand-btn-soft px-3 py-2 text-[12px]" onClick={() => setDeleteConfirm(null)}>
              {l("Cancel", "取消", "取消")}
            </button>
            <button type="button" className="brand-btn-primary px-3 py-2 text-[12px]" onClick={() => void handleDeleteConfirm()}>
              {l("Confirm", "確定", "确定")}
            </button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
