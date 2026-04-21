"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Building2, ChevronLeft, ChevronRight, Compass, Music2, Plane, TentTree, Waves, Zap } from "lucide-react";
import { createTripWithTemplates } from "@/features/trips/actions";
import { type Lang, texts } from "@/shared/i18n";

type Template = {
  id: string;
  name_zh: string;
  icon: string | null;
  category: string;
};

const destinationTree = {
  亚洲: {
    日本: ["东京", "大阪", "京都", "福冈", "札幌", "冲绳", "名古屋", "仙台"],
    韩国: ["首尔", "釜山", "济州", "仁川"],
    中国: ["北京", "上海", "广州", "成都", "杭州", "西安", "深圳", "重庆"],
    泰国: ["曼谷", "清迈", "普吉", "芭提雅"],
    新加坡: ["新加坡"],
    马来西亚: ["吉隆坡", "槟城", "新山"],
    印度尼西亚: ["雅加达", "巴厘岛", "泗水"],
    越南: ["河内", "胡志明市", "岘港"],
    菲律宾: ["马尼拉", "宿务", "长滩岛"],
    印度: ["新德里", "孟买", "班加罗尔"],
    阿联酋: ["迪拜", "阿布扎比"],
    土耳其: ["伊斯坦布尔", "安塔利亚"],
    斯里兰卡: ["科伦坡", "康提"],
    尼泊尔: ["加德满都", "博卡拉"],
    卡塔尔: ["多哈"],
  },
  欧洲: {
    法国: ["巴黎", "里昂", "尼斯", "马赛"],
    英国: ["伦敦", "爱丁堡", "曼彻斯特", "伯明翰"],
    意大利: ["罗马", "米兰", "佛罗伦萨", "那不勒斯"],
    西班牙: ["马德里", "巴塞罗那", "塞维利亚"],
    德国: ["柏林", "慕尼黑", "法兰克福"],
    瑞士: ["苏黎世", "日内瓦", "卢塞恩"],
    葡萄牙: ["里斯本", "波尔图"],
    荷兰: ["阿姆斯特丹", "鹿特丹"],
    冰岛: ["雷克雅未克"],
    奥地利: ["维也纳", "萨尔茨堡"],
    比利时: ["布鲁塞尔", "布鲁日"],
    挪威: ["奥斯陆", "卑尔根"],
    瑞典: ["斯德哥尔摩", "哥德堡"],
    丹麦: ["哥本哈根"],
    捷克: ["布拉格"],
    希腊: ["雅典", "圣托里尼"],
    匈牙利: ["布达佩斯"],
    爱尔兰: ["都柏林"],
    波兰: ["华沙", "克拉科夫"],
  },
  北美洲: {
    美国: ["纽约", "洛杉矶", "西雅图", "旧金山", "芝加哥", "波士顿"],
    加拿大: ["温哥华", "多伦多", "蒙特利尔", "卡尔加里"],
    墨西哥: ["墨西哥城", "坎昆", "瓜达拉哈拉"],
    古巴: ["哈瓦那"],
    哥斯达黎加: ["圣何塞"],
    巴拿马: ["巴拿马城"],
    牙买加: ["金斯敦", "蒙特哥贝"],
  },
  大洋洲: {
    澳大利亚: ["悉尼", "墨尔本", "布里斯班", "珀斯"],
    新西兰: ["奥克兰", "皇后镇", "惠灵顿"],
    斐济: ["楠迪", "苏瓦"],
    巴布亚新几内亚: ["莫尔兹比港"],
    萨摩亚: ["阿皮亚"],
  },
  南美洲: {
    巴西: ["里约热内卢", "圣保罗", "萨尔瓦多"],
    阿根廷: ["布宜诺斯艾利斯", "门多萨"],
    智利: ["圣地亚哥", "复活节岛"],
    秘鲁: ["利马", "库斯科"],
    哥伦比亚: ["波哥大", "麦德林"],
    乌拉圭: ["蒙得维的亚"],
    厄瓜多尔: ["基多", "瓜亚基尔"],
    玻利维亚: ["拉巴斯"],
  },
  非洲: {
    摩洛哥: ["马拉喀什", "卡萨布兰卡"],
    埃及: ["开罗", "卢克索"],
    南非: ["开普敦", "约翰内斯堡"],
    肯尼亚: ["内罗毕"],
    坦桑尼亚: ["桑给巴尔", "达累斯萨拉姆"],
    纳米比亚: ["温得和克"],
    埃塞俄比亚: ["亚的斯亚贝巴"],
    毛里求斯: ["路易港"],
    突尼斯: ["突尼斯市"],
  },
} as const;

