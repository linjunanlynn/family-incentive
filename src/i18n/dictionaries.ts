export type Locale = "zh" | "en";

export const LOCALES: Locale[] = ["zh", "en"];
export const DEFAULT_LOCALE: Locale = "zh";

type Messages = {
  appName: string;
  tagline: string;
  nav: {
    dashboard: string;
    checkin: string;
    rewards: string;
    manage: string;
    manageRewards: string;
    members: string;
    periodOverview: string;
    dailyCheckin: string;
    accounts: string;
  };
  auth: {
    loginTitle: string;
    username: string;
    password: string;
    submit: string;
    logout: string;
    logIn: string;
    userMenu: string;
    invalid: string;
    loggedOut: string;
    accountsTitle: string;
    accountKind: string;
    kindAdmin: string;
    kindParent: string;
    kindChild: string;
    linkMember: string;
    linkChild: string;
    createAccount: string;
    resetPassword: string;
    newPassword: string;
    disabled: string;
    enabled: string;
    childReadOnly: string;
    enableAccount: string;
    disableAccount: string;
    accountStatus: string;
    errForbidden: string;
    errUsername: string;
    errPassword: string;
    errLink: string;
    errTaken: string;
    errMemberTaken: string;
    errChildTaken: string;
    /** Login form: accounts remembered on this browser */
    savedOnThisDevice: string;
  };
  common: {
    today: string; week: string; month: string; year: string;
    previous: string; next: string; cancel: string; save: string; delete: string;
    edit: string; add: string; confirm: string; back: string; points: string;
    positive: string; negative: string; total: string; noData: string;
    operator: string; loading: string; success: string; failed: string;
    times: string; record: string; records: string; undo: string;
    switchOperator: string; anonymous: string; pinPlaceholder: string;
    pinWrong: string; enterPin: string; submit: string; net: string;
    stars: string; triangles: string;
  };
  dashboard: {
    titleWeek: string;
    titleMonth: string;
    titleYear: string;
    currentPoints: string; thisWeek: string; thisMonth: string;
    thisYear: string; trend: string; breakdownByCategory: string;
    heatmap: string; weeklyAvg: string; bestDay: string;
    dailyTotal: string; monthlyTotal: string;
    chartStyleBars: string;
    chartStyleLine: string;
    noActivity: string; goCheckin: string; seeAll: string; recentEntries: string;
    sumPositive: string; sumNegative: string;
  };
  checkin: {
    title: string; pickDate: string; pickChild: string; pickOperator: string;
    tip: string;
    alreadyLogged: string;
    recordedToday: string;
    addNote: string; noteHint: string; tappedToday: string;
    todayPoints: string; undoLast: string; noBehaviors: string;
    categoryFilter: string; allCategories: string;     addedOnce: string;
    noPermission: string;
    labelPositiveScore: string;
    labelNegativeScore: string;
    undoThisCard: string;
    recordedNoteLabel: string;
  };
  manage: {
    title: string; forChild: string; addCategory: string; addBehavior: string;
    categoryNameZh: string; categoryNameEn: string; categoryEmoji: string;
    behaviorType: string; behaviorNameZh: string; behaviorNameEn: string;
    points: string; archived: string; restore: string; archive: string;
    reorderHint: string; confirmDelete: string; categoryDeleted: string;
    behaviorDeleted: string; saved: string;
  };
  members: {
    title: string; add: string; role: string; roleParent: string;
    roleGrandparent: string; roleOther: string; pinSet: string; pinNotSet: string;
    changePin: string; removePin: string;
  };
  rewards: {
    shopTitle: string;
    shopSubtitle: string;
    available: string;
    earned: string;
    spent: string;
    pending: string;
    starUnit: string;
    cost: string;
    redeem: string;
    redeemAgain: string;
    requestForKid: string;
    locked: string;
    needMore: string;
    saveMore: string;
    saving: string;
    saveTip: (n: number) => string;
    progressLabel: string;
    onlyForChild: string;
    sharedReward: string;
    stockLeft: (n: number) => string;
    outOfStock: string;
    cooldownActive: string;
    cooldownDays: (n: number) => string;
    confirmTitle: string;
    confirmBody: (cost: number) => string;
    addNote: string;
    notePlaceholder: string;
    submit: string;
    submitted: string;
    submittedHint: string;
    awaitingApproval: string;
    awaitingFulfillment: string;
    historyTitle: string;
    statusPending: string;
    statusApproved: string;
    statusFulfilled: string;
    statusRejected: string;
    statusCancelled: string;
    cancel: string;
    cancelMine: string;
    inboxTitle: string;
    inboxEmpty: string;
    approve: string;
    reject: string;
    fulfill: string;
    reviewedBy: string;
    requestedBy: string;
    selfRequested: string;
    catalogEmpty: string;
    tabAll: string;
    catTreat: string;
    catPrivilege: string;
    catOuting: string;
    catToy: string;
    catFamily: string;
    catLearning: string;
    manageTitle: string;
    addReward: string;
    editReward: string;
    rewardNameZh: string;
    rewardNameEn: string;
    rewardDescZh: string;
    rewardDescEn: string;
    rewardEmoji: string;
    rewardCost: string;
    rewardCategory: string;
    rewardScope: string;
    rewardScopeAll: string;
    rewardStock: string;
    rewardStockUnlimited: string;
    rewardCooldown: string;
    rewardCooldownNone: string;
    archive: string;
    restore: string;
    delete: string;
    confirmDelete: string;
    insufficient: string;
    forbidden: string;
    refunded: string;
    pickChild: string;
    inboxFilterAll: string;
    inboxFilterPending: string;
    inboxFilterApproved: string;
    inboxFilterDone: string;
    browseOnlyTitle: string;
    browseOnlyBody: string;
    browseOnlyFoot: string;
    mustLoginToRequest: string;
    historyLoginHint: string;
  };
  weekdays: string[];
  weekdaysShort: string[];
  months: string[];
};

