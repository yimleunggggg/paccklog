import Link from "next/link";
import { Backpack, Briefcase, CalendarDays, CircleDot, MapPin, Package, Shirt } from "lucide-react";
import type { ComponentType } from "react";
import { addTripItem, saveTripAsTemplate } from "@/features/trips/actions";
import { requireUser } from "@/features/trips/server";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LockerPickerSheet } from "@/components/locker-picker-sheet";
import { QuickAddForm } from "@/components/quick-add-form";
import { SortableTripGroup } from "@/components/sortable-trip-group";
import { resolveLang, texts } from "@/shared/i18n";
import { getTripWeather } from "@/lib/weather";

type TripDetailPageProps = {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ status?: string; view?: string; mode?: string; lang?: string; container?: string }>;
};

export default async function TripDetailPage({ params, searchParams }: TripDetailPageProps) {
  const [{ tripId }, query] = await Promise.all([params, searchParams]);
  const statusFilter = query.status ?? "all";
  const view = query.view ?? "category";
  const mode = query.mode === "compact" ? "compact" : "detail";
  const lang = resolveLang(query.lang);
  const allowedContainers = new Set(["undecided", "suitcase", "backpack", "carry_on", "wear"]);
  const containerFilter = query.container && allowedContainers.has(query.container) ? query.container : "";
  const t = texts[lang];
  const { supabase, user } = await requireUser();

  const { data: trip } = await supabase.from("trips").select("id,title,status,start_date,end_date,tags,description").eq("id", tripId).single();
  const [{ data: allTripItems }, { data: lockerItems }] = await Promise.all([
    supabase.from("trip_items").select("*").eq("trip_id", tripId).order("sort_order"),
    supabase.from("gear_locker").select("id,name,category,brand").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);
  const items = (allTripItems ?? []).filter((item) => {
    const statusMatched = statusFilter === "all" ? true : item.status === statusFilter;
    const containerMatched = containerFilter ? item.container === containerFilter : true;
    return statusMatched && containerMatched;
  });
  const allItems = allTripItems ?? [];
  const { data: userTrips } = await supabase
    .from("trips")
    .select("id,title,status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const grouped =
    view === "container"
      ? (items ?? []).reduce<Record<string, typeof items>>((acc, item) => {
          acc[item.container] = [...(acc[item.container] ?? []), item];
          return acc;
        }, {})
      : (items ?? []).reduce<Record<string, typeof items>>((acc, item) => {
          acc[item.category] = [...(acc[item.category] ?? []), item];
          return acc;
        }, {});
  const containerIconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
    suitcase: Briefcase,
    backpack: Backpack,
    carry_on: Package,
    wear: Shirt,
    undecided: Package,
  };
  const statusMeta: Record<string, string> = {
    all: t.statusAll?.trim() || (lang === "en" ? "All" : "全部"),
    to_pack: t.statusToPack?.trim() || (lang === "en" ? "To pack" : "待打包"),
    packed: t.statusPacked?.trim() || (lang === "en" ? "Packed" : "已打包"),
    to_buy: t.statusToBuy?.trim() || (lang === "en" ? "To buy" : "待购买"),
    optional: t.statusOptional?.trim() || (lang === "en" ? "Optional" : "可选"),
  };
  const statusFilters = ["all", "to_pack", "packed", "to_buy", "optional"] as const;
  const priorityMeta: Record<string, string> = {
    to_pack: lang === "en" ? "Must carry" : "必带",
    packed: lang === "en" ? "Must carry" : "必带",
    to_buy: lang === "en" ? "Need to buy" : "待购买",
    optional: lang === "en" ? "Optional" : "可选",
  };
  const categoryViewLabel = t.categoryView?.trim() || (lang === "en" ? "Category view" : "分类视图");
  const containerViewLabel = t.containerView?.trim() || (lang === "en" ? "By container" : "按容器");
  const containerMeta: Record<string, string> = {
    undecided: t.containerUndecided,
    suitcase: t.containerSuitcase,
    backpack: t.containerBackpack,
    carry_on: t.containerCarryOn,
    wear: t.containerWear,
  };
  const categoryMeta: Record<string, string> = {
    clothing: t.categoryClothing,
    footwear: t.categoryFootwear,
    electronics: t.categoryElectronics,
    toiletries: t.categoryToiletries,
    documents: t.categoryDocuments,
    nutrition: t.categoryNutrition,
    camping: t.categoryCamping,
    first_aid: t.categoryFirstAid,
    other: t.categoryOther,
  };

  const total = items?.length ?? 0;
  const packed = items?.filter((item) => item.status === "packed").length ?? 0;
  const progress = total === 0 ? 0 : Math.round((packed / total) * 100);
  const statusCount = {
    all: allItems?.length ?? 0,
    to_pack: allItems?.filter((item) => item.status === "to_pack").length ?? 0,
    packed: allItems?.filter((item) => item.status === "packed").length ?? 0,
    to_buy: allItems?.filter((item) => item.status === "to_buy").length ?? 0,
    optional: allItems?.filter((item) => item.status === "optional").length ?? 0,
  };
  const country = trip?.tags?.[1];
  const cityTagRaw = trip?.tags?.[2] ?? "";
  const city = cityTagRaw.split("/")[0]?.trim() || cityTagRaw.split("、")[0]?.trim() || cityTagRaw;
  const cleanTags = (trip?.tags ?? []).filter((tag: string) => tag !== "__pinned");
  const continentTag = cleanTags[0] ?? "";
  const countryTag = cleanTags[1] ?? "";
  const cityTag = cleanTags[2] ?? "";
  const monthTag = cleanTags[3] ?? "";
  const durationTag = cleanTags[4] ?? "";
  const seasonTag = cleanTags[5] ?? "";
  const styleTag = cleanTags[6] ?? "";
  const hasWeatherInputs = Boolean(city && trip?.start_date && trip?.end_date);
  const weather = hasWeatherInputs ? await getTripWeather(city, country, trip?.start_date, trip?.end_date, lang) : null;
  const normalizedDescription = (() => {
    const raw = (trip?.description ?? "").trim();
    if (!raw) return "";
    const lines: string[] = raw
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => Boolean(line));
    const autoHintLine = lines.find((line: string) => /^(装备建议|裝備建議|Gear suggestion)/i.test(line));
    const userLines = lines.filter((line: string) => !/^(装备建议|裝備建議|Gear suggestion)/i.test(line));
    const fallbackHint =
      weather?.suggestion ??
      (lang === "en"
        ? "Pack a lightweight setup and check the latest forecast before departure."
        : lang === "zh-TW"
          ? "建議按輕量化裝備準備，並在出發前查看最新天氣。"
          : "建议按轻量化装备准备，并在出发前查看最新天气。");
    const localizedAutoHint =
      lang === "en"
        ? `Gear suggestion: ${fallbackHint}`
        : lang === "zh-TW"
          ? `裝備建議：${fallbackHint}`
          : `装备建议：${fallbackHint}`;
    if (!autoHintLine) return userLines.join("\n");
    return [...userLines, localizedAutoHint].filter(Boolean).join("\n");
  })();
  const containerStats = ["suitcase", "backpack", "carry_on", "wear", "undecided"].map((key) => ({
    key,
    label: containerMeta[key] ?? key,
    count: (items ?? []).filter((item) => item.container === key).length,
  }));
  return (
    <main className="packlog-page mx-auto w-full max-w-[1260px] p-4 pb-24 md:p-6 md:pb-6">
      <div className="xl:grid xl:grid-cols-[220px_1fr_280px] xl:gap-6">
        <aside className="hidden xl:block">
          <div className="sticky top-6 rounded-[14px] border border-[#d8d0c4] bg-[#fefcf8] p-3">
            <p className="mb-2 text-[11px] tracking-[0.08em] text-[#8c8880]">{t.libraryNav.toUpperCase()}</p>
            <ul className="space-y-1 text-sm">
              <li className="rounded px-2 py-1 text-[#4a4840]">01 {t.navTripList}</li>
              <li className="rounded px-2 py-1 text-[#8c8880]">02 {t.navTemplates}</li>
              <li className="rounded px-2 py-1 text-[#8c8880]">03 {t.navExplore}</li>
            </ul>
            <div className="my-3 h-px bg-[#e1d9cd]" />
            <p className="mb-2 text-[11px] tracking-[0.08em] text-[#8c8880]">{t.yourTrips.toUpperCase()}</p>
            <ul className="space-y-2">
              {(userTrips ?? []).map((entry) => (
                <li key={entry.id} className={`rounded-[8px] border px-2 py-1 ${entry.id === tripId ? "border-[#3a5c33] bg-[#eef4ea]" : "border-[#e1d9cd] bg-white"}`}>
                  <Link href={`/trips/${entry.id}?lang=${lang}`} className="block text-sm text-[#2f2d29]">
                    {entry.title}
                  </Link>
                  <p className="text-[11px] text-[#8c8880]">{entry.status}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <div>
      <div className="mb-3 flex items-center justify-between">
        <Link href={`/?lang=${lang}`} className="text-sm underline">
          {t.backList}
        </Link>
        <LanguageSwitcher lang={lang} />
      </div>
      <section className="mb-5 rounded-[20px] bg-[#17361f] p-5 text-[#f1f5ee]">
        <p className="text-[12px] tracking-[0.08em] text-[#9fbc97]">
          {[continentTag, countryTag, cityTag].filter(Boolean).join(" · ")}
        </p>
        <h1 className="mt-1.5 text-[28px] leading-[1.15] text-[#f1f5ee] md:text-[32px]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>
          {trip?.title ?? t.tripDetail}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="hero-chip">
            <CalendarDays size={12} /> {(trip?.start_date ?? "--")} — {(trip?.end_date ?? "--")}
          </span>
          {durationTag ? (
            <span className="hero-chip">
              <CircleDot size={12} /> {durationTag}
            </span>
          ) : null}
          {cityTag ? (
            <span className="hero-chip">
              <MapPin size={12} /> {cityTag}
            </span>
          ) : null}
          {styleTag ? <span className="hero-chip">{styleTag}</span> : null}
          {seasonTag ? <span className="hero-chip">{seasonTag}</span> : null}
          {monthTag ? <span className="hero-chip">{monthTag}</span> : null}
        </div>
        <div className="mt-4 h-px bg-[#2f4f35]" />
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-[30px] leading-none md:text-[34px]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>{progress}%</p>
            <p className="text-[13px] text-[#c9d8c5]">{t.progress}</p>
          </div>
          <div className="text-right">
            <p className="text-[26px] leading-none md:text-[30px]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>{packed}/{total}</p>
            <p className="text-[13px] text-[#c9d8c5]">{t.checkedCount}</p>
          </div>
        </div>
        <div className="mt-2.5 h-1.5 rounded-full bg-[#2f4f35]">
          <div className="h-full rounded-full bg-[#8fb087]" style={{ width: `${progress}%` }} />
        </div>
      </section>
      {normalizedDescription ? (
        <p className="mb-4 whitespace-pre-wrap rounded-[10px] border border-[#e6e0d6] bg-[#f5f1ea] px-3 py-2 text-[14px] text-[#3e3b34]">
          {normalizedDescription}
        </p>
      ) : null}
      {(trip?.status === "done" || trip?.status === "completed") ? (
        <form action={saveTripAsTemplate} className="mb-4">
          <input type="hidden" name="trip_id" value={tripId} />
          <button type="submit" className="brand-btn-soft px-3 py-2 text-xs">
            {t.saveAsTemplate}
          </button>
        </form>
      ) : null}

      <section className="mb-6 rounded-[12px] border border-[#d8d0c4] bg-[#fefcf8] px-4 py-3 text-[#2f3f2f]">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[12px] tracking-[0.08em] text-[#6b695f]">{t.weatherTitle}</p>
          <p className="text-[11px] text-[#8c8880]">
            {t.weatherSource}: {weather?.source ?? "--"}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-[180px_1fr]">
          <div className="rounded-[10px] border border-[#e5ddd0] bg-[#f5f1ea] px-3 py-3">
            <p className="text-[28px] leading-none text-[#1f2c1f]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>
              {weather?.avgTempC ?? "--"}°
            </p>
            <p className="mt-1 text-[11px] text-[#7a766d]">
              {weather?.minTempC ?? "--"}° ~ {weather?.maxTempC ?? "--"}°
            </p>
            <p className="mt-2 text-[11px] text-[#7a766d]">
              {lang === "en" ? "Rain" : lang === "zh-TW" ? "降雨" : "降雨"}: {weather?.rainSumMm ?? "--"}mm
            </p>
          </div>
          <div className="rounded-[10px] border border-[#e5ddd0] bg-[#f8f5ef] px-3 py-3">
            <p className="mb-1 text-[12px] text-[#5d695d]">{t.smartSuggestion}</p>
            <p className="text-[12px] leading-relaxed text-[#4f5a4f]">
              {weather?.suggestion ?? t.weatherReferenceHint}
            </p>
            {weather?.isEstimated ? (
              <p className="mt-2 text-[11px] text-[#7a766d]">
                {t.weatherEstimatedHint}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="mr-1 text-[13px] text-muted-foreground">{t.checklistView}</span>
        {statusFilters.map((s) => (
          <Link
            key={s}
            href={`/trips/${tripId}?status=${s}&view=${view}&mode=${mode}&lang=${lang}${containerFilter ? `&container=${containerFilter}` : ""}`}
            className={`inline-flex h-10 items-center rounded-[10px] border px-4 text-[14px] ${statusFilter === s ? "border-[#243d1f] bg-[#243d1f] text-[#fefcf8]" : "border-[#d8d0c4] bg-[#fefcf8] text-[#34322d]"}`}
          >
            {statusMeta[s]}{" "}
            <span className={statusFilter === s ? "text-[#d0ddca]" : "text-[#8c8880]"}>{statusCount[s]}</span>
          </Link>
        ))}
        <Link
          href={`/trips/${tripId}?status=${statusFilter}&view=category&mode=${mode}&lang=${lang}${containerFilter ? `&container=${containerFilter}` : ""}`}
          className={`brand-chip ${view === "category" ? "bg-primary text-primary-foreground" : ""}`}
        >
          {categoryViewLabel}
        </Link>
        <Link
          href={`/trips/${tripId}?status=${statusFilter}&view=container&mode=${mode}&lang=${lang}${containerFilter ? "" : ""}`}
          className={`brand-chip ${view === "container" ? "bg-primary text-primary-foreground" : ""}`}
        >
          {containerViewLabel}{containerFilter ? " ×" : ""}
        </Link>
      </div>
      <section className="mb-5 rounded-xl border border-[#d8d0c4] bg-[#fefcf8] p-3">
        <div className="mb-2 flex justify-end">
          <LockerPickerSheet
            tripId={tripId}
            buttonLabel={t.fromGearLocker}
            submitLabel={t.addSelectedToTrip}
            items={lockerItems ?? []}
          />
        </div>
        <QuickAddForm
          tripId={tripId}
          quickAddPlaceholder={t.quickAddBar}
          addLabel={lang === "en" ? "Add" : lang === "zh-TW" ? "新增" : "添加"}
          statusToPack={t.statusToPack}
          statusToBuy={t.statusToBuy}
          statusOptional={t.statusOptional}
          customCategoryLabel={lang === "en" ? "Custom category" : lang === "zh-TW" ? "自訂分類" : "自定义分类"}
          customCategoryPlaceholder={lang === "en" ? "Enter category name" : lang === "zh-TW" ? "輸入分類名稱" : "输入分类名称"}
          viewToggleLabel={t.viewToggle}
          viewToggleHref={`/trips/${tripId}?status=${statusFilter}&view=${view}&mode=${mode === "detail" ? "compact" : "detail"}&lang=${lang}${containerFilter ? `&container=${containerFilter}` : ""}`}
          categories={Object.entries(categoryMeta).map(([value, label]) => ({ value, label }))}
        />
      </section>

      <section className="space-y-4">
        {view === "container" ? (
          <div className="space-y-3">
            {Object.entries(grouped).map(([group, groupItems]) => {
              const Icon = containerIconMap[group] ?? Package;
              const totalInContainer = groupItems?.length ?? 0;
              const packedInContainer = (groupItems ?? []).filter((item) => item.status === "packed").length;
              const containerProgress = totalInContainer ? Math.round((packedInContainer / totalInContainer) * 100) : 0;
              return (
                <section key={group} className="container-card">
                  <Link
                    href={`/trips/${tripId}?status=${statusFilter}&view=category&mode=${mode}&lang=${lang}&container=${group}`}
                    className="container-head"
                  >
                    <div className="container-icon">
                      <Icon size={20} className="text-[#546c4f]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="container-cap">{String(group).toUpperCase()}</p>
                      <h3 className="container-title">{containerMeta[group] ?? group}</h3>
                      <p className="container-meta">{totalInContainer} {t.containerItemsPacked} {packedInContainer}</p>
                    </div>
                  </Link>
                  <div className="container-progress">
                    <div style={{ width: `${containerProgress}%` }} />
                  </div>
                  <div className="container-item-lines">
                    {(groupItems ?? []).slice(0, 8).map((item) => (
                      <button key={item.id} className="container-item-chip" type="button">
                        {item.name}
                      </button>
                    ))}
                    {(groupItems ?? []).length > 8 ? <span className="container-more">+{(groupItems ?? []).length - 8} {t.moreSuffix}</span> : null}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          Object.entries(grouped).map(([group, groupItems]) => (
            <details key={group} className="section-group rounded-none" open>
              <summary className="section-head list-none cursor-pointer">
                <span className="section-icon" aria-hidden />
                <span className="section-index">
                  {String(Math.max(1, Object.keys(grouped).indexOf(group) + 1)).padStart(2, "0")}
                </span>
                <span className="section-name">
                  {(categoryMeta[group] ?? group).toUpperCase()}
                </span>
                <span className="section-count">
                  {groupItems?.length ?? 0}
                </span>
                <span className="section-arrow ml-2 text-xs text-[#b8b4ac]">›</span>
              </summary>
              <SortableTripGroup
                items={groupItems ?? []}
                tripId={tripId}
                group={group}
                scopeField={view === "container" ? "container" : "category"}
                mode={mode}
                lang={lang}
                statusMeta={statusMeta}
                containerMeta={containerMeta}
                priorityMeta={priorityMeta}
                saveText={t.save}
                cancelText={t.confirmCancel}
                saveToLockerText={t.saveToGearLocker}
                brandPlaceholder={t.brand}
                brandAlternativesPlaceholder={t.brandAlternativesPlaceholder}
                notePlaceholder={t.noteField}
                editLabel={t.advancedEdit}
                tripStatus={trip?.status}
                reviewLabels={[
                  { value: "used", label: t.reviewUsed },
                  { value: "unused", label: t.reviewUnused },
                  { value: "missed", label: t.reviewMissed },
                  { value: "skip", label: t.reviewSkip },
                ]}
              />
            </details>
          ))
        )}
      </section>

      <section className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#d8d0c4] bg-[#f4f1ec] p-3 md:hidden">
        <form action={addTripItem} className="mx-auto flex w-full max-w-5xl gap-2">
          <input type="hidden" name="trip_id" value={tripId} />
          <input type="hidden" name="category" value="other" />
          <input
            required
            name="name"
            placeholder={t.quickAddBar}
            className="flex-1 rounded-xl border px-3 py-2 text-sm"
          />
          <button type="submit" name="status" value="to_pack" className="brand-btn-primary px-3 py-2 text-xs">
            +{t.statusToPack}
          </button>
        </form>
      </section>


        </div>
        <aside className="hidden xl:block">
          <div className="sticky top-6 space-y-3">
            <section className="rounded-[14px] border border-[#d8d0c4] bg-[#fefcf8] p-3">
              <p className="mb-2 text-[11px] tracking-[0.1em] text-[#8c8880]">$ {t.containerFlow.toUpperCase()}</p>
              <div className="grid grid-cols-2 gap-2">
                {containerStats.map((c) => (
                  <div key={c.key} className="rounded-[10px] border border-[#e1d9cd] bg-white p-2">
                    <p className="text-xs text-[#8c8880]">{c.label}</p>
                    <p className="text-[22px] leading-none text-[#1f1f1b]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>{String(c.count).padStart(2, "0")}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-[14px] border border-[#d8d0c4] bg-[#fefcf8] p-3">
              <p className="mb-2 text-[11px] tracking-[0.1em] text-[#8c8880]">$ {t.climatePanel.toUpperCase()}</p>
              <p className="text-[30px] leading-none" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>
                {weather?.minTempC ?? "--"}°—{weather?.maxTempC ?? "--"}°
              </p>
              <p className="mt-1 text-xs text-[#6b695f]">{weather?.locationLabel ?? `${city ?? ""} ${country ?? ""}`.trim()}</p>
              <p className="mt-2 text-xs text-[#8c8880]">{t.weatherSource}：{weather?.source ?? "Open-Meteo"}</p>
            </section>
          </div>
        </aside>
      </div>
    </main>
  );
}
