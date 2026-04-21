"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureUserProfile, normalizeItemName, requireUser } from "@/features/trips/server";

function getSeasonByMonth(month: number, lang: string) {
  const isEn = lang === "en";
  const isTw = lang === "zh-TW";
  if ([3, 4, 5].includes(month)) return isEn ? "Spring" : isTw ? "春季" : "春季";
  if ([6, 7, 8].includes(month)) return isEn ? "Summer" : isTw ? "夏季" : "夏季";
  if ([9, 10, 11].includes(month)) return isEn ? "Autumn" : isTw ? "秋季" : "秋季";
  return isEn ? "Winter" : isTw ? "冬季" : "冬季";
}

function buildPackingHint(season: string, lang: string) {
  const isEn = lang === "en";
  const isTw = lang === "zh-TW";
  if (season === "Summer" || season === "夏季") return isEn ? "Quick-dry breathable wear, airy shoes, sun hat and sunscreen." : isTw ? "輕薄快乾、透氣鞋、遮陽帽、防曬。" : "轻薄速干、透气鞋、遮阳帽、防晒。";
  if (season === "Winter" || season === "冬季") return isEn ? "Insulating mid-layer, windproof shell, warm socks and gloves." : isTw ? "保暖中層、防風外層、保暖襪與手套。" : "保暖中层、防风外层、保暖袜、手套。";
  if (season === "Autumn" || season === "秋季") return isEn ? "Layering setup, light fleece and a wind-resistant jacket." : isTw ? "洋蔥式穿搭、薄抓絨、輕防風外套。" : "洋葱穿搭、薄抓绒、轻防风外套。";
  return isEn ? "Layer-friendly outerwear, quick-dry base and light rain-ready gear." : isTw ? "可疊穿外套、快乾內層與防小雨裝備。" : "可叠穿外套、速干内层、防小雨装备。";
}

function hasDestinationConflict(templateName: string, country: string) {
  const locationKeywords = ["日本", "韩国", "中国", "英国", "美国", "法国", "意大利", "泰国"];
  const matched = locationKeywords.find((keyword) => templateName.includes(keyword));
  if (!matched) return false;
  return !country.includes(matched);
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
  const startDate = new Date(startDateRaw);
  const endDate = new Date(endDateRaw);
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

  if (!startDateRaw || !endDateRaw || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate || selectedCities.length === 0) {
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
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
  const month = lang === "en" ? `${monthNumber}` : `${monthNumber}月`;
  const duration = lang === "en" ? `${durationDays} days` : `${durationDays}天`;
  const season = getSeasonByMonth(monthNumber, lang);
  const mainCity = selectedCities[0] ?? country ?? continent;
  const mainScene = selectedSceneNames.length > 0 ? selectedSceneNames.slice(0, 2).join("") : (lang === "en" ? "Trip" : "行程");
  const dayUnit = lang === "en" ? "d" : "日";
  const autoTitle = `${mainCity} · ${mainScene} · ${durationDays}${dayUnit}`;
  const title = customTitle || autoTitle;
  const packingHint = buildPackingHint(season, lang);
  const tags = [continent, country, city, month, duration, season, travelStyle].filter(Boolean);
  const autoHintPrefix = lang === "en" ? `Gear suggestion (${season}): ${packingHint}` : lang === "zh-TW" ? `裝備建議（${season}）：${packingHint}` : `装备建议(${season})：${packingHint}`;
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
        category: item.category,
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

export async function updateTripItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const status = String(formData.get("status"));
  const container = String(formData.get("container"));
  const note = String(formData.get("note") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  const tripId = String(formData.get("trip_id") ?? "");
  const brand = String(formData.get("brand") ?? "").trim();
  const brandAlternatives = String(formData.get("brand_alternatives") ?? "")
    .split(/[,\n]/)
    .map((value) => value.trim())
    .filter(Boolean);
  const saveToLocker = String(formData.get("save_to_locker") ?? "") === "true";

  const { error } = await supabase
    .from("trip_items")
    .update({
      ...(name ? { name } : {}),
      status,
      container,
      note: note || null,
      quantity: Number.isFinite(quantity) ? quantity : 1,
      brand: brand || null,
      brand_alternatives: brandAlternatives,
    })
    .eq("id", id);

  if (error) {
    return;
  }

  if (saveToLocker && name) {
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
          brand: brand || null,
          note: note || null,
          status: "owned",
          category: String(formData.get("category") ?? "") || null,
        })
        .eq("id", existingLocker[0].id)
        .eq("user_id", user.id);
    } else {
      await supabase.from("gear_locker").insert({
        user_id: user.id,
        name,
        category: String(formData.get("category") ?? "") || null,
        brand: brand || null,
        note: note || null,
        status: "owned",
      });
    }
  }

  revalidatePath(tripId ? `/trips/${tripId}` : "/");
  revalidatePath("/locker");
}

export async function deleteTripItem(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const tripId = String(formData.get("trip_id") ?? "");
  if (!id) return;
  const { error } = await supabase.from("trip_items").delete().eq("id", id);
  if (error) return;
  revalidatePath(tripId ? `/trips/${tripId}` : "/");
}

export async function toggleTripItemPacked(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const nextStatus = String(formData.get("next_status") ?? "packed");
  const tripId = String(formData.get("trip_id") ?? "");
  if (!id) return;

  const { error } = await supabase.from("trip_items").update({ status: nextStatus }).eq("id", id);
  if (error) return;
  revalidatePath(tripId ? `/trips/${tripId}` : "/");
}

export async function addTripItem(formData: FormData) {
  const { supabase } = await requireUser();
  const tripId = String(formData.get("trip_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "other");
  const customCategory = String(formData.get("custom_category") ?? "").trim();
  const category = categoryRaw === "__custom__" ? customCategory || "other" : categoryRaw;
  const status = String(formData.get("status") ?? "to_pack");
  const container = String(formData.get("container") ?? "undecided");

  if (!tripId || !name) return;

  const { error } = await supabase.from("trip_items").insert({
    trip_id: tripId,
    name,
    category,
    status,
    container,
    quantity: 1,
  });

  if (error) return;
  revalidatePath(`/trips/${tripId}`);
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
  const scopeField = String(formData.get("scope_field") ?? "category");
  const scopeValue = String(formData.get("scope_value") ?? "");
  if (!tripId || !draggedId || !targetId || !scopeValue) return;

  const query = supabase
    .from("trip_items")
    .select("id,sort_order")
    .eq("trip_id", tripId)
    .order("sort_order", { ascending: true });
  if (scopeField === "container") {
    query.eq("container", scopeValue);
  } else {
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
  const { supabase } = await requireUser();
  const tripId = String(formData.get("trip_id") ?? "");
  if (!tripId) return;
  const { error } = await supabase.from("trips").delete().eq("id", tripId);
  if (error) return;
  revalidatePath("/");
}

export async function toggleTripArchived(formData: FormData) {
  const { supabase, user } = await requireUser();
  const tripId = String(formData.get("trip_id") ?? "");
  const currentStatus = String(formData.get("current_status") ?? "");
  if (!tripId) return;
  const nextStatus = currentStatus === "done" || currentStatus === "completed" ? "in_progress" : "done";
  const { error } = await supabase.from("trips").update({ status: nextStatus }).eq("id", tripId);
  if (error) return;
  if (nextStatus === "done" && currentStatus !== "done" && currentStatus !== "completed") {
    await syncGearUsageForTripDone(supabase, user.id, tripId);
  }
  revalidatePath("/");
  revalidatePath("/locker");
}

export async function addLockerItemsToTrip(formData: FormData) {
  const { supabase, user } = await requireUser();
  const tripId = String(formData.get("trip_id") ?? "");
  const selectedIds = formData
    .getAll("locker_ids")
    .map((value) => String(value))
    .filter(Boolean);
  if (!tripId || selectedIds.length === 0) return;

  const { data: lockerItems } = await supabase
    .from("gear_locker")
    .select("name,category,brand,note")
    .eq("user_id", user.id)
    .in("id", selectedIds);
  if (!lockerItems?.length) return;

  const payload = lockerItems.map((item) => ({
    trip_id: tripId,
    name: item.name,
    category: item.category || "other",
    status: "to_pack",
    container: "undecided",
    quantity: 1,
    brand: item.brand || null,
    note: item.note || null,
  }));

  const { error } = await supabase.from("trip_items").insert(payload);
  if (error) return;
  revalidatePath(`/trips/${tripId}`);
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
