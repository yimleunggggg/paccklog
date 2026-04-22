"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  defaultStatus?: "to_pack" | "to_buy" | "optional" | "packed";
};

export function LockerPickerSheet({ tripId, buttonLabel, submitLabel, items, defaultStatus = "to_pack" }: LockerPickerSheetProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetStatus, setTargetStatus] = useState<"to_pack" | "to_buy" | "optional" | "packed">(defaultStatus);
  const [targetContainer, setTargetContainer] = useState<"undecided" | "suitcase" | "backpack" | "carry_on" | "wear">("undecided");
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const grouped = useMemo(() => {
    return items.reduce<Record<string, LockerItem[]>>((acc, item) => {
      const key = item.category || "other";
      acc[key] = [...(acc[key] ?? []), item];
      return acc;
    }, {});
  }, [items]);

  return (
    <>
      <button
        type="button"
        className="text-[13px] text-[#3a5c33] underline-offset-2 hover:underline"
        onClick={() => {
          setFeedback(null);
          setOpen(true);
        }}
      >
        {buttonLabel}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={() => setOpen(false)}>
          <div className="max-h-[75vh] w-full overflow-auto rounded-t-[18px] border border-[#d8d0c4] bg-[#fefcf8] p-4" onClick={(e) => e.stopPropagation()}>
            <form
              action={(formData) => {
                startTransition(async () => {
                  setFeedback(null);
                  const result = await addLockerItemsToTrip(formData);
                  if (!result?.ok) {
                    setFeedback({ type: "error", message: result?.error ? `导入失败：${result.error}` : "导入失败，请重试" });
                    return;
                  }
                  if (result.count === 0) {
                    setFeedback({ type: "ok", message: "没有新增：所选物品已在当前行程中" });
                    return;
                  }
                  setFeedback({ type: "ok", message: `已导入 ${result.count} 项` });
                  setSelectedIds([]);
                  window.setTimeout(() => setOpen(false), 450);
                  router.refresh();
                });
              }}
              className="space-y-4"
            >
              <input type="hidden" name="trip_id" value={tripId} />
              <input type="hidden" name="target_status" value={targetStatus} />
              <input type="hidden" name="target_container" value={targetContainer} />
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="brand-chip" onClick={() => setSelectedIds(items.map((item) => item.id))}>全选</button>
                <button type="button" className="brand-chip" onClick={() => setSelectedIds([])}>清空</button>
                <span className="text-[12px] text-[#6f6b62]">已选 {selectedIds.length}</span>
              </div>
              <div className="rounded-[10px] border border-[#e2dbcf] bg-[#fbf9f4] p-2.5">
                <div className="mb-2 text-[12px] text-[#6f6b62]">导入设置（应用到本次选中的物品）</div>
              <div className="flex flex-wrap items-center gap-2 text-[12px]">
                <span className="text-[#8c8880]">默认状态：</span>
                {[
                  { key: "to_pack", label: "待打包" },
                  { key: "to_buy", label: "待购买" },
                  { key: "optional", label: "再说" },
                  { key: "packed", label: "已打包" },
                ].map((opt) => (
                  <button key={opt.key} type="button" className={`brand-chip ${targetStatus === opt.key ? "brand-chip-active" : ""}`} onClick={() => setTargetStatus(opt.key as typeof targetStatus)}>
                    {opt.label}
                  </button>
                ))}
                <span className="ml-2 text-[#8c8880]">默认位置：</span>
                <select value={targetContainer} onChange={(e) => setTargetContainer(e.target.value as typeof targetContainer)} className="ui-control-input ui-native-select h-9 min-w-[170px] text-[12px]">
                  <option value="undecided">未分类</option>
                  <option value="suitcase">托运行李箱</option>
                  <option value="backpack">背包</option>
                  <option value="carry_on">随身包</option>
                  <option value="wear">身上穿戴</option>
                </select>
              </div>
              </div>
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
                          <input
                            type="checkbox"
                            name="locker_ids"
                            value={item.id}
                            checked={selectedIds.includes(item.id)}
                            onChange={(e) => {
                              setSelectedIds((prev) =>
                                e.target.checked
                                  ? (prev.includes(item.id) ? prev : [...prev, item.id])
                                  : prev.filter((id) => id !== item.id),
                              );
                            }}
                            className="ui-round-check mt-0.5"
                          />
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
              <div className="flex items-center justify-end gap-2">
                {feedback ? (
                  <p className={`mr-auto text-[12px] ${feedback.type === "ok" ? "text-[#3a5c33]" : "text-[#9b4b35]"}`}>{feedback.message}</p>
                ) : null}
                <button type="submit" disabled={isPending || selectedIds.length === 0} className="brand-btn-primary px-3 py-2 text-[12px] disabled:opacity-50">
                  {isPending ? "加入中..." : submitLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
