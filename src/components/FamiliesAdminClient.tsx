"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { createFamilyAction, deleteFamilyAction, updateFamilyAction } from "@/app/actions/families";
import { useI18n } from "@/i18n/I18nProvider";

type FamilyRow = {
  id: string;
  nameZh: string;
  nameEn: string;
  childrenCount: number;
  admins: { username: string; disabled: boolean }[];
};

export function FamiliesAdminClient({ families }: { families: FamilyRow[] }) {
  const { locale, pick } = useI18n();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    nameZh: "",
    nameEn: "",
    adminUsername: "",
    adminPassword: "",
    adminNameZh: "",
    adminNameEn: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createFamilyAction(draft);
      if (res.ok) {
        toast.success(locale === "zh" ? "家庭已创建" : "Family created");
        setOpen(false);
        setDraft({
          nameZh: "",
          nameEn: "",
          adminUsername: "",
          adminPassword: "",
          adminNameZh: "",
          adminNameEn: "",
        });
        router.refresh();
      } else {
        toast.error(res.error === "taken" ? (locale === "zh" ? "账号已存在" : "Username taken") : "Failed");
      }
    });
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold">{locale === "zh" ? "家庭管理" : "Family Admin"}</h1>
          <p className="text-sm text-[color:var(--foreground-muted)]">
            {locale === "zh"
              ? "主管理员可以创建家庭，并分配每个家庭的家庭管理员。"
              : "The super admin creates families and assigns family admins."}
          </p>
        </div>
        <div className="hidden sm:block flex-1" />
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          {locale === "zh" ? "创建家庭" : "Create family"}
        </button>
      </section>

      {open && (
        <form onSubmit={submit} className="card p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="家庭中文名" value={draft.nameZh} onChange={(nameZh) => setDraft((d) => ({ ...d, nameZh }))} />
          <Field label="Family name" value={draft.nameEn} onChange={(nameEn) => setDraft((d) => ({ ...d, nameEn }))} />
          <Field label="管理员中文名" value={draft.adminNameZh} onChange={(adminNameZh) => setDraft((d) => ({ ...d, adminNameZh }))} />
          <Field label="Admin name" value={draft.adminNameEn} onChange={(adminNameEn) => setDraft((d) => ({ ...d, adminNameEn }))} />
          <Field label="管理员账号" value={draft.adminUsername} onChange={(adminUsername) => setDraft((d) => ({ ...d, adminUsername }))} />
          <Field label="管理员密码" type="password" value={draft.adminPassword} onChange={(adminPassword) => setDraft((d) => ({ ...d, adminPassword }))} />
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" className="btn" onClick={() => setOpen(false)}>
              {locale === "zh" ? "取消" : "Cancel"}
            </button>
            <button type="submit" className="btn btn-primary">
              {locale === "zh" ? "保存" : "Save"}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {families.map((family) => (
          <div key={family.id} className="card p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🏠</div>
              <div className="min-w-0">
                <div className="font-semibold">{pick(family)}</div>
                <div className="text-xs text-[color:var(--foreground-muted)]">
                  {locale === "zh" ? "孩子数量" : "Children"}: {family.childrenCount}
                </div>
              </div>
            </div>
            {editingId === family.id ? (
              <FamilyEditForm
                family={family}
                onCancel={() => setEditingId(null)}
                onSave={(nameZh, nameEn) =>
                  startTransition(async () => {
                    const res = await updateFamilyAction({ id: family.id, nameZh, nameEn });
                    if (res.ok) {
                      toast.success(locale === "zh" ? "已保存" : "Saved");
                      setEditingId(null);
                      router.refresh();
                    } else {
                      toast.error("Failed");
                    }
                  })
                }
              />
            ) : null}
            <div className="text-sm">
              <div className="text-xs text-[color:var(--foreground-muted)] mb-1">
                {locale === "zh" ? "家庭管理员" : "Family admins"}
              </div>
              {family.admins.length > 0 ? (
                family.admins.map((admin) => (
                  <span key={admin.username} className="inline-flex mr-2 mb-2 rounded-full bg-[color:var(--surface-2)] px-2 py-1 font-mono text-xs">
                    {admin.username}{admin.disabled ? " · disabled" : ""}
                  </span>
                ))
              ) : (
                <span className="text-[color:var(--foreground-muted)]">—</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="btn btn-primary text-xs" href={`/admin/families/${family.id}`}>
                {locale === "zh" ? "查看 / 管理" : "View / manage"}
              </Link>
              <button className="btn btn-ghost text-xs" onClick={() => setEditingId(family.id)}>
                <Pencil className="w-3.5 h-3.5" />
                {locale === "zh" ? "修改" : "Edit"}
              </button>
              <button
                className="btn btn-ghost text-xs text-[color:var(--negative)]"
                onClick={() => {
                  if (!confirm(locale === "zh" ? "确认删除这个家庭及其全部数据？" : "Delete this family and all data?")) return;
                  startTransition(async () => {
                    const res = await deleteFamilyAction(family.id);
                    if (res.ok) {
                      toast.success(locale === "zh" ? "已删除" : "Deleted");
                      router.refresh();
                    } else {
                      toast.error(res.error === "protected" ? (locale === "zh" ? "默认家庭不能删除" : "Default family cannot be deleted") : "Failed");
                    }
                  });
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {locale === "zh" ? "删除" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FamilyEditForm({
  family,
  onCancel,
  onSave,
}: {
  family: Pick<FamilyRow, "nameZh" | "nameEn">;
  onCancel: () => void;
  onSave: (nameZh: string, nameEn: string) => void;
}) {
  const { locale } = useI18n();
  const [nameZh, setNameZh] = useState(family.nameZh);
  const [nameEn, setNameEn] = useState(family.nameEn);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <Field label="家庭中文名" value={nameZh} onChange={setNameZh} />
      <Field label="Family name" value={nameEn} onChange={setNameEn} />
      <div className="sm:col-span-2 flex justify-end gap-2">
        <button className="btn btn-ghost text-xs" onClick={onCancel}>{locale === "zh" ? "取消" : "Cancel"}</button>
        <button className="btn btn-primary text-xs" onClick={() => onSave(nameZh, nameEn)}>{locale === "zh" ? "保存" : "Save"}</button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="text-xs text-[color:var(--foreground-muted)]">
      {label}
      <input
        type={type}
        className="input mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </label>
  );
}
