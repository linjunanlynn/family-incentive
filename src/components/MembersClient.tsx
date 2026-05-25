"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Upload } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import {
  createChildWithAccountAction,
  createParentMemberWithAccountAction,
  deleteChildAction,
  deleteMemberAction,
  updateChildProfileAction,
  updateMemberAction,
} from "@/app/actions/members";

type Member = {
  id: string;
  nameZh: string;
  nameEn: string;
  role: string;
  emoji: string;
  color: string;
  account: { username: string; disabled: boolean } | null;
};

type ChildMember = {
  id: string;
  nameZh: string;
  nameEn: string;
  emoji: string;
  color: string;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  account: { username: string; disabled: boolean } | null;
};

const PRESET_EMOJIS = ["👩", "👨", "👵", "👴", "👧", "👦", "👤", "🦊", "🐯", "🐻"];
const PRESET_COLORS = ["#ec4899", "#0ea5e9", "#a855f7", "#f59e0b", "#10b981", "#6366f1", "#ef4444"];

export function MembersClient({ members, children_ }: { members: Member[]; children_: ChildMember[] }) {
  const { t } = useI18n();
  const [, startTransition] = useTransition();
  const [adding, setAdding] = useState<"parent" | "child" | null>(null);

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="text-lg font-semibold">{t.members.title}</div>
        <div className="hidden sm:block flex-1 min-w-2" />
        <button type="button" className="btn btn-primary w-full sm:w-auto justify-center" onClick={() => setAdding("parent")}>
          <Plus className="w-4 h-4" />
          添加家长
        </button>
        <button type="button" className="btn btn-ghost w-full sm:w-auto justify-center" onClick={() => setAdding("child")}>
          <Plus className="w-4 h-4" />
          添加孩子
        </button>
      </section>

      {adding === "parent" && (
        <ParentAccountForm
          onCancel={() => setAdding(null)}
          onSubmit={(d) =>
            startTransition(async () => {
              const res = await createParentMemberWithAccountAction(d);
              if (res.ok) {
                toast.success(t.common.success);
                setAdding(null);
              } else {
                toast.error(res.error === "taken" ? "账号已存在" : t.common.failed);
              }
            })
          }
        />
      )}

      {adding === "child" && (
        <ChildAccountForm
          onCancel={() => setAdding(null)}
          onSubmit={(d) =>
            startTransition(async () => {
              const res = await createChildWithAccountAction(d);
              if (res.ok) {
                toast.success(t.common.success);
                setAdding(null);
              } else {
                toast.error(res.error === "taken" ? "账号已存在" : t.common.failed);
              }
            })
          }
        />
      )}

      <section className="space-y-3">
        <div className="text-base font-semibold">孩子成员</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {children_.map((c) => (
            <ChildCard key={c.id} child={c} />
          ))}
          {children_.length === 0 && (
            <div className="card p-6 text-sm text-[color:var(--foreground-muted)] text-center">
              创建孩子后，才会出现孩子的积分主页、行为配置和奖励兑换入口。
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-base font-semibold">家长成员</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {members.map((m) => (
          <MemberCard key={m.id} member={m} />
        ))}
      </div>
      </section>
    </div>
  );
}

