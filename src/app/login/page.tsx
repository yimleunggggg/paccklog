import { sendEmailCode, signInWithPassword, signUpWithPassword, verifyEmailCode } from "@/features/auth/actions";
import { resolveLang } from "@/shared/i18n";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string; email?: string; lang?: string }>;
}) {
  const { sent, error, email, lang: rawLang } = await searchParams;
  const lang = resolveLang(rawLang);
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
  const c =
    lang === "en"
      ? {
          title: "Sign in to PACKLOG",
          subtitle: "Sign in with either OTP or password.",
          intro:
            "I am a product builder who travels often. PACKLOG started from my own pain points: missing essentials, hard-to-track last-minute changes, and poor checklist reuse across scenarios. This is still evolving. If you have ideas, feedback, or anything you want to share, feel free to email me. If this tool helps you, I will be genuinely happy.",
          newsletter: "Email subscription (Newsletter)",
          contactMe: "Contact me",
          contactLabel: "Contact",
          otpBlock: "OTP sign-in / sign-up",
          sendOtp: "Send OTP code",
          otpVerifyBlock: "Enter OTP to continue",
          verifyEmail: "Email (verification)",
          otpCode: "6-digit OTP code",
          verifyAndSignIn: "Verify and sign in",
          passwordSignIn: "Email/password sign in",
          signInBtn: "Sign in with password",
          passwordSignUp: "Email/password sign up",
          setPassword: "Set password",
          signUpBtn: "Sign up with password",
            emailLabel: "Email",
            passwordLabel: "Password",
          noContact: "Contact email not configured yet.",
        }
      : lang === "zh-TW"
        ? {
            title: "登入 PACKLOG 行前志",
            subtitle: "支援驗證碼或密碼兩種方式登入。",
            intro:
              "我是長期出差與旅行的產品從業者。這個小工具來自我自己的真實痛點：行李清單容易遺漏、臨時改動難追蹤、不同場景難複用。目前它仍在持續優化中，如果你有任何建議或想說的話，歡迎隨時寄信給我。如果它真的幫到了你，我會非常開心。",
            newsletter: "郵件訂閱（Newsletter）",
            contactMe: "聯絡我",
            contactLabel: "聯絡方式",
            otpBlock: "驗證碼登入 / 註冊",
            sendOtp: "發送驗證碼",
            otpVerifyBlock: "輸入驗證碼完成登入",
            verifyEmail: "郵箱（用於校驗）",
            otpCode: "6位驗證碼",
            verifyAndSignIn: "驗證並登入",
            passwordSignIn: "郵箱密碼登入",
            signInBtn: "用密碼登入",
            passwordSignUp: "郵箱密碼註冊",
            setPassword: "設定密碼",
            signUpBtn: "用密碼註冊",
            emailLabel: "郵箱",
            passwordLabel: "密碼",
            noContact: "尚未設定聯絡郵箱。",
          }
        : {
            title: "登录 PACKLOG 行前志",
            subtitle: "支持验证码或密码两种方式登录。",
            intro:
              "我是一个长期出差和旅行的产品从业者，这个小工具来自我自己平时出门时的真实痛点：清单容易遗漏、临时改动难追踪、不同场景复用很麻烦。现在它还在持续优化中，如果你有任何想法、吐槽或建议，欢迎随时邮件告诉我。如果它真的帮到了你，我会非常开心。",
            newsletter: "邮件订阅（Newsletter）",
            contactMe: "联系我",
            contactLabel: "联系方式",
            otpBlock: "验证码登录 / 注册",
            sendOtp: "发送验证码",
            otpVerifyBlock: "输入验证码完成登录",
            verifyEmail: "邮箱（用于校验）",
            otpCode: "6位验证码",
            verifyAndSignIn: "验证并登录",
            passwordSignIn: "邮箱密码登录",
            signInBtn: "用密码登录",
            passwordSignUp: "邮箱密码注册",
            setPassword: "设置密码",
            signUpBtn: "用密码注册",
            emailLabel: "邮箱",
            passwordLabel: "密码",
            noContact: "尚未设置联系邮箱。",
          };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6 py-8">
      <div>
        <h1 className="text-3xl font-semibold">{c.title}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{c.subtitle}</p>
      </div>
      <section className="rounded-xl border border-[#d8d0c4] bg-[#fefcf8] p-4 text-sm leading-6 text-[#4a4840]">
        <p>{c.intro}</p>
        <p className="mt-2 text-[12px] text-[#6e695f]">
          {c.contactLabel}：{contactEmail || c.noContact}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {contactEmail ? (
            <>
              <a
                href={`mailto:${contactEmail}?subject=${encodeURIComponent("PACKLOG 订阅")}&body=${encodeURIComponent("你好，我想订阅 PACKLOG 的更新。")}`}
                className="brand-btn-soft px-3 py-2 text-[12px]"
              >
                {c.newsletter}
              </a>
              <a
                href={`mailto:${contactEmail}?subject=${encodeURIComponent("PACKLOG 建议反馈")}`}
                className="brand-btn-primary px-3 py-2 text-[12px]"
              >
                {c.contactMe}
              </a>
            </>
          ) : (
            <span className="text-[12px] text-[#8a857c]">{c.noContact}</span>
          )}
        </div>
      </section>
      {sent ? <p className="rounded border border-green-200 bg-green-50 p-3 text-sm">验证码已发送，请检查邮箱。</p> : null}
      {error ? <p className="rounded border border-red-200 bg-red-50 p-3 text-sm">{decodeURIComponent(error)}</p> : null}

      <form action={sendEmailCode} className="space-y-3 rounded-xl border p-4">
        <p className="text-sm font-medium">{c.otpBlock}</p>
        <label className="flex flex-col gap-2 text-sm">
          {c.emailLabel}
          <input
            name="email"
            type="email"
            required
            className="rounded-md border bg-transparent px-3 py-2 outline-none focus:ring-2"
            placeholder="you@example.com"
          />
        </label>
        <button type="submit" className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground">
          {c.sendOtp}
        </button>
      </form>

      {sent ? (
        <form action={verifyEmailCode} className="space-y-3 rounded-xl border p-4">
          <p className="text-sm font-medium">{c.otpVerifyBlock}</p>
          <input type="hidden" name="email" value={email ?? ""} />
          <label className="flex flex-col gap-2 text-sm">
            {c.verifyEmail}
            <input
              name="email_view"
              type="email"
              value={email ?? ""}
              readOnly
              className="rounded-md border bg-muted px-3 py-2 text-muted-foreground"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            {c.otpCode}
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
            {c.verifyAndSignIn}
          </button>
        </form>
      ) : null}

      <form action={signInWithPassword} className="space-y-3 rounded-xl border p-4">
        <p className="text-sm font-medium">{c.passwordSignIn}</p>
        <label className="flex flex-col gap-2 text-sm">
          {c.emailLabel}
          <input
            name="email"
            type="email"
            required
            className="rounded-md border bg-transparent px-3 py-2 outline-none focus:ring-2"
            placeholder="you@example.com"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          {c.passwordLabel}
          <input
            name="password"
            type="password"
            required
            className="rounded-md border bg-transparent px-3 py-2 outline-none focus:ring-2"
            placeholder="至少 6 位"
          />
        </label>
        <button type="submit" className="w-full rounded-md border px-4 py-2">
          {c.signInBtn}
        </button>
      </form>

      <form action={signUpWithPassword} className="space-y-3 rounded-xl border p-4">
        <p className="text-sm font-medium">{c.passwordSignUp}</p>
        <label className="flex flex-col gap-2 text-sm">
          {c.emailLabel}
          <input
            name="email"
            type="email"
            required
            className="rounded-md border bg-transparent px-3 py-2 outline-none focus:ring-2"
            placeholder="you@example.com"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          {c.setPassword}
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="rounded-md border bg-transparent px-3 py-2 outline-none focus:ring-2"
            placeholder="至少 6 位"
          />
        </label>
        <button type="submit" className="w-full rounded-md border px-4 py-2">
          {c.signUpBtn}
        </button>
      </form>
    </main>
  );
}
