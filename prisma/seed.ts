import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();
const DEFAULT_FAMILY_ID = "default-family";

type SeedBehavior = { type: "positive" | "negative"; zh: string; en: string; points?: number };
type SeedCategory = {
  key: string;
  emoji: string;
  zh: string;
  en: string;
  behaviors: SeedBehavior[];
};
type SeedChild = {
  nameZh: string;
  nameEn: string;
  emoji: string;
  color: string;
  order: number;
  categories: SeedCategory[];
};

const jimmy: SeedChild = {
  nameZh: "Jimmy",
  nameEn: "Jimmy",
  emoji: "🦁",
  color: "#3b82f6",
  order: 0,
  categories: [
    {
      key: "resilience",
      emoji: "🛡️",
      zh: "坚韧抗挫",
      en: "Resilience",
      behaviors: [
        { type: "positive", zh: "网球、钢琴这些课程都认真自觉上，没闹情绪", en: "Attended tennis, piano and other classes attentively and willingly, without fuss." },
        { type: "positive", zh: "失败/或者遇到困难后，情绪快速调整并继续", en: "Quickly adjusted emotions after failure or difficulty and kept going." },
        { type: "positive", zh: "主动尝试和挑战没做过的任务", en: "Took the initiative to try and challenge tasks never done before." },
        { type: "negative", zh: "遇困难直接放弃或哭闹", en: "Gave up or cried directly when facing difficulty." },
        { type: "negative", zh: "做不好事/做事失败后抱怨责怪他人", en: "Complained and blamed others after doing poorly or failing at something." },
        { type: "negative", zh: "做算术/写作业马虎潦草", en: "Did arithmetic/homework carelessly and messily." },
      ],
    },
    {
      key: "goal-driven",
      emoji: "🎯",
      zh: "目标管理",
      en: "Goal-driven",
      behaviors: [
        { type: "positive", zh: "自己按时完成RAZ阅读和作业", en: "Completed RAZ reading and homework on time by himself." },
        { type: "positive", zh: "自己定了计划并照着做", en: "Made his own plan and followed it." },
        { type: "positive", zh: "说到做到，承诺的事情按时完成", en: "Kept his word and finished promised things on time." },
        { type: "negative", zh: "玩心大发忘记完成作业/任务", en: "Got carried away playing and forgot to finish homework/tasks." },
        { type: "negative", zh: "找借口不做，东摸西摸", en: "Made excuses not to do things and dawdled." },
        { type: "negative", zh: "看书/练习注意力涣散", en: "Lost focus while reading or practicing." },
      ],
    },
    {
      key: "kindness",
      emoji: "🥰",
      zh: "友善关爱",
      en: "Kindness",
      behaviors: [
        { type: "positive", zh: "主动关心/照顾 Aimee", en: "Took the initiative to care for or look after Aimee." },
        { type: "positive", zh: "与家人沟通语气温和", en: "Spoke gently with family members." },
        { type: "positive", zh: "主动为家人分担家务事", en: "Voluntarily shared household chores for the family." },
        { type: "negative", zh: "对妹妹大吼大叫，抢夺玩具和东西闹脾气", en: "Yelled at sister, grabbed toys/things and threw tantrums." },
        { type: "negative", zh: "家人说的正确的事不听，惹大人生气", en: "Refused to listen to family's reasonable words and made adults upset." },
        { type: "negative", zh: "因为缺乏耐心，做事急躁，而发脾气", en: "Became impatient, did things hastily, and lost temper." },
      ],
    },
    {
      key: "integrity",
      emoji: "🤝",
      zh: "诚实守信",
      en: "Integrity",
      behaviors: [
        { type: "positive", zh: "做错事主动承认，不撒谎", en: "Admitted mistakes truthfully without lying." },
        { type: "positive", zh: "答应别人的事记在心上并努力做到", en: "Remembered promises made to others and tried hard to keep them." },
        { type: "positive", zh: "借东西及时归还，损坏了会主动说明", en: "Returned borrowed items on time and took the initiative to explain if damaged." },
        { type: "negative", zh: "做错事不承认，推卸给他人", en: "Denied mistakes and shifted blame to others." },
        { type: "negative", zh: "为逃避责罚说假话", en: "Lied to avoid punishment." },
        { type: "negative", zh: "答应的事转头就忘或找借口", en: "Forgot promises or found excuses soon after making them." },
      ],
    },
    {
      key: "service",
      emoji: "🧹",
      zh: "责任服务",
      en: "Service",
      behaviors: [
        { type: "positive", zh: "主动收拾书桌、餐具、收拾垃圾", en: "Took the initiative to tidy desk, clear tableware, and throw away trash." },
        { type: "positive", zh: "自觉整理个人物品（书包、玩具、衣物等）", en: "Organized personal belongings (school bag, toys, clothes, etc.) on his own." },
        { type: "positive", zh: "主动帮忙照顾家人", en: "Actively helped to take care of family members." },
        { type: "negative", zh: "乱扔玩具/衣物", en: "Left toys/clothes scattered around." },
        { type: "negative", zh: "故意弄坏东西或浪费食物", en: "Deliberately damaged items or wasted food." },
        { type: "negative", zh: "拒绝收拾自己弄乱弄脏的区域", en: "Refused to clean up the area he messed up or dirtied." },
      ],
    },
    {
      key: "excellence",
      emoji: "✨",
      zh: "卓越专注",
      en: "Excellence",
      behaviors: [
        { type: "positive", zh: "作业书写工整、检查无误", en: "Wrote homework neatly and checked it without mistakes." },
        { type: "positive", zh: "RAZ一次就做全对", en: "Got all RAZ answers correct in one go." },
        { type: "positive", zh: "做事情专注、不三心二意", en: "Stayed focused on a task without being distracted." },
        { type: "negative", zh: "作业乱画，涂改很多", en: "Scribbled homework with many corrections." },
        { type: "negative", zh: "做事粗心，常犯低级错误", en: "Was careless and often made silly mistakes." },
        { type: "negative", zh: "拖拖拉拉效率低", en: "Procrastinated and was inefficient." },
      ],
    },
  ],
};

