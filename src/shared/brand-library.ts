export type BrandEntry = {
  key: string;
  category?: BrandCategory;
  names: {
    zh?: string;
    en: string;
    local?: string;
  };
  aliases?: string[];
};

export type BrandCategory =
  | "outdoor_apparel"
  | "outdoor_footwear"
  | "outdoor_gear"
  | "beauty_care"
  | "electronics"
  | "sport_apparel"
  | "other";

export const BRAND_CATEGORY_LABELS: Record<BrandCategory, string> = {
  outdoor_apparel: "户外服饰",
  outdoor_footwear: "鞋靴",
  outdoor_gear: "户外装备",
  beauty_care: "美妆个护",
  electronics: "电子设备",
  sport_apparel: "运动服饰",
  other: "其他",
};

export const BRAND_LIBRARY: BrandEntry[] = [
  { key: 'adidas', names: { en: 'adidas' } },
  { key: 'altra', names: { en: 'Altra' } },
  { key: 'anessa', names: { zh: '安热沙', en: 'Anessa' } },
  { key: 'apple', names: { en: 'Apple' } },
  { key: 'arcteryx', names: { zh: '始祖鸟', en: 'Arc\'teryx' }, aliases: ['arc', 'arcteryx'] },
  { key: 'bigagnes', names: { en: 'Big Agnes' } },
  { key: 'biore', names: { zh: '碧柔', en: 'Biore' } },
  { key: 'blackdiamond', names: { zh: '黑钻', en: 'Black Diamond' } },
  { key: 'belkin', names: { en: 'Belkin' } },
  { key: 'brooks', names: { en: 'Brooks' } },
  { key: 'camel', names: { zh: '骆驼', en: 'CAMEL' } },
  { key: 'canon', names: { en: 'Canon' } },
  { key: 'casio', names: { en: 'CASIO' } },
  { key: 'coleman', names: { zh: '科勒曼', en: 'Coleman' } },
  { key: 'columbia', names: { zh: '哥伦比亚', en: 'Columbia' } },
  { key: 'gap', names: { en: 'GAP' } },
  { key: 'gillette', names: { en: 'Gillette' } },
  { key: 'compressport', names: { en: 'Compressport' } },
  { key: 'darntough', names: { en: 'Darn Tough' } },
  { key: 'decathlon', names: { zh: '迪卡侬', en: 'Decathlon' } },
  { key: 'deuter', names: { zh: '多特', en: 'deuter' } },
  { key: 'dyson', names: { zh: '戴森', en: 'Dyson' } },
  { key: 'fjalraven', names: { zh: '北极狐', en: 'Fjällräven', local: 'Fjällräven' } },
  { key: 'garmin', names: { zh: '佳明', en: 'Garmin' } },
  { key: 'goalzero', names: { en: 'Goal Zero' } },
  { key: 'gopro', names: { en: 'GoPro' } },
  { key: 'gregory', names: { en: 'Gregory' } },
  { key: 'hoka', names: { en: 'HOKA' } },
  { key: 'houdini', names: { en: 'Houdini' } },
  { key: 'huawei', names: { zh: '华为', en: 'HUAWEI' } },
  { key: 'hydroflask', names: { en: 'Hydro Flask' } },
  { key: 'icebreaker', names: { en: 'Icebreaker' } },
  { key: 'jetboil', names: { en: 'Jetboil' } },
  { key: 'kailas', names: { zh: '凯乐石', en: 'KAILAS' } },
  { key: 'keen', names: { en: 'KEEN' } },
  { key: 'larocheposay', names: { zh: '理肤泉', en: 'La Roche-Posay' } },
  { key: 'lasportiva', names: { zh: '拉思珀蒂瓦', en: 'La Sportiva' } },
  { key: 'leki', names: { en: 'LEKI' } },
  { key: 'lowa', names: { en: 'LOWA' } },
  { key: 'lululemon', names: { zh: '露露乐蒙', en: 'lululemon' } },
  { key: 'maybelline', names: { zh: '美宝莲', en: 'Maybelline' } },
  { key: 'mammut', names: { zh: '猛犸象', en: 'Mammut' } },
  { key: 'merrell', names: { en: 'MERRELL' } },
  { key: 'montbell', names: { zh: '梦倍路', en: 'mont-bell' } },
  { key: 'mobi_garden', names: { zh: '牧高笛', en: 'Mobi Garden' }, aliases: ['mugaodi', 'mobigarden'] },
  { key: 'msr', names: { en: 'MSR' } },
  { key: 'muji', names: { zh: '无印良品', en: 'MUJI' } },
  { key: 'mysteryranch', names: { en: 'Mystery Ranch' } },
  { key: 'nalgene', names: { en: 'Nalgene' } },
  { key: 'naturehike', names: { zh: '挪客', en: 'Naturehike' } },
  { key: 'nemo', names: { en: 'NEMO' } },
  { key: 'newbalance', names: { en: 'New Balance' } },
  { key: 'nike', names: { en: 'Nike' } },
  { key: 'nikon', names: { en: 'Nikon' } },
  { key: 'norrona', names: { en: 'Norrona', local: 'Norrøna' } },
  { key: 'off', names: { zh: '欧护', en: 'OFF!' } },
  { key: 'osprey', names: { zh: '小鹰', en: 'Osprey' } },
  { key: 'patagonia', names: { zh: '巴塔哥尼亚', en: 'Patagonia' } },
  { key: 'pelliot', names: { zh: '伯希和', en: 'PELLIOT' } },
  { key: 'petzl', names: { en: 'Petzl' } },
  { key: 'primus', names: { en: 'Primus' } },
  { key: 'quechua', names: { en: 'Quechua' } },
  { key: 'rab', names: { en: 'Rab' } },
  { key: 'revlon', names: { en: 'Revlon' } },
  { key: 'saucony', names: { en: 'Saucony' } },
  { key: 'salomon', names: { zh: '萨洛蒙', en: 'Salomon' } },
  { key: 'scarpa', names: { en: 'SCARPA' } },
  { key: 'seatosummit', names: { zh: '海到山', en: 'Sea to Summit' } },
  { key: 'silva', names: { en: 'SILVA' } },
  { key: 'smartwool', names: { en: 'Smartwool' } },
  { key: 'snowpeak', names: { zh: '雪峰', en: 'Snow Peak' } },
  { key: 'sony', names: { en: 'Sony' } },
  { key: 'stanley', names: { en: 'Stanley' } },
  { key: 'suunto', names: { zh: '颂拓', en: 'Suunto' } },
  { key: 'thenorthface', names: { zh: '北面', en: 'The North Face' }, aliases: ['tnf'] },
  { key: 'thermarest', names: { en: 'Therm-a-Rest' } },
  { key: 'toread', names: { zh: '探路者', en: 'TOREAD' } },
  { key: 'underarmour', names: { zh: '安德玛', en: 'Under Armour' } },
  { key: 'uniqlo', names: { zh: '优衣库', en: 'UNIQLO' } },
  { key: 'xiaomi', names: { zh: '小米', en: 'Xiaomi' } },
];

