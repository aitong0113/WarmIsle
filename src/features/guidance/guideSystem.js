const GUIDE_STATES = {
  REST: "rest",
  CALM: "calm",
  TALK: "talk",
  HELP: "help",
};

const EMOTION_TO_STATE = {
  tired: GUIDE_STATES.REST,
  stressed: GUIDE_STATES.REST,
  anxious: GUIDE_STATES.CALM,
  relaxed: GUIDE_STATES.CALM,
  sad: GUIDE_STATES.TALK,
  ok: GUIDE_STATES.TALK,
  grateful: GUIDE_STATES.TALK,
  happy: GUIDE_STATES.TALK,
};

const KEYWORD_RULES = [
  {
    state: GUIDE_STATES.HELP,
    keywords: ["不想活", "消失", "撐不住", "救救我", "一個人扛不住", "想傷害自己"],
  },
  {
    state: GUIDE_STATES.REST,
    keywords: ["好累", "很累", "沒力氣", "撐好久", "筋疲力盡", "想休息"],
  },
  {
    state: GUIDE_STATES.CALM,
    keywords: ["停不下來", "一直想", "腦袋很亂", "很焦躁", "喘不過氣", "轉不停"],
  },
];

const HELP_LEVEL_RULES = [
  {
    riskLevel: "urgent",
    keywords: ["想死", "不想活", "自殺", "結束自己", "想傷害自己", "現在就想"],
  },
  {
    riskLevel: "high",
    keywords: ["撐不住", "活不下去", "崩潰", "一個人扛不住", "救救我", "快不行了"],
  },
  {
    riskLevel: "elevated",
    keywords: ["消失", "沒有希望", "好想逃", "扛不住", "真的不行", "受不了了"],
  },
];

const HELP_CRISIS_PLANS = {
  urgent: {
    alertTitle: "如果你現在有立即傷害自己的衝動，先不要一個人待著。",
    alertBody: "先把找資源這件事變成眼前唯一的事。聯絡能立刻回應的人，或直接撥打緊急與危機專線。",
    steps: [
      "先離開讓你更危險的物品或空間，讓自己靠近其他人。",
      "立刻打給信任的人，直接說你現在需要有人陪。",
      "若有立即危險，優先撥打 119 或 110。",
    ],
  },
  high: {
    alertTitle: "你現在看起來已經接近扛不住，先把支援接上。",
    alertBody: "先不要要求自己整理清楚，只要先把人和資源找來。燈塔先幫你把免費且能立刻聯絡的方向放前面。",
    steps: [
      "先打給一位能回應你的人，直接說你現在狀況不太穩。",
      "優先看免費支持或危機專線，先讓自己被接住。",
      "如果你已經覺得自己快失控，直接改撥緊急資源。",
    ],
  },
  elevated: {
    alertTitle: "這不是小事，現在適合先找更穩的支持。",
    alertBody: "你不一定要一口氣做到很多，只要先找到第一個能聯絡的窗口。",
    steps: [
      "先從免費專線或社區支持開始，降低求助門檻。",
      "把查到的資源縮到同一個縣市，優先找你去得到的地方。",
      "如果你不想一個人查，也可以先回小屋把狀況說出來。",
    ],
  },
};

