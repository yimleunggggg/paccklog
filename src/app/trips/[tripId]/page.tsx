import Link from "next/link";
import { CalendarDays, CircleDot, MapPin } from "lucide-react";
import { saveTripAsTemplate } from "@/features/trips/actions";
import { LockerPickerSheet } from "@/components/locker-picker-sheet";
import { QuickAddForm } from "@/components/quick-add-form";
import { SortableTripGroup } from "@/components/sortable-trip-group";
import { TripContainerGroups } from "@/components/trip-container-groups";
import { TripShareActions } from "@/components/trip-share-actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveLang, texts } from "@/shared/i18n";
import { getTripWeather } from "@/lib/weather";
import { getItemCategoryOptions } from "@/shared/item-categories";
import { localeForLang, pickLangText } from "@/shared/localized-text";

function formatDateRange(start: string | null, end: string | null, lang: string) {
  if (!start) return "--";
  const locale = localeForLang(lang);
  const fmt = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });
  const startStr = fmt.format(new Date(start));
  const endStr = end ? fmt.format(new Date(end)) : "--";
  return `${startStr} – ${endStr}`;
}

type TripDetailPageProps = {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ status?: string; view?: string; mode?: string; lang?: string; container?: string }>;
};

export default async function TripDetailPage({ params, searchParams }: TripDetailPageProps) {
  const [{ tripId }, query] = await Promise.all([params, searchParams]);
  const statusFilter = query.status ?? "all";
  const allowedViews = new Set(["all", "category", "container"]);
  const view = query.view && allowedViews.has(query.view) ? query.view : "all";
  const mode = "detail" as const;
  const lang = resolveLang(query.lang);
  const allowedContainers = new Set(["undecided", "suitcase", "backpack", "carry_on", "wear"]);
  const containerFilter = query.container && allowedContainers.has(query.container) ? query.container : "";
  const t = texts[lang];
  const l = (en: string, zhTW: string, zhCN: string) => pickLangText(lang, { en, zhTW, zhCN });
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    return (
      <main className="packlog-page mx-auto w-full max-w-[980px] p-4 md:p-6">
        <h1 className="text-2xl text-[#1c1c18]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>
          {t.tripDetail}
        </h1>
        <p className="mt-2 text-sm text-[#6f6b62]">
          {lang === "en"
            ? "Trip detail is personal data. Login starts only when creating your personal trip."
            : lang === "zh-TW"
              ? "行程詳情屬於個人資料。只有在建立個人行程時才會啟動登入。"
              : "行程详情属于个人数据。只有在创建个人行程时才会发起登录。"}
        </p>
        <div className="mt-4 flex gap-2">
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
      : view === "category"
        ? (items ?? []).reduce<Record<string, typeof items>>((acc, item) => {
          acc[item.category] = [...(acc[item.category] ?? []), item];
          return acc;
          }, {})
        : { all_items: items };
  const scopeFieldForList: "all" | "category" | "container" =
    view === "container" ? "container" : view === "category" ? "category" : "all";
  const statusMeta: Record<string, string> = {
    all: t.statusAll?.trim() || l("All", "全部", "全部"),
    to_pack: t.statusToPack?.trim() || l("To pack", "待打包", "待打包"),
    packed: t.statusPacked?.trim() || l("Packed", "已打包", "已打包"),
    to_buy: t.statusToBuy?.trim() || l("To buy", "待购买", "待购买"),
    optional: t.statusOptional?.trim() || l("Optional", "可选", "可选"),
  };
  const statusLabel = (value?: string | null) => {
    if (!value) return "";
    return statusMeta[value] ?? value;
  };
  const statusFilters = ["all", "to_pack", "packed", "to_buy", "optional"] as const;
  const categoryViewLabel = t.categoryView?.trim() || l("Category view", "分類視圖", "分类视图");
  const containerViewLabel = t.containerView?.trim() || l("By container", "按容器", "按容器");
  const allViewLabel = l("All view", "全部視圖", "全局视图");
  const rainLabel = l("Rain", "降雨", "降雨");
  const categoryDistributionLabel = l("Category distribution", "分類分布", "分类分布");
  const containerDistributionLabel = l("Container distribution", "容器分布", "容器分布");
  const packedRatioLabel = l("Packed ratio", "已打包進度", "已打包进度");
  const quickAddLabel = l("Add", "新增", "添加");
  const optionalHintLabel = l("optional", "可選", "可选");
  const noteOptionalLabel = l("Note (optional)", "備註（可選）", "备注（可选）");
  const lockerLinkedHintText = l("Already linked to Gear Locker. Edits auto-sync.", "已關聯裝備庫，編輯將自動同步。", "已关联装备库，编辑将自动同步。");
  const allItemsSectionLabel = l("ALL ITEMS", "全部物品", "全部物品");
  const containerMeta: Record<string, string> = {
    undecided: t.containerUndecided,
    suitcase: t.containerSuitcase,
    backpack: t.containerBackpack,
    carry_on: t.containerCarryOn,
    wear: t.containerWear,
  };
  const categoryOptions = getItemCategoryOptions(lang);
  const categoryMeta = Object.fromEntries(categoryOptions.map((option) => [option.value, option.label]));

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
  const hasFilter = statusFilter !== "all" || Boolean(containerFilter);
  const filterHint =
    items.length === 0
      ? lang === "en"
        ? "No matching items. Try another filter."
        : lang === "zh-TW"
          ? "未找到符合條件的物品，請調整篩選。"
          : "未找到符合条件的物品，请调整筛选。"
      : hasFilter
        ? lang === "en"
          ? `Filtered items: ${items.length} / ${allItems.length}`
          : lang === "zh-TW"
            ? `篩選結果：${items.length} / ${allItems.length}`
            : `筛选结果：${items.length} / ${allItems.length}`
        : lang === "en"
          ? `Showing all items: ${allItems.length}`
          : lang === "zh-TW"
            ? `顯示全部 ${allItems.length} 件物品`
            : `显示全部 ${allItems.length} 件物品`;
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
              <li>
                <Link href={`/explore?lang=${lang}`} className="block rounded px-2 py-1 text-[#8c8880] hover:bg-[#f3eee5] hover:text-[#3a5c33]">
                  03 {t.navExplore}
                </Link>
              </li>
            </ul>
            <div className="my-3 h-px bg-[#e1d9cd]" />
            <p className="mb-2 text-[11px] tracking-[0.08em] text-[#8c8880]">{t.yourTrips.toUpperCase()}</p>
            <ul className="space-y-2">
              {(userTrips ?? []).map((entry) => (
                <li key={entry.id} className={`rounded-[8px] border px-2 py-1 ${entry.id === tripId ? "border-[#3a5c33] bg-[#eef4ea]" : "border-[#e1d9cd] bg-white"}`}>
                  <Link href={`/trips/${entry.id}?lang=${lang}`} className="block text-sm text-[#2f2d29]">
                    {entry.title}
                  </Link>
                  <p className="text-[11px] text-[#8c8880]">{statusLabel(entry.status)}</p>
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
            <CalendarDays size={12} /> {formatDateRange(trip?.start_date ?? null, trip?.end_date ?? null, lang)}
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
      {progress >= 100 ? (
        <TripShareActions tripId={tripId} lang={lang} title={trip?.title ?? t.tripDetail} progress={progress} />
      ) : null}
      {(trip?.status === "done" || trip?.status === "completed" || progress >= 100) ? (
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
              {rainLabel}: {weather?.rainSumMm ?? "--"}mm
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

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[13px] text-muted-foreground">{t.checklistView}</span>
        {statusFilters.map((s) => (
          <Link
            key={s}
            href={`/trips/${tripId}?status=${s}&view=${view}&lang=${lang}${containerFilter ? `&container=${containerFilter}` : ""}`}
            className={`brand-chip ${statusFilter === s ? "brand-chip-active" : ""}`}
          >
            {statusMeta[s]}{" "}
            <span className={statusFilter === s ? "text-[#d0ddca]" : "text-[#8c8880]"}>{statusCount[s]}</span>
          </Link>
        ))}
        <Link
          href={`/trips/${tripId}?status=${statusFilter}&view=all&lang=${lang}`}
          className={`brand-chip ${view === "all" ? "brand-chip-active" : ""}`}
        >
          {allViewLabel}
        </Link>
        <Link
          href={`/trips/${tripId}?status=${statusFilter}&view=category&lang=${lang}`}
          className={`brand-chip ${view === "category" ? "brand-chip-active" : ""}`}
        >
          {categoryViewLabel}
        </Link>
        <Link
          href={`/trips/${tripId}?status=${statusFilter}&view=container&lang=${lang}`}
          className={`brand-chip ${view === "container" ? "brand-chip-active" : ""}`}
        >
          {containerViewLabel}
        </Link>
      </div>
      <p className={`ui-filter-hint mb-3 ${items.length === 0 ? "ui-filter-hint-empty" : ""}`}>{filterHint}</p>
      <section className="mb-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-[10px] border border-[#e1d9cd] bg-[#fefcf8] px-3 py-2">
          <p className="text-[11px] text-[#8c8880]">{categoryDistributionLabel}</p>
          <p className="mt-1 text-[12px] text-[#4a4840]">
            {Object.entries(
              (items ?? []).reduce<Record<string, number>>((acc, item) => {
                acc[item.category] = (acc[item.category] ?? 0) + 1;
                return acc;
              }, {}),
            )
              .slice(0, 3)
              .map(([key, count]) => `${categoryMeta[key] ?? key} ${count}${l("", "件", "件")}`)
              .join(" · ") || "--"}
          </p>
        </div>
        <div className="rounded-[10px] border border-[#e1d9cd] bg-[#fefcf8] px-3 py-2">
          <p className="text-[11px] text-[#8c8880]">{containerDistributionLabel}</p>
          <p className="mt-1 text-[12px] text-[#4a4840]">
            {Object.entries(
              (items ?? []).reduce<Record<string, number>>((acc, item) => {
                acc[item.container] = (acc[item.container] ?? 0) + 1;
                return acc;
              }, {}),
            )
              .slice(0, 3)
              .map(([key, count]) => `${containerMeta[key] ?? key} ${count}${l("", "件", "件")}`)
              .join(" · ") || "--"}
          </p>
        </div>
        <div className="rounded-[10px] border border-[#e1d9cd] bg-[#fefcf8] px-3 py-2">
          <p className="text-[11px] text-[#8c8880]">{packedRatioLabel}</p>
          <p className="mt-1 text-[12px] text-[#4a4840]">{packed}/{total} · {progress}%</p>
        </div>
      </section>
      <section className="mb-5 rounded-xl border border-[#d8d0c4] bg-[#fefcf8] p-3">
        <div className="mb-2 flex justify-end">
          <LockerPickerSheet
            tripId={tripId}
            buttonLabel={t.fromGearLocker}
            submitLabel={t.addSelectedToTrip}
            items={lockerItems ?? []}
            defaultStatus={statusFilter === "to_buy" || statusFilter === "optional" ? statusFilter : "to_pack"}
          />
        </div>
        <QuickAddForm
          tripId={tripId}
          quickAddPlaceholder={t.quickAddBar}
          addLabel={quickAddLabel}
          defaultStatus={statusFilter === "to_buy" || statusFilter === "optional" || statusFilter === "packed" ? statusFilter : "to_pack"}
          brandLabel={t.brand}
          brandOptionalHint={optionalHintLabel}
          noteLabel={noteOptionalLabel}
          categories={categoryOptions}
        />
      </section>

      <section className="space-y-5">
        {view === "container" ? (
          <TripContainerGroups
            tripId={tripId}
            lang={lang}
            grouped={grouped}
            containerMeta={containerMeta}
            categoryMeta={categoryMeta}
            categoryOptions={categoryOptions}
            statusMeta={statusMeta}
            containerItemsPackedText={t.containerItemsPacked}
            saveText={t.save}
            cancelText={t.confirmCancel}
            saveToLockerText={t.saveToGearLocker}
            lockerLinkedHintText={lockerLinkedHintText}
            brandPlaceholder={t.brand}
            brandAlternativesPlaceholder={t.brandAlternativesPlaceholder}
            notePlaceholder={t.noteField}
            editLabel={t.advancedEdit}
            savePendingText={t.savePending}
            saveSuccessText={t.saveSuccess}
            saveFailedText={t.saveFailed}
            tripStatus={trip?.status}
            reviewLabels={[
              { value: "used", label: t.reviewUsed },
              { value: "unused", label: t.reviewUnused },
              { value: "missed", label: t.reviewMissed },
              { value: "skip", label: t.reviewSkip },
            ]}
          />
        ) : (
          Object.entries(grouped).map(([group, groupItems], groupIndex) => (
            <section key={group}>
              {view === "category" ? (
                <details className="section-group" open={groupIndex === 0}>
                  <summary className="section-head cursor-pointer list-none">
                    <span className="section-index">{String(groupIndex + 1).padStart(2, "0")}</span>
                    <span className="section-name">{group === "all_items" ? allItemsSectionLabel : group.replace(/_/g, " ").toUpperCase()}</span>
                    <span className="section-count">{groupItems?.length ?? 0}</span>
                  </summary>
                  <SortableTripGroup
                    key={`${group}:${(groupItems ?? []).map((item) => `${item.id}:${item.status}:${item.container}:${item.category}`).join("|")}`}
                    items={groupItems ?? []}
                    tripId={tripId}
                    group={group}
                    scopeField={scopeFieldForList}
                    mode={mode}
                    lang={lang}
                    statusMeta={statusMeta}
                    containerMeta={containerMeta}
                    categoryMeta={categoryMeta}
                    categoryOptions={categoryOptions}
                    showCategoryTag={view !== "category"}
                    saveText={t.save}
                    cancelText={t.confirmCancel}
                    saveToLockerText={t.saveToGearLocker}
                    lockerLinkedHintText={lockerLinkedHintText}
                    brandPlaceholder={t.brand}
                    brandAlternativesPlaceholder={t.brandAlternativesPlaceholder}
                    notePlaceholder={t.noteField}
                    editLabel={t.advancedEdit}
                    savePendingText={t.savePending}
                    saveSuccessText={t.saveSuccess}
                    saveFailedText={t.saveFailed}
                    tripStatus={trip?.status}
                    reviewLabels={[
                      { value: "used", label: t.reviewUsed },
                      { value: "unused", label: t.reviewUnused },
                      { value: "missed", label: t.reviewMissed },
                      { value: "skip", label: t.reviewSkip },
                    ]}
                  />
                </details>
              ) : (
                <>
                  <div className="section-head">
                    <span className="section-index">{String(groupIndex + 1).padStart(2, "0")}</span>
                    <span className="section-name">{group === "all_items" ? allItemsSectionLabel : group.replace(/_/g, " ").toUpperCase()}</span>
                    <span className="section-count">{groupItems?.length ?? 0}</span>
                  </div>
                  <SortableTripGroup
                    key={`${group}:${(groupItems ?? []).map((item) => `${item.id}:${item.status}:${item.container}:${item.category}`).join("|")}`}
                    items={groupItems ?? []}
                    tripId={tripId}
                    group={group}
                    scopeField={scopeFieldForList}
                    mode={mode}
                    lang={lang}
                    statusMeta={statusMeta}
                    containerMeta={containerMeta}
                    categoryMeta={categoryMeta}
                    categoryOptions={categoryOptions}
                    showCategoryTag={view !== "category"}
                    saveText={t.save}
                    cancelText={t.confirmCancel}
                    saveToLockerText={t.saveToGearLocker}
                    lockerLinkedHintText={lockerLinkedHintText}
                    brandPlaceholder={t.brand}
                    brandAlternativesPlaceholder={t.brandAlternativesPlaceholder}
                    notePlaceholder={t.noteField}
                    editLabel={t.advancedEdit}
                    savePendingText={t.savePending}
                    saveSuccessText={t.saveSuccess}
                    saveFailedText={t.saveFailed}
                    tripStatus={trip?.status}
                    reviewLabels={[
                      { value: "used", label: t.reviewUsed },
                      { value: "unused", label: t.reviewUnused },
                      { value: "missed", label: t.reviewMissed },
                      { value: "skip", label: t.reviewSkip },
                    ]}
                  />
                </>
              )}
            </section>
          ))
        )}
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