const aimee: SeedChild = {
  nameZh: "Aimee",
  nameEn: "Aimee",
  emoji: "🦄",
  color: "#ec4899",
  order: 1,
  categories: [
    {
      key: "resilience",
      emoji: "🛡️",
      zh: "坚韧适应",
      en: "Resilience",
      behaviors: [
        { type: "positive", zh: "吃饭穿衣不挑不闹", en: "Ate and dressed without fussing or being picky." },
        { type: "positive", zh: "坚持每天学RAZ和写作业", en: "Persisted in learning RAZ and doing homework every day." },
        { type: "positive", zh: "愿意尝新食物、试新动作", en: "Willing to try new food or new movements." },
        { type: "negative", zh: "一点事不顺心就躺地大哭", en: "Threw a tantrum on the floor when slightly frustrated." },
        { type: "negative", zh: "故意偏食，把食物弄得到处是", en: "Deliberately picked at food and made a mess everywhere." },
      ],
    },
    {
      key: "kindness",
      emoji: "🥰",
      zh: "友善礼仪",
      en: "Kindness",
      behaviors: [
        { type: "positive", zh: "见到熟人主动叫", en: "Greeted familiar people proactively." },
        { type: "positive", zh: "会说\"谢谢\"\"对不起\"", en: "Said \"thank you\" and \"sorry\" on her own." },
        { type: "positive", zh: "愿意把玩具分给小朋友", en: "Willing to share toys with other children." },
        { type: "positive", zh: "爱护哥哥，懂得和哥哥商量而不是随便发脾气", en: "Showed care for brother, knew how to discuss with him instead of throwing a tantrum." },
        { type: "negative", zh: "打人、推人、咬人", en: "Hit, pushed, or bit others." },
        { type: "negative", zh: "大喊大叫不讲道理", en: "Yelled and acted unreasonably." },
        { type: "negative", zh: "抢东西不肯松手", en: "Grabbed things and refused to let go." },
      ],
    },
    {
      key: "integrity",
      emoji: "🤝",
      zh: "诚实守信",
      en: "Integrity",
      behaviors: [
        { type: "positive", zh: "做错事会主动说出来，不撒谎", en: "Admitted mistakes truthfully without lying." },
        { type: "positive", zh: "答应的事会记着并做到", en: "Remembered and kept small promises." },
        { type: "positive", zh: "拿不属于自己的东西前会先问", en: "Asked first before taking someone else's belongings." },
        { type: "negative", zh: "做错事不承认，说\"不是我\"", en: "Denied doing something wrong even when obvious." },
        { type: "negative", zh: "为了想要的东西说假话", en: "Lied to get something she wanted." },
        { type: "negative", zh: "答应的事转头就不认账", en: "Immediately forgot or denied a promise she just made." },
      ],
    },
    {
      key: "service",
      emoji: "🧹",
      zh: "责任自理",
      en: "Service",
      behaviors: [
        { type: "positive", zh: "自己收玩具、叠小被子", en: "Put away toys and folded her own little blanket." },
        { type: "positive", zh: "帮忙摆碗筷、擦桌子", en: "Helped set the table and wiped the table." },
        { type: "positive", zh: "自己把垃圾扔进桶", en: "Threw her own trash into the bin." },
        { type: "negative", zh: "乱扔玩具/衣物", en: "Left toys/clothes scattered around." },
        { type: "negative", zh: "故意弄坏或者弄脏衣服或者东西，或浪费食物", en: "Deliberately damaged or soiled clothes/items, or wasted food." },
        { type: "negative", zh: "拒绝收拾自己弄乱弄脏的区域", en: "Refused to clean up the area she messed up or dirtied." },
      ],
    },
    {
      key: "excellence",
      emoji: "✨",
      zh: "卓越习惯",
      en: "Excellence",
      behaviors: [
        { type: "positive", zh: "吃饭坐好，不掉饭粒", en: "Sat properly during meals and didn't drop food." },
        { type: "positive", zh: "RAZ练习一周做对3次", en: "Got all RAZ questions correct 3 times in a week." },
        { type: "positive", zh: "衣服穿得整整齐齐", en: "Dressed neatly and kept clothes tidy." },
        { type: "negative", zh: "吃饭歪歪扭扭，掉得满地", en: "Slouched at the table and dropped food all over." },
        { type: "negative", zh: "做事坐不住，跑来跑去", en: "Couldn't sit still and kept running around." },
        { type: "negative", zh: "故意打扰哥哥学习或者做事", en: "Deliberately disturbed brother while he was studying or doing something." },
      ],
    },
    {
      key: "self-initiation",
      emoji: "🌟",
      zh: "自主尝试",
      en: "Self-initiation",
      behaviors: [
        { type: "positive", zh: "主动要求自己穿鞋子、背小书包", en: "Took the initiative to put on shoes or backpack by herself." },
        { type: "positive", zh: "遇到小问题先自己想办法，再叫人帮忙", en: "Tried to solve a small problem by herself before asking for help." },
        { type: "positive", zh: "主动尝试没做过的小家务或小手工", en: "Voluntarily tried a small chore or craft she hadn't done before." },
        { type: "negative", zh: "什么都要大人代劳，明明自己会也不做", en: "Insisted on adults doing everything for her, even things she could do." },
        { type: "negative", zh: "碰到一点点困难立刻找大人，不肯自己试", en: "Immediately sought adult help at the slightest difficulty, unwilling to try." },
        { type: "negative", zh: "对新活动/新游戏直接拒绝，不肯试一试", en: "Refused new activities/games outright without even trying." },
      ],
    },
  ],
};

