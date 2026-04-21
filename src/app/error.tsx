"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium">页面发生错误，请重试。</p>
        <button type="button" onClick={() => reset()} className="rounded-md border bg-white px-3 py-2 text-sm">
          重新加载
        </button>
      </div>
    </main>
  );
}
