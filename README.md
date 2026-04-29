# Family Incentive · 家庭激励墙

> A self-hosted, bilingual (中 / EN) behavior tracker for kids — designed for whole-family
> collaboration (parents and grandparents) with weekly / monthly / yearly visualizations.

![tech](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![tech](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![tech](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![tech](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

---

## ✨ Features

- **Visual dashboard** with three views: **Week / Month / Year**
  - KPI cards (current points, period total, best day)
  - Stacked bar (positive vs. negative) + net trend line
  - Per-category breakdown with progress bars
  - Cross-children comparison (weekly view)
  - **Yearly heatmap** (GitHub-style) for the full year view
- **Daily check-in** page
  - One tap = +1 occurrence; long-press / hover for note
  - Filter by category, undo last action, edit/delete entries
  - Per-day summary (☆ positive · △ negative · net points)
- **Behavior configuration** (CRUD)
  - Categories (icon + ZH/EN names) per child
  - Behaviors (positive / negative, points 1–20, ZH/EN names)
  - Archive instead of delete to preserve history
- **Accounts & roles**
  - **Admin parent** (`parent_admin`): behavior configuration, members, and **login account** management (`/accounts`)
  - **Parent** (`parent`): daily check-in / scoring; each log shows **which member** scored it
  - **Child** (`child`): **overview only** — cannot open check-in or settings
  - JWT session cookie (`fi_session`); set `AUTH_SECRET` in `.env` (min 16 characters)
- **Family members**
  - Pre-seeded: Mom · Dad · Grandma · Grandpa (optional **4-digit PIN** still available on the Members page)
- **Bilingual UI** (Chinese / English) — switch with one click in the top bar
- **PostgreSQL** for durable storage (local Docker / Neon / any host — same Prisma schema)

---

## 🚀 Quick start (local)

You need a **PostgreSQL** database URL in `.env` (see `.env.example`). Easiest local option:

```bash
docker run --name fi-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=family -p 5432:5432 -d postgres:16
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/family"
```

Then:

```bash
cd family-incentive
cp .env.example .env     # set DATABASE_URL + AUTH_SECRET (16+ chars)
npm install              # also runs prisma generate
npx prisma migrate deploy   # apply tables to empty Postgres
npm run db:seed          # Jimmy + Aimee + behaviors + default login accounts
npm run dev              # http://localhost:3000
```

After seed, sign in with any of **`mom`** / **`dad`** / **`grandma`** / **`grandpa`** / **`jimmy`** / **`aimee`** — default password **`familydemo`** (override with `SEED_DEFAULT_PASSWORD` before seeding). **`mom`** is the admin account.

Open <http://localhost:3000> in your browser. To use it from other devices on the
LAN (phones for the grandparents):

```bash
npm run dev -- -H 0.0.0.0
# then visit http://<your-mac-ip>:3000 from any device on the same Wi-Fi
```

For "production"-style hosting on the home network:

```bash
npm run build
PORT=3000 npm start -- -H 0.0.0.0
```

---

## 🧱 Project structure

```
prisma/
  schema.prisma          # data model (Member · Child · Category · Behavior · LogEntry)
  seed.ts                # initial data for Jimmy & Aimee
src/
  app/
    layout.tsx           # global shell + i18n + top bar
    page.tsx             # dashboard (week / month / year)
    checkin/             # daily check-in
    manage/              # behavior configuration
    members/             # family members + PIN
    accounts/            # admin: login accounts (UserAccount)
    login/               # sign-in page
    actions/             # server actions (logs / config / members / session / auth / accounts)
  components/            # client components
  i18n/                  # dictionaries + provider + cookie helper
  lib/                   # prisma client, stats, utils
  generated/prisma/      # Prisma client (auto-generated, gitignored)
scripts/
  clear-logs.ts          # delete all log entries
  test-log.ts            # insert sample log entries
```

---

## 🗄️  Useful scripts

| Command            | What it does                                  |
| ------------------ | --------------------------------------------- |
| `npm run dev`      | Start Next.js in dev mode                     |
| `npm run build`    | Production build                              |
| `npm start`        | Start production server                       |
| `npm run lint`     | ESLint                                        |
| `npm run db:migrate` | Run / create Prisma migrations              |
| `npm run db:seed`  | Idempotent seed (won't duplicate)             |
| `npm run db:studio`| Open Prisma Studio (DB GUI)                   |

---

## 💾 Backup

Use your host’s Postgres backups (e.g. Neon **Branches / Snapshots**, or `pg_dump`). Prisma schema is in `prisma/schema.prisma`.

---

## ☁️ Vercel + Neon（简单上线）

1. **[Neon](https://neon.tech)**：注册 → 新建项目 → 复制 **Connection string**（选 **Pooled** / `?sslmode=require` 亦可）。
2. **[Vercel](https://vercel.com)**：Import 本仓库 → **Environment Variables** 添加：
   - `DATABASE_URL` = Neon **Pooled** 连接串（运行时查询）  
   - `DIRECT_DATABASE_URL` = Neon **Direct** 连接串（与 Pooled 同一项目里另复制一条；`prisma migrate` 专用，避免 pooler 上 advisory lock 超时 **P1002**）  
   - `AUTH_SECRET` = 至少 16 位随机字符串（勿泄露、勿频繁改）
3. **Build Command** 设为：`npm run vercel-build`  
   （会先 `prisma migrate deploy` 建表，再 `next build`。首次部署后数据库是空的。）
4. **首次灌数据**：在本地把 `.env` 的 `DATABASE_URL`（可 Pooled）与 `DIRECT_DATABASE_URL`（Direct）指到**同一 Neon 库**（或临时用 Neon SQL Editor），执行一次：
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
   然后立刻用管理员账号登录，在 **登录账号** 里改掉默认密码。
5. 打开 Vercel 分配的域名即可使用（HTTPS 由 Vercel 提供，登录 Cookie 在生产环境为 `Secure`）。

说明：本项目为 **Next.js 全栈**（Server Actions + Prisma），不是纯静态导出；按上面方式部署后，读写都落在 Neon 的 Postgres 上。

---

## 🔐 Environment

| Variable | Purpose |
| -------- | ------- |
| `DATABASE_URL` | PostgreSQL URL — on Neon+Vercel use the **pooled** URL for runtime |
| `DIRECT_DATABASE_URL` | Same DB over **direct** (non-pooler) host — required for `prisma migrate`; local Docker can duplicate `DATABASE_URL` |
| `AUTH_SECRET` | **Required** for sign-in — secret key for JWT sessions (≥ 16 characters) |
| `SEED_DEFAULT_PASSWORD` | Optional; password assigned to seeded accounts (default `familydemo`) |

---

## 🧪 Default data

- Jimmy (🦁) — 6 categories: 🛡️ Resilience · 🎯 Goal-driven · 🥰 Kindness · 🤝 Integrity · 🧹 Service · ✨ Excellence
- Aimee (🦄) — 6 categories: 🛡️ Resilience · 🥰 Kindness · 🤝 Integrity · 🧹 Service · ✨ Excellence · 🌟 Self-initiation

72 behaviors total (positive ☆ and negative △), bilingual.
Adjust freely under **Behaviors** (`/manage`) as **admin** (`mom` after seed).

**Optional PIN:** on **Members**, each family member can set a 4-digit PIN (bcrypt); useful as an extra step when sharing devices.
