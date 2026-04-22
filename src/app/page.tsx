import Link from "next/link";
import { Archive, ArchiveRestore, Pin, PinOff, Trash2 } from "lucide-react";
import { deleteTrip, toggleTripArchived, toggleTripPinned } from "@/features/trips/actions";
import { requireUser } from "@/features/trips/server";
import { HeaderIconMenus } from "@/components/header-icon-menus";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { resolveLang, texts } from "@/shared/i18n";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; status?: string }>;
}) {
  const { lang: rawLang, status } = await searchParams;
  const lang = resolveLang(rawLang);
  const t = texts[lang];
  const { supabase, user } = await requireUser();
  const { data: trips, error } = await supabase
    .from("trips")
    .select("id,title,start_date,end_date,status,created_at,tags,trip_items(status),trip_scenes(scene_templates(name_zh,icon))")
    .order("created_at", { ascending: false });
  const normalizedTrips = (trips ?? [])
    .map((trip) => ({
      ...trip,
      pinned: Array.isArray(trip.tags) && trip.tags.includes("__pinned"),
      itemCount: Array.isArray(trip.trip_items) ? trip.trip_items.length : 0,
      packedCount: Array.isArray(trip.trip_items) ? trip.trip_items.filter((item) => item.status === "packed").length : 0,
      sceneTags: Array.isArray(trip.trip_scenes)
        ? trip.trip_scenes
            .flatMap((row) => (Array.isArray(row.scene_templates) ? row.scene_templates : [row.scene_templates]))
            .filter(Boolean)
            .slice(0, 3)
        : [],
    }))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  const selectedStatus = status === "in_progress" || status === "done" ? status : "all";
  const sceneLabelMap: Record<string, string> = {
    徒步: lang === "en" ? "Hiking" : lang === "zh-TW" ? "健行" : "徒步",
    露营: lang === "en" ? "Camping" : lang === "zh-TW" ? "露營" : "露营",
    越野跑: lang === "en" ? "Trail Run" : lang === "zh-TW" ? "越野跑" : "越野跑",
    潜水: lang === "en" ? "Diving" : lang === "zh-TW" ? "潛水" : "潜水",
    音乐节: lang === "en" ? "Music Festival" : lang === "zh-TW" ? "音樂祭" : "音乐节",
    城市漫游: lang === "en" ? "City Walk" : lang === "zh-TW" ? "城市漫遊" : "城市漫游",
    攀岩: lang === "en" ? "Climbing" : lang === "zh-TW" ? "攀岩" : "攀岩",
    骑行: lang === "en" ? "Cycling" : lang === "zh-TW" ? "騎行" : "骑行",
    滑雪: lang === "en" ? "Skiing" : lang === "zh-TW" ? "滑雪" : "滑雪",
    出国基础: lang === "en" ? "International Basics" : lang === "zh-TW" ? "出國基礎" : "出国基础",
  };
  const statusLabel = (value?: string | null) => {
    if (!value) return "";
    if (value === "planning" || value === "in_progress" || value === "packing" || value === "traveling") return t.packingNow;
    if (value === "done" || value === "completed") return t.tabArchived;
    return value;
  };
  const cleanTripTitle = (raw?: string | null) => {
    const title = (raw ?? "").trim();
    if (!title) return "";

    const withoutCityNoise = title.replace(/\s*[+＋]\s*\d+\s*(城|city|cities)\s*/gi, " ");
    const withoutTailNoise = withoutCityNoise.replace(
      /\s*[-—–·]\s*(哈哈哈+|呵呵+|lol+|test+|testing+|demo+)\s*$/gi,
      "",
    );
    const normalized = withoutTailNoise
      .replace(/[·]{2,}/g, "·")
      .replace(/[-—–]{2,}/g, "-")
      .replace(/\s{2,}/g, " ")
      .replace(/\s*([·-])\s*/g, " $1 ")
      .trim()
      .replace(/\s+([·-])$/g, "");

    return normalized || title;
  };
  const splitTripTitle = (raw?: string | null) => {
    const cleaned = cleanTripTitle(raw)
      .replace(/[—–-]/g, " · ")
      .replace(/\s*·\s*/g, " · ")
      .replace(/\s{2,}/g, " ")
      .trim();
    const parts = cleaned
      .split("·")
      .map((part) => part.trim())
      .filter(Boolean);
    return {
      city: parts[0] ?? cleaned,
      detail: parts.slice(1).join(" · "),
    };
  };
  const visibleTrips = normalizedTrips.filter((trip) => {
    if (selectedStatus === "in_progress") {
      return trip.status === "planning" || trip.status === "in_progress" || trip.status === "packing" || trip.status === "traveling";
    }
    if (selectedStatus === "done") return trip.status === "done" || trip.status === "completed";
    return true;
  });
  const hasFilter = selectedStatus !== "all";
  const filterHint =
    visibleTrips.length === 0
      ? lang === "en"
        ? "No matching trips. Try another filter."
        : lang === "zh-TW"
          ? "未找到符合條件的行程，請調整篩選。"
          : "未找到符合条件的行程，请调整筛选。"
      : hasFilter
        ? lang === "en"
          ? `Filtered trips: ${visibleTrips.length} / ${normalizedTrips.length}`
          : lang === "zh-TW"
            ? `篩選結果：${visibleTrips.length} / ${normalizedTrips.length}`
            : `筛选结果：${visibleTrips.length} / ${normalizedTrips.length}`
        : lang === "en"
          ? `Showing all trips: ${normalizedTrips.length}`
          : lang === "zh-TW"
            ? `顯示全部 ${normalizedTrips.length} 個行程`
            : `显示全部 ${normalizedTrips.length} 个行程`;

  return (
    <main className="packlog-page mx-auto w-full max-w-[980px] p-4 md:p-6">
      <header className="mb-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
          <h1
            className="whitespace-nowrap text-3xl leading-[1.05] text-[#1c1c18]"
            style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}
          >
            {t.appName}
          </h1>
          <p className="text-sm text-[#8c8880]">{user.email}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link href={`/explore?lang=${lang}`} className="brand-btn-soft inline-flex h-10 items-center px-4 text-[12px]">
              {t.navExplore}
            </Link>
            <Link href={`/locker?lang=${lang}`} className="brand-btn-soft inline-flex h-10 items-center px-4 text-[12px]">
              {t.gearLocker}
            </Link>
            <Link href={`/trips/new?lang=${lang}`} className="brand-btn-primary inline-flex h-10 items-center px-4 text-[12px]">
              {t.newTrip}
            </Link>
          </div>
          </div>
          <HeaderIconMenus lang={lang} />
        </div>
      </header>

      {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm">{error.message}</p> : null}

      <div className="mb-4 flex items-center justify-between border-b border-[#d8d0c4] pb-2">
        <p className="text-[13px] tracking-[0.08em] text-[#6f6b62]">{t.ledgerTitle}</p>
        <p className="text-[13px] text-[#6f6b62]">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}</p>
      </div>
      <section className="mb-2" />
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { value: "all", label: t.tabAll },
          { value: "in_progress", label: t.tabInProgress },
          { value: "done", label: t.tabArchived },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/?lang=${lang}&status=${tab.value}`}
            className={`brand-chip inline-flex min-w-[72px] ${selectedStatus === tab.value ? "brand-chip-active" : ""}`}
          >
            {(tab.label ?? "").trim() || (tab.value === "all" ? (lang === "en" ? "All" : lang === "zh-TW" ? "全部" : "全部") : tab.value === "in_progress" ? (lang === "en" ? "In progress" : lang === "zh-TW" ? "進行中" : "进行中") : lang === "en" ? "Archived" : lang === "zh-TW" ? "歸檔" : "归档")}
          </Link>
        ))}
      </div>
      <p className={`ui-filter-hint mb-3 ${visibleTrips.length === 0 ? "ui-filter-hint-empty" : ""}`}>{filterHint}</p>
      {!normalizedTrips || normalizedTrips.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          {t.emptyTrips}
        </div>
      ) : (
        <ul>
          {visibleTrips.map((trip) => {
            const titleParts = splitTripTitle(trip.title);
            const isArchived = trip.status === "done" || trip.status === "completed";
            return (
            <li key={trip.id} className="group border-b border-[#e8e3d8] py-3">
              <div className="mb-1.5 flex items-start justify-between gap-3">
                <Link href={`/trips/${trip.id}?lang=${lang}`} className="block min-w-0 flex-1">
                  <p className="trip-ledger-title">
                    <b>{titleParts.city}</b>
                    {titleParts.detail ? <em> · {titleParts.detail}</em> : null}
                  </p>
                  <p className="trip-ledger-meta">
                    {trip.pinned ? <span className="trip-pinned-dot" aria-label={t.pin} /> : null}
                    <span>{(trip.start_date ?? t.noDate)} - {(trip.end_date ?? t.noDate)}</span>
                    <span className="trip-ledger-dot" />
                    <span>{(trip.sceneTags ?? []).map((s) => sceneLabelMap[s.name_zh] ?? s.name_zh).join(" · ") || "-"}</span>
                    <span className="trip-ledger-dot" />
                    <span>{trip.itemCount} {t.itemsCount}</span>
                  </p>
                </Link>
                <div className="trip-actions mt-0.5 flex items-center gap-1">
                  <form action={toggleTripArchived}>
                    <input type="hidden" name="trip_id" value={trip.id} />
                    <input type="hidden" name="current_status" value={trip.status} />
                    <button className="trip-action-btn" type="submit" aria-label={isArchived ? t.unarchive : t.archive}>
                      {isArchived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                    </button>
                  </form>
                  <form action={toggleTripPinned}>
                    <input type="hidden" name="trip_id" value={trip.id} />
                    <input type="hidden" name="next_pinned" value={trip.pinned ? "false" : "true"} />
                    <button className="trip-action-btn" type="submit" aria-label={trip.pinned ? t.unpin : t.pin}>
                      {trip.pinned ? <PinOff size={13} /> : <Pin size={13} />}
                    </button>
                  </form>
                  <form action={deleteTrip}>
                    <input type="hidden" name="trip_id" value={trip.id} />
                    <ConfirmSubmitButton
                      className="trip-action-btn text-[#9b6a2a]"
                      aria-label={t.delete}
                      confirmText={t.deleteConfirm}
                      cancelText={t.confirmCancel}
                      okText={t.confirmOk}
                    >
                      <Trash2 size={13} />
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="trip-progress-track flex-1" aria-label={statusLabel(trip.status)}>
                  <div className="trip-progress-fill" style={{ width: `${trip.itemCount ? Math.round((trip.packedCount / trip.itemCount) * 100) : 0}%` }} />
                </div>
                <p className="trip-progress-percent">
                  {trip.itemCount ? Math.round((trip.packedCount / trip.itemCount) * 100) : 0}%
                </p>
              </div>
            </li>
          );
          })}
        </ul>
      )}
    </main>
  );
}

