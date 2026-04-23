"use client";

import { useState } from "react";
import { pickLangText } from "@/shared/localized-text";

type TripShareActionsProps = {
  tripId: string;
  lang: "zh-CN" | "zh-TW" | "en";
  title: string;
  progress: number;
};

export function TripShareActions({ tripId, lang, title, progress }: TripShareActionsProps) {
  const [feedback, setFeedback] = useState("");
  const l = (en: string, zhTW: string, zhCN: string) => pickLangText(lang, { en, zhTW, zhCN });
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/trips/${tripId}?lang=${lang}` : "";

  const copyShareCard = async () => {
    const copyText =
      l(
        `My packing checklist: ${title}\nProgress: ${progress}%\n${shareUrl}`,
        `我的打包清單：${title}\n完成度：${progress}%\n${shareUrl}`,
        `我的打包清单：${title}\n完成度：${progress}%\n${shareUrl}`,
      );
    try {
      await navigator.clipboard.writeText(copyText);
      setFeedback(l("Share card copied", "分享卡片文案已複製", "分享卡片文案已复制"));
      window.setTimeout(() => setFeedback(""), 1400);
    } catch {
      setFeedback(l("Copy failed", "複製失敗", "复制失败"));
    }
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <button type="button" onClick={copyShareCard} className="brand-btn-soft px-3 py-2 text-xs">
        {l("Share card", "分享卡片", "分享卡片")}
      </button>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(shareUrl);
            setFeedback(l("Link copied", "連結已複製", "链接已复制"));
            window.setTimeout(() => setFeedback(""), 1400);
          } catch {
            setFeedback(l("Copy failed", "複製失敗", "复制失败"));
          }
        }}
        className="brand-btn-soft px-3 py-2 text-xs"
      >
        {l("Copy link", "複製連結", "复制链接")}
      </button>
      {feedback ? <span className="text-[12px] text-[#3a5c33]">{feedback}</span> : null}
    </div>
  );
}

