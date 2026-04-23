"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/trips/server";
import { normalizeItemCategory } from "@/shared/item-categories";
import { ensureGearMasterId } from "@/server/gear-master";

export async function addLockerItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const category = normalizeItemCategory(String(formData.get("category") ?? "").trim());
  const brand = String(formData.get("brand") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const status = String(formData.get("status") ?? "owned");
  if (!name) return;
  const gearId = await ensureGearMasterId(supabase, {
    name,
    category: category || null,
    brand: brand || null,
    note: note || null,
  });

  const { error } = await supabase.from("gear_locker").insert({
    user_id: user.id,
    gear_id: gearId,
    name,
    category: category || null,
    brand: brand || null,
    note: note || null,
    status: status === "wishlist" ? "wishlist" : "owned",
  });
  if (error) return;
  revalidatePath("/locker");
}

export async function updateLockerItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const name = String(formData.get("name") ?? "").trim();
  const category = normalizeItemCategory(String(formData.get("category") ?? "").trim());
  const brand = String(formData.get("brand") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const status = String(formData.get("status") ?? "owned");
  if (!name) return;
  const gearId = await ensureGearMasterId(supabase, {
    name,
    category: category || null,
    brand: brand || null,
    note: note || null,
  });

  const { error } = await supabase
    .from("gear_locker")
    .update({
      gear_id: gearId,
      name,
      category: category || null,
      brand: brand || null,
      note: note || null,
      status: status === "wishlist" ? "wishlist" : "owned",
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return;
  revalidatePath("/locker");
}

export async function deleteLockerItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { error } = await supabase.from("gear_locker").delete().eq("id", id).eq("user_id", user.id);
  if (error) return;
  revalidatePath("/locker");
}