const countryRegionCityMap: Record<string, Record<string, string[]>> = {
  中国: {
    华北: ["北京", "天津", "石家庄", "太原", "呼和浩特"],
    华东: ["上海", "杭州", "南京", "苏州", "宁波", "合肥", "青岛", "济南", "厦门", "福州"],
    华南: ["广州", "深圳", "珠海", "南宁", "海口"],
    西南: ["成都", "重庆", "昆明", "贵阳", "拉萨"],
    西北: ["西安", "兰州", "银川", "西宁", "乌鲁木齐"],
    东北: ["沈阳", "大连", "长春", "哈尔滨"],
  },
  日本: {
    关东: ["东京", "横滨", "镰仓", "箱根"],
    关西: ["大阪", "京都", "神户", "奈良"],
    九州: ["福冈", "熊本", "鹿儿岛"],
    北海道: ["札幌", "小樽", "函馆"],
    冲绳: ["冲绳", "那霸", "石垣岛"],
    中部: ["名古屋", "金泽", "高山"],
  },
  美国: {
    西海岸: ["洛杉矶", "旧金山", "西雅图", "圣地亚哥"],
    东海岸: ["纽约", "波士顿", "迈阿密", "华盛顿"],
    中部: ["芝加哥", "丹佛", "达拉斯", "休斯顿"],
    夏威夷: ["檀香山", "茂宜岛"],
  },
  加拿大: {
    不列颠哥伦比亚省: ["温哥华", "维多利亚", "惠斯勒"],
    安大略省: ["多伦多", "渥太华", "滑铁卢"],
    魁北克省: ["蒙特利尔", "魁北克城"],
    阿尔伯塔省: ["卡尔加里", "班夫", "埃德蒙顿"],
  },
  澳大利亚: {
    新南威尔士州: ["悉尼", "纽卡斯尔"],
    维多利亚州: ["墨尔本", "大洋路"],
    昆士兰州: ["布里斯班", "凯恩斯", "黄金海岸"],
    西澳州: ["珀斯"],
  },
};

const localizedNames: Record<Lang, Record<string, string>> = {
  "zh-CN": {},
  "zh-TW": {
    亚洲: "亞洲",
    欧洲: "歐洲",
    北美洲: "北美洲",
    大洋洲: "大洋洲",
  },
  en: {
    亚洲: "Asia",
    欧洲: "Europe",
    北美洲: "North America",
    大洋洲: "Oceania",
    日本: "Japan",
    韩国: "South Korea",
    中国: "China",
    泰国: "Thailand",
    法国: "France",
    英国: "United Kingdom",
    意大利: "Italy",
    美国: "United States",
    加拿大: "Canada",
    澳大利亚: "Australia",
    新西兰: "New Zealand",
    东京: "Tokyo",
    大阪: "Osaka",
    京都: "Kyoto",
    福冈: "Fukuoka",
    札幌: "Sapporo",
    冲绳: "Okinawa",
    首尔: "Seoul",
    釜山: "Busan",
    济州: "Jeju",
    北京: "Beijing",
    上海: "Shanghai",
    广州: "Guangzhou",
    成都: "Chengdu",
    杭州: "Hangzhou",
    西安: "Xi'an",
    曼谷: "Bangkok",
    清迈: "Chiang Mai",
    普吉: "Phuket",
    巴黎: "Paris",
    里昂: "Lyon",
    尼斯: "Nice",
    伦敦: "London",
    爱丁堡: "Edinburgh",
    曼彻斯特: "Manchester",
    罗马: "Rome",
    米兰: "Milan",
    佛罗伦萨: "Florence",
    纽约: "New York",
    洛杉矶: "Los Angeles",
    西雅图: "Seattle",
    旧金山: "San Francisco",
    温哥华: "Vancouver",
    多伦多: "Toronto",
    蒙特利尔: "Montreal",
    悉尼: "Sydney",
    墨尔本: "Melbourne",
    布里斯班: "Brisbane",
    奥克兰: "Auckland",
    皇后镇: "Queenstown",
  },
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      type="submit"
      className="brand-btn-primary h-11 w-full px-5 text-[16px] disabled:opacity-50"
      style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 500, lineHeight: 1.1, whiteSpace: "nowrap" }}
    >
      {pending ? `${label}...` : label}
    </button>
  );
}