const DESTINATION_GUIDE_META = {
  "/island": {
    id: "island",
    label: "島中央",
    badgeLabel: "先看地圖",
    title: "先回到島中央看看",
    description: "如果你還不確定往哪走，回到地圖會更容易重新選。",
    stateCopy: {
      rest: "如果你現在還不想做決定，先回島中央慢慢看也可以。",
      calm: "先回地圖把選項看清楚，會比急著做決定更穩。",
      talk: "如果你想重新選一條路，回島中央最容易重新開始。",
      help: "如果你還在猶豫，地圖能幫你重新看到目前有哪些支援。",
    },
  },
  "/beach": {
    id: "beach",
    label: "情緒沙灘",
    badgeLabel: "先放下來",
    title: "先把感受放到岸上",
    description: "如果你還不想講太多，先寫下一句也很夠。",
    stateCopy: {
      rest: "現在先不用做太多，先把今天的累留在沙灘上。",
      calm: "當腦袋很亂時，先寫下一句話能幫你把霧降下來。",
      talk: "如果你還在整理怎麼開口，沙灘是比較低負擔的第一步。",
      help: "如果你還沒準備好立刻求助，也可以先把現在的狀況寫下來。",
    },
  },
  "/hako-cabin": {
    id: "hako-cabin",
    label: "哈可小屋",
    badgeLabel: "先陪你說",
    title: "這裡適合把話慢慢展開",
    description: "如果你需要被接住和回應，這裡比純記錄更適合。",
    stateCopy: {
      rest: "如果累背後其實有很多話卡著，小屋會比你一個人撐著輕一點。",
      calm: "當腦袋一直轉時，先說出來能幫你把混亂切成可處理的片段。",
      talk: "這一步和你現在的狀態最接近，我會先接住你的第一句。",
      help: "如果你還沒準備好直接求助，可以先讓我陪你把狀況說清楚。",
    },
  },
  "/campfire": {
    id: "campfire",
    label: "營火廣場",
    badgeLabel: "先降噪",
    title: "這裡比較適合先休息一下",
    description: "用環境聲和火光把節奏放慢，再決定要不要往下走。",
    stateCopy: {
      rest: "這一步很貼近你現在的狀態，先休息比硬撐更重要。",
      calm: "如果現在不想練習，只想讓心裡安靜一點，營火會比較適合。",
      talk: "如果你講到有點累，也可以先來這裡待一下。",
      help: "這裡能先陪你緩一點，但若真的扛不住，還是要把支援接上。",
    },
  },
  "/meditation": {
    id: "meditation",
    label: "冥想碼頭",
    badgeLabel: "先穩住",
    title: "這裡適合先把呼吸找回來",
    description: "如果你想把注意力拉回身體，這裡會比繼續想有效。",
    stateCopy: {
      rest: "如果你的累比較像被心事拖住，短一點的練習也能幫你鬆掉一些。",
      calm: "這一步很貼近你現在的狀態，先穩住再處理事情會比較有空間。",
      talk: "如果你想先整理一下情緒，再回來說，也可以先去碼頭。",
      help: "練習能幫你先穩一點，但若危險感很高，先找人比練習更優先。",
    },
  },
  "/lighthouse": {
    id: "lighthouse",
    label: "心理燈塔",
    badgeLabel: "先接上支援",
    title: "這裡放的是能真的聯絡的資源",
    description: "如果你需要更明確的幫助，燈塔會先把能用的方向攤開。",
    stateCopy: {
      rest: "如果累已經不是休息能解決的程度，燈塔能幫你找到更穩的支持。",
      calm: "當混亂持續很久時，找專業資源比自己反覆想更有幫助。",
      talk: "如果你發現光傾訴還不夠，這裡會是下一步。",
      help: "這一步和你現在的狀態最相關，先把能立刻聯絡的支援接上。",
    },
  },
  "/login": {
    id: "login",
    label: "登入頁",
    badgeLabel: "先登入",
    title: "先把帳號接上",
    description: "登入後，紀錄、偏好與解鎖狀態才會跟著你。",
    stateCopy: {
      rest: "如果你想之後少一點重來，先登入會讓紀錄留得住。",
      calm: "先把帳號接上，後面的陪伴與偏好才會穩定跟著你。",
      talk: "登入之後，小屋和紀錄都能跟著同一個身份累積。",
      help: "如果你之後需要持續追蹤資源或對話，先登入比較穩。",
    },
  },
  "/account": {
    id: "account",
    label: "會員中心",
    badgeLabel: "先看帳號",
    title: "先確認你的帳號與解鎖狀態",
    description: "如果某個區域進不去，通常先到會員中心就能知道下一步。",
    stateCopy: {
      rest: "如果你不想研究為什麼打不開，會員中心會直接告訴你狀態。",
      calm: "先看清楚帳號狀態，會比猜測卡在哪裡更省力。",
      talk: "如果你是為了某個功能而來，會員中心會先幫你對齊權限。",
      help: "當你需要的支援被鎖住時，會員中心是最快的確認入口。",
    },
  },
  "/upgrade": {
    id: "upgrade",
    label: "升級頁",
    badgeLabel: "先解鎖",
    title: "這裡是解鎖更多支持的入口",
    description: "如果你想打開付費場域，升級頁會整理付款與解鎖流程。",
    stateCopy: {
      rest: "如果你常用放鬆型場域，解鎖後會少很多中斷。",
      calm: "如果你想把冥想和資源穩定打開，這裡會是下一步。",
      talk: "如果你想把整座島的支持都打開，升級頁會帶你完成。",
      help: "如果你現在需要的支持在付費區，這裡是解鎖入口。",
    },
  },
};

