"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureUserProfile, normalizeItemName, requireUser } from "@/features/trips/server";
import { normalizeItemCategory } from "@/shared/item-categories";
import { pickLangText } from "@/shared/localized-text";
import { ensureGearMasterId } from "@/server/gear-master";

function getSeasonByMonth(month: number, lang: string) {
  if ([3, 4, 5].includes(month)) return pickLangText(lang, { en: "Spring", zhTW: "春季", zhCN: "春季" });
  if ([6, 7, 8].includes(month)) return pickLangText(lang, { en: "Summer", zhTW: "夏季", zhCN: "夏季" });
  if ([9, 10, 11].includes(month)) return pickLangText(lang, { en: "Autumn", zhTW: "秋季", zhCN: "秋季" });
  return pickLangText(lang, { en: "Winter", zhTW: "冬季", zhCN: "冬季" });
}

function buildPackingHint(season: string, lang: string) {
  if (season === "Summer" || season === "夏季") {
    return pickLangText(lang, {
      en: "Quick-dry breathable wear, airy shoes, sun hat and sunscreen.",
      zhTW: "輕薄快乾、透氣鞋、遮陽帽、防曬。",
      zhCN: "轻薄速干、透气鞋、遮阳帽、防晒。",
    });
  }
  if (season === "Winter" || season === "冬季") {
    return pickLangText(lang, {
      en: "Insulating mid-layer, windproof shell, warm socks and gloves.",
      zhTW: "保暖中層、防風外層、保暖襪與手套。",
      zhCN: "保暖中层、防风外层、保暖袜、手套。",
    });
  }
  if (season === "Autumn" || season === "秋季") {
    return pickLangText(lang, {
      en: "Layering setup, light fleece and a wind-resistant jacket.",
      zhTW: "洋蔥式穿搭、薄抓絨、輕防風外套。",
      zhCN: "洋葱穿搭、薄抓绒、轻防风外套。",
    });
  }
  return pickLangText(lang, {
    en: "Layer-friendly outerwear, quick-dry base and light rain-ready gear.",
    zhTW: "可疊穿外套、快乾內層與防小雨裝備。",
    zhCN: "可叠穿外套、速干内层、防小雨装备。",
  });
}

function hasDestinationConflict(templateName: string, country: string) {
  const locationKeywords = ["日本", "韩国", "中国", "英国", "美国", "法国", "意大利", "泰国"];
  const matched = locationKeywords.find((keyword) => templateName.includes(keyword));
  if (!matched) return false;
  return !country.includes(matched);
}

function isMissingSourceLockerColumnError(error: unknown) {
  const message = typeof error === "object" && error && "message" in error ? String((error as { message?: string }).message ?? "") : "";
  return message.includes("source_locker_id") && (message.includes("does not exist") || message.includes("column"));
}

function isMissingGearIdColumnError(error: unknown) {
  const message = typeof error === "object" && error && "message" in error ? String((error as { message?: string }).message ?? "") : "";
  return message.includes("gear_id") && (message.includes("does not exist") || message.includes("column"));
}

async function hasSourceLockerIdColumn(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"]) {
  const { error } = await supabase.from("trip_items").select("id,source_locker_id").limit(1);
  if (!error) return true;
  if (isMissingSourceLockerColumnError(error)) return false;
  return true;
}

async function hasTripItemGearIdColumn(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"]) {
  const { error } = await supabase.from("trip_items").select("id,gear_id").limit(1);
  if (!error) return true;
  if (isMissingGearIdColumnError(error)) return false;
  return true;
}

async function hasLockerGearIdColumn(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"]) {
  const { error } = await supabase.from("gear_locker").select("id,gear_id").limit(1);
  if (!error) return true;
  if (isMissingGearIdColumnError(error)) return false;
  return true;
}