export function brandDisplayName(entry: BrandEntry) {
  if (entry.names.zh) return `${entry.names.zh} / ${entry.names.en}`;
  if (entry.names.local && entry.names.local !== entry.names.en) return `${entry.names.local} / ${entry.names.en}`;
  return entry.names.en;
}

export const BRAND_DISPLAY_OPTIONS = BRAND_LIBRARY.map(brandDisplayName);

const BRAND_CATEGORY_MAP: Record<string, BrandCategory> = {
  adidas: "sport_apparel",
  altra: "outdoor_footwear",
  anessa: "beauty_care",
  apple: "electronics",
  arcteryx: "outdoor_apparel",
  bigagnes: "outdoor_gear",
  biore: "beauty_care",
  blackdiamond: "outdoor_gear",
  belkin: "electronics",
  brooks: "outdoor_footwear",
  camel: "outdoor_apparel",
  canon: "electronics",
  casio: "electronics",
  coleman: "outdoor_gear",
  columbia: "outdoor_apparel",
  gap: "sport_apparel",
  gillette: "beauty_care",
  compressport: "sport_apparel",
  darntough: "outdoor_apparel",
  decathlon: "sport_apparel",
  deuter: "outdoor_gear",
  dyson: "electronics",
  fjalraven: "outdoor_apparel",
  garmin: "electronics",
  goalzero: "electronics",
  gopro: "electronics",
  gregory: "outdoor_gear",
  hoka: "outdoor_footwear",
  houdini: "outdoor_apparel",
  huawei: "electronics",
  hydroflask: "outdoor_gear",
  icebreaker: "outdoor_apparel",
  jetboil: "outdoor_gear",
  kailas: "outdoor_apparel",
  keen: "outdoor_footwear",
  larocheposay: "beauty_care",
  lasportiva: "outdoor_footwear",
  leki: "outdoor_gear",
  lowa: "outdoor_footwear",
  lululemon: "sport_apparel",
  maybelline: "beauty_care",
  mammut: "outdoor_apparel",
  merrell: "outdoor_footwear",
  montbell: "outdoor_apparel",
  mobi_garden: "outdoor_gear",
  msr: "outdoor_gear",
  muji: "beauty_care",
  mysteryranch: "outdoor_gear",
  nalgene: "outdoor_gear",
  naturehike: "outdoor_gear",
  nemo: "outdoor_gear",
  newbalance: "sport_apparel",
  nike: "sport_apparel",
  nikon: "electronics",
  norrona: "outdoor_apparel",
  off: "beauty_care",
  osprey: "outdoor_gear",
  patagonia: "outdoor_apparel",
  pelliot: "outdoor_apparel",
  petzl: "outdoor_gear",
  primus: "outdoor_gear",
  quechua: "outdoor_apparel",
  rab: "outdoor_apparel",
  revlon: "beauty_care",
  saucony: "outdoor_footwear",
  salomon: "outdoor_footwear",
  scarpa: "outdoor_footwear",
  seatosummit: "outdoor_gear",
  silva: "outdoor_gear",
  smartwool: "outdoor_apparel",
  snowpeak: "outdoor_gear",
  sony: "electronics",
  stanley: "outdoor_gear",
  suunto: "electronics",
  thenorthface: "outdoor_apparel",
  thermarest: "outdoor_gear",
  toread: "outdoor_apparel",
  underarmour: "sport_apparel",
  uniqlo: "sport_apparel",
  xiaomi: "electronics",
};

export type BrandOption = {
  key: string;
  label: string;
  category: BrandCategory;
  searchTokens: string[];
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

export const BRAND_OPTIONS: BrandOption[] = BRAND_LIBRARY.map((entry) => ({
  key: entry.key,
  label: brandDisplayName(entry),
  category: BRAND_CATEGORY_MAP[entry.key] ?? "other",
  searchTokens: [
    entry.key,
    entry.names.en,
    entry.names.zh ?? "",
    entry.names.local ?? "",
    ...(entry.aliases ?? []),
    brandDisplayName(entry),
  ]
    .filter(Boolean)
    .map(normalize),
}));

export function detectBrandFromText(input: string | null | undefined): BrandOption | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;
  const normalized = normalize(raw);
  if (!normalized) return null;
  let best: BrandOption | null = null;
  let bestTokenLength = 0;
  for (const option of BRAND_OPTIONS) {
    for (const token of option.searchTokens) {
      if (!token) continue;
      if (normalized.includes(token) && token.length > bestTokenLength) {
        best = option;
        bestTokenLength = token.length;
      }
    }
  }
  return best;
}