const CRISIS_CONTACTS = [
  { id: "1925", label: "安心專線 1925", description: "24 小時心理支持", href: "tel:1925" },
  { id: "1995", label: "生命線 1995", description: "24 小時協談專線", href: "tel:1995" },
  { id: "1980", label: "張老師 1980", description: "情緒支持與輔導", href: "tel:1980" },
  { id: "119", label: "119 / 110", description: "有立即危險時優先聯絡", href: "tel:119" },
];

const GUIDE_CONFIG = {
  rest: {
    badgeLabel: "先休息",
    title: "先讓自己鬆一點",
    message: "你已經很撐了，要不要先讓身體和腦袋休息一下？",
    companionLine: "我有聽到你在撐，現在不用再更用力。",
    primaryAction: {
      id: "campfire",
      label: "去營火廣場",
      description: "先用火光和環境聲把節奏放慢。",
      to: "/campfire",
    },
    secondaryAction: {
      id: "hako-cabin",
      label: "先去哈可小屋",
      description: "如果你想說說累從哪裡來，我可以陪你講。",
      to: "/hako-cabin",
    },
  },
  calm: {
    badgeLabel: "先穩住",
    title: "先穩住現在的節奏",
    message: "你的腦袋可能還在轉，要不要先慢下來一點？",
    companionLine: "如果心裡很吵，我先陪你把呼吸找回來。",
    primaryAction: {
      id: "meditation",
      label: "去冥想碼頭",
      description: "先把注意力拉回呼吸和身體。",
      to: "/meditation",
    },
    secondaryAction: {
      id: "campfire",
      label: "改去營火廣場",
      description: "如果你不想練習，只想安靜待著也可以。",
      to: "/campfire",
    },
  },
  talk: {
    badgeLabel: "先陪你說",
    title: "把話慢慢說完整",
    message: "如果你還想多說一點，我可以陪你慢慢講。",
    companionLine: "你不用先整理好，想到哪裡就說到哪裡。",
    primaryAction: {
      id: "hako-cabin",
      label: "去哈可小屋",
      description: "把剛剛那句話延伸成一次完整對話。",
      to: "/hako-cabin",
    },
    secondaryAction: {
      id: "beach",
      label: "先留在情緒沙灘",
      description: "先把今天的感受記下來，也是一種整理。",
      to: "/beach",
    },
  },
  help: {
    badgeLabel: "先接上支援",
    title: "先找更穩的支撐",
    message: "這件事你不用一個人承擔，也許可以讓更專業的支持進來。",
    companionLine: "我會陪你，但這一刻更重要的是把支援接上。",
    primaryAction: {
      id: "lighthouse",
      label: "去心理燈塔",
      description: "先看可以立刻使用的資源與方向。",
      to: "/lighthouse",
    },
    secondaryAction: {
      id: "hako-cabin",
      label: "先去哈可小屋",
      description: "如果你還沒準備好求助，也可以先讓我陪你。",
      to: "/hako-cabin",
    },
  },
};

function normalizeText(value) {
  return `${value || ""}`.trim().toLowerCase();
}

function detectStateFromKeywords(content) {
  const normalized = normalizeText(content);

  if (!normalized) return "";

  const matchedRule = KEYWORD_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword.toLowerCase())),
  );

  return matchedRule?.state || "";
}

