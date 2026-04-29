import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDict } from "@/i18n/server";
import { readSessionToken, SESSION_COOKIE } from "@/auth/jwt";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (raw) {
    const s = await readSessionToken(raw);
    if (s) redirect("/");
  }
  const { t } = await getDict();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="card w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <div className="text-3xl mb-2">✨</div>
          <h1 className="text-xl font-semibold">{t.appName}</h1>
          <p className="text-sm text-[color:var(--foreground-muted)] mt-1">{t.auth.loginTitle}</p>
        </div>
        <LoginForm t={t} />
        <p className="text-xs text-[color:var(--foreground-muted)] text-center">{t.auth.childReadOnly}</p>
      </div>
    </div>
  );
}
