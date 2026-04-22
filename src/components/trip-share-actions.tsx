"use client";

import { useState } from "react";

type TripShareActionsProps = {
  tripId: string;
  lang: "zh-CN" | "zh-TW" | "en";
  title: string;
  progress: number;
};

export function TripShareActions({ tripId, lang, title, progress }: TripShareActionsProps) {
  const [feedback, setFeedback] = useState("");
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/trips/${tripId}?lang=${lang}` : "";

  const copyShareCard = async () => {
    const copyText =
      lang === "en"
        ? `My packing checklist: ${title}\nProgress: ${progress}%\n${shareUrl}`
        : lang === "zh-TW"
          ? `我的打包清單：${title}\n完成度：${progress}%\n${shareUrl}`
          : `我的打包清单：${title}\n完成度：${progress}%\n${shareUrl}`;
    try {
      await navigator.clipboard.writeText(copyText);
      setFeedback(lang === "en" ? "Share card copied" : lang === "zh-TW" ? "分享卡片文案已複製" : "分享卡片文案已复制");
      window.setTimeout(() => setFeedback(""), 1400);
    } catch {
      setFeedback(lang === "en" ? "Copy failed" : lang === "zh-TW" ? "複製失敗" : "复制失败");
    }
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <button type="button" onClick={copyShareCard} className="brand-btn-soft px-3 py-2 text-xs">
        {lang === "en" ? "Share card" : lang === "zh-TW" ? "分享卡片" : "分享卡片"}
      </button>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(shareUrl);
            setFeedback(lang === "en" ? "Link copied" : lang === "zh-TW" ? "連結已複製" : "链接已复制");
            window.setTimeout(() => setFeedback(""), 1400);
          } catch {
            setFeedback(lang === "en" ? "Copy failed" : lang === "zh-TW" ? "複製失敗" : "复制失败");
          }
        }}
        className="brand-btn-soft px-3 py-2 text-xs"
      >
        {lang === "en" ? "Copy link" : lang === "zh-TW" ? "複製連結" : "复制链接"}
      </button>
      {feedback ? <span className="text-[12px] text-[#3a5c33]">{feedback}</span> : null}
    </div>
  );
}

