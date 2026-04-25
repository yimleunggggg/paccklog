"use client";

import { useEffect, useMemo, useState } from "react";
import { Backpack, Briefcase, Package, Shirt } from "lucide-react";
import { SortableTripGroup } from "@/components/sortable-trip-group";

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
  review_note?: string | null;
  review_utility?: number | null;
  weight_g?: number | null;
};

type TripContainerGroupsProps = {
  tripId: string;
  lang: "zh-CN" | "zh-TW" | "en";
  grouped: Record<string, TripItem[]>;
  containerMeta: Record<string, string>;
  categoryMeta: Record<string, string>;
  categoryOptions: Array<{ value: string; label: string }>;
  statusMeta: Record<string, string>;
  containerItemsPackedText: string;
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

export function TripContainerGroups({
  tripId,
  lang,
  grouped,
  containerMeta,
  categoryMeta,
  categoryOptions,
  statusMeta,
  containerItemsPackedText,
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
}: TripContainerGroupsProps) {
  const storageKey = `trip:${tripId}:openContainerGroup`;
  const groups = useMemo(() => Object.entries(grouped), [grouped]);
  const [openGroup, setOpenGroup] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(storageKey) ?? "";
  });
  const activeOpenGroup = openGroup && grouped[openGroup] ? openGroup : "";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!activeOpenGroup) {
      window.localStorage.removeItem(storageKey);
      return;
    }
    window.localStorage.setItem(storageKey, activeOpenGroup);
  }, [activeOpenGroup, storageKey]);

  const iconFor = (group: string) => {
    if (group === "suitcase") return Briefcase;
    if (group === "backpack") return Backpack;
    if (group === "wear") return Shirt;
    return Package;
  };

  return (
    <div className="space-y-3">
      {groups.map(([group, groupItems]) => {
        const Icon = iconFor(group);
        const totalInContainer = groupItems?.length ?? 0;
        const packedInContainer = (groupItems ?? []).filter((item) => item.status === "packed").length;
        const containerProgress = totalInContainer ? Math.round((packedInContainer / totalInContainer) * 100) : 0;
        const expanded = activeOpenGroup === group;
        return (
          <section key={group} className="container-card">
            <button
              type="button"
              className="container-head w-full text-left"
              onClick={() => setOpenGroup((prev) => (prev === group ? "" : group))}
              aria-expanded={expanded}
            >
              <div className="container-icon">
                <Icon size={20} className="text-[#546c4f]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="container-cap">{String(group).toUpperCase()}</p>
                <h3 className="container-title">{containerMeta[group] ?? group}</h3>
                <p className="container-meta">{totalInContainer} {containerItemsPackedText} {packedInContainer}</p>
              </div>
            </button>
            <div className="container-progress">
              <div style={{ width: `${containerProgress}%` }} />
            </div>
            {expanded ? (
              <div className="mt-3">
                <SortableTripGroup
                  key={`${group}:${(groupItems ?? []).map((item) => `${item.id}:${item.status}:${item.container}:${item.category}`).join("|")}`}
                  items={groupItems ?? []}
                  tripId={tripId}
                  group={group}
                  scopeField="container"
                  mode="detail"
                  lang={lang}
                  statusMeta={statusMeta}
                  containerMeta={containerMeta}
                  categoryMeta={categoryMeta}
                  categoryOptions={categoryOptions}
                  showCategoryTag
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
                  tripStatus={tripStatus}
                  reviewLabels={reviewLabels}
                />
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