export const dict: Record<Locale, Messages> = {
  zh: {
    appName: "家庭激励墙",
    tagline: "每天一点正向反馈，看得见的成长",
    nav: {
      dashboard: "总览",
      checkin: "打卡",
      rewards: "积分乐园",
      manage: "行为配置",
      manageRewards: "奖励配置",
      members: "家庭成员",
      periodOverview: "周期总览",
      dailyCheckin: "当日打分",
      accounts: "登录账号",
    },
    common: {
      today: "今天",
      week: "周",
      month: "月",
      year: "年",
      previous: "上一",
      next: "下一",
      cancel: "取消",
      save: "保存",
      delete: "删除",
      edit: "编辑",
      add: "新增",
      confirm: "确定",
      back: "返回",
      points: "颗星",
      positive: "得星",
      negative: "失去",
      total: "合计",
      noData: "暂无数据",
      operator: "操作人",
      loading: "加载中…",
      success: "操作成功",
      failed: "操作失败",
      times: "次",
      record: "记录",
      records: "条记录",
      undo: "撤销",
      switchOperator: "切换操作人",
      anonymous: "未指定",
      pinPlaceholder: "请输入 4 位 PIN（可选）",
      pinWrong: "PIN 不正确",
      enterPin: "需要输入 PIN",
      submit: "提交",
      net: "净分",
      stars: "得星",
      triangles: "失去",
    },
    dashboard: {
      titleWeek: "本周成长",
      titleMonth: "本月成长",
      titleYear: "本年成长",
      currentPoints: "当前积分",
      thisWeek: "本周累计",
      thisMonth: "本月累计",
      thisYear: "本年累计",
      trend: "积分趋势",
      breakdownByCategory: "类别分布",
      heatmap: "全年热力图",
      weeklyAvg: "周均",
      bestDay: "最佳日",
      dailyTotal: "每日积分",
      monthlyTotal: "每月积分",
      chartStyleBars: "正负条形",
      chartStyleLine: "净分趋势",
      noActivity: "今日还没有记录，去打卡吧 →",
      goCheckin: "立即打卡",
      seeAll: "查看全部",
      recentEntries: "最近记录",
      sumPositive: "本周正向",
      sumNegative: "本周负向",
    },
    checkin: {
      title: "每日打卡",
      pickDate: "选择日期",
      pickChild: "选择孩子",
      pickOperator: "选择操作人",
      tip: "每项行为当天只能打一次分；如需修改请先删除当日记录。",
      alreadyLogged: "该项今天已经打过分了",
      recordedToday: "本日已记",
      addNote: "添加备注（可选）",
      noteHint: "备注",
      tappedToday: "今日记录",
      todayPoints: "今日得分",
      undoLast: "撤销上一条",
      noBehaviors: "该类别暂无行为项",
      categoryFilter: "类别",
      allCategories: "全部",
      addedOnce: "已记录一次 +",
      noPermission: "当前账号无权限执行此操作。",
      labelPositiveScore: "正向加分",
      labelNegativeScore: "负向减分",
      undoThisCard: "撤销本条",
      recordedNoteLabel: "备注",
    },
    manage: {
      title: "行为项配置",
      forChild: "为谁配置",
      addCategory: "新增类别",
      addBehavior: "新增行为",
      categoryNameZh: "类别（中文）",
      categoryNameEn: "类别（英文）",
      categoryEmoji: "图标",
      behaviorType: "类型",
      behaviorNameZh: "行为（中文）",
      behaviorNameEn: "行为（英文）",
      points: "分值",
      archived: "已归档",
      restore: "恢复",
      archive: "归档",
      reorderHint: "拖拽 ⇅ 调整顺序（开发中）",
      confirmDelete: "确定删除？历史记录将保留但失去关联。",
      categoryDeleted: "类别已删除",
      behaviorDeleted: "行为已删除",
      saved: "已保存",
    },
    members: {
      title: "家庭成员",
      add: "新增成员",
      role: "角色",
      roleParent: "父母",
      roleGrandparent: "祖辈",
      roleOther: "其他",
      pinSet: "已设置 PIN",
      pinNotSet: "无 PIN",
      changePin: "修改 PIN",
      removePin: "移除 PIN",
    },
    rewards: {
      shopTitle: "积分乐园",
      shopSubtitle: "用你的星星，换喜欢的奖励吧 ✨",
      available: "可用星星",
      earned: "累计获得",
      spent: "已经花掉",
      pending: "申请中（待爸妈确认）",
      starUnit: "颗星",
      cost: "花费",
      redeem: "立即兑换",
      redeemAgain: "再来一次",
      requestForKid: "代TA申请",
      locked: "再加把劲",
      needMore: "还差",
      saveMore: "继续努力哦！",
      saving: "正在攒大礼物",
      saveTip: (n: number) => `还差 ${n} 颗星就能拿到啦`,
      progressLabel: "兑换进度",
      onlyForChild: "专属奖励",
      sharedReward: "全家奖励",
      stockLeft: (n: number) => `仅剩 ${n} 个`,
      outOfStock: "已被换光",
      cooldownActive: "暂时不能再换",
      cooldownDays: (n: number) => `每 ${n} 天可换 1 次`,
      confirmTitle: "确定要兑换吗？",
      confirmBody: (cost: number) => `这会用掉你 ${cost} 颗星星，要继续吗？`,
      addNote: "想对爸妈说点什么？（可选）",
      notePlaceholder: "比如：周六晚上想看《冰雪奇缘》",
      submit: "确认申请",
      submitted: "已发送给爸妈！",
      submittedHint: "等爸妈点头，星星就会被取走 ⭐",
      awaitingApproval: "等待爸妈确认",
      awaitingFulfillment: "已确认，等待兑现",
      historyTitle: "我的兑换记录",
      statusPending: "待审核",
      statusApproved: "已确认",
      statusFulfilled: "已完成",
      statusRejected: "未通过",
      statusCancelled: "已取消",
      cancel: "取消",
      cancelMine: "撤回申请",
      inboxTitle: "兑换审核",
      inboxEmpty: "暂时没有需要处理的申请",
      approve: "通过",
      reject: "驳回",
      fulfill: "标记已兑现",
      reviewedBy: "审核人",
      requestedBy: "申请人",
      selfRequested: "孩子自己",
      catalogEmpty: "还没有可兑换的奖励，让爸妈去配置吧～",
      tabAll: "全部",
      catTreat: "美食小零嘴",
      catPrivilege: "特别权利",
      catOuting: "出游探索",
      catToy: "玩具收藏",
      catFamily: "亲子时光",
      catLearning: "学习装备",
      manageTitle: "奖励配置",
      addReward: "新增奖励",
      editReward: "编辑奖励",
      rewardNameZh: "奖励名（中文）",
      rewardNameEn: "奖励名（英文）",
      rewardDescZh: "描述（中文）",
      rewardDescEn: "描述（英文）",
      rewardEmoji: "图标",
      rewardCost: "需要的星星数",
      rewardCategory: "类别",
      rewardScope: "适用范围",
      rewardScopeAll: "全家所有孩子",
      rewardStock: "数量上限",
      rewardStockUnlimited: "不限",
      rewardCooldown: "冷却天数",
      rewardCooldownNone: "无",
      archive: "下架",
      restore: "上架",
      delete: "删除",
      confirmDelete: "确定删除该奖励？",
      insufficient: "星星不够呢，再继续努力吧！",
      forbidden: "当前账号无权操作",
      refunded: "未通过，星星已退还",
      pickChild: "为谁兑换",
      inboxFilterAll: "全部",
      inboxFilterPending: "待审核",
      inboxFilterApproved: "已确认",
      inboxFilterDone: "已完成",
      browseOnlyTitle: "浏览模式",
      browseOnlyBody:
        "未登录只能查看积分和礼品目录。要提交兑换，请让孩子登录自己的账号，或由家长登录后代为申请。",
      browseOnlyFoot: "孩子账号或家长账号登录后即可申请兑换",
      mustLoginToRequest: "请先登录：孩子本人登录，或由家长登录后代为申请。",
      historyLoginHint: "登录后可查看该孩子的兑换记录。",
    },
    auth: {
      loginTitle: "登录",
      username: "用户名",
      password: "密码",
      submit: "登录",
      logout: "退出",
      logIn: "登录",
      userMenu: "账户菜单",
      invalid: "用户名或密码错误",
      loggedOut: "已退出登录",
      accountsTitle: "登录账号管理",
      accountKind: "角色",
      kindAdmin: "管理员家长",
      kindParent: "家长（可打分）",
      kindChild: "孩子（仅浏览）",
      linkMember: "关联家庭成员",
      linkChild: "关联孩子",
      createAccount: "新建账号",
      resetPassword: "重置密码",
      newPassword: "新密码",
      disabled: "已停用",
      enabled: "正常",
      childReadOnly: "孩子账号仅可查看总览，不能打卡或进入配置。",
      enableAccount: "启用",
      disableAccount: "停用",
      accountStatus: "状态",
      errForbidden: "无权限",
      errUsername: "用户名至少 2 个字符",
      errPassword: "密码至少 4 位",
      errLink: "请正确选择关联的成员或孩子",
      errTaken: "用户名已被占用",
      errMemberTaken: "该成员已绑定账号",
      errChildTaken: "该孩子已绑定账号",
      savedOnThisDevice: "本设备曾登录",
    },
    weekdays: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
    weekdaysShort: ["日", "一", "二", "三", "四", "五", "六"],
    months: [
      "1 月", "2 月", "3 月", "4 月", "5 月", "6 月",
      "7 月", "8 月", "9 月", "10 月", "11 月", "12 月",
    ],
  },
  en: {
    appName: "Family Incentive",
    tagline: "Tiny daily wins. Visible growth.",
    nav: {
      dashboard: "Overview",
      checkin: "Check-in",
      rewards: "Points Park",
      manage: "Behaviors",
      manageRewards: "Reward catalog",
      members: "Members",
      periodOverview: "Period overview",
      dailyCheckin: "Daily score",
      accounts: "Accounts",
    },
    common: {
      today: "Today",
      week: "Week",
      month: "Month",
      year: "Year",
      previous: "Previous",
      next: "Next",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      confirm: "Confirm",
      back: "Back",
      points: "stars",
      positive: "Earned",
      negative: "Lost",
      total: "Total",
      noData: "No data",
      operator: "By",
      loading: "Loading…",
      success: "Saved",
      failed: "Failed",
      times: "×",
      record: "log",
      records: "records",
      undo: "Undo",
      switchOperator: "Switch operator",
      anonymous: "Unspecified",
      pinPlaceholder: "Enter 4-digit PIN (optional)",
      pinWrong: "Wrong PIN",
      enterPin: "PIN required",
      submit: "Submit",
      net: "Net",
      stars: "Earned",
      triangles: "Lost",
    },
    dashboard: {
      titleWeek: "Weekly growth",
      titleMonth: "Monthly growth",
      titleYear: "Yearly growth",
      currentPoints: "Current points",
      thisWeek: "This week",
      thisMonth: "This month",
      thisYear: "This year",
      trend: "Points trend",
      breakdownByCategory: "By category",
      heatmap: "Yearly heatmap",
      weeklyAvg: "Weekly avg",
      bestDay: "Best day",
      dailyTotal: "Daily points",
      monthlyTotal: "Monthly points",
      chartStyleBars: "Bars (+/−)",
      chartStyleLine: "Net trend",
      noActivity: "No entries today — tap to check in →",
      goCheckin: "Check in now",
      seeAll: "See all",
      recentEntries: "Recent entries",
      sumPositive: "Positive (week)",
      sumNegative: "Negative (week)",
    },
    checkin: {
      title: "Daily check-in",
      pickDate: "Date",
      pickChild: "Child",
      pickOperator: "Operator",
      tip: "Each behavior can only be scored once per day. Delete the day’s entry to change it.",
      alreadyLogged: "This behavior was already scored today",
      recordedToday: "Logged today",
      addNote: "Add note (optional)",
      noteHint: "Note",
      tappedToday: "Logged today",
      todayPoints: "Today's points",
      undoLast: "Undo last",
      noBehaviors: "No behaviors in this category",
      categoryFilter: "Category",
      allCategories: "All",
      addedOnce: "Logged +",
      noPermission: "This account is not allowed to do that.",
      labelPositiveScore: "Positive (+)",
      labelNegativeScore: "Negative (−)",
      undoThisCard: "Undo this score",
      recordedNoteLabel: "Note",
    },
    manage: {
      title: "Behavior settings",
      forChild: "For",
      addCategory: "Add category",
      addBehavior: "Add behavior",
      categoryNameZh: "Category (中文)",
      categoryNameEn: "Category (English)",
      categoryEmoji: "Emoji",
      behaviorType: "Type",
      behaviorNameZh: "Behavior (中文)",
      behaviorNameEn: "Behavior (English)",
      points: "Points",
      archived: "Archived",
      restore: "Restore",
      archive: "Archive",
      reorderHint: "Drag ⇅ to reorder (coming soon)",
      confirmDelete: "Delete this? Historical logs will be kept but unlinked.",
      categoryDeleted: "Category deleted",
      behaviorDeleted: "Behavior deleted",
      saved: "Saved",
    },
    members: {
      title: "Family members",
      add: "Add member",
      role: "Role",
      roleParent: "Parent",
      roleGrandparent: "Grandparent",
      roleOther: "Other",
      pinSet: "PIN set",
      pinNotSet: "No PIN",
      changePin: "Change PIN",
      removePin: "Remove PIN",
    },
    rewards: {
      shopTitle: "Points Park",
      shopSubtitle: "Spend your stars on something you love ✨",
      available: "Stars to spend",
      earned: "Earned all-time",
      spent: "Already spent",
      pending: "Awaiting approval",
      starUnit: "stars",
      cost: "Cost",
      redeem: "Redeem",
      redeemAgain: "Redeem again",
      requestForKid: "Redeem for kid",
      locked: "Keep going!",
      needMore: "Need",
      saveMore: "You can do it!",
      saving: "Saving up",
      saveTip: (n: number) => `${n} more stars to unlock`,
      progressLabel: "Progress",
      onlyForChild: "Just for them",
      sharedReward: "Whole-family",
      stockLeft: (n: number) => `Only ${n} left`,
      outOfStock: "Out of stock",
      cooldownActive: "Cooling down",
      cooldownDays: (n: number) => `1× every ${n} days`,
      confirmTitle: "Spend your stars?",
      confirmBody: (cost: number) => `This will use ${cost} of your stars. Continue?`,
      addNote: "Anything to tell mom & dad? (optional)",
      notePlaceholder: "e.g. I'd like to watch Frozen on Saturday night",
      submit: "Send request",
      submitted: "Sent to mom & dad!",
      submittedHint: "Stars will be deducted once they approve ⭐",
      awaitingApproval: "Waiting for approval",
      awaitingFulfillment: "Approved, awaiting fulfillment",
      historyTitle: "My redemptions",
      statusPending: "Pending",
      statusApproved: "Approved",
      statusFulfilled: "Done",
      statusRejected: "Rejected",
      statusCancelled: "Cancelled",
      cancel: "Cancel",
      cancelMine: "Withdraw request",
      inboxTitle: "Reward inbox",
      inboxEmpty: "No pending requests right now",
      approve: "Approve",
      reject: "Reject",
      fulfill: "Mark fulfilled",
      reviewedBy: "Reviewed by",
      requestedBy: "Requested by",
      selfRequested: "the kid",
      catalogEmpty: "No rewards yet — ask the admin to add some!",
      tabAll: "All",
      catTreat: "Treats",
      catPrivilege: "Privileges",
      catOuting: "Outings",
      catToy: "Toys",
      catFamily: "Family time",
      catLearning: "Learning",
      manageTitle: "Reward catalog",
      addReward: "Add reward",
      editReward: "Edit reward",
      rewardNameZh: "Name (中文)",
      rewardNameEn: "Name (English)",
      rewardDescZh: "Description (中文)",
      rewardDescEn: "Description (English)",
      rewardEmoji: "Emoji",
      rewardCost: "Star cost",
      rewardCategory: "Category",
      rewardScope: "Available to",
      rewardScopeAll: "All children",
      rewardStock: "Stock cap",
      rewardStockUnlimited: "Unlimited",
      rewardCooldown: "Cooldown days",
      rewardCooldownNone: "None",
      archive: "Archive",
      restore: "Restore",
      delete: "Delete",
      confirmDelete: "Delete this reward?",
      insufficient: "Not enough stars yet — keep earning!",
      forbidden: "Not allowed",
      refunded: "Rejected — stars refunded.",
      pickChild: "For",
      inboxFilterAll: "All",
      inboxFilterPending: "Pending",
      inboxFilterApproved: "Approved",
      inboxFilterDone: "Fulfilled",
      browseOnlyTitle: "Browse only",
      browseOnlyBody:
        "You can view stars and the reward catalog. To submit a redemption, sign in as the child, or as a parent to request on their behalf.",
      browseOnlyFoot: "Sign in as a child or parent account to request a reward.",
      mustLoginToRequest: "Please sign in: as the child, or as a parent to redeem for them.",
      historyLoginHint: "Sign in to see this child’s redemption history.",
    },
    auth: {
      loginTitle: "Sign in",
      username: "Username",
      password: "Password",
      submit: "Sign in",
      logout: "Sign out",
      logIn: "Log in",
      userMenu: "Account menu",
      invalid: "Invalid username or password",
      loggedOut: "Signed out",
      accountsTitle: "Login accounts",
      accountKind: "Role",
      kindAdmin: "Admin parent",
      kindParent: "Parent (can score)",
      kindChild: "Child (view only)",
      linkMember: "Link family member",
      linkChild: "Link child",
      createAccount: "Create account",
      resetPassword: "Reset password",
      newPassword: "New password",
      disabled: "Disabled",
      enabled: "Active",
      childReadOnly: "Child accounts can only view the overview.",
      enableAccount: "Enable",
      disableAccount: "Disable",
      accountStatus: "Status",
      errForbidden: "Not allowed",
      errUsername: "Username must be at least 2 characters",
      errPassword: "Password must be at least 4 characters",
      errLink: "Link exactly one member or one child",
      errTaken: "Username is already taken",
      errMemberTaken: "That member already has an account",
      errChildTaken: "That child already has an account",
      savedOnThisDevice: "Used on this device",
    },
    weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
  },
};

export type Dict = Messages;