function parseDateOnly(value: string) {
  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

async function syncGearUsageForTripDone(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  userId: string,
  tripId: string,
) {
  const [{ data: tripItems }, { data: lockerItems }] = await Promise.all([
    supabase.from("trip_items").select("name").eq("trip_id", tripId),
    supabase.from("gear_locker").select("id,name,times_used").eq("user_id", userId),
  ]);

  const increments = new Map<string, number>();
  (tripItems ?? []).forEach((item) => {
    const key = normalizeItemName(item.name ?? "");
    if (!key) return;
    increments.set(key, (increments.get(key) ?? 0) + 1);
  });

  for (const locker of lockerItems ?? []) {
    const key = normalizeItemName(locker.name ?? "");
    const increase = increments.get(key) ?? 0;
    if (increase <= 0) continue;
    await supabase
      .from("gear_locker")
      .update({
        times_used: (locker.times_used ?? 0) + increase,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", locker.id)
      .eq("user_id", userId);
  }
}

async function recalculateLockerUsage(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  userId: string,
) {
  const { data: lockerItems } = await supabase.from("gear_locker").select("id,times_used,last_used_at").eq("user_id", userId);
  const usageCountByLockerId = new Map<string, number>();

  const { data: usageRows } = await supabase
    .from("trip_items")
    .select("source_locker_id,trip_id")
    .not("source_locker_id", "is", null);

  const uniqueTripLockerPairs = new Set<string>();
  (usageRows ?? []).forEach((row) => {
    const lockerId = String(row.source_locker_id ?? "");
    const tripId = String(row.trip_id ?? "");
    if (!lockerId || !tripId) return;
    uniqueTripLockerPairs.add(`${lockerId}:${tripId}`);
  });

  uniqueTripLockerPairs.forEach((pair) => {
    const lockerId = pair.split(":")[0];
    usageCountByLockerId.set(lockerId, (usageCountByLockerId.get(lockerId) ?? 0) + 1);
  });

  await Promise.all(
    (lockerItems ?? []).map((locker) => {
      const nextTimesUsed = usageCountByLockerId.get(locker.id) ?? 0;
      const prevTimesUsed = locker.times_used ?? 0;
      if (nextTimesUsed === prevTimesUsed) return Promise.resolve();
      return supabase
        .from("gear_locker")
        .update({
          times_used: nextTimesUsed,
          last_used_at: nextTimesUsed > 0 ? new Date().toISOString() : null,
        })
        .eq("id", locker.id)
        .eq("user_id", userId);
    }),
  );
}

export async function createTripWithTemplates(formData: FormData) {
  const { supabase, user } = await requireUser();
  const lang = String(formData.get("lang") ?? "zh-CN");

  const customTitle = String(formData.get("custom_title") ?? "").trim();
  const continent = String(formData.get("continent") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const selectedCities = formData
    .getAll("cities")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const city = selectedCities.join(" / ");
  const travelStyle = String(formData.get("travel_style") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const startDateRaw = String(formData.get("start_date") ?? "").trim();
  const endDateRaw = String(formData.get("end_date") ?? "").trim();
  const startDate = parseDateOnly(startDateRaw);
  const endDate = parseDateOnly(endDateRaw);
  const start_date = startDateRaw || null;
  const end_date = endDateRaw || null;
  const selectedTemplates = formData
    .getAll("templates")
    .map((value) => String(value))
    .filter(Boolean);
  const selectedSceneNames = formData
    .getAll("scene_names")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!startDateRaw || !endDateRaw || !startDate || !endDate || endDate < startDate || selectedCities.length === 0) {
    redirect(`/trips/new?lang=${encodeURIComponent(lang)}&error=invalid_date_range`);
  }

  const { error: userProfileError } = await ensureUserProfile(supabase, user);
  if (userProfileError) {
    redirect(`/trips/new?lang=${encodeURIComponent(lang)}&error=${encodeURIComponent(`用户档案初始化失败: ${userProfileError.message}`)}`);
  }

  let resolvedTemplateIds = [...selectedTemplates];
  if (resolvedTemplateIds.length === 0 && selectedSceneNames.length > 0) {
    const { data: templatesByName } = await supabase
      .from("scene_templates")
      .select("id,name_zh")
      .in("name_zh", selectedSceneNames);
    resolvedTemplateIds = (templatesByName ?? []).map((item) => item.id);
  }

  if (resolvedTemplateIds.length > 0) {
    const { data: selectedTemplateDetails } = await supabase
      .from("scene_templates")
      .select("id,name_zh")
      .in("id", resolvedTemplateIds);
    const conflictTemplate = (selectedTemplateDetails ?? []).find((item) => hasDestinationConflict(item.name_zh, country));
    if (conflictTemplate) {
      redirect(`/trips/new?lang=${encodeURIComponent(lang)}&error=${encodeURIComponent(`场景“${conflictTemplate.name_zh}”与目的地“${country}”冲突`)}`);
    }
  }

  const monthNumber = startDate.getMonth() + 1;
  const durationDays = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
  const month = pickLangText(lang, { en: `${monthNumber}`, zhTW: `${monthNumber}月`, zhCN: `${monthNumber}月` });
  const duration = pickLangText(lang, { en: `${durationDays} days`, zhTW: `${durationDays}天`, zhCN: `${durationDays}天` });
  const season = getSeasonByMonth(monthNumber, lang);
  const mainCity = selectedCities[0] ?? country ?? continent;
  const mainScene =
    selectedSceneNames.length > 0 ? selectedSceneNames.slice(0, 2).join("") : pickLangText(lang, { en: "Trip", zhTW: "行程", zhCN: "行程" });
  const dayUnit = pickLangText(lang, { en: "d", zhTW: "日", zhCN: "日" });
  const autoTitle = `${mainCity} · ${mainScene} · ${durationDays}${dayUnit}`;
  const title = customTitle || autoTitle;
  const packingHint = buildPackingHint(season, lang);
  const tags = [continent, country, city, month, duration, season, travelStyle].filter(Boolean);
  const autoHintPrefix = pickLangText(lang, {
    en: `Gear suggestion (${season}): ${packingHint}`,
    zhTW: `裝備建議（${season}）：${packingHint}`,
    zhCN: `装备建议(${season})：${packingHint}`,
  });
  const mergedNote = [note, autoHintPrefix].filter(Boolean).join("\n");

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .insert({ user_id: user.id, title, tags, start_date, end_date, description: mergedNote || null })
    .select("id")
    .single();

  if (tripError || !trip) {
    redirect(`/trips/new?lang=${encodeURIComponent(lang)}&error=${encodeURIComponent(tripError?.message ?? "create_trip_failed")}`);
  }

  if (resolvedTemplateIds.length > 0) {
    const { error: sceneError } = await supabase
      .from("trip_scenes")
      .insert(resolvedTemplateIds.map((template_id) => ({ trip_id: trip.id, template_id })));
    if (sceneError) {
      redirect(`/trips/new?lang=${encodeURIComponent(lang)}&error=${encodeURIComponent(sceneError.message)}`);
    }
  }

  const { data: templateItems } =
    resolvedTemplateIds.length > 0
      ? await supabase
          .from("template_items")
          .select("template_id,name_zh,category,priority,default_quantity,note_zh,sort_order")
          .in("template_id", resolvedTemplateIds)
      : { data: [] as Array<{ template_id: string; name_zh: string; category: string; priority: string | null; default_quantity: number | null; note_zh: string | null; sort_order: number | null }> };

  const mergedMap = new Map<string, Record<string, unknown>>();
  (templateItems ?? []).forEach((item) => {
    const key = normalizeItemName(item.name_zh);
    if (!mergedMap.has(key)) {
      mergedMap.set(key, {
        trip_id: trip.id,
        name: item.name_zh,
        category: normalizeItemCategory(item.category),
        status: item.priority === "optional" ? "optional" : item.priority === "should" ? "to_buy" : "to_pack",
        quantity: item.default_quantity ?? 1,
        note: item.note_zh ?? null,
        source_template_ids: [item.template_id],
        sort_order: item.sort_order ?? 0,
      });
    }
  });

  if (mergedMap.size > 0) {
    const { error: itemError } = await supabase.from("trip_items").insert(Array.from(mergedMap.values()));
    if (itemError) {
      redirect(`/trips/new?lang=${encodeURIComponent(lang)}&error=${encodeURIComponent(itemError.message)}`);
    }
  }

  revalidatePath("/");
  redirect(`/trips/${trip.id}?lang=${encodeURIComponent(lang)}`);
}

export async function updateTripItem(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
  item?: {
    id: string;
    name: string;
    category: string;
    status: string;
    container: string;
    source_locker_id?: string | null;
    brand: string | null;
    brand_alternatives: string[] | null;
    note: string | null;
  };
}> {
  const { supabase, user } = await requireUser();
  const sourceLockerColumnReady = await hasSourceLockerIdColumn(supabase);
  const tripItemGearIdColumnReady = await hasTripItemGearIdColumn(supabase);
  const lockerGearIdColumnReady = await hasLockerGearIdColumn(supabase);
  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const status = String(formData.get("status"));
  const container = String(formData.get("container"));
  const category = normalizeItemCategory(String(formData.get("category") ?? "other"));
  const note = String(formData.get("note") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  const tripId = String(formData.get("trip_id") ?? "");
  const sourceLockerIdRaw = String(formData.get("source_locker_id") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const brandAlternatives = String(formData.get("brand_alternatives") ?? "")
    .split(/[,\n]/)
    .map((value) => value.trim())
    .filter(Boolean);
  const saveToLocker = String(formData.get("save_to_locker") ?? "") === "true";
  const gearId = await ensureGearMasterId(supabase, { name, category, brand: brand || null, note: note || null });

  const { data: updatedRow, error } = await supabase
    .from("trip_items")
    .update({
      ...(name ? { name } : {}),
      ...(tripItemGearIdColumnReady ? { gear_id: gearId } : {}),
      category,
      status,
      container,
      note: note || null,
      quantity: Number.isFinite(quantity) ? quantity : 1,
      brand: brand || null,
      brand_alternatives: brandAlternatives,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  const updated = updatedRow as {
    id: string;
    name: string;
    category: string;
    status: string;
    container: string;
    source_locker_id?: string | null;
    brand: string | null;
    brand_alternatives: string[] | null;
    note: string | null;
  };

  let lockerIdToSync = sourceLockerIdRaw || "";

  if (lockerIdToSync && name) {
    await supabase
      .from("gear_locker")
      .update({
        name,
        ...(lockerGearIdColumnReady ? { gear_id: gearId } : {}),
        category,
        brand: brand || null,
        note: note || null,
        status: "owned",
      })
      .eq("id", lockerIdToSync)
      .eq("user_id", user.id);
  } else if (saveToLocker && name) {
    const { data: existingLocker } = await supabase
      .from("gear_locker")
      .select("id")
      .eq("user_id", user.id)
      .ilike("name", name)
      .limit(1);

    if (existingLocker?.[0]?.id) {
      await supabase
        .from("gear_locker")
        .update({
          ...(lockerGearIdColumnReady ? { gear_id: gearId } : {}),
          brand: brand || null,
          note: note || null,
          status: "owned",
          category: normalizeItemCategory(String(formData.get("category") ?? "")),
        })
        .eq("id", existingLocker[0].id)
        .eq("user_id", user.id);
      lockerIdToSync = existingLocker[0].id;
    } else {
      const { data: insertedLocker } = await supabase.from("gear_locker").insert({
        user_id: user.id,
        ...(lockerGearIdColumnReady ? { gear_id: gearId } : {}),
        name,
        category: normalizeItemCategory(String(formData.get("category") ?? "")),
        brand: brand || null,
        note: note || null,
        status: "owned",
      }).select("id").single();
      lockerIdToSync = insertedLocker?.id ?? "";
    }
  }

  if (lockerIdToSync && !sourceLockerIdRaw && sourceLockerColumnReady) {
    const { error: linkError } = await supabase.from("trip_items").update({ source_locker_id: lockerIdToSync }).eq("id", id);
    if (!linkError && updated) updated.source_locker_id = lockerIdToSync;
  }

  if (saveToLocker || Boolean(sourceLockerIdRaw)) {
    revalidatePath("/locker");
  }
  if (tripId) {
    revalidatePath(`/trips/${tripId}`);
  }
  return { ok: true, item: updated };
}

export async function deleteTripItem(formData: FormData): Promise<{ ok: boolean }> {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const tripId = String(formData.get("trip_id") ?? "");
  if (!id) return { ok: false };
  const { error } = await supabase.from("trip_items").delete().eq("id", id);
  if (error) return { ok: false };
  await recalculateLockerUsage(supabase, user.id);
  revalidatePath(tripId ? `/trips/${tripId}` : "/");
  revalidatePath("/locker");
  return { ok: true };
}

export async function toggleTripItemPacked(formData: FormData): Promise<{
  ok: boolean;
  item?: { status: string; last_status_before_packed: string | null };
}> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const tripId = String(formData.get("trip_id") ?? "");
  if (!id) return { ok: false };

  const { data: current } = await supabase
    .from("trip_items")
    .select("status,last_status_before_packed")
    .eq("id", id)
    .single();
  if (!current) return { ok: false };

  const wasPacked = current.status === "packed";
  const restoreStatus =
    current.last_status_before_packed === "to_buy" || current.last_status_before_packed === "optional" || current.last_status_before_packed === "to_pack"
      ? current.last_status_before_packed
      : "to_pack";
  const nextPayload = wasPacked
    ? { status: restoreStatus }
    : {
        status: "packed",
        last_status_before_packed:
          current.status === "to_buy" || current.status === "optional" || current.status === "to_pack" ? current.status : "to_pack",
      };

  const { data: updated, error } = await supabase
    .from("trip_items")
    .update(nextPayload)
    .eq("id", id)
    .select("status,last_status_before_packed")
    .single();
  if (error || !updated) return { ok: false };
  revalidatePath(tripId ? `/trips/${tripId}` : "/");
  return { ok: true, item: updated };
}

export async function addTripItem(formData: FormData): Promise<{
  ok: boolean;
  item?: { id: string; name: string; status: string; container: string };
}> {
  const { supabase } = await requireUser();
  const tripItemGearIdColumnReady = await hasTripItemGearIdColumn(supabase);
  const tripId = String(formData.get("trip_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "other");
  const customCategory = String(formData.get("custom_category") ?? "").trim();
  const category = normalizeItemCategory(categoryRaw === "__custom__" ? customCategory || "other" : categoryRaw);
  const status = String(formData.get("status") ?? "to_pack");
  const container = String(formData.get("container") ?? "undecided");
  const brand = String(formData.get("brand") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const gearId = await ensureGearMasterId(supabase, { name, category, brand: brand || null, note: note || null });

  if (!tripId || !name) return { ok: false };
  const { data: topRow } = await supabase
    .from("trip_items")
    .select("sort_order")
    .eq("trip_id", tripId)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = Number.isFinite(topRow?.sort_order) ? Number(topRow?.sort_order) - 10 : 10;

  const { data: inserted, error } = await supabase.from("trip_items").insert({
    trip_id: tripId,
    ...(tripItemGearIdColumnReady ? { gear_id: gearId } : {}),
    name,
    category,
    status,
    container,
    quantity: 1,
    sort_order: nextSortOrder,
    brand: brand || null,
    note: note || null,
  }).select("id,name,status,container").single();

  if (error || !inserted) return { ok: false };
  revalidatePath(`/trips/${tripId}`);
  return { ok: true, item: inserted };
}

export async function setTripItemStatus(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const tripId = String(formData.get("trip_id") ?? "");
  const status = String(formData.get("status") ?? "to_pack");
  if (!id) return;
  const { error } = await supabase.from("trip_items").update({ status }).eq("id", id);
  if (error) return;
  revalidatePath(tripId ? `/trips/${tripId}` : "/");
}

export async function setTripItemContainer(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const tripId = String(formData.get("trip_id") ?? "");
  const container = String(formData.get("container") ?? "undecided");
  if (!id) return;
  const { error } = await supabase.from("trip_items").update({ container }).eq("id", id);
  if (error) return;
  revalidatePath(tripId ? `/trips/${tripId}` : "/");
}

export async function moveTripItem(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const tripId = String(formData.get("trip_id") ?? "");
  const direction = String(formData.get("direction") ?? "up");
  const scopeField = String(formData.get("scope_field") ?? "");
  const scopeValue = String(formData.get("scope_value") ?? "");
  if (!id || !tripId) return;

  const { data: current } = await supabase
    .from("trip_items")
    .select("id,sort_order")
    .eq("id", id)
    .eq("trip_id", tripId)
    .single();
  if (!current) return;

  const neighborQuery = supabase
    .from("trip_items")
    .select("id,sort_order")
    .eq("trip_id", tripId)
    .neq("id", id)
    .order("sort_order", { ascending: direction !== "down" })
    .limit(1);
  if (scopeField === "category" && scopeValue) neighborQuery.eq("category", scopeValue);
  if (scopeField === "container" && scopeValue) neighborQuery.eq("container", scopeValue);
  if (direction === "down") {
    neighborQuery.gt("sort_order", current.sort_order);
  } else {
    neighborQuery.lt("sort_order", current.sort_order);
  }
  const { data: neighborRows } = await neighborQuery;
  const neighbor = neighborRows?.[0];
  if (!neighbor) return;

  await supabase.from("trip_items").update({ sort_order: neighbor.sort_order }).eq("id", current.id);
  await supabase.from("trip_items").update({ sort_order: current.sort_order }).eq("id", neighbor.id);
  revalidatePath(`/trips/${tripId}`);
}

export async function reorderTripItemsByIds(formData: FormData) {
  const { supabase } = await requireUser();
  const tripId = String(formData.get("trip_id") ?? "");
  const draggedId = String(formData.get("dragged_id") ?? "");
  const targetId = String(formData.get("target_id") ?? "");
  const scopeField = String(formData.get("scope_field") ?? "all");
  const scopeValue = String(formData.get("scope_value") ?? "");
  if (!tripId || !draggedId || !targetId) return;

  const query = supabase
    .from("trip_items")
    .select("id,sort_order")
    .eq("trip_id", tripId)
    .order("sort_order", { ascending: true });
  if (scopeField === "container" && scopeValue) {
    query.eq("container", scopeValue);
  } else if (scopeField === "category" && scopeValue) {
    query.eq("category", scopeValue);
  }
  const { data: rows } = await query;
  if (!rows?.length) return;

  const list = [...rows];
  const from = list.findIndex((row) => row.id === draggedId);
  const to = list.findIndex((row) => row.id === targetId);
  if (from < 0 || to < 0 || from === to) return;

  const [moved] = list.splice(from, 1);
  list.splice(to, 0, moved);

  await Promise.all(
    list.map((row, index) =>
      supabase
        .from("trip_items")
        .update({ sort_order: (index + 1) * 10 })
        .eq("id", row.id)
        .eq("trip_id", tripId),
    ),
  );
  revalidatePath(`/trips/${tripId}`);
}

export async function addReference(formData: FormData) {
  const { supabase, user } = await requireUser();
  const trip_id = String(formData.get("trip_id"));
  const type = String(formData.get("type"));
  const title = String(formData.get("title") ?? "");
  const url = String(formData.get("url") ?? "");
  const note = String(formData.get("note") ?? "");

  const { error } = await supabase.from("trip_references").insert({
    trip_id,
    user_id: user.id,
    type,
    title: title || null,
    url: url || null,
    note: note || null,
  });

  if (error) {
    return;
  }
  revalidatePath(`/trips/${trip_id}`);
}

export async function toggleTripPinned(formData: FormData) {
  const { supabase } = await requireUser();
  const tripId = String(formData.get("trip_id") ?? "");
  const nextPinned = String(formData.get("next_pinned") ?? "false") === "true";
  if (!tripId) return;

  const { data: trip } = await supabase.from("trips").select("tags").eq("id", tripId).single();
  const tags = Array.isArray(trip?.tags) ? [...trip.tags] : [];
  const filtered = tags.filter((tag) => tag !== "__pinned");
  const nextTags = nextPinned ? ["__pinned", ...filtered] : filtered;
  const { error } = await supabase.from("trips").update({ tags: nextTags }).eq("id", tripId);
  if (error) return;
  revalidatePath("/");
}

export async function deleteTrip(formData: FormData) {
  const { supabase, user } = await requireUser();
  const tripId = String(formData.get("trip_id") ?? "");
  if (!tripId) return;
  const { error } = await supabase.from("trips").delete().eq("id", tripId);
  if (error) return;
  await recalculateLockerUsage(supabase, user.id);
  revalidatePath("/");
  revalidatePath("/locker");
}

export async function toggleTripArchived(formData: FormData) {
  const { supabase, user } = await requireUser();
  const tripId = String(formData.get("trip_id") ?? "");
  const currentStatus = String(formData.get("current_status") ?? "");
  if (!tripId) return;
  const nextStatus = currentStatus === "done" || currentStatus === "completed" ? "planning" : "completed";
  const { error } = await supabase.from("trips").update({ status: nextStatus }).eq("id", tripId);
  if (error) return;
  if (nextStatus === "completed" && currentStatus !== "done" && currentStatus !== "completed") {
    await syncGearUsageForTripDone(supabase, user.id, tripId);
  }
  await recalculateLockerUsage(supabase, user.id);
  revalidatePath("/");
  revalidatePath("/locker");
}

export async function addLockerItemsToTrip(formData: FormData): Promise<{ ok: boolean; count: number; status: string; container: string; error?: string }> {
  const { supabase, user } = await requireUser();
  const sourceLockerColumnReady = await hasSourceLockerIdColumn(supabase);
  const tripItemGearIdColumnReady = await hasTripItemGearIdColumn(supabase);
  const tripId = String(formData.get("trip_id") ?? "");
  const selectedIds = formData
    .getAll("locker_ids")
    .map((value) => String(value))
    .filter(Boolean);
  const targetStatusRaw = String(formData.get("target_status") ?? "to_pack");
  const targetStatus = targetStatusRaw === "to_buy" || targetStatusRaw === "optional" || targetStatusRaw === "packed" ? targetStatusRaw : "to_pack";
  const targetContainerRaw = String(formData.get("target_container") ?? "undecided");
  const targetContainer =
    targetContainerRaw === "suitcase" ||
    targetContainerRaw === "backpack" ||
    targetContainerRaw === "carry_on" ||
    targetContainerRaw === "wear"
      ? targetContainerRaw
      : "undecided";
  if (!tripId || selectedIds.length === 0) {
    return { ok: false, count: 0, status: targetStatus, container: targetContainer, error: "缺少行程或未选择物品" };
  }

  const { data: lockerItems } = await supabase
    .from("gear_locker")
    .select("id,name,category,brand,note,gear_id")
    .eq("user_id", user.id)
    .in("id", selectedIds);
  if (!lockerItems?.length) {
    return { ok: false, count: 0, status: targetStatus, container: targetContainer, error: "未找到可导入的装备库物品（可能无权限或已删除）" };
  }

  let existingBySource = new Set<string>();
  let existingByName = new Set<string>();
  if (sourceLockerColumnReady) {
    const { data: existingSourceRows } = await supabase
      .from("trip_items")
      .select("source_locker_id")
      .eq("trip_id", tripId)
      .in("source_locker_id", selectedIds);
    existingBySource = new Set((existingSourceRows ?? []).map((row) => String(row.source_locker_id ?? "")).filter(Boolean));
  } else {
    const { data: existingTripRows } = await supabase.from("trip_items").select("name").eq("trip_id", tripId);
    existingByName = new Set((existingTripRows ?? []).map((row) => normalizeItemName(String(row.name ?? ""))).filter(Boolean));
  }

  const payload = lockerItems
    .filter((item) => {
      if (sourceLockerColumnReady) return !existingBySource.has(item.id);
      return !existingByName.has(normalizeItemName(String(item.name ?? "")));
    })
    .map((item) => ({
    trip_id: tripId,
    ...(sourceLockerColumnReady ? { source_locker_id: item.id } : {}),
    ...(tripItemGearIdColumnReady ? { gear_id: item.gear_id ?? null } : {}),
    name: item.name,
    category: normalizeItemCategory(item.category || "other"),
    status: targetStatus,
    container: targetContainer,
    quantity: 1,
    brand: item.brand || null,
    note: item.note || null,
    }));

  if (!payload.length) return { ok: true, count: 0, status: targetStatus, container: targetContainer };

  const { error } = await supabase.from("trip_items").insert(payload);
  if (error) {
    return { ok: false, count: 0, status: targetStatus, container: targetContainer, error: error.message };
  }
  await recalculateLockerUsage(supabase, user.id);
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/locker");
  return { ok: true, count: payload.length, status: targetStatus, container: targetContainer };
}

export async function bulkOperateTripItems(formData: FormData): Promise<{ ok: boolean }> {
  const { supabase, user } = await requireUser();
  const tripId = String(formData.get("trip_id") ?? "");
  const action = String(formData.get("action") ?? "");
  const ids = formData.getAll("item_ids").map((value) => String(value)).filter(Boolean);
  if (!tripId || ids.length === 0) return { ok: false };

  if (action === "delete") {
    const { error } = await supabase.from("trip_items").delete().eq("trip_id", tripId).in("id", ids);
    if (error) return { ok: false };
    await recalculateLockerUsage(supabase, user.id);
    revalidatePath(`/trips/${tripId}`);
    revalidatePath("/locker");
    return { ok: true };
  }

  if (action === "set_container") {
    const containerRaw = String(formData.get("container") ?? "undecided");
    const container =
      containerRaw === "suitcase" ||
      containerRaw === "backpack" ||
      containerRaw === "carry_on" ||
      containerRaw === "wear"
        ? containerRaw
        : "undecided";
    const { error } = await supabase.from("trip_items").update({ container }).eq("trip_id", tripId).in("id", ids);
    if (error) return { ok: false };
    revalidatePath(`/trips/${tripId}`);
    return { ok: true };
  }

  if (action === "set_status") {
    const statusRaw = String(formData.get("status") ?? "to_pack");
    const status = statusRaw === "to_buy" || statusRaw === "optional" || statusRaw === "packed" ? statusRaw : "to_pack";
    const { error } = await supabase.from("trip_items").update({ status }).eq("trip_id", tripId).in("id", ids);
    if (error) return { ok: false };
    revalidatePath(`/trips/${tripId}`);
    return { ok: true };
  }

  if (action === "save_to_locker") {
    const lockerGearIdColumnReady = await hasLockerGearIdColumn(supabase);
    const { data: rows } = await supabase
      .from("trip_items")
      .select("name,category,brand,note,gear_id")
      .eq("trip_id", tripId)
      .in("id", ids);
    const items = rows ?? [];
    for (const item of items) {
      const name = String(item.name ?? "").trim();
      if (!name) continue;
      const { data: existing } = await supabase
        .from("gear_locker")
        .select("id")
        .eq("user_id", user.id)
        .ilike("name", name)
        .limit(1);
      if (existing?.[0]?.id) {
        await supabase
          .from("gear_locker")
          .update({
            ...(lockerGearIdColumnReady ? { gear_id: item.gear_id ?? null } : {}),
            category: normalizeItemCategory(String(item.category ?? "")),
            brand: item.brand || null,
            note: item.note || null,
            status: "owned",
          })
          .eq("id", existing[0].id)
          .eq("user_id", user.id);
      } else {
        await supabase.from("gear_locker").insert({
          user_id: user.id,
          ...(lockerGearIdColumnReady ? { gear_id: item.gear_id ?? null } : {}),
          name,
          category: normalizeItemCategory(String(item.category ?? "")),
          brand: item.brand || null,
          note: item.note || null,
          status: "owned",
        });
      }
    }
    revalidatePath("/locker");
    return { ok: true };
  }

  return { ok: false };
}

export async function setTripItemReview(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const tripId = String(formData.get("trip_id") ?? "");
  const reviewResult = String(formData.get("review_result") ?? "skip");
  const reviewNote = String(formData.get("review_note") ?? "").trim();
  if (!id) return;
  const { error } = await supabase
    .from("trip_items")
    .update({ review_result: reviewResult, review_note: reviewNote || null })
    .eq("id", id);
  if (error) return;
  revalidatePath(tripId ? `/trips/${tripId}` : "/");
}

export async function saveTripAsTemplate(formData: FormData) {
  const { supabase, user } = await requireUser();
  const tripId = String(formData.get("trip_id") ?? "");
  if (!tripId) return;
  const [{ data: trip }, { data: items }, { data: scenes }] = await Promise.all([
    supabase.from("trips").select("title,tags").eq("id", tripId).single(),
    supabase.from("trip_items").select("name,category,status,container,quantity,brand,brand_alternatives,note,sort_order").eq("trip_id", tripId),
    supabase.from("trip_scenes").select("scene_templates(name_zh)").eq("trip_id", tripId),
  ]);
  const sceneNames = (scenes ?? [])
    .flatMap((row) => (Array.isArray(row.scene_templates) ? row.scene_templates : [row.scene_templates]))
    .map((scene) => scene?.name_zh)
    .filter(Boolean);
  await supabase.from("trip_templates").insert({
    user_id: user.id,
    source_trip_id: tripId,
    name: trip?.title ? `${trip.title} 模板` : "我的行程模板",
    scenes: sceneNames,
    data: { trip, items, scenes: sceneNames },
  });
  revalidatePath("/profile");
}

export async function copyPublicTrip(formData: FormData) {
  const { supabase, user } = await requireUser();
  const sourceTripId = String(formData.get("source_trip_id") ?? "");
  const lang = String(formData.get("lang") ?? "zh-CN");
  if (!sourceTripId) return;
  const [{ data: trip }, { data: items }, { data: scenes }] = await Promise.all([
    supabase.from("trips").select("title,start_date,end_date,tags,description").eq("id", sourceTripId).single(),
    supabase.from("trip_items").select("name,category,status,container,quantity,brand,brand_alternatives,note,sort_order,source_template_ids").eq("trip_id", sourceTripId),
    supabase.from("trip_scenes").select("template_id").eq("trip_id", sourceTripId),
  ]);
  const { data: newTrip } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      title: `${trip?.title ?? "行程"}（复制）`,
      start_date: trip?.start_date ?? null,
      end_date: trip?.end_date ?? null,
      tags: Array.isArray(trip?.tags) ? trip.tags : [],
      description: trip?.description ?? null,
    })
    .select("id")
    .single();
  if (!newTrip) return;
  const sourceScenes = scenes ?? [];
  if (sourceScenes.length) {
    await supabase.from("trip_scenes").insert(sourceScenes.map((s) => ({ trip_id: newTrip.id, template_id: s.template_id })));
  }
  const sourceItems = items ?? [];
  if (sourceItems.length) {
    await supabase.from("trip_items").insert(sourceItems.map((item) => ({ ...item, trip_id: newTrip.id })));
  }
  redirect(`/trips/${newTrip.id}?lang=${encodeURIComponent(lang)}`);
}
