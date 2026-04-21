import Link from "next/link";
import { copyPublicTrip } from "@/features/trips/actions";
import { requireUser } from "@/features/trips/server";
import { resolveLang, texts } from "@/shared/i18n";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang: rawLang } = await searchParams;
  const lang = resolveLang(rawLang);
  const t = texts[lang];
  const { supabase } = await requireUser();
  const { data: trips } = await supabase
    .from("trips")
    .select("id,title,start_date,end_date,tags")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(40);

  return (
    <main className="packlog-page mx-auto w-full max-w-[980px] p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href={`/?lang=${lang}`} className="text-sm underline">
          {t.backList}
        </Link>
        <h1 className="text-2xl" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>{t.explore}</h1>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {(trips ?? []).map((trip) => (
          <li key={trip.id} className="rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] p-3">
            <p className="text-[18px]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>{trip.title}</p>
            <p className="mt-1 text-xs text-[#8c8880]">{trip.start_date ?? t.noDate} - {trip.end_date ?? t.noDate}</p>
            <p className="mt-1 text-xs text-[#4a4840]">{Array.isArray(trip.tags) ? trip.tags.slice(0, 4).join(" · ") : ""}</p>
            <form action={copyPublicTrip} className="mt-2">
              <input type="hidden" name="source_trip_id" value={trip.id} />
              <input type="hidden" name="lang" value={lang} />
              <button type="submit" className="brand-btn-soft px-3 py-2 text-xs">{t.copyToMyTrip}</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
