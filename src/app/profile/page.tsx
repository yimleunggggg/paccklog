import Link from "next/link";
import { requireUser } from "@/features/trips/server";
import { resolveLang, texts } from "@/shared/i18n";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang: rawLang } = await searchParams;
  const lang = resolveLang(rawLang);
  const t = texts[lang];
  const { supabase } = await requireUser();
  const { data: templates } = await supabase
    .from("trip_templates")
    .select("id,name,created_at,scenes")
    .order("created_at", { ascending: false });

  return (
    <main className="packlog-page mx-auto w-full max-w-[980px] p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href={`/?lang=${lang}`} className="text-sm underline">
          {t.backList}
        </Link>
        <h1 className="text-2xl" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>{t.myTemplateLibrary}</h1>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {(templates ?? []).map((tpl) => (
          <li key={tpl.id} className="rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] p-3">
            <p className="text-base">{tpl.name}</p>
            <p className="mt-1 text-xs text-[#8c8880]">{new Date(tpl.created_at).toLocaleDateString()}</p>
            <p className="mt-1 text-xs text-[#4a4840]">{Array.isArray(tpl.scenes) ? tpl.scenes.join(" · ") : ""}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
