import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "fi_session";

export type AccountKind = "parent_admin" | "parent" | "child";

export type SessionClaims = {
  sub: string;
  username: string;
  kind: AccountKind;
  memberId: string | null;
  childId: string | null;
};

/** Only used when `NODE_ENV !== "production"` and `AUTH_SECRET` is missing or too short. */
const DEV_FALLBACK_SECRET =
  "family-incentive-local-only-not-for-production-auth-secret";

let warnedDevFallback = false;

function secretKeyBytes(): Uint8Array {
  const s = process.env.AUTH_SECRET?.trim();
  if (s && s.length >= 16) {
    return new TextEncoder().encode(s);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET must be set in .env (min 16 characters). Copy .env.example and set AUTH_SECRET before deploy.",
    );
  }
  if (!warnedDevFallback) {
    warnedDevFallback = true;
    console.warn(
      "[auth] AUTH_SECRET missing or shorter than 16 characters — using a dev-only default. Add AUTH_SECRET to .env for stable sessions and before any production use.",
    );
  }
  return new TextEncoder().encode(DEV_FALLBACK_SECRET);
}

export async function createSessionToken(claims: SessionClaims): Promise<string> {
  return new SignJWT({
    u: claims.username,
    k: claims.kind,
    mid: claims.memberId,
    cid: claims.childId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKeyBytes());
}

export async function readSessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretKeyBytes(), { algorithms: ["HS256"] });
    const sub = payload.sub;
    if (!sub || typeof payload.u !== "string" || typeof payload.k !== "string") return null;
    const k = payload.k as AccountKind;
    if (k !== "parent_admin" && k !== "parent" && k !== "child") return null;
    return {
      sub,
      username: payload.u,
      kind: k,
      memberId: typeof payload.mid === "string" ? payload.mid : null,
      childId: typeof payload.cid === "string" ? payload.cid : null,
    };
  } catch {
    return null;
  }
}
