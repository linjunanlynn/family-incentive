"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, KeyRound, X } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import {
  createMemberAction,
  deleteMemberAction,
  setMemberPinAction,
  updateMemberAction,
} from "@/app/actions/members";

type Member = {
  id: string;
  nameZh: string;
  nameEn: string;
  role: string;
  emoji: string;
  color: string;
  hasPin: boolean;
};

const PRESET_EMOJIS = ["👩", "👨", "👵", "👴", "👧", "👦", "👤", "🦊", "🐯", "🐻"];
const PRESET_COLORS = ["#ec4899", "#0ea5e9", "#a855f7", "#f59e0b", "#10b981", "#6366f1", "#ef4444"];

export function MembersClient({ members }: { members: Member[] }) {
  const { t } = useI18n();
  const [, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [pinFor, setPinFor] = useState<Member | null>(null);

  return (
    <div className="space-y-4">
      <section className="flex items-center gap-3">
        <div className="text-lg font-semibold">{t.members.title}</div>
        <div className="flex-1" />
        <button className="btn btn-primary" onClick={() => setAdding(true)}>
          <Plus className="w-4 h-4" />
          {t.members.add}
        </button>
      </section>

      {adding && (
        <MemberForm
          onCancel={() => setAdding(false)}
          onSubmit={(d) =>
            startTransition(async () => {
              await createMemberAction(d);
              toast.success(t.common.success);
              setAdding(false);
            })
          }
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {members.map((m) => (
          <MemberCard key={m.id} member={m} onChangePin={() => setPinFor(m)} />
        ))}
      </div>

      {pinFor && (
        <PinModal
          member={pinFor}
          onClose={() => setPinFor(null)}
          onSubmit={(pin) =>
            startTransition(async () => {
              await setMemberPinAction(pinFor.id, pin || null);
              toast.success(t.common.success);
              setPinFor(null);
            })
          }
        />
      )}
    </div>
  );
}

function MemberCard({ member, onChangePin }: { member: Member; onChangePin: () => void }) {
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
        omitPin
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
    <div className="card p-4 flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-2xl text-2xl inline-flex items-center justify-center"
        style={{ background: `${member.color}22`, color: member.color }}
      >
        {member.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{pick(member)}</div>
        <div className="text-xs text-[color:var(--foreground-muted)]">{roleLabel}</div>
        <div className="text-xs mt-0.5">
          {member.hasPin ? (
            <span className="text-[color:var(--positive)]">🔒 {t.members.pinSet}</span>
          ) : (
            <span className="text-[color:var(--foreground-muted)]">{t.members.pinNotSet}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <button className="btn btn-ghost btn-icon" title={t.common.edit} onClick={() => setEditing(true)}>
          <Pencil className="w-4 h-4" />
        </button>
        <button className="btn btn-ghost btn-icon" title={t.members.changePin} onClick={onChangePin}>
          <KeyRound className="w-4 h-4" />
        </button>
        <button
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

function MemberForm({
  initial,
  omitPin,
  onCancel,
  onSubmit,
}: {
  initial?: { nameZh: string; nameEn: string; role: string; emoji: string; color: string };
  omitPin?: boolean;
  onCancel: () => void;
  onSubmit: (d: { nameZh: string; nameEn: string; role: string; emoji: string; color: string; pin?: string }) => void;
}) {
  const { t } = useI18n();
  const [nameZh, setNameZh] = useState(initial?.nameZh ?? "");
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? "");
  const [role, setRole] = useState(initial?.role ?? "parent");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "👤");
  const [color, setColor] = useState(initial?.color ?? "#6366f1");
  const [pin, setPin] = useState("");

  function submit() {
    if (!nameZh.trim() || !nameEn.trim()) return;
    onSubmit({ nameZh: nameZh.trim(), nameEn: nameEn.trim(), role, emoji, color, pin: omitPin ? undefined : pin || undefined });
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
      {!omitPin && (
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">PIN ({t.common.pinPlaceholder})</label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            className="input max-w-[160px] tracking-[0.4em] text-center"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="••••"
          />
        </div>
      )}
      <div className="flex justify-end gap-2">
        <button className="btn" onClick={onCancel}>{t.common.cancel}</button>
        <button className="btn btn-primary" onClick={submit}>{t.common.save}</button>
      </div>
    </div>
  );
}

function PinModal({
  member,
  onClose,
  onSubmit,
}: {
  member: Member;
  onClose: () => void;
  onSubmit: (pin: string) => void;
}) {
  const { t, pick } = useI18n();
  const [pin, setPin] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4" onClick={onClose}>
      <div className="card w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{member.emoji}</span>
            <div className="font-medium">{pick(member)}</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="text-sm text-[color:var(--foreground-muted)] mb-2">
          {t.members.changePin} ({t.common.pinPlaceholder})
        </div>
        <input
          autoFocus
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          className="input text-center tracking-[0.5em] text-lg"
          placeholder="••••"
        />
        <div className="flex justify-between gap-2 mt-4">
          <button className="btn" onClick={() => onSubmit("")}>
            {t.members.removePin}
          </button>
          <div className="flex gap-2">
            <button className="btn" onClick={onClose}>{t.common.cancel}</button>
            <button className="btn btn-primary" onClick={() => onSubmit(pin)}>{t.common.save}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
