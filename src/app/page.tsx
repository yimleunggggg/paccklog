import Link from "next/link";
import { Pin, PinOff, Trash2 } from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { deleteTrip, toggleTripArchived, toggleTripPinned } from "@/features/trips/actions";
import { requireUser } from "@/features/trips/server";
import { LanguageSwitcher } from "@/components/language-switcher";
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
    if (value === "planning" || value === "in_progress") return t.packingNow;
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
  const visibleTrips = normalizedTrips.filter((trip) => {
    if (selectedStatus === "in_progress") return trip.status === "planning" || trip.status === "in_progress";
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
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link href={`/locker?lang=${lang}`} className="brand-btn-soft inline-flex h-10 items-center px-4 text-sm">
              {t.gearLocker}
            </Link>
            <Link href={`/trips/new?lang=${lang}`} className="brand-btn-primary inline-flex h-10 items-center px-4 text-sm">
              {t.newTrip}
            </Link>
          </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher lang={lang} />
            <form action={signOut}>
              <button className="brand-btn-soft inline-flex h-10 items-center px-3 text-sm" type="submit">
                {t.signOut}
              </button>
            </form>
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
          { value: "all", label: t.tabAll },
          { value: "in_progress", label: t.tabInProgress },
          { value: "done", label: t.tabArchived },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/?lang=${lang}&status=${tab.value}`}
            className={`brand-chip inline-flex min-w-[72px] items-center justify-center px-4 py-2 text-sm ${selectedStatus === tab.value ? "border-[#243d1f] bg-[#243d1f] text-[#fefcf8]" : "text-[#34322d]"}`}
          >
            {(tab.label ?? "").trim() || (tab.value === "all" ? (lang === "en" ? "All" : lang === "zh-TW" ? "全部" : "全部") : tab.value === "in_progress" ? (lang === "en" ? "In progress" : lang === "zh-TW" ? "進行中" : "进行中") : lang === "en" ? "Archived" : lang === "zh-TW" ? "歸檔" : "归档")}
          </Link>
        ))}
      </div>
      {!normalizedTrips || normalizedTrips.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          {t.emptyTrips}
        </div>
      ) : (
        <ul>
          {visibleTrips.map((trip) => (
            <li
              key={trip.id}
              className={`py-4 ${trip.pinned ? "relative pl-3" : ""}`}
            >
              {trip.pinned ? <span className="absolute left-0 top-4 h-[calc(100%-2rem)] w-[2px] rounded-full bg-[#3a5c33]" /> : null}
              <div className="mb-2 flex items-start justify-between gap-3">
                <Link href={`/trips/${trip.id}?lang=${lang}`} className="block flex-1">
                  <p className="text-[11px] tracking-[0.08em] text-[#8c8880]">{statusLabel(trip.status)}</p>
                  <p className="text-[20px] leading-[1.1] text-[#1c1c18] md:text-[24px]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>
                    {cleanTripTitle(trip.title)}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-[13px] text-[#6f6b62]">
                    {(trip.start_date ?? t.noDate)} - {(trip.end_date ?? t.noDate)}
                    <span className="status-tag status-tag-container">{statusLabel(trip.status)}</span>
                  </p>
                </Link>
                <div className="flex items-center gap-2">
                  <form action={toggleTripArchived}>
                    <input type="hidden" name="trip_id" value={trip.id} />
                    <input type="hidden" name="current_status" value={trip.status} />
                    <button className="brand-chip px-2 py-1 text-xs" type="submit">
                      {trip.status === "done" || trip.status === "completed" ? t.unarchive : t.archive}
                    </button>
                  </form>
                  <form action={toggleTripPinned}>
                    <input type="hidden" name="trip_id" value={trip.id} />
                    <input type="hidden" name="next_pinned" value={trip.pinned ? "false" : "true"} />
                    <button className="brand-chip p-2" type="submit" aria-label={trip.pinned ? t.unpin : t.pin}>
                      {trip.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </button>
                  </form>
                  <form action={deleteTrip}>
                    <input type="hidden" name="trip_id" value={trip.id} />
                    <ConfirmSubmitButton
                      className="brand-chip p-2 text-[#9b6a2a]"
                      aria-label={t.delete}
                      confirmText={t.deleteConfirm}
                      cancelText={t.confirmCancel}
                      okText={t.confirmOk}
                    >
                      <Trash2 size={14} />
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-[#8c8880]">
                {(trip.sceneTags ?? []).length ? <span>{(trip.sceneTags ?? []).map((s) => sceneLabelMap[s.name_zh] ?? s.name_zh).join(" · ")}</span> : null}
                <span>· {trip.itemCount} {t.itemsCount}</span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="trip-progress-track flex-1">
                  <div className="trip-progress-fill" style={{ width: `${trip.itemCount ? Math.round((trip.packedCount / trip.itemCount) * 100) : 0}%` }} />
                </div>
                <p className="text-[14px] leading-none text-[#3a5c33]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>
                  {trip.itemCount ? Math.round((trip.packedCount / trip.itemCount) * 100) : 0}%
                </p>
              </div>
              <div className="mt-4 h-px w-full bg-[#ddd5c8]" />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