const defaultMembers = [
  { nameZh: "妈妈", nameEn: "Mom", role: "parent", emoji: "👩", color: "#ec4899" },
  { nameZh: "爸爸", nameEn: "Dad", role: "parent", emoji: "👨", color: "#0ea5e9" },
  { nameZh: "奶奶", nameEn: "Grandma", role: "grandparent", emoji: "👵", color: "#a855f7" },
  { nameZh: "爷爷", nameEn: "Grandpa", role: "grandparent", emoji: "👴", color: "#f59e0b" },
];

async function seedChild(child: SeedChild) {
  const created = await prisma.child.upsert({
    where: { id: child.nameEn.toLowerCase() },
    update: { familyId: DEFAULT_FAMILY_ID },
    create: {
      id: child.nameEn.toLowerCase(),
      familyId: DEFAULT_FAMILY_ID,
      nameZh: child.nameZh,
      nameEn: child.nameEn,
      emoji: child.emoji,
      color: child.color,
      order: child.order,
    },
  });

  for (let ci = 0; ci < child.categories.length; ci++) {
    const cat = child.categories[ci];
    const category = await prisma.category.upsert({
      where: { childId_key: { childId: created.id, key: cat.key } },
      update: { nameZh: cat.zh, nameEn: cat.en, emoji: cat.emoji, order: ci },
      create: {
        childId: created.id,
        key: cat.key,
        nameZh: cat.zh,
        nameEn: cat.en,
        emoji: cat.emoji,
        order: ci,
      },
    });

    // Wipe existing behaviors only if none exist (idempotent first-run seed).
    const existingCount = await prisma.behavior.count({ where: { categoryId: category.id } });
    if (existingCount === 0) {
      for (let bi = 0; bi < cat.behaviors.length; bi++) {
        const b = cat.behaviors[bi];
        await prisma.behavior.create({
          data: {
            categoryId: category.id,
            type: b.type,
            nameZh: b.zh,
            nameEn: b.en,
            points: b.points ?? 1,
            order: bi,
          },
        });
      }
    }
  }
}