function MemberCard({ member }: { member: Member }) {
  const { t, pick } = useI18n();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <MemberForm
        initial={{
          nameZh: member.nameZh,
          nameEn: member.nameEn,
          role: member.role,
          emoji: member.emoji,
          color: member.color,
        }}
        onCancel={() => setEditing(false)}
        onSubmit={(d) =>
          startTransition(async () => {
            await updateMemberAction({ id: member.id, ...d });
            toast.success(t.common.success);
            setEditing(false);
          })
        }
      />
    );
  }

  const roleLabel =
    member.role === "parent"
      ? t.members.roleParent
      : member.role === "grandparent"
        ? t.members.roleGrandparent
        : t.members.roleOther;

  return (
    <div className="card p-4 flex flex-col gap-3 min-[400px]:flex-row min-[400px]:items-center">
      <div className="flex items-center gap-3 min-w-0">
      <div
        className="w-12 h-12 rounded-2xl text-2xl inline-flex items-center justify-center shrink-0"
        style={{ background: `${member.color}22`, color: member.color }}
      >
        {member.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium break-words min-[400px]:truncate">{pick(member)}</div>
        <div className="text-xs text-[color:var(--foreground-muted)]">{roleLabel}</div>
        <div className="text-xs text-[color:var(--foreground-muted)] font-mono">
          {member.account?.username ?? "no account"}
          {member.account?.disabled ? " · disabled" : ""}
        </div>
      </div>
      </div>
      <div className="flex flex-row min-[400px]:flex-col gap-1 justify-end shrink-0">
        <button type="button" className="btn btn-ghost btn-icon" title={t.common.edit} onClick={() => setEditing(true)}>
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          title={t.common.delete}
          onClick={() => {
            if (!confirm(t.manage.confirmDelete)) return;
            startTransition(async () => {
              await deleteMemberAction(member.id);
              toast.success(t.common.success);
            });
          }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ChildCard({ child }: { child: ChildMember }) {
  const { t, pick } = useI18n();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <ChildProfileForm
        initial={child}
        onCancel={() => setEditing(false)}
        onSubmit={(d) =>
          startTransition(async () => {
            await updateChildProfileAction({ id: child.id, ...d });
            toast.success(t.common.success);
            setEditing(false);
          })
        }
      />
    );
  }

  return (
    <div className="card p-4 flex flex-col gap-3 min-[400px]:flex-row min-[400px]:items-center">
      <div className="flex items-center gap-3 min-w-0">
        <ChildAvatar emoji={child.emoji} avatarUrl={child.avatarUrl} color={child.color} size="md" />
        <div className="flex-1 min-w-0">
          <div className="font-medium break-words min-[400px]:truncate">{pick(child)}</div>
          <div className="text-xs text-[color:var(--foreground-muted)]">孩子</div>
          <div className="text-xs text-[color:var(--foreground-muted)] font-mono">
            {child.account?.username ?? "no account"}
            {child.account?.disabled ? " · disabled" : ""}
          </div>
        </div>
      </div>
      <div className="flex flex-row min-[400px]:flex-col gap-1 justify-end shrink-0">
        <button type="button" className="btn btn-ghost btn-icon" title={t.common.edit} onClick={() => setEditing(true)}>
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          title={t.common.delete}
          onClick={() => {
            if (!confirm(t.manage.confirmDelete)) return;
            startTransition(async () => {
              await deleteChildAction(child.id);
              toast.success(t.common.success);
            });
          }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ParentAccountForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (d: { nameZh: string; nameEn: string; role: string; emoji: string; color: string; username: string; password: string }) => void;
}) {
  const { t } = useI18n();
  const [nameZh, setNameZh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [role, setRole] = useState("parent");
  const [emoji, setEmoji] = useState("👤");
  const [color, setColor] = useState("#6366f1");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function submit() {
    if (!nameZh.trim() || !nameEn.trim() || !username.trim() || !password) return;
    onSubmit({ nameZh: nameZh.trim(), nameEn: nameEn.trim(), role, emoji, color, username, password });
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="font-medium">添加家长账号</div>
      <PersonBasics
        nameZh={nameZh}
        setNameZh={setNameZh}
        nameEn={nameEn}
        setNameEn={setNameEn}
        emoji={emoji}
        setEmoji={setEmoji}
        color={color}
        setColor={setColor}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">{t.members.role}</label>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="parent">{t.members.roleParent}</option>
            <option value="grandparent">{t.members.roleGrandparent}</option>
            <option value="other">{t.members.roleOther}</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">登录账号</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">登录密码</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn" onClick={onCancel}>{t.common.cancel}</button>
        <button type="button" className="btn btn-primary" onClick={submit}>{t.common.save}</button>
      </div>
    </div>
  );
}

function ChildAvatar({
  emoji,
  avatarUrl,
  color,
  size,
}: {
  emoji: string;
  avatarUrl: string | null;
  color: string;
  size: "md" | "lg";
}) {
  const className =
    size === "lg"
      ? "w-16 h-16 rounded-3xl text-3xl"
      : "w-12 h-12 rounded-2xl text-2xl";
  return (
    <div
      className={`${className} inline-flex items-center justify-center shrink-0 overflow-hidden bg-[color:var(--surface-2)]`}
      style={{ backgroundColor: `${color}22`, color }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        emoji
      )}
    </div>
  );
}

function ChildAccountForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (d: { nameZh: string; nameEn: string; emoji: string; color: string; avatarUrl: string | null; backgroundUrl: string | null; username: string; password: string }) => void;
}) {
  const { t } = useI18n();
  const [nameZh, setNameZh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [emoji, setEmoji] = useState("🧒");
  const [color, setColor] = useState("#6366f1");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function submit() {
    if (!nameZh.trim() || !nameEn.trim() || !username.trim() || !password) return;
    onSubmit({ nameZh: nameZh.trim(), nameEn: nameEn.trim(), emoji, color, avatarUrl, backgroundUrl, username, password });
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="font-medium">添加孩子账号</div>
      <PersonBasics
        nameZh={nameZh}
        setNameZh={setNameZh}
        nameEn={nameEn}
        setNameEn={setNameEn}
        emoji={emoji}
        setEmoji={setEmoji}
        color={color}
        setColor={setColor}
        avatarUrl={avatarUrl}
        setAvatarUrl={setAvatarUrl}
        backgroundUrl={backgroundUrl}
        setBackgroundUrl={setBackgroundUrl}
        showImageUploads
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">孩子登录账号</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">孩子登录密码</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn" onClick={onCancel}>{t.common.cancel}</button>
        <button type="button" className="btn btn-primary" onClick={submit}>{t.common.save}</button>
      </div>
    </div>
  );
}

function ChildProfileForm({
  initial,
  onCancel,
  onSubmit,
}: {
  initial: ChildMember;
  onCancel: () => void;
  onSubmit: (d: { nameZh: string; nameEn: string; emoji: string; color: string; avatarUrl: string | null; backgroundUrl: string | null }) => void;
}) {
  const { t } = useI18n();
  const [nameZh, setNameZh] = useState(initial.nameZh);
  const [nameEn, setNameEn] = useState(initial.nameEn);
  const [emoji, setEmoji] = useState(initial.emoji);
  const [color, setColor] = useState(initial.color);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatarUrl);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(initial.backgroundUrl);
  return (
    <div className="card p-4 space-y-3">
      <PersonBasics
        nameZh={nameZh}
        setNameZh={setNameZh}
        nameEn={nameEn}
        setNameEn={setNameEn}
        emoji={emoji}
        setEmoji={setEmoji}
        color={color}
        setColor={setColor}
        avatarUrl={avatarUrl}
        setAvatarUrl={setAvatarUrl}
        backgroundUrl={backgroundUrl}
        setBackgroundUrl={setBackgroundUrl}
        showImageUploads
      />
      <div className="flex justify-end gap-2">
        <button type="button" className="btn" onClick={onCancel}>{t.common.cancel}</button>
        <button type="button" className="btn btn-primary" onClick={() => onSubmit({ nameZh, nameEn, emoji, color, avatarUrl, backgroundUrl })}>{t.common.save}</button>
      </div>
    </div>
  );
}

