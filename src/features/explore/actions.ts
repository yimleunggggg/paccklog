"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/trips/server";
import { detectBrandFromText } from "@/shared/brand-library";
import { normalizeItemCategory } from "@/shared/item-categories";

export type ExploreMutationResult =
  | { ok: true }
  | { ok: false; code: "missing_fields" | "empty_template" | "copy_failed" | "item_missing" | "trip_insert_failed" };

function bulkTripStatus(raw: string): "to_pack" | "to_buy" | "optional" | "packed" | null {
  if (raw === "to_pack" || raw === "to_buy" || raw === "optional" || raw === "packed") return raw;
  return null;
}

function pickLocalizedCommunityValue(
  lang: string,
  values: {
    base?: string | null;
    zh?: string | null;
    en?: string | null;
  },
) {
  if (lang === "en") return values.en || values.base || values.zh || null;
  return values.zh || values.base || values.en || null;
}

let hasTripSourceLockerColumn: boolean | null = null;
async function canUseTripSourceLockerColumn(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"]) {
  if (hasTripSourceLockerColumn !== null) return hasTripSourceLockerColumn;
  const { error } = await supabase.from("trip_items").select("source_locker_id").limit(1);
  hasTripSourceLockerColumn = !error;
  return hasTripSourceLockerColumn;
}

export async function copyCommunityTemplateToTrip(formData: FormData): Promise<ExploreMutationResult> {
  const { supabase, user } = await requireUser();
  const templateId = String(formData.get("template_id") ?? "");
  const tripId = String(formData.get("trip_id") ?? "");
  const lang = String(formData.get("lang") ?? "zh-CN");
  const bulkStatus = bulkTripStatus(String(formData.get("bulk_status") ?? "").trim());
  if (!templateId || !tripId) return { ok: false, code: "missing_fields" };

  const { data: templateItems } = await supabase
    .from("community_template_items")
    .select("name,name_zh,name_en,category,status,container,brand,note,note_zh,note_en,sort_order")
    .eq("template_id", templateId)
    .order("sort_order", { ascending: true });

  if (!templateItems?.length) {
    return { ok: false, code: "empty_template" };
  }

  const canUseSourceLocker = await canUseTripSourceLockerColumn(supabase);
  const names = (templateItems ?? [])
    .map((item) =>
      pickLocalizedCommunityValue(lang, {
        base: item.name,
        zh: item.name_zh,
        en: item.name_en,
      }) ?? item.name,
    )
    .filter(Boolean);
  const { data: ownedRows } =
    canUseSourceLocker && names.length
      ? await supabase.from("gear_locker").select("id,name").eq("user_id", user.id).in("name", names)
      : { data: [] as Array<{ id: string; name: string }> };
  const lockerByName = new Map((ownedRows ?? []).map((row) => [row.name, row.id]));

  const payload = (templateItems ?? []).map((item) => {
    const localizedName =
      pickLocalizedCommunityValue(lang, {
        base: item.name,
        zh: item.name_zh,
        en: item.name_en,
      }) ?? item.name;
    const fromTemplate =
      item.status === "opt" ? "optional" : item.status === "buy" ? "to_buy" : "to_pack";
    const status = bulkStatus ?? fromTemplate;
    return {
      trip_id: tripId,
      ...(canUseSourceLocker ? { source_locker_id: lockerByName.get(localizedName) ?? null } : {}),
      name: localizedName,
      category: normalizeItemCategory(item.category || "other"),
      status,
      container: item.container || "undecided",
      quantity: 1,
      brand: item.brand || detectBrandFromText(localizedName)?.label || null,
      note:
        pickLocalizedCommunityValue(lang, {
          base: item.note,
          zh: item.note_zh,
          en: item.note_en,
        }) ?? null,
      sort_order: item.sort_order ?? 0,
    };
  });

  const { error } = await supabase.from("trip_items").insert(payload);
  if (error) {
    return { ok: false, code: "copy_failed" };
  }

  const { error: incError } = await supabase.rpc("increment_community_template_copy_count", {
    p_template_id: templateId,
  });
  if (incError) {
    console.error("increment_community_template_copy_count", incError);
  }

  revalidatePath("/explore");
  revalidatePath(`/trips/${tripId}`);
  return { ok: true };
}