type SeedReward = {
  key: string; // stable lookup so re-seeds don't duplicate
  emoji: string;
  zh: string;
  en: string;
  descZh?: string;
  descEn?: string;
  costPoints: number;
  category:
    | "treat"
    | "privilege"
    | "outing"
    | "toy"
    | "family"
    | "learning";
  cooldownDays?: number;
  childId?: string | null; // null/undefined = shared
};

// Default whole-family reward catalog. Tuned for kids ~3-9 yrs old.
// Costs are deliberately spread so kids can choose between small daily wins
// (10-25 stars) and saving toward bigger ones (60-200 stars).
const defaultRewards: SeedReward[] = [
  // 🍦 Treats
  { key: "treat-icecream", emoji: "🍦", zh: "一支冰淇淋", en: "One ice-cream cone", descZh: "出门时挑一支自己喜欢的冰淇淋", descEn: "Pick any ice cream when we're out", costPoints: 10, category: "treat" },
  { key: "treat-snackbox", emoji: "🍪", zh: "选购一份小零食", en: "Pick a small snack", descZh: "去超市自己选一份零食带回家", descEn: "Pick one snack at the store", costPoints: 12, category: "treat" },
  { key: "treat-bubbletea", emoji: "🧋", zh: "一杯果汁/奶茶", en: "Juice or bubble tea", descZh: "陪爸妈外出时来一杯", descEn: "Get one drink when out with mom/dad", costPoints: 18, category: "treat" },
  { key: "treat-breakfast", emoji: "🥞", zh: "周末早餐自己点", en: "Pick weekend breakfast", descZh: "周六或周日的早餐由你来定", descEn: "Choose Saturday or Sunday breakfast", costPoints: 15, category: "treat" },

  // 🎮 Privileges
  { key: "priv-extra-game-15", emoji: "🎮", zh: "额外 15 分钟游戏时间", en: "+15 min game time", descZh: "周末当天可以多玩 15 分钟", descEn: "15 extra game minutes today", costPoints: 12, category: "privilege", cooldownDays: 1 },
  { key: "priv-extra-game-30", emoji: "🕹️", zh: "额外 30 分钟游戏/平板时间", en: "+30 min screen time", descZh: "周末当天多玩 30 分钟", descEn: "30 extra minutes of games/iPad", costPoints: 22, category: "privilege", cooldownDays: 2 },
  { key: "priv-late-bed", emoji: "🌙", zh: "周末晚睡 30 分钟", en: "Stay up 30 min later", descZh: "周末当晚可以晚 30 分钟睡觉", descEn: "30-minute later bedtime on a weekend", costPoints: 20, category: "privilege", cooldownDays: 3 },
  { key: "priv-skip-chore", emoji: "🧺", zh: "免做一次家务", en: "Skip one chore", descZh: "本周可以选一次家务由别人代劳", descEn: "Skip one chore this week", costPoints: 25, category: "privilege", cooldownDays: 3 },
  { key: "priv-car-dj", emoji: "🎧", zh: "车上音乐 DJ 权", en: "Car-DJ for the day", descZh: "今天坐车你来点歌单", descEn: "You pick the music in the car all day", costPoints: 8, category: "privilege" },
  { key: "priv-pajama-day", emoji: "🦄", zh: "周末睡衣日", en: "Weekend pajama day", descZh: "周末整天可以一直穿睡衣", descEn: "Stay in PJs all day on a weekend", costPoints: 18, category: "privilege", cooldownDays: 7 },

  // 🏞 Outings
  { key: "outing-park-half", emoji: "🌳", zh: "公园半日游", en: "Half-day park trip", descZh: "全家去公园玩半天", descEn: "Half a day at the park together", costPoints: 50, category: "outing" },
  { key: "outing-museum", emoji: "🏛️", zh: "博物馆/科技馆", en: "Museum / science centre", descZh: "周末挑一家博物馆去探索", descEn: "Pick a museum to explore on the weekend", costPoints: 70, category: "outing" },
  { key: "outing-icecream-trip", emoji: "🍨", zh: "专程去吃冰淇淋", en: "Ice-cream outing", descZh: "专门坐车出去吃一次甜品", descEn: "A dedicated trip out for dessert", costPoints: 35, category: "outing" },
  { key: "outing-day-out", emoji: "🏖️", zh: "全家半日小旅行", en: "Half-day mini-trip", descZh: "全家一起去近郊玩半天", descEn: "A short half-day trip with the whole family", costPoints: 100, category: "outing" },

  // 🧸 Toys
  { key: "toy-mystery", emoji: "🧸", zh: "小玩具盲盒", en: "Mystery mini-toy", descZh: "选一个小盲盒/卡通公仔", descEn: "Pick a small blind-box / mini-figure", costPoints: 60, category: "toy" },
  { key: "toy-sticker", emoji: "🌈", zh: "新一套贴纸/手账", en: "New sticker / craft set", descZh: "选一套自己喜欢的贴纸或手工材料", descEn: "Pick a sticker pack or craft kit", costPoints: 30, category: "toy" },
  { key: "toy-lego-small", emoji: "🧱", zh: "一盒小颗粒积木", en: "A small Lego set", descZh: "选一盒预算合适的积木", descEn: "Pick a small Lego/brick set", costPoints: 120, category: "toy" },
  { key: "toy-big-gift", emoji: "🎁", zh: "攒一个大礼物", en: "Save toward a big gift", descZh: "和爸妈一起列愿望清单，攒够再换", descEn: "Save up with mom/dad for a wishlist gift", costPoints: 250, category: "toy" },

  // 👨‍👩‍👧‍👦 Family time
  { key: "family-movie", emoji: "🍿", zh: "家庭电影夜（自选电影 + 爆米花）", en: "Movie night (you pick + popcorn)", descZh: "周五或周六晚上由你选片", descEn: "You pick the movie on Fri/Sat night", costPoints: 30, category: "family", cooldownDays: 7 },
  { key: "family-board-game", emoji: "🎲", zh: "家庭桌游 1 小时", en: "1-hr family board games", descZh: "全家陪你玩 1 小时桌游", descEn: "1 hour of board games with everyone", costPoints: 25, category: "family" },
  { key: "family-1on1", emoji: "🥰", zh: "和爸爸/妈妈专属时光 1 小时", en: "1-on-1 hour with mom or dad", descZh: "你来定做什么，爸爸或妈妈陪你 1 小时", descEn: "Pick the activity, get 1 hour just with mom or dad", costPoints: 35, category: "family" },
  { key: "family-camp-night", emoji: "🏕️", zh: "客厅露营之夜", en: "Living-room camp-out", descZh: "搭帐篷、讲故事，在客厅过一夜", descEn: "Build a fort and sleep in the living room", costPoints: 70, category: "family" },

  // 📚 Learning
  { key: "learn-book", emoji: "📚", zh: "选购一本喜欢的绘本", en: "Pick a new picture book", descZh: "去书店挑一本想看的书", descEn: "Pick a book at the bookstore", costPoints: 50, category: "learning" },
  { key: "learn-art-supplies", emoji: "🎨", zh: "一套新的画材/手工", en: "New art / craft supplies", descZh: "选一套画笔、贴纸或手工材料", descEn: "Pick out a new art or craft kit", costPoints: 60, category: "learning" },
  { key: "learn-experiment", emoji: "🔬", zh: "一次科学小实验材料", en: "A science-experiment kit", descZh: "一起买材料做一个小科学实验", descEn: "Get materials for a small science experiment", costPoints: 80, category: "learning" },
];