function PersonBasics({
  nameZh,
  setNameZh,
  nameEn,
  setNameEn,
  emoji,
  setEmoji,
  color,
  setColor,
  avatarUrl,
  setAvatarUrl,
  backgroundUrl,
  setBackgroundUrl,
  showImageUploads,
}: {
  nameZh: string;
  setNameZh: (value: string) => void;
  nameEn: string;
  setNameEn: (value: string) => void;
  emoji: string;
  setEmoji: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
  avatarUrl?: string | null;
  setAvatarUrl?: (value: string | null) => void;
  backgroundUrl?: string | null;
  setBackgroundUrl?: (value: string | null) => void;
  showImageUploads?: boolean;
}) {
  return (
    <>
      {showImageUploads ? (
        <ChildVisualPreview
          nameZh={nameZh}
          nameEn={nameEn}
          emoji={emoji}
          color={color}
          avatarUrl={avatarUrl ?? null}
          backgroundUrl={backgroundUrl ?? null}
        />
      ) : null}
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">Emoji</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {PRESET_EMOJIS.map((e) => (
              <button
                type="button"
                key={e}
                onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-lg text-lg ${emoji === e ? "bg-[color:var(--surface-2)] ring-2 ring-[color:var(--primary)]" : "hover:bg-[color:var(--surface-2)]"}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">Color</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {PRESET_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-[color:var(--foreground)]" : ""}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">中文名</label>
          <input className="input" value={nameZh} onChange={(e) => setNameZh(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">English name</label>
          <input className="input" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        </div>
      </div>
      {showImageUploads && setAvatarUrl && setBackgroundUrl ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ImageUploadField
            label="上传头像"
            value={avatarUrl ?? null}
            onChange={setAvatarUrl}
            maxWidth={512}
            maxHeight={512}
            maxBytes={240 * 1024}
          />
          <ImageUploadField
            label="上传背景图"
            value={backgroundUrl ?? null}
            onChange={setBackgroundUrl}
            maxWidth={1280}
            maxHeight={720}
            maxBytes={820 * 1024}
          />
        </div>
      ) : null}
    </>
  );
}