export async function addCommunityItemToLocker(formData: FormData): Promise<ExploreMutationResult> {
  const { supabase, user } = await requireUser();
  const itemId = String(formData.get("item_id") ?? "");
  const lockerStatus = String(formData.get("locker_status") ?? "owned");
  const lang = String(formData.get("lang") ?? "zh-CN");
  if (!itemId) return { ok: false, code: "missing_fields" };

  const { data: item } = await supabase
    .from("community_template_items")
    .select("name,name_zh,name_en,category,brand,note,note_zh,note_en")
    .eq("id", itemId)
    .single();
  if (!item) return { ok: false, code: "item_missing" };

  const normalizedCategory = normalizeItemCategory(item.category);
  const localizedName =
    pickLocalizedCommunityValue(lang, {
      base: item.name,
      zh: item.name_zh,
      en: item.name_en,
    }) ?? item.name;
  const localizedNote =
    pickLocalizedCommunityValue(lang, {
      base: item.note,
      zh: item.note_zh,
      en: item.note_en,
    }) ?? null;
  const detectedBrand = item.brand || detectBrandFromText(localizedName)?.label || null;
  const status = lockerStatus === "wishlist" ? "wishlist" : "owned";
  const { data: existing } = await supabase
    .from("gear_locker")
    .select("id")
    .eq("user_id", user.id)
    .ilike("name", localizedName)
    .limit(1);

  if (existing?.[0]?.id) {
    await supabase
      .from("gear_locker")
      .update({
        category: normalizedCategory,
        brand: detectedBrand,
        note: localizedNote,
        status,
      })
      .eq("id", existing[0].id)
      .eq("user_id", user.id);
  } else {
    await supabase.from("gear_locker").insert({
      user_id: user.id,
      name: localizedName,
      category: normalizedCategory,
      brand: detectedBrand,
      note: localizedNote,
      status,
    });
  }

  // best-effort engagement metrics
  const { data: metricItem } = await supabase
    .from("community_template_items")
    .select("template_id,added_to_locker_count")
    .eq("id", itemId)
    .single();
  if (metricItem?.template_id) {
    await supabase
      .from("community_template_items")
      .update({
        added_to_locker_count: (metricItem.added_to_locker_count ?? 0) + 1,
      })
      .eq("id", itemId);
    const { data: t } = await supabase
      .from("community_templates")
      .select("item_add_count")
      .eq("id", metricItem.template_id)
      .single();
    await supabase
      .from("community_templates")
      .update({ item_add_count: (t?.item_add_count ?? 0) + 1 })
      .eq("id", metricItem.template_id);
  }

  revalidatePath("/locker");
  revalidatePath("/explore");
  return { ok: true };
}

export async function addCommunityItemToTrip(formData: FormData): Promise<ExploreMutationResult> {
  const { supabase, user } = await requireUser();
  const itemId = String(formData.get("item_id") ?? "");
  const tripId = String(formData.get("trip_id") ?? "");
  const tripStatusRaw = String(formData.get("trip_status") ?? "to_pack");
  const lang = String(formData.get("lang") ?? "zh-CN");
  if (!itemId || !tripId) return { ok: false, code: "missing_fields" };

  const { data: item } = await supabase
    .from("community_template_items")
    .select("name,name_zh,name_en,category,brand,note,note_zh,note_en")
    .eq("id", itemId)
    .single();
  if (!item) return { ok: false, code: "item_missing" };

  const localizedName =
    pickLocalizedCommunityValue(lang, {
      base: item.name,
      zh: item.name_zh,
      en: item.name_en,
    }) ?? item.name;
  const localizedNote =
    pickLocalizedCommunityValue(lang, {
      base: item.note,
      zh: item.note_zh,
      en: item.note_en,
    }) ?? null;

  const tripStatus =
    tripStatusRaw === "to_buy" || tripStatusRaw === "optional" || tripStatusRaw === "packed"
      ? tripStatusRaw
      : "to_pack";

  const canUseSourceLocker = await canUseTripSourceLockerColumn(supabase);
  const { data: existingLocker } =
    canUseSourceLocker
      ? await supabase.from("gear_locker").select("id").eq("user_id", user.id).ilike("name", localizedName).limit(1)
      : { data: [] as Array<{ id: string }> };
  const { error } = await supabase.from("trip_items").insert({
    trip_id: tripId,
    ...(canUseSourceLocker ? { source_locker_id: existingLocker?.[0]?.id ?? null } : {}),
    name: localizedName,
    category: normalizeItemCategory(item.category || "other"),
    status: tripStatus,
    container: "undecided",
    quantity: 1,
    brand: item.brand || detectBrandFromText(localizedName)?.label || null,
    note: localizedNote,
  });

  if (error) return { ok: false, code: "trip_insert_failed" };

  // best-effort engagement metrics
  const { data: metricItem } = await supabase
    .from("community_template_items")
    .select("template_id,added_to_trip_count")
    .eq("id", itemId)
    .single();
  if (metricItem?.template_id) {
    await supabase
      .from("community_template_items")
      .update({
        added_to_trip_count: (metricItem.added_to_trip_count ?? 0) + 1,
      })
      .eq("id", itemId);
    const { data: t } = await supabase
      .from("community_templates")
      .select("item_add_count")
      .eq("id", metricItem.template_id)
      .single();
    await supabase
      .from("community_templates")
      .update({ item_add_count: (t?.item_add_count ?? 0) + 1 })
      .eq("id", metricItem.template_id);
  }

  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/explore");
  return { ok: true };
}
