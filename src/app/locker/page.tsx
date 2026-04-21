import Link from "next/link";
import { requireUser } from "@/features/trips/server";
import { resolveLang, texts } from "@/shared/i18n";
import { LockerItemEditor } from "@/components/locker-item-editor";
import { LockerAddForm } from "@/components/locker-add-form";

export default async function LockerPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; status?: string }>;
}) {
  const { lang: rawLang, status } = await searchParams;
  const lang = resolveLang(rawLang);
  const t = texts[lang];
  const { supabase, user } = await requireUser();
  const selectedStatus = status === "owned" || status === "wishlist" ? status : "all";
  const { data: lockerItems } = await supabase
    .from("gear_locker")
    .select("id,name,category,brand,note,status,times_used,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const visibleItems = (lockerItems ?? []).filter((item) => (selectedStatus === "all" ? true : item.status === selectedStatus));
  const grouped = visibleItems.reduce<Record<string, typeof visibleItems>>((acc, item) => {
    const key = item.category || "other";
    acc[key] = [...(acc[key] ?? []), item];
    return acc;
  }, {});

  return (
    <main className="packlog-page mx-auto w-full max-w-[980px] p-4 md:p-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] italic text-[#1c1c18]" style={{ fontFamily: "EB Garamond, serif" }}>
          {t.gearLocker}
        </h1>
        <Link href={`/?lang=${lang}`} className="brand-btn-soft px-3 py-2 text-sm">
          {t.backList}
        </Link>
      </header>

      <div className="mb-3 flex flex-wrap gap-2">
        {[
          { value: "all", label: t.statusAll },
          { value: "owned", label: t.owned },
          { value: "wishlist", label: t.wishlist },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/locker?lang=${lang}&status=${tab.value}`}
            className={`brand-chip ${selectedStatus === tab.value ? "brand-chip-active" : ""}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <section className="mb-5 border-b border-[#d8d0c4] pb-4">
        <LockerAddForm
          itemNameLabel={t.itemName}
          brandLabel={t.brand}
          categoryLabel={t.category}
          categoryOptions={[
            { value: "clothing", label: t.categoryClothing },
            { value: "footwear", label: t.categoryFootwear },
            { value: "electronics", label: t.categoryElectronics },
            { value: "toiletries", label: t.categoryToiletries },
            { value: "documents", label: t.categoryDocuments },
            { value: "nutrition", label: t.categoryNutrition },
            { value: "camping", label: t.categoryCamping },
            { value: "first_aid", label: t.categoryFirstAid },
            { value: "other", label: t.categoryOther },
          ]}
          noteLabel={t.noteField}
          addLabel={t.add}
          ownedLabel={t.owned}
          wishlistLabel={t.wishlist}
        />
      </section>

      <section className="space-y-5">
        {Object.entries(grouped).map(([group, groupItems], index) => (
          <section key={group}>
            <div className="section-head">
              <span className="section-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="section-name">{group.toUpperCase()}</span>
              <span className="section-count">{groupItems.length}</span>
            </div>
            <ul>
              {groupItems.map((item) => (
                <li key={item.id} className="item-row item-row-flat locker-row">
                  <div className="locker-row-main">
                    <div className="locker-row-left">
                      <span className={`locker-dot inline-flex h-[17px] w-[17px] rounded-full border ${item.status === "owned" ? "border-[#3a5c33] bg-[#3a5c33]" : "border-[#c9c3b8] bg-transparent"}`}>
                        {item.status === "owned" ? "✓" : ""}
                      </span>
                      <div className="min-w-0 locker-row-text">
                        <p className="locker-item-name text-[#1f1f1b]">{item.name}</p>
                        {item.brand ? (
                          <p className="locker-item-brand text-[#7b7770]" style={{ fontFamily: "EB Garamond, serif" }}>
                            {item.brand}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="locker-row-right">
                      <p className="locker-used-times text-[#8c8880]" style={{ fontFamily: "EB Garamond, serif" }}>
                        × {item.times_used ?? 0}
                      </p>
                      <LockerItemEditor
                        item={item}
                        editText={t.advancedEdit}
                        saveText={t.save}
                        cancelText={t.confirmCancel}
                        deleteText={t.confirmOk}
                        confirmText={`${t.delete}「${item.name}」？`}
                        ownedText={t.owned}
                        wishlistText={t.wishlist}
                        itemNameLabel={t.itemName}
                        brandLabel={t.brand}
                        categoryLabel={t.category}
                        noteLabel={t.noteField}
                        statusLabel={t.status}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>
    </main>
  );
}
