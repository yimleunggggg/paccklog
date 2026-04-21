import { sendEmailCode, signInWithPassword, verifyEmailCode } from "@/features/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string; email?: string }>;
}) {
  const { sent, error, email } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-3xl font-semibold">登录 PACKLOG 行前志</h1>
        <p className="text-muted-foreground mt-2 text-sm">支持验证码登录；开发期可用邮箱密码登录绕过发信限流。</p>
      </div>
      {sent ? <p className="rounded border border-green-200 bg-green-50 p-3 text-sm">验证码已发送，请检查邮箱。</p> : null}
      {error ? <p className="rounded border border-red-200 bg-red-50 p-3 text-sm">{decodeURIComponent(error)}</p> : null}
      <form action={sendEmailCode} className="space-y-3 rounded-xl border p-4">
        <label className="flex flex-col gap-2 text-sm">
          邮箱
          <input
            name="email"
            type="email"
            required
            className="rounded-md border bg-transparent px-3 py-2 outline-none focus:ring-2"
            placeholder="you@example.com"
          />
        </label>
        <button type="submit" className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground">
          发送验证码
        </button>
      </form>

      {sent ? (
        <form action={verifyEmailCode} className="space-y-3 rounded-xl border p-4">
          <input type="hidden" name="email" value={email ?? ""} />
          <label className="flex flex-col gap-2 text-sm">
            邮箱（用于校验）
            <input
              name="email_view"
              type="email"
              value={email ?? ""}
              readOnly
              className="rounded-md border bg-muted px-3 py-2 text-muted-foreground"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            6位验证码
            <input
              name="token"
              inputMode="numeric"
              required
              minLength={6}
              maxLength={6}
              className="rounded-md border bg-transparent px-3 py-2 tracking-[0.4em] outline-none focus:ring-2"
              placeholder="123456"
            />
          </label>
          <button type="submit" className="w-full rounded-md border px-4 py-2">
            验证并登录
          </button>
        </form>
      ) : null}

      <form action={signInWithPassword} className="space-y-3 rounded-xl border p-4">
        <p className="text-sm font-medium">邮箱密码登录（开发应急）</p>
        <label className="flex flex-col gap-2 text-sm">
          邮箱
          <input
            name="email"
            type="email"
            required
            className="rounded-md border bg-transparent px-3 py-2 outline-none focus:ring-2"
            placeholder="you@example.com"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          密码
          <input
            name="password"
            type="password"
            required
            className="rounded-md border bg-transparent px-3 py-2 outline-none focus:ring-2"
            placeholder="至少 6 位"
          />
        </label>
        <button type="submit" className="w-full rounded-md border px-4 py-2">
          用密码登录
        </button>
      </form>
    </main>
  );
}
