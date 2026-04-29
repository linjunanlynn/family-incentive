export type Locale = "zh" | "en";

export const LOCALES: Locale[] = ["zh", "en"];
export const DEFAULT_LOCALE: Locale = "zh";

type Messages = {
  appName: string;
  tagline: string;
  nav: {
    dashboard: string;
    checkin: string;
    manage: string;
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
      manage: "行为配置",
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
      points: "积分",
      positive: "正向",
      negative: "负向",
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
      stars: "☆ 正向",
      triangles: "△ 负向",
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
      manage: "Behaviors",
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
      points: "Points",
      positive: "Positive",
      negative: "Negative",
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
      stars: "☆ Positive",
      triangles: "△ Negative",
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
