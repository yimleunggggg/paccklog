import type { requireUser } from "@/features/trips/server";

type AppSupabase = Awaited<ReturnType<typeof requireUser>>["supabase"];

export function normalizeGearName(input: string) {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[·•]/g, " ")
    .replace(/[()（）\[\]【】]/g, "")
    .trim();
}

function applyNullableEq<T extends { eq: (field: string, value: string) => T; is: (field: string, value: null) => T }>(
  query: T,
  field: string,
  value: string | null,
) {
  if (value) return query.eq(field, value);
  return query.is(field, null);
}

export async function ensureGearMasterId(
  supabase: AppSupabase,
  payload: {
    name: string;
    category?: string | null;
    brand?: string | null;
    note?: string | null;
  },
) {
  const name = String(payload.name ?? "").trim();
  if (!name) return null;
  const category = payload.category?.trim() || null;
  const brand = payload.brand?.trim() || null;
  const note = payload.note?.trim() || null;
  const normalizedName = normalizeGearName(name);
  if (!normalizedName) return null;

  let query = supabase
    .from("gear_master")
    .select("id")
    .eq("normalized_name", normalizedName)
    .limit(1);
  query = applyNullableEq(query, "brand", brand);
  query = applyNullableEq(query, "category", category);
  const { data: existing } = await query;
  if (existing?.[0]?.id) return String(existing[0].id);

  const { data: inserted, error } = await supabase
    .from("gear_master")
    .insert({
      normalized_name: normalizedName,
      display_name: name,
      category,
      brand,
      canonical_note: note,
    })
    .select("id")
    .single();
  if (!error && inserted?.id) return String(inserted.id);

  // Handle possible races against unique index.
  let retryQuery = supabase
    .from("gear_master")
    .select("id")
    .eq("normalized_name", normalizedName)
    .limit(1);
  retryQuery = applyNullableEq(retryQuery, "brand", brand);
  retryQuery = applyNullableEq(retryQuery, "category", category);
  const { data: retry } = await retryQuery;
  return retry?.[0]?.id ? String(retry[0].id) : null;
}
