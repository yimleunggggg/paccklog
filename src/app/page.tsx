import Link from "next/link";
import { Archive, ArchiveRestore, Pin, PinOff, Trash2 } from "lucide-react";
import { deleteTrip, toggleTripArchived, toggleTripPinned } from "@/features/trips/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { TripActionSubmitButton } from "@/components/trip-action-submit-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveLang, texts } from "@/shared/i18n";
import { localeForLang, pickLangText } from "@/shared/localized-text";

function formatDateRange(start: string | null, end: string | null, lang: string) {
  if (!start) return "--";
  const locale = localeForLang(lang);
  const fmt = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });
  const startStr = fmt.format(new Date(start));
  const endStr = end ? fmt.format(new Date(end)) : "--";
  return `${startStr} – ${endStr}`;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; status?: string }>;
}) {
  const { lang: rawLang, status } = await searchParams;
  const lang = resolveLang(rawLang);
  const t = texts[lang];
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    return (
      <main className="packlog-page mx-auto w-full max-w-[980px] p-4 md:p-6">
        <header className="mb-6 space-y-3">
          <h1
            className="text-3xl leading-[1.05] text-[#1c1c18]"
            style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}
          >
            {t.appName}
          </h1>
          <p className="text-sm text-[#6f6b62]">
            {lang === "en"
              ? "Browse community checklists first. Login starts only when you create your personal trip."
              : lang === "zh-TW"
                ? "可先瀏覽社群清單；只有在建立個人行程時才會啟動登入。"
                : "你可以先浏览社区清单；只有在创建个人行程时才会发起登录。"}
          </p>
        </header>
        <div className="flex flex-wrap gap-2">
          <Link href={`/explore?lang=${lang}`} className="brand-btn-soft px-4 py-2 text-sm">
            {t.explore}
          </Link>
          <Link href={`/trips/new?lang=${lang}`} className="brand-btn-primary px-4 py-2 text-sm">
            {t.newTrip}
          </Link>
        </div>
      </main>
    );
  }
  const { data: trips, error } = await supabase
    .from("trips")
    .select("id,title,start_date,end_date,status,created_at,tags,trip_items(status),trip_scenes(scene_templates(name_zh,name_en,icon))")
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
  const inProgressCount = normalizedTrips.filter(
    (trip) => trip.status === "planning" || trip.status === "in_progress" || trip.status === "packing" || trip.status === "traveling",
  ).length;
  const archivedCount = normalizedTrips.filter((trip) => trip.status === "done" || trip.status === "completed").length;
  const sceneLabel = (scene: { name_zh?: string | null; name_en?: string | null }) =>
    lang === "en" ? scene.name_en?.trim() || scene.name_zh || "" : scene.name_zh || scene.name_en || "";
  const l = (en: string, zhTW: string, zhCN: string) => pickLangText(lang, { en, zhTW, zhCN });
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
          </div>
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
          { value: "all", label: `${t.tabAll} (${normalizedTrips.length})` },
          { value: "in_progress", label: `${t.tabInProgress} (${inProgressCount})` },
          { value: "done", label: `${t.tabArchived} (${archivedCount})` },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/?lang=${lang}&status=${tab.value}`}
            className={`brand-chip inline-flex min-w-[72px] ${selectedStatus === tab.value ? "brand-chip-active" : ""}`}
          >
            {(tab.label ?? "").trim() ||
              (tab.value === "all"
                ? l("All", "全部", "全部")
                : tab.value === "in_progress"
                  ? l("In progress", "進行中", "进行中")
                  : l("Archived", "歸檔", "归档"))}
          </Link>
        ))}
      </div>
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
                    <span>{formatDateRange(trip.start_date, trip.end_date, lang)}</span>
                    <span className="trip-ledger-dot" />
                    <span>{(trip.sceneTags ?? []).map((s) => sceneLabel(s)).join(" · ") || "-"}</span>
                    <span className="trip-ledger-dot" />
                    <span>{trip.itemCount} {t.itemsCount}</span>
                  </p>
                </Link>
                <div className="trip-actions mt-0.5 flex items-center gap-1">
                  <form action={toggleTripArchived}>
                    <input type="hidden" name="trip_id" value={trip.id} />
                    <input type="hidden" name="current_status" value={trip.status} />
                    <TripActionSubmitButton className="trip-action-btn" ariaLabel={isArchived ? t.unarchive : t.archive}>
                      {isArchived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                    </TripActionSubmitButton>
                  </form>
                  <form action={toggleTripPinned}>
                    <input type="hidden" name="trip_id" value={trip.id} />
                    <input type="hidden" name="next_pinned" value={trip.pinned ? "false" : "true"} />
                    <TripActionSubmitButton className="trip-action-btn" ariaLabel={trip.pinned ? t.unpin : t.pin}>
                      {trip.pinned ? <PinOff size={13} /> : <Pin size={13} />}
                    </TripActionSubmitButton>
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
                <div className={`trip-progress-track flex-1 ${trip.itemCount === 0 ? "is-empty" : ""}`} aria-label={statusLabel(trip.status)}>
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