function formatDateInput(value: Date) {
  const yyyy = value.getFullYear();
  const mm = `${value.getMonth() + 1}`.padStart(2, "0");
  const dd = `${value.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function buildMonthGrid(monthDate: Date) {
  const first = startOfMonth(monthDate);
  const firstWeekDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < firstWeekDay; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

export function NewTripForm({ templates, lang, error }: { templates: Template[]; lang: Lang; error?: string }) {
  const t = texts[lang];
  const continents = Object.keys(destinationTree);
  const [continent, setContinent] = useState<string>(continents[0]);
  const countries = Object.keys(destinationTree[continent as keyof typeof destinationTree]);
  const [country, setCountry] = useState<string>(countries[0]);
  const [region, setRegion] = useState<string>("");
  const cities = destinationTree[continent as keyof typeof destinationTree][
    country as keyof (typeof destinationTree)[keyof typeof destinationTree]
  ] as readonly string[];
  const [selectedCities, setSelectedCities] = useState<string[]>(cities[0] ? [cities[0]] : []);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [travelStyle, setTravelStyle] = useState<string>("");
  const [customTravelStyle, setCustomTravelStyle] = useState<string>("");
  const [isCustomTravelStyle, setIsCustomTravelStyle] = useState<boolean>(false);
  const [countryQuery, setCountryQuery] = useState<string>("");
  const [cityQuery, setCityQuery] = useState<string>("");
  const [countryOpen, setCountryOpen] = useState<boolean>(false);
  const [cityOpen, setCityOpen] = useState<boolean>(false);
  const [quickDuration, setQuickDuration] = useState<number | null>(null);
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);
  const [customDurationValue, setCustomDurationValue] = useState<string>("");
  const [customTitle, setCustomTitle] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  const displayName = (value: string) => localizedNames[lang][value] ?? value;

  const sceneGroups = useMemo(() => {
    const labels =
      lang === "en"
        ? { outdoor: "Outdoor", city: "City", travelBasics: "Travel Basics" }
        : lang === "zh-TW"
          ? { outdoor: "戶外活動", city: "城市活動", travelBasics: "出行基礎" }
          : { outdoor: "户外活动", city: "城市活动", travelBasics: "出行基础" };
    return [
      {
        group: labels.outdoor,
        items: [
          { key: "徒步", Icon: Compass },
          { key: "露营", Icon: TentTree },
          { key: "越野跑", Icon: Zap },
          { key: "潜水", Icon: Waves },
        ],
      },
      {
        group: labels.city,
        items: [
          { key: "音乐节", Icon: Music2 },
          { key: "城市漫游", Icon: Building2 },
        ],
      },
      {
        group: labels.travelBasics,
        items: [{ key: "跨国旅行", Icon: Plane }],
      },
    ] as const;
  }, [lang]);
  const templateByName = useMemo(() => {
    const map = new Map<string, Template>();
    templates.forEach((item) => map.set(item.name_zh, item));
    return map;
  }, [templates]);
  const [selectedScenes, setSelectedScenes] = useState<string[]>([]);
  const searchAliasMap: Record<string, string[]> = {
    法国: ["france", "faguo", "fa"],
    英国: ["uk", "unitedkingdom", "yingguo", "england"],
    德国: ["germany", "deguo"],
    意大利: ["italy", "yidali"],
    西班牙: ["spain", "xibanya"],
    日本: ["japan", "riben"],
    韩国: ["korea", "hanguo"],
    中国: ["china", "zhongguo"],
    美国: ["usa", "unitedstates", "meiguo"],
    巴黎: ["paris", "bali"],
    伦敦: ["london", "lundun"],
    东京: ["tokyo", "dongjing"],
    大阪: ["osaka", "daban"],
    京都: ["kyoto", "jingdu"],
    首尔: ["seoul", "shouer"],
    北京: ["beijing"],
    上海: ["shanghai"],
    广州: ["guangzhou"],
    成都: ["chengdu"],
    洛杉矶: ["losangeles", "la", "luoshanji"],
    纽约: ["newyork", "nyc", "niuyue"],
    曼谷: ["bangkok", "mangu"],
    清迈: ["chiangmai", "qingmai"],
  };
  const allCountries = Array.from(new Set(Object.values(destinationTree).flatMap((group) => Object.keys(group))));
  const matchesSearch = (item: string, query: string) => {
    const q = normalizeSearch(query);
    if (!q) return true;
    const tokens = [
      item,
      displayName(item),
      ...(searchAliasMap[item] ?? []),
    ].map((t) => normalizeSearch(t));
    return tokens.some((token) => token.includes(q));
  };
  const filteredCountries = allCountries.filter((item) => matchesSearch(item, countryQuery)).slice(0, 80);
  const regionOptions = useMemo(() => Object.keys(countryRegionCityMap[country] ?? {}), [country]);
  const countryCities = useMemo(() => {
    if (region && countryRegionCityMap[country]?.[region]) {
      return countryRegionCityMap[country][region];
    }
    if (regionOptions.length) {
      return Object.values(countryRegionCityMap[country]).flat();
    }
    const group = destinationTree[continent as keyof typeof destinationTree] as Record<string, readonly string[]>;
    return group[country] ?? [];
  }, [continent, country, region, regionOptions]);
  const filteredCities = countryCities.filter((item) => matchesSearch(item, cityQuery)).slice(0, 80);
  const generatedTitle = useMemo(() => {
    if (!startDate) return "";
    const s = new Date(startDate);
    const effectiveEndDate = endDate || startDate;
    const e = new Date(effectiveEndDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return t.invalidDateHint;
    const days = Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1;
    const mainCity = selectedCities[0] || country || continent;
    const mainScene = selectedScenes.length ? selectedScenes.slice(0, 2).join("") : (lang === "en" ? "Trip" : "行程");
    return `${mainCity} · ${mainScene} · ${days}${lang === "en" ? "d" : "日"}`;
  }, [startDate, endDate, country, selectedCities, continent, selectedScenes, lang, t.invalidDateHint]);
  const previewTitle = customTitle.trim() || generatedTitle;
  const travelPresets: Array<{ value: string; label: string }> = useMemo(
    () =>
      lang === "en"
        ? [
            { value: "solo", label: "Solo" },
            { value: "friends", label: "Friends" },
            { value: "family", label: "Family" },
            { value: "business", label: "Business" },
          ]
        : lang === "zh-TW"
          ? [
              { value: "solo", label: "獨旅" },
              { value: "friends", label: "朋友同行" },
              { value: "family", label: "家庭出行" },
              { value: "business", label: "商務出差" },
            ]
          : [
              { value: "solo", label: "独旅" },
              { value: "friends", label: "朋友同行" },
              { value: "family", label: "家庭出行" },
              { value: "business", label: "商务出差" },
            ],
    [lang],
  );
  const travelStyleLabelMap = useMemo(
    () => new Map(travelPresets.map((item) => [item.value, item.label])),
    [travelPresets],
  );

  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : null;
  const monthGrid = useMemo(() => buildMonthGrid(calendarMonth), [calendarMonth]);
  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: new Date(2026, i, 1).toLocaleString(lang === "en" ? "en-US" : lang === "zh-TW" ? "zh-TW" : "zh-CN", { month: "long" }),
      })),
    [lang],
  );
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => Array.from({ length: 21 }, (_, i) => currentYear - 5 + i), [currentYear]);
  const goNextStep = () => {
    if (step === 1 && startDate && !endDate) {
      if (quickDuration && quickDuration > 0) {
        const s = new Date(startDate);
        if (!Number.isNaN(s.getTime())) {
          const e = new Date(s);
          e.setDate(e.getDate() + quickDuration - 1);
          setEndDate(formatDateInput(e));
        } else {
          setEndDate(startDate);
        }
      } else {
        // If only start date is selected, default to one-day trip.
        setEndDate(startDate);
      }
    }
    setStep((prev) => Math.min(3, prev + 1));
  };

  return (
    <form action={createTripWithTemplates} className="space-y-5 rounded-[16px] border border-[#d8d0c4] bg-[#fefcf8] p-4 md:p-5">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="country" value={country} />
      {selectedCities.map((city) => (
        <input key={city} type="hidden" name="cities" value={city} />
      ))}
      {selectedScenes.map((scene) => (
        <input key={scene} type="hidden" name="scene_names" value={scene} />
      ))}
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-[0.14em] text-[#8c8880]">{`${t.stepLabel} ${step}/3`}</p>
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`h-1.5 w-6 rounded-full ${step >= s ? "bg-[#243d1f]" : "bg-[#d8d0c4]"}`} />
          ))}
        </div>
      </div>
      {error ? <p className="rounded border border-red-200 bg-red-50 p-2 text-sm">{error}</p> : null}
      <label className={`block text-sm ${step === 3 ? "" : "hidden"}`}>
        {t.customTitleOptional}
        <input
          name="custom_title"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          className="mt-1 w-full rounded-[10px] border-[0.5px] border-[#d8d0c4] bg-[#fefcf8] px-3 py-2"
          placeholder={t.customTitlePlaceholder}
        />
      </label>

      <div className={`space-y-4 ${step === 1 ? "" : "hidden"}`}>
        <div>
          <p className="mb-2 text-[12px] tracking-[0.06em] text-[#8c8880]">{t.destinationStep}</p>
          <div className="grid gap-2 md:grid-cols-4">
            <label className="text-sm">
              <p className="mb-1 text-[12px] tracking-[0.06em] text-[#8c8880]">CONTINENT</p>
              <select
                name="continent"
                value={continent}
                onChange={(e) => {
                  const nextContinent = e.target.value;
                  setContinent(nextContinent);
                  const nextCountries = Object.keys(destinationTree[nextContinent as keyof typeof destinationTree]);
                  const nextCountry = nextCountries[0];
                  setCountry(nextCountry);
                  setRegion("");
                  setCountryQuery("");
                  const nextCities =
                    destinationTree[nextContinent as keyof typeof destinationTree][
                      nextCountry as keyof (typeof destinationTree)[keyof typeof destinationTree]
                    ];
                  setSelectedCities(nextCities?.[0] ? [nextCities[0]] : []);
                  setCityQuery("");
                }}
                className="h-12 w-full rounded-[10px] border-[0.5px] border-[#d8d0c4] bg-[#fefcf8] px-3 text-[16px]"
              >
                {continents.map((item) => (
                  <option key={item} value={item}>
                    {displayName(item)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <p className="mb-1 text-[12px] tracking-[0.06em] text-[#8c8880]">COUNTRY</p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCountryOpen((prev) => !prev)}
                  className="flex h-12 w-full items-center justify-between rounded-[10px] border-[0.5px] border-[#d8d0c4] bg-[#fefcf8] px-3 text-[16px]"
                >
                  <span className="truncate text-left">{country || t.selectCountry}</span>
                  <span>▾</span>
                </button>
                {countryOpen ? (
                  <div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] p-1 shadow-sm">
                    <input
                      value={countryQuery}
                      onChange={(e) => setCountryQuery(e.target.value)}
                      placeholder={t.searchCountry}
                      className="mb-1 h-9 w-full rounded border border-[#d8d0c4] px-2 text-sm"
                    />
                    {[...new Set([...countries, ...filteredCountries])].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="block w-full rounded px-2 py-2 text-left text-sm hover:bg-[#ede8df]"
                        onMouseDown={() => {
                          setCountry(item);
                          setRegion("");
                          setCountryQuery("");
                          const nextCities = countryRegionCityMap[item]
                            ? Object.values(countryRegionCityMap[item]).flat()
                            : (destinationTree[continent as keyof typeof destinationTree] as Record<string, readonly string[]>)[item] ?? [];
                          if (nextCities?.length) {
                            setSelectedCities([nextCities[0]]);
                          }
                          setCountryOpen(false);
                        }}
                      >
                        {displayName(item)}
                      </button>
                    ))}
                    {countryQuery.trim() && filteredCountries.length === 0 ? (
                      <p className="px-2 py-2 text-xs text-[#8c8880]">
                        {lang === "en" ? "No country match. Try Chinese, pinyin, or English keywords." : lang === "zh-TW" ? "未找到匹配國家，請嘗試中文、拼音或英文關鍵字。" : "未找到匹配国家，请尝试中文、拼音或英文关键词。"}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </label>
            <label className="text-sm">
              <p className="mb-1 text-[12px] tracking-[0.06em] text-[#8c8880]">
                {lang === "en" ? "STATE / PROVINCE" : lang === "zh-TW" ? "省 / 州" : "省 / 州"}
              </p>
              <select
                value={region}
                onChange={(e) => {
                  const nextRegion = e.target.value;
                  setRegion(nextRegion);
                  const nextCities =
                    nextRegion && countryRegionCityMap[country]?.[nextRegion]
                      ? countryRegionCityMap[country][nextRegion]
                      : countryRegionCityMap[country]
                        ? Object.values(countryRegionCityMap[country]).flat()
                        : countryCities;
                  setSelectedCities(nextCities?.[0] ? [nextCities[0]] : []);
                }}
                className="h-12 w-full rounded-[10px] border-[0.5px] border-[#d8d0c4] bg-[#fefcf8] px-3 text-[16px]"
                disabled={!regionOptions.length}
              >
                <option value="">
                  {regionOptions.length
                    ? lang === "en"
                      ? "All regions"
                      : lang === "zh-TW"
                        ? "全部省州"
                        : "全部省州"
                    : lang === "en"
                      ? "Not required"
                      : lang === "zh-TW"
                        ? "該國家不需要"
                        : "该国家不需要"}
                </option>
                {regionOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <p className="mb-1 text-[12px] tracking-[0.06em] text-[#8c8880]">CITY</p>
              <div className="relative">
                <input
                  value={cityQuery}
                  onFocus={() => setCityOpen(true)}
                  onBlur={() => setTimeout(() => setCityOpen(false), 120)}
                  onChange={(e) => {
                    setCityQuery(e.target.value);
                  }}
                  className="h-12 w-full rounded-[10px] border-[0.5px] border-[#d8d0c4] bg-[#fefcf8] px-3 text-[16px]"
                  placeholder={t.searchCity}
                />
                {cityOpen ? (
                  <div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] p-1 shadow-sm">
                    {[...new Set(filteredCities)].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="block w-full rounded px-2 py-2 text-left text-sm hover:bg-[#ede8df]"
                        onMouseDown={() => {
                          setSelectedCities((prev) => (prev.includes(item) ? prev : [...prev, item]));
                          setCityQuery("");
                        }}
                      >
                        {displayName(item)}
                      </button>
                    ))}
                    {cityQuery.trim() ? (
                      <button
                        type="button"
                        className="mt-1 block w-full rounded border border-dashed border-[#d8d0c4] px-2 py-2 text-left text-sm text-[#4a4840]"
                        onMouseDown={() => {
                          const customCity = cityQuery.trim();
                          setSelectedCities((prev) => (prev.includes(customCity) ? prev : [...prev, customCity]));
                          setCityQuery("");
                          setCityOpen(false);
                        }}
                      >
                        + {t.addCity}: {cityQuery.trim()}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedCities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    className="brand-chip px-3 py-1 text-xs"
                    onClick={() => setSelectedCities((prev) => prev.filter((c) => c !== city))}
                  >
                    {city} ×
                  </button>
                ))}
              </div>
              {!selectedCities.length ? <p className="mt-1 text-xs text-[#9b6a2a]">{t.cityRequired}</p> : null}
            </label>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[12px] tracking-[0.06em] text-[#8c8880]">{t.durationStep}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {[3, 5, 7, 10, 14].map((days) => (
              <button
                key={days}
                type="button"
                className={`brand-chip min-w-[58px] px-3 py-2 text-sm ${quickDuration === days ? "brand-chip-active" : ""}`}
                onClick={() => {
                  setIsCustomDuration(false);
                  setCustomDurationValue("");
                  setQuickDuration(days);
                  if (!startDate) return;
                  const s = new Date(startDate);
                  if (Number.isNaN(s.getTime())) return;
                  const e = new Date(s);
                  e.setDate(e.getDate() + days - 1);
                  setEndDate(formatDateInput(e));
                }}
              >
                {days} {t.daysSuffix}
              </button>
            ))}
            <button
              type="button"
              className={`brand-chip min-w-[58px] px-3 py-2 text-sm ${isCustomDuration ? "brand-chip-active" : ""}`}
              onClick={() => {
                setIsCustomDuration(true);
                setQuickDuration(null);
              }}
            >
              + {t.customDuration}
            </button>
            {isCustomDuration ? (
              <input
                inputMode="numeric"
                value={customDurationValue}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/[^\d]/g, "");
                  setCustomDurationValue(onlyDigits);
                  const parsed = Number(onlyDigits);
                  if (parsed > 0) {
                    setQuickDuration(parsed);
                    if (startDate) {
                      const s = new Date(startDate);
                      if (!Number.isNaN(s.getTime())) {
                        const end = new Date(s);
                        end.setDate(end.getDate() + parsed - 1);
                        setEndDate(formatDateInput(end));
                      }
                    }
                  } else {
                    setQuickDuration(null);
                  }
                }}
                placeholder={lang === "en" ? "Days" : "天数"}
                className="h-10 w-[92px] rounded-[10px] border-[0.5px] border-[#d8d0c4] bg-[#fefcf8] px-3 text-sm"
              />
            ) : null}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[12px] tracking-[0.06em] text-[#8c8880]">{t.dateStep}</p>
          <input required type="hidden" name="start_date" value={startDate} />
          <input required type="hidden" name="end_date" value={endDate} />
          <div className="max-w-[760px] overflow-hidden rounded-[14px] border border-[#d8d0c4] bg-[#fefcf8] p-3">
            <div className="mb-3 flex min-h-10 items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <select
                  value={calendarMonth.getFullYear()}
                  onChange={(e) => {
                    const y = Number(e.target.value);
                    setCalendarMonth((prev) => new Date(y, prev.getMonth(), 1));
                  }}
                  className="h-9 min-w-[82px] rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] px-2 text-[13px] leading-9 text-[#2f2d29]"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  value={calendarMonth.getMonth()}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    setCalendarMonth((prev) => new Date(prev.getFullYear(), m, 1));
                  }}
                  className="h-9 min-w-[78px] rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] px-2 text-[13px] leading-9 text-[#2f2d29]"
                >
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous month"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] text-[#4a4840] hover:bg-[#f2eee6]"
                  onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#d8d0c4] bg-[#fefcf8] text-[#4a4840] hover:bg-[#f2eee6]"
                  onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="mb-2 grid grid-cols-7 text-center text-[13px] text-[#8c8880]">
              {["M", "T", "W", "T", "F", "S", "S"].map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthGrid.map((cell, idx) => {
                if (!cell) return <span key={`blank-${idx}`} className="h-8" />;
                const inRange = startDateObj && endDateObj && cell >= startDateObj && cell <= endDateObj;
                const isStart = startDateObj && sameDay(cell, startDateObj);
                const isEnd = endDateObj && sameDay(cell, endDateObj);
                return (
                  <button
                    key={cell.toISOString()}
                    type="button"
                    className={`h-8 rounded-[8px] text-[13px] ${isStart || isEnd ? "bg-[#243d1f] text-[#fefcf8]" : inRange ? "bg-[#e8f2e4] text-[#243d1f]" : "hover:bg-[#f2eee6]"}`}
                    onClick={() => {
                      const clicked = formatDateInput(cell);
                      if (!startDate || (startDate && endDate)) {
                        setStartDate(clicked);
                        if (quickDuration && quickDuration > 0) {
                          const start = new Date(clicked);
                          const autoEnd = new Date(start);
                          autoEnd.setDate(autoEnd.getDate() + quickDuration - 1);
                          setEndDate(formatDateInput(autoEnd));
                        } else {
                          setEndDate("");
                        }
                        return;
                      }
                      if (clicked < startDate) {
                        setStartDate(clicked);
                        setEndDate(startDate);
                      } else {
                        setEndDate(clicked);
                      }
                    }}
                  >
                    {cell.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[12px] tracking-[0.06em] text-[#8c8880]">{t.travelStyleStep}</p>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {travelPresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`brand-chip ${!isCustomTravelStyle && travelStyle === preset.value ? "brand-chip-active" : ""}`}
                onClick={() => {
                  setIsCustomTravelStyle(false);
                  setTravelStyle(preset.value);
                }}
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              className={`brand-chip ${isCustomTravelStyle ? "brand-chip-active" : ""}`}
              onClick={() => {
                setIsCustomTravelStyle(true);
                setTravelStyle(customTravelStyle.trim());
              }}
            >
              + {t.customTravelStyle}
            </button>
            {isCustomTravelStyle ? (
              <input
                value={customTravelStyle}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomTravelStyle(value);
                  setTravelStyle(value.trim());
                }}
                className="h-10 w-[180px] rounded-[10px] border-[0.5px] border-[#d8d0c4] bg-[#fefcf8] px-3 text-[14px]"
                placeholder={t.customTravelStylePlaceholder}
              />
            ) : null}
          </div>
          <input type="hidden" name="travel_style" value={travelStyle} />
        </div>
      </div>

      <div className={`rounded-[14px] border border-[#d8d0c4] bg-[#f8f5ef] px-4 py-4 text-sm ${step === 3 ? "" : "hidden"}`}>
        <p className="text-[11px] tracking-[0.04em] text-[#7a766d]">{t.autoTitleLabel}</p>
        <p className="mt-2 text-[22px] leading-[1.2] text-[#2f2d29] md:text-[24px]" style={{ fontFamily: "EB Garamond, serif", fontStyle: "italic" }}>
          {previewTitle || t.autoTitleHint}
        </p>
        <p className="mt-2 text-[13px] text-[#6f6b62]" style={{ fontFamily: "DM Sans, sans-serif" }}>
          {startDate || "--"} — {endDate || startDate || "--"} · {travelStyleLabelMap.get(travelStyle) ?? travelStyle ?? "Solo"}
        </p>
      </div>

      <label className={`block text-sm ${step === 3 ? "" : "hidden"}`}>
        {t.optionalNote}
        <textarea name="note" className="mt-1 w-full rounded-[10px] border-[0.5px] border-[#d8d0c4] bg-[#fefcf8] px-3 py-2" placeholder={t.notePlaceholderTrip} />
      </label>

      <div className={step === 2 ? "" : "hidden"}>
        <p className="mb-2 text-sm font-medium">{t.templates}</p>
        <div className="space-y-3">
          {sceneGroups.map((group) => (
            <section key={group.group}>
              <p className="mb-2 text-[12px] tracking-[0.06em] text-[#8c8880]">{group.group}</p>
              <div className="grid grid-cols-3 gap-2">
                {group.items.map((scene) => {
                  const hit = templateByName.get(scene.key);
                  const active = selectedScenes.includes(scene.key);
                  const Icon = scene.Icon;
                  return (
                    <label
                      key={scene.key}
                      className={`cursor-pointer rounded-[12px] border p-[14px_12px] text-center ${active ? "border-[#6b9460] bg-[#e8f2e4]" : "border-[#d8d0c4] bg-[#fefcf8]"}`}
                    >
                      {hit ? <input type="checkbox" name="templates" value={hit.id} className="hidden" checked={active} readOnly /> : null}
                      <button
                        type="button"
                        className="flex w-full flex-col items-center gap-1"
                        onClick={() => {
                          setSelectedScenes((prev) => (prev.includes(scene.key) ? prev.filter((item) => item !== scene.key) : [...prev, scene.key]));
                        }}
                      >
                        <Icon size={24} strokeWidth={1.6} className={active ? "text-[#243d1f]" : "text-[#6d6a63]"} />
                        <span className={`text-xs ${active ? "text-[#243d1f]" : "text-[#4a4840]"}`}>{scene.key}</span>
                      </button>
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        <div className="mt-3 rounded-[10px] bg-[#243d1f] px-3 py-2 text-xs text-[#dbe7d6]">
          {(lang === "en" ? "Selected scenes: " : lang === "zh-TW" ? "已選場景：" : "已选场景：") +
            (selectedScenes.length ? selectedScenes.join(" · ") : lang === "en" ? "None" : lang === "zh-TW" ? "暫無" : "暂无")}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        {step > 1 ? (
          <button
            type="button"
            className="brand-btn-soft shrink-0 whitespace-nowrap px-4 py-2 text-sm"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
          >
            {t.prevStep}
          </button>
        ) : null}
        {step < 3 ? (
          <button type="button" className="brand-btn-editorial whitespace-nowrap px-6 py-2 text-sm" onClick={goNextStep}>
            {t.nextStep}
          </button>
        ) : (
          <div className="ml-auto w-full max-w-[340px]">
            <SubmitButton label={t.generateMyPacklog} />
          </div>
        )}
      </div>
    </form>
  );
}
