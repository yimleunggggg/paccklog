type WeatherSummary = {
  locationLabel: string;
  avgTempC: number | null;
  minTempC: number | null;
  maxTempC: number | null;
  rainSumMm: number | null;
  windMaxKmh: number | null;
  suggestion: string;
  source: string;
  isEstimated?: boolean;
};

function buildSuggestion(avgTemp: number | null, rain: number | null, wind: number | null, lang: string) {
  const tips: string[] = [];
  const isEn = lang === "en";
  const isTw = lang === "zh-TW";
  if (avgTemp !== null) {
    if (avgTemp <= 8) tips.push(isEn ? "Layer up with insulation and a windproof shell; pack warm socks and gloves." : isTw ? "建議保暖中層+防風外層，準備保暖襪與手套。" : "建议保暖中层+防风外层，准备保暖袜和手套。");
    else if (avgTemp <= 18) tips.push(isEn ? "Use layering: long-sleeve base + light jacket." : isTw ? "建議洋蔥式穿搭，長袖內層+輕外套。" : "建议洋葱穿搭，长袖内层+轻外套。");
    else if (avgTemp <= 28) tips.push(isEn ? "Choose breathable quick-dry outfits and keep sun protection ready." : isTw ? "建議透氣快乾衣物，白天注意防曬。" : "建议透气速干衣物，白天注意防晒。");
    else tips.push(isEn ? "Keep outfits very light and breathable; hydrate and strengthen sun protection." : isTw ? "建議輕薄透氣穿搭，補水與防曬都要加強。" : "建议轻薄透气穿搭，补水和防晒都要加强。");
  }
  if (rain !== null && rain >= 8) tips.push(isEn ? "Rain looks significant: bring a rain shell and waterproof pouches." : isTw ? "預計降水偏多，建議帶雨衣/防水殼與防水收納袋。" : "预计降水偏多，建议带雨衣/防水壳和防水收纳袋。");
  if (wind !== null && wind >= 30) tips.push(isEn ? "Wind may be strong: add a windproof jacket and cap." : isTw ? "預計風力較強，建議帶防風外套與防風帽。" : "预计风力较强，建议带防风外套和防风帽。");
  if (tips.length === 0) tips.push(isEn ? "Pack a standard lightweight setup and check weather updates before departure." : isTw ? "建議按常規輕量化裝備準備，並關注臨近天氣更新。" : "建议按常规轻量化出行装备准备，并关注临近天气更新。");
  return tips.join(" ");
}

function getSeasonalRangeByMonth(month: number) {
  if ([12, 1, 2].includes(month)) return { min: 4, max: 12, rain: 24, wind: 18 };
  if ([3, 4, 5].includes(month)) return { min: 11, max: 21, rain: 30, wind: 20 };
  if ([6, 7, 8].includes(month)) return { min: 23, max: 32, rain: 42, wind: 16 };
  return { min: 14, max: 24, rain: 28, wind: 22 };
}

function buildEstimatedWeather(city: string, country: string | undefined, startDate: string, lang: string) {
  const month = new Date(startDate).getMonth() + 1;
  const range = getSeasonalRangeByMonth(month);
  const avg = Number(((range.min + range.max) / 2).toFixed(1));
  return {
    locationLabel: [city, country].filter(Boolean).join(", "),
    avgTempC: avg,
    minTempC: range.min,
    maxTempC: range.max,
    rainSumMm: range.rain,
    windMaxKmh: range.wind,
    suggestion: buildSuggestion(avg, range.rain, range.wind, lang),
    source: lang === "en" ? "Open-Meteo (estimated)" : lang === "zh-TW" ? "Open-Meteo（估算）" : "Open-Meteo（估算）",
    isEstimated: true,
  } satisfies WeatherSummary;
}

export async function getTripWeather(city?: string, country?: string, startDate?: string | null, endDate?: string | null, lang: string = "zh-CN"): Promise<WeatherSummary | null> {
  if (!city || !startDate || !endDate) return null;

  const locationQuery = encodeURIComponent([city, country].filter(Boolean).join(", "));
  const geoLang = lang === "en" ? "en" : "zh";
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${locationQuery}&count=1&language=${geoLang}&format=json`;
  const geoResp = await fetch(geoUrl, { cache: "no-store" });
  if (!geoResp.ok) return buildEstimatedWeather(city, country, startDate, lang);
  const geoData = (await geoResp.json()) as {
    results?: Array<{ latitude: number; longitude: number; name: string; country?: string }>;
  };
  const best = geoData.results?.[0];
  if (!best) return buildEstimatedWeather(city, country, startDate, lang);

  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${best.latitude}&longitude=${best.longitude}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
    `&start_date=${startDate}&end_date=${endDate}&timezone=auto`;
  const weatherResp = await fetch(weatherUrl, { cache: "no-store" });
  if (!weatherResp.ok) return buildEstimatedWeather(city, country, startDate, lang);
  const weatherData = (await weatherResp.json()) as {
    daily?: {
      temperature_2m_max?: number[];
      temperature_2m_min?: number[];
      precipitation_sum?: number[];
      wind_speed_10m_max?: number[];
    };
  };

  const maxArr = weatherData.daily?.temperature_2m_max ?? [];
  const minArr = weatherData.daily?.temperature_2m_min ?? [];
  const rainArr = weatherData.daily?.precipitation_sum ?? [];
  const windArr = weatherData.daily?.wind_speed_10m_max ?? [];
  if (!maxArr.length || !minArr.length) return buildEstimatedWeather(city, country, startDate, lang);

  const minTemp = Math.min(...minArr);
  const maxTemp = Math.max(...maxArr);
  const avgTemp = Number(((minTemp + maxTemp) / 2).toFixed(1));
  const rainSum = rainArr.length ? Number(rainArr.reduce((a, b) => a + b, 0).toFixed(1)) : null;
  const windMax = windArr.length ? Number(Math.max(...windArr).toFixed(1)) : null;

  return {
    locationLabel: [best.name, best.country].filter(Boolean).join(", "),
    avgTempC: avgTemp,
    minTempC: Number(minTemp.toFixed(1)),
    maxTempC: Number(maxTemp.toFixed(1)),
    rainSumMm: rainSum,
    windMaxKmh: windMax,
    suggestion: buildSuggestion(avgTemp, rainSum, windMax, lang),
    source: "Open-Meteo",
  };
}
