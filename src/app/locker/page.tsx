import Link from "next/link";
import { requireUser } from "@/features/trips/server";
import { resolveLang, texts, type Lang } from "@/shared/i18n";
import { LockerAddModal } from "@/components/locker-add-modal";
import { LockerFilteredList } from "@/components/locker-filtered-list";
import { getItemCategoryOptions } from "@/shared/item-categories";

function hasCjk(text: string | null | undefined) {
  return /[\u4e00-\u9fff]/.test(text ?? "");
}

export default async function LockerPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; status?: string; category?: string; brand?: string }>;
}) {
  const { lang: rawLang, status, category, brand } = await searchParams;
  const lang = resolveLang(rawLang);
  const { supabase, user } = await requireUser();
  const selectedStatus = status === "owned" || status === "wishlist" ? status : "all";
  const selectedCategory = String(category ?? "all");
  const brandKeyword = String(brand ?? "").trim();
  const { data: lockerItems } = await supabase
    .from("gear_locker")
    .select("id,name,category,brand,note,status,times_used,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const autoZh = lang === "en" && (lockerItems ?? []).some((item) => hasCjk(item.name) || hasCjk(item.note) || hasCjk(item.brand));
  const uiLang: Lang = autoZh ? "zh-CN" : lang;
  const t = texts[uiLang];
  const noteText = uiLang === "en" ? "Note" : uiLang === "zh-TW" ? "備註" : "备注";
  const optionalText = uiLang === "en" ? "optional" : uiLang === "zh-TW" ? "可選" : "可选";
  const categoryOptions = [{ value: "all", label: t.statusAll }, ...getItemCategoryOptions(uiLang)];
  const { data: userTrips } = await supabase.from("trips").select("id,title,start_date,end_date").eq("user_id", user.id);
  const tripIds = (userTrips ?? []).map((trip) => trip.id);
  const { data: usageRows } =
    tripIds.length > 0
      ? await supabase
          .from("trip_items")
          .select("trip_id,source_locker_id,status,container,note,updated_at")
          .in("trip_id", tripIds)
          .not("source_locker_id", "is", null)
          .order("updated_at", { ascending: false })
      : { data: [] as Array<{ trip_id: string; source_locker_id: string | null; status: string; container: string; note: string | null; updated_at: string | null }> };
  const tripTitleById = new Map((userTrips ?? []).map((trip) => [trip.id, { title: trip.title ?? "", start_date: trip.start_date, end_date: trip.end_date }]));
  const usageLogsByLockerId = new Map<
    string,
    Array<{ trip_id: string; trip_title: string; trip_date: string; status: string; container: string; note: string | null; updated_at: string | null }>
  >();
  (usageRows ?? []).forEach((row) => {
    const lockerId = String(row.source_locker_id ?? "");
    if (!lockerId) return;
    const trip = tripTitleById.get(row.trip_id);
    const tripDate = trip?.start_date && trip?.end_date ? `${trip.start_date} ~ ${trip.end_date}` : "";
    const current = usageLogsByLockerId.get(lockerId) ?? [];
    current.push({
      trip_id: row.trip_id,
      trip_title: trip?.title ?? row.trip_id,
      trip_date: tripDate,
      status: row.status,
      container: row.container,
      note: row.note,
      updated_at: row.updated_at,
    });
    usageLogsByLockerId.set(lockerId, current);
  });
  const lockerItemsWithLogs = (lockerItems ?? []).map((item) => ({
    ...item,
    usage_logs: usageLogsByLockerId.get(item.id)?.slice(0, 5) ?? [],
  }));

  return (
    <main className="packlog-page mx-auto w-full max-w-[980px] p-4 md:p-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] italic text-[#1c1c18]" style={{ fontFamily: "EB Garamond, serif" }}>
          {t.gearLocker}
        </h1>
        <div className="flex items-center gap-2">
          <LockerAddModal
            title={t.add}
            openText={t.add}
            closeText={t.confirmCancel}
            itemNameLabel={t.itemName}
            brandLabel={t.brand}
            brandOptionalHint={optionalText}
            categoryLabel={t.category}
            categoryOptions={categoryOptions.filter((item) => item.value !== "all")}
            noteLabel={noteText}
            addLabel={t.add}
            ownedLabel={t.owned}
            wishlistLabel={t.wishlist}
          />
          <Link href={`/?lang=${uiLang}`} className="brand-btn-soft px-3 py-2 text-[12px]">
            {t.backList}
          </Link>
        </div>
      </header>

      <LockerFilteredList
        items={lockerItemsWithLogs}
        lang={uiLang}
        initialStatus={selectedStatus}
        initialCategory={selectedCategory}
        initialBrand={brandKeyword}
        categoryOptions={categoryOptions}
        texts={{
          statusAll: t.statusAll,
          owned: t.owned,
          wishlist: t.wishlist,
          brand: t.brand,
          usedTimes: t.usedTimes,
          usedTimesUnit: t.usedTimesUnit,
          save: t.save,
          confirmCancel: t.confirmCancel,
          delete: t.delete,
          itemName: t.itemName,
          category: t.category,
          status: t.status,
        }}
      />
    </main>
  );
}