function detectHelpRiskLevel(content) {
  const normalized = normalizeText(content);

  if (!normalized) return "";

  const matchedRule = HELP_LEVEL_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword.toLowerCase())),
  );

  return matchedRule?.riskLevel || "";
}

function rankActions(actions, preferenceCounts = {}) {
  return [...actions].sort((left, right) => {
    const rightScore = preferenceCounts[right.id] || 0;
    const leftScore = preferenceCounts[left.id] || 0;

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return (left.order || 0) - (right.order || 0);
  });
}

function buildLearningHint(actions, preferenceCounts = {}) {
  const preferredAction = actions.find((action) => (preferenceCounts[action.id] || 0) > 0);
  if (!preferredAction) return "";

  return `你最近比較常點「${preferredAction.label.replace("去", "")}」，我先把它排前面。`;
}

export function resolveGuideState({ mood, content }) {
  const riskLevel = detectHelpRiskLevel(content);
  if (riskLevel) return GUIDE_STATES.HELP;

  const keywordState = detectStateFromKeywords(content);
  if (keywordState) return keywordState;

  const emotionState = EMOTION_TO_STATE[mood] || "";
  if (emotionState) return emotionState;

  if ((content || "").trim().length >= 80) {
    return GUIDE_STATES.TALK;
  }

  return GUIDE_STATES.TALK;
}

export function buildEmotionGuide({ mood, content, preferenceCounts = {} }) {
  const state = resolveGuideState({ mood, content });
  const config = GUIDE_CONFIG[state] || GUIDE_CONFIG.talk;
  const riskLevel = state === GUIDE_STATES.HELP ? detectHelpRiskLevel(content) || "elevated" : "none";
  const rankedActions = state === GUIDE_STATES.HELP
    ? [
        { ...config.primaryAction, order: 0 },
        { ...config.secondaryAction, order: 1 },
      ]
    : rankActions(
        [
          { ...config.primaryAction, order: 0 },
          { ...config.secondaryAction, order: 1 },
        ].filter(Boolean),
        preferenceCounts,
      );
  const [primaryAction, secondaryAction] = rankedActions;
  const learningHint = state === GUIDE_STATES.HELP ? "" : buildLearningHint(rankedActions, preferenceCounts);
  const crisisPlan = state === GUIDE_STATES.HELP
    ? {
        riskLevel,
        contacts: CRISIS_CONTACTS,
        ...HELP_CRISIS_PLANS[riskLevel],
      }
    : null;

  return {
    ...config,
    state,
    mood: mood || "",
    content: content || "",
    riskLevel,
    primaryAction,
    secondaryAction,
    learningHint,
    crisisPlan,
  };
}

export function buildHoverGuide({ targetPath, currentGuide }) {
  const target = DESTINATION_GUIDE_META[targetPath];
  if (!target) return null;

  const state = currentGuide?.state || GUIDE_STATES.TALK;
  const isRecommended = [currentGuide?.primaryAction?.to, currentGuide?.secondaryAction?.to].includes(targetPath);
  const fallbackAction = currentGuide?.primaryAction?.to === targetPath
    ? currentGuide?.secondaryAction
    : currentGuide?.primaryAction;

  return {
    state,
    badgeLabel: target.badgeLabel,
    title: isRecommended ? `${target.label}和你現在的狀態很接近` : target.title,
    message: target.stateCopy[state] || target.description,
    companionLine: isRecommended ? "如果你想，我現在就可以直接帶你過去。" : target.description,
    primaryAction: {
      id: target.id,
      label: `去${target.label}`,
      description: target.description,
      to: targetPath,
    },
    secondaryAction: fallbackAction || currentGuide?.secondaryAction || null,
    learningHint: "",
    riskLevel: currentGuide?.riskLevel || "none",
    crisisPlan: currentGuide?.crisisPlan || null,
  };
}

export { DESTINATION_GUIDE_META, GUIDE_CONFIG, GUIDE_STATES };