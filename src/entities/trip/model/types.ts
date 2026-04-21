export const tripStatuses = ["planning", "packing", "traveling", "completed"] as const;
export type TripStatus = (typeof tripStatuses)[number];

export const itemStatuses = ["to_pack", "packed", "to_buy", "optional"] as const;
export type ItemStatus = (typeof itemStatuses)[number];

export const itemContainers = ["suitcase", "backpack", "carry_on", "wear", "undecided"] as const;
export type ItemContainer = (typeof itemContainers)[number];

export const itemCategories = [
  "clothing",
  "footwear",
  "electronics",
  "toiletries",
  "documents",
  "nutrition",
  "camping",
  "first_aid",
  "other",
] as const;
export type ItemCategory = (typeof itemCategories)[number];

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  tags: string[];
  status: TripStatus;
  created_at: string;
}

export interface TripItem {
  id: string;
  trip_id: string;
  name: string;
  category: ItemCategory;
  status: ItemStatus;
  container: ItemContainer;
  quantity: number;
  brand: string | null;
  note: string | null;
  is_checked: boolean;
  source_template_id: string | null;
}