async function seedRewards() {
  for (let i = 0; i < defaultRewards.length; i++) {
    const r = defaultRewards[i];
    const existing = await prisma.reward.findFirst({
      where: {
        // re-use Chinese name as the idempotency key — names are unique enough
        // for a seed list and do not collide with admin-created ones.
        familyId: DEFAULT_FAMILY_ID,
        nameZh: r.zh,
        childId: r.childId ?? null,
      },
      select: { id: true },
    });
    if (existing) continue;
    await prisma.reward.create({
      data: {
        familyId: DEFAULT_FAMILY_ID,
        childId: r.childId ?? null,
        nameZh: r.zh,
        nameEn: r.en,
        descZh: r.descZh ?? null,
        descEn: r.descEn ?? null,
        emoji: r.emoji,
        costPoints: r.costPoints,
        category: r.category,
        cooldownDays: r.cooldownDays ?? null,
        order: i,
      },
    });
  }
}

async function main() {
  await prisma.family.upsert({
    where: { id: DEFAULT_FAMILY_ID },
    update: { nameZh: "默认家庭", nameEn: "Default Family" },
    create: { id: DEFAULT_FAMILY_ID, nameZh: "默认家庭", nameEn: "Default Family" },
  });

  for (const m of defaultMembers) {
    await prisma.member.upsert({
      where: { id: m.nameEn.toLowerCase() },
      update: { familyId: DEFAULT_FAMILY_ID },
      create: { id: m.nameEn.toLowerCase(), familyId: DEFAULT_FAMILY_ID, ...m },
    });
  }

  await seedChild(jimmy);
  await seedChild(aimee);
  await seedRewards();

  const defaultPassword = process.env.SEED_DEFAULT_PASSWORD ?? "familydemo";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  const seedAccounts: {
    username: string;
    accountKind: "super_admin" | "family_admin" | "parent" | "child";
    familyId: string | null;
    memberId: string | null;
    childId: string | null;
  }[] = [
    { username: "superadmin", accountKind: "super_admin", familyId: null, memberId: null, childId: null },
    { username: "mom", accountKind: "family_admin", familyId: DEFAULT_FAMILY_ID, memberId: "mom", childId: null },
    { username: "dad", accountKind: "parent", familyId: DEFAULT_FAMILY_ID, memberId: "dad", childId: null },
    { username: "grandma", accountKind: "parent", familyId: DEFAULT_FAMILY_ID, memberId: "grandma", childId: null },
    { username: "grandpa", accountKind: "parent", familyId: DEFAULT_FAMILY_ID, memberId: "grandpa", childId: null },
    { username: "jimmy", accountKind: "child", familyId: DEFAULT_FAMILY_ID, memberId: null, childId: "jimmy" },
    { username: "aimee", accountKind: "child", familyId: DEFAULT_FAMILY_ID, memberId: null, childId: "aimee" },
  ];
  for (const row of seedAccounts) {
    await prisma.userAccount.upsert({
      where: { username: row.username },
      update: {
        passwordHash,
        accountKind: row.accountKind,
        familyId: row.familyId,
        memberId: row.memberId,
        childId: row.childId,
        disabled: false,
      },
      create: {
        username: row.username,
        passwordHash,
        accountKind: row.accountKind,
        familyId: row.familyId,
        memberId: row.memberId,
        childId: row.childId,
      },
    });
  }

  const childrenCount = await prisma.child.count();
  const behaviorCount = await prisma.behavior.count();
  const accountCount = await prisma.userAccount.count();
  const rewardCount = await prisma.reward.count();
  console.log(
    `✅ Seed complete. Children: ${childrenCount}, Behaviors: ${behaviorCount}, Rewards: ${rewardCount}, Accounts: ${accountCount} (password: ${defaultPassword})`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
