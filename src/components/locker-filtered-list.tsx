"use client";

import { useMemo, useState } from "react";
import { LockerItemEditor } from "@/components/locker-item-editor";
import { defaultZhNameFallback, defaultZhNoteFallback, pickLangText, resolveLocalizedText } from "@/shared/localized-text";

type LockerItem = {
  id: string;
  name: string;
  category: string | null;
  brand: string | null;
  note: string | null;
  status: string;
  times_used: number | null;
  usage_logs?: Array<{
    trip_id: string;
    trip_title: string;
    trip_date: string;
    status: string;
    container: string;
    note: string | null;
    updated_at: string | null;
  }>;
};

type CategoryOption = {
  value: string;
  label: string;
};

export function LockerFilteredList({
  items,
  lang,
  initialStatus,
  initialCategory,
  initialBrand,
  categoryOptions,
  texts,
}: {
  items: LockerItem[];
  lang: string;
  initialStatus: "all" | "owned" | "wishlist";
  initialCategory: string;
  initialBrand: string;
  categoryOptions: CategoryOption[];
  texts: {
    statusAll: string;
    owned: string;
    wishlist: string;
    brand: string;
    usedTimes: string;
    usedTimesUnit: string;
    save: string;
    confirmCancel: string;
    delete: string;
    itemName: string;
    category: string;
    status: string;
  };
}) {
  const l = (en: string, zhTW: string, zhCN: string) => pickLangText(lang, { en, zhTW, zhCN });
  const localizedLang = pickLangText(lang, { en: "en", zhTW: "zh-TW", zhCN: "zh-CN" }) as "en" | "zh-TW" | "zh-CN";
  const [status, setStatus] = useState<"all" | "owned" | "wishlist">(initialStatus);
  const [category, setCategory] = useState(initialCategory);
  const [keywordInput, setKeywordInput] = useState(initialBrand);
  const [appliedKeyword, setAppliedKeyword] = useState(initialBrand);
  const noteText = l("Note", "備註", "备注");
  const historyText = l("Usage log", "使用記錄", "使用记录");
  const optionalText = l("optional", "可選", "可选");
  const statusLabel = (value: string) => {
    if (value === "packed") return l("Packed", "已打包", "已打包");
    if (value === "to_buy") return l("To buy", "待購買", "待购买");
    if (value === "optional") return l("Optional", "再說", "再说");
    return l("To pack", "待打包", "待打包");
  };
  const containerLabel = (value: string) => {
    if (value === "suitcase") return l("Suitcase", "托運行李箱", "托运行李箱");
    if (value === "backpack") return l("Backpack", "背包", "背包");
    if (value === "carry_on") return l("Carry-on", "隨身包", "随身包");
    if (value === "wear") return l("On body", "身上穿戴", "身上穿戴");
    return l("Unsorted", "未分類", "未分类");
  };
  const getLocalizedLockerName = (item: LockerItem) =>
    resolveLocalizedText({
      lang: localizedLang,
      source: item.name,
      zhFallback: (raw) => defaultZhNameFallback(raw),
    });
  const getLocalizedLockerNote = (item: LockerItem) =>
    resolveLocalizedText({
      lang: localizedLang,
      source: item.note,
      zhFallbackSource: item.name,
      zhFallback: (raw, nameSource) => defaultZhNoteFallback(raw, nameSource || ""),
    });

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const statusOk = status === "all" ? true : item.status === status;
      const categoryOk = category === "all" ? true : (item.category ?? "other") === category;
      const brandOk = !appliedKeyword ? true : (item.brand ?? "").toLowerCase().includes(appliedKeyword.toLowerCase());
      return statusOk && categoryOk && brandOk;
    });
  }, [items, status, category, appliedKeyword]);

  const grouped = useMemo(() => {
    return visibleItems.reduce<Record<string, LockerItem[]>>((acc, item) => {
      const key = item.category || "other";
      acc[key] = [...(acc[key] ?? []), item];
      return acc;
    }, {});
  }, [visibleItems]);
  const categoryLabelMap = useMemo(
    () => new Map(categoryOptions.filter((option) => option.value !== "all").map((option) => [option.value, option.label])),
    [categoryOptions],
  );

  const hasFilter = status !== "all" || category !== "all" || !!appliedKeyword;
  const filterHint =
    visibleItems.length === 0
      ? "未找到匹配结果，请调整筛选条件。"
      : hasFilter
        ? `筛选结果：${visibleItems.length} / ${items.length}`
        : `显示全部 ${items.length} 件装备`;

  return (
    <>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {[
          { value: "all", label: texts.statusAll },
          { value: "owned", label: texts.owned },
          { value: "wishlist", label: texts.wishlist },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value as "all" | "owned" | "wishlist")}
            className={`brand-chip ${status === tab.value ? "brand-chip-active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="mb-4 border-b border-[#d8d0c4] pb-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setCategory(option.value)}
              className={`brand-chip ${category === option.value ? "brand-chip-active" : ""}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            name="brand"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder={`${texts.brand}关键词`}
            className="ui-control-input min-w-[240px] flex-1"
          />
          <button type="button" onClick={() => setAppliedKeyword(keywordInput.trim())} className="brand-btn-primary h-10 px-4 text-[12px]">
            筛选
          </button>
          <button
            type="button"
            onClick={() => {
              setKeywordInput("");
              setAppliedKeyword("");
              setStatus("all");
              setCategory("all");
            }}
            className="brand-btn-soft inline-flex h-10 items-center px-4 text-[12px]"
          >
            清空
          </button>
        </div>
        <p className={`ui-filter-hint mt-2 ${visibleItems.length === 0 ? "ui-filter-hint-empty" : ""}`}>{filterHint}</p>
      </section>

      <section className="space-y-5">
        {Object.entries(grouped).map(([group, groupItems], index) => (
          <section key={group}>
            <div className="section-head">
              <span className="section-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="section-name">
                {localizedLang === "en" ? String(categoryLabelMap.get(group) ?? group).toUpperCase() : categoryLabelMap.get(group) ?? group}
              </span>
              <span className="section-count">{groupItems.length}</span>
            </div>
            <ul>
              {groupItems.map((item) => (
                <li key={item.id} className="item-row item-row-flat locker-row">
                  <div className="locker-row-main">
                    <div className="locker-row-left">
                      <div className="min-w-0 locker-row-text">
                        <p className="locker-item-name text-[#1f1f1b]">{getLocalizedLockerName(item)}</p>
                        {item.brand ? (
                          <p className="locker-item-brand text-[#7b7770]" style={{ fontFamily: "EB Garamond, serif" }}>
                            {item.brand}
                          </p>
                        ) : null}
                        {item.note ? <p className="locker-item-note item-manual-note-line">{getLocalizedLockerNote(item)}</p> : null}
                        {item.usage_logs?.length ? (
                          <details className="mt-1">
                            <summary className="cursor-pointer text-[12px] text-[#6f6b62]">
                              {historyText} ({item.usage_logs.length})
                            </summary>
                            <div className="mt-1 space-y-1 text-[12px] text-[#6f6b62]">
                              {item.usage_logs.map((log) => (
                                <div key={`${item.id}:${log.trip_id}:${log.updated_at ?? ""}`} className="rounded-[8px] border border-[#e6dfd2] px-2 py-1">
                                  <a
                                    href={`/trips/${log.trip_id}?lang=${lang}`}
                                    className="text-[#3d3a33] underline-offset-2 hover:underline"
                                    title={l("Open trip detail", "打開行程詳情", "打开行程详情")}
                                  >
                                    {log.trip_title}
                                  </a>
                                  <p>{log.trip_date}</p>
                                  <p>
                                    {l("Status: ", "狀態：", "状态：")}
                                    {statusLabel(log.status)}
                                    {" · "}
                                    {l("Location: ", "位置：", "位置：")}
                                    {containerLabel(log.container)}
                                  </p>
                                  {log.note ? <p>{l("Note: ", "備註：", "备注：")}{log.note}</p> : null}
                                </div>
                              ))}
                            </div>
                          </details>
                        ) : null}
                      </div>
                    </div>
                    <div className="locker-row-right">
                      <p className="locker-used-times text-[#8c8880]" style={{ fontFamily: "EB Garamond, serif" }}>
                        {(() => {
                          const usageCount = Math.max(item.times_used ?? 0, item.usage_logs?.length ?? 0);
                          return localizedLang === "en" ? `Used ${usageCount}x` : `${texts.usedTimes} ${usageCount}${texts.usedTimesUnit}`;
                        })()}
                      </p>
                      <LockerItemEditor
                        item={item}
                        editText={l("Edit", "編輯", "编辑")}
                        saveText={texts.save}
                        cancelText={texts.confirmCancel}
                        deleteText={texts.delete}
                        confirmText={`${texts.delete}「${getLocalizedLockerName(item)}」？`}
                        ownedText={texts.owned}
                        wishlistText={texts.wishlist}
                        itemNameLabel={texts.itemName}
                        brandLabel={texts.brand}
                        brandOptionalHint={optionalText}
                        categoryLabel={texts.category}
                        categoryOptions={categoryOptions.filter((option) => option.value !== "all")}
                        noteLabel={noteText}
                        statusLabel={texts.status}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>
    </>
  );
}
