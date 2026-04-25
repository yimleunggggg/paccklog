export type WeightHint = {
  tokens: string[];
  weightG: number;
};

const WEIGHT_HINTS: WeightHint[] = [
  { tokens: ["macbook", "laptop", "笔记本"], weightG: 1240 },
  { tokens: ["airpods", "earbuds", "耳机"], weightG: 50 },
  { tokens: ["passport", "护照"], weightG: 60 },
  { tokens: ["charger", "adapter", "充电器"], weightG: 120 },
  { tokens: ["power bank", "powerbank", "充电宝"], weightG: 220 },
  { tokens: ["camera", "相机", "leica", "sony"], weightG: 700 },
  { tokens: ["lens", "镜头"], weightG: 420 },
  { tokens: ["tripod", "三脚架"], weightG: 1100 },
  { tokens: ["jacket", "shell", "冲锋衣", "外套"], weightG: 540 },
  { tokens: ["down", "parka", "羽绒"], weightG: 720 },
  { tokens: ["boots", "shoes", "鞋"], weightG: 980 },
  { tokens: ["t-shirt", "tshirt", "t恤"], weightG: 180 },
  { tokens: ["toothbrush", "牙刷"], weightG: 18 },
  { tokens: ["toiletry", "洗漱", "洗漱包"], weightG: 380 },
  { tokens: ["umbrella", "伞"], weightG: 380 },
  { tokens: ["wallet", "钱包"], weightG: 110 },
];

export function suggestWeightByName(name: string) {
  const query = (name ?? "").trim().toLowerCase();
  if (!query) return null;
  let best: WeightHint | null = null;
  let bestLen = 0;
  for (const hint of WEIGHT_HINTS) {
    for (const token of hint.tokens) {
      const tokenLow = token.toLowerCase();
      if (query.includes(tokenLow) && tokenLow.length > bestLen) {
        best = hint;
        bestLen = tokenLow.length;
      }
    }
  }
  return best;
}
