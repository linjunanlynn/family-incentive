import { cookies } from "next/headers";
import { getSession } from "@/lib/get-session";
import { isChild } from "@/lib/permissions";

export const CHILD_COOKIE = "fi_child";

export async function getCurrentChildId(): Promise<string | null> {
  const c = await cookies();
  return c.get(CHILD_COOKIE)?.value ?? null;
}