function ChildVisualPreview({
  nameZh,
  nameEn,
  emoji,
  color,
  avatarUrl,
  backgroundUrl,
}: {
  nameZh: string;
  nameEn: string;
  emoji: string;
  color: string;
  avatarUrl: string | null;
  backgroundUrl: string | null;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] min-h-36 p-4 flex items-end"
      style={{
        background: backgroundUrl
          ? `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.48)), url(${backgroundUrl}) center/cover`
          : `linear-gradient(135deg, ${color}22, ${color}08)`,
      }}
    >
      <div className="relative z-10 flex items-center gap-3 text-white drop-shadow-sm">
        <ChildAvatar emoji={emoji} avatarUrl={avatarUrl} color={color} size="lg" />
        <div>
          <div className="text-lg font-semibold">{nameZh || "孩子姓名"}</div>
          <div className="text-sm opacity-90">{nameEn || "Child name"}</div>
        </div>
      </div>
    </div>
  );
}

function ImageUploadField({
  label,
  value,
  onChange,
  maxWidth,
  maxHeight,
  maxBytes,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  maxWidth: number;
  maxHeight: number;
  maxBytes: number;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-[color:var(--foreground-muted)]">{label}</label>
      <div className="flex flex-wrap gap-2">
        <label className="btn btn-ghost text-xs cursor-pointer">
          <Upload className="w-4 h-4" />
          选择图片
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              void compressImageToDataUrl(file, { maxWidth, maxHeight, maxBytes })
                .then(onChange)
                .catch(() => toast.error(`图片过大或读取失败，请选择较小图片`));
              e.currentTarget.value = "";
            }}
          />
        </label>
        {value ? (
          <button type="button" className="btn btn-ghost text-xs" onClick={() => onChange(null)}>
            移除
          </button>
        ) : null}
      </div>
    </div>
  );
}

function compressImageToDataUrl(
  file: File,
  options: { maxWidth: number; maxHeight: number; maxBytes: number },
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("not_image"));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(
        1,
        options.maxWidth / img.naturalWidth,
        options.maxHeight / img.naturalHeight,
      );
      const width = Math.max(1, Math.round(img.naturalWidth * scale));
      const height = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.82;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      while (dataUrl.length > options.maxBytes * 1.37 && quality > 0.45) {
        quality -= 0.08;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }
      if (dataUrl.length > options.maxBytes * 1.37) {
        reject(new Error("too_large"));
        return;
      }
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("load_failed"));
    };
    img.src = objectUrl;
  });
}

function MemberForm({
  initial,
  onCancel,
  onSubmit,
}: {
  initial?: { nameZh: string; nameEn: string; role: string; emoji: string; color: string };
  onCancel: () => void;
  onSubmit: (d: { nameZh: string; nameEn: string; role: string; emoji: string; color: string }) => void;
}) {
  const { t } = useI18n();
  const [nameZh, setNameZh] = useState(initial?.nameZh ?? "");
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? "");
  const [role, setRole] = useState(initial?.role ?? "parent");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "👤");
  const [color, setColor] = useState(initial?.color ?? "#6366f1");

  function submit() {
    if (!nameZh.trim() || !nameEn.trim()) return;
    onSubmit({ nameZh: nameZh.trim(), nameEn: nameEn.trim(), role, emoji, color });
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">{t.manage.categoryEmoji}</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {PRESET_EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-lg text-lg ${emoji === e ? "bg-[color:var(--surface-2)] ring-2 ring-[color:var(--primary)]" : "hover:bg-[color:var(--surface-2)]"}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">Color</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-[color:var(--foreground)]" : ""}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">中文名</label>
          <input className="input" value={nameZh} onChange={(e) => setNameZh(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">English name</label>
          <input className="input" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">{t.members.role}</label>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="parent">{t.members.roleParent}</option>
            <option value="grandparent">{t.members.roleGrandparent}</option>
            <option value="other">{t.members.roleOther}</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button className="btn" onClick={onCancel}>{t.common.cancel}</button>
        <button className="btn btn-primary" onClick={submit}>{t.common.save}</button>
      </div>
    </div>
  );
}
