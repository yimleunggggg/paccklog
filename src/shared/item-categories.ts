import { itemCategories, type ItemCategory } from "@/entities/trip/model/types";
import { texts, type Lang } from "@/shared/i18n";

const CATEGORY_ALIASES: Record<string, ItemCategory> = {
  gear: "bags",
  health: "first_aid",
  medicine: "first_aid",
  meds: "first_aid",
  hygienic: "toiletries",
  hygiene: "toiletries",
  food: "nutrition",
  snack: "nutrition",
  snacks: "nutrition",
};

const CATEGORY_TEXT_KEY_MAP: Record<ItemCategory, keyof (typeof texts)["zh-CN"]> = {
  clothing: "categoryClothing",
  footwear: "categoryFootwear",
  electronics: "categoryElectronics",
  toiletries: "categoryToiletries",
  documents: "categoryDocuments",
  nutrition: "categoryNutrition",
  first_aid: "categoryFirstAid",
  bags: "categoryBags",
  accessories: "categoryAccessories",
  disposable: "categoryDisposable",
  camping: "categoryCamping",
  other: "categoryOther",
};

export function normalizeItemCategory(input: string | null | undefined): ItemCategory {
  const raw = String(input ?? "")
    .trim()
    .toLowerCase();
  if (!raw) return "other";
  const aliased = CATEGORY_ALIASES[raw] ?? raw;
  if ((itemCategories as readonly string[]).includes(aliased)) {
    return aliased as ItemCategory;
  }
  return "other";
}

export function getItemCategoryLabel(category: string | null | undefined, lang: Lang): string {
  const normalized = normalizeItemCategory(category);
  const textKey = CATEGORY_TEXT_KEY_MAP[normalized];
  return texts[lang][textKey] as string;
}

export function getItemCategoryOptions(lang: Lang) {
  return itemCategories.map((value) => ({
    value,
    label: getItemCategoryLabel(value, lang),
  }));
}
