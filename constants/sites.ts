export enum ConnectionMode {
  NATIVE_API = 'NATIVE_API',
  WEBVIEW = 'WEBVIEW',
  CUSTOM_TAB = 'CUSTOM_TAB',
  EXTERNAL_BROWSER = 'EXTERNAL_BROWSER'
}

export interface ServiceDefinition {
  id: string;
  categoryId: string;
  label: string;
  url: string;
  accessibilityLabel: string;
  order: number;
  connectionMode: ConnectionMode;
  enabled?: boolean;
}

export interface ServiceCategory {
  id: string;
  label: string;
  order: number;
}

export const CATEGORIES_LIST: ServiceCategory[] = [
  { id: 'learning', label: 'AI · 學習', order: 1 },
  { id: 'reference', label: '資料 · 課程', order: 2 },
  { id: 'community', label: '社群 · 抒寫', order: 3 },
  { id: 'reading', label: '披覽 · 共讀', order: 4 },
  { id: 'tools', label: '器用 · 雜務', order: 5 }
];

export const SERVICES: ServiceDefinition[] = [
  // Category: learning
  {
    id: 'ai_gaokao',
    categoryId: 'learning',
    label: 'AI 高考',
    url: 'https://gk.bdfz.net',
    accessibilityLabel: 'AI 高考',
    order: 1,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'ai_classical_chinese',
    categoryId: 'learning',
    label: 'AI 文言',
    url: 'https://gwyw.bdfz.net/',
    accessibilityLabel: 'AI 文言',
    order: 2,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'ai_prose',
    categoryId: 'learning',
    label: 'AI 散文',
    url: 'https://gksw.bdfz.net/',
    accessibilityLabel: 'AI 散文',
    order: 3,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'ai_language_application',
    categoryId: 'learning',
    label: 'AI 語用',
    url: 'https://yyjc.bdfz.net/',
    accessibilityLabel: 'AI 語用',
    order: 4,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'ai_dictation',
    categoryId: 'learning',
    label: 'AI 默寫',
    url: 'https://mx.bdfz.net',
    accessibilityLabel: 'AI 默寫',
    order: 5,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'gaokao_dictation',
    categoryId: 'learning',
    label: '高考默寫',
    url: 'https://mf.bdfz.net',
    accessibilityLabel: '高考詩文默寫',
    order: 6,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'gaokao_recitation',
    categoryId: 'learning',
    label: '高考背誦',
    url: 'https://recite.bdfz.net/',
    accessibilityLabel: '琅琅 · 高考古詩文背誦',
    order: 7,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'grade_nine_recitation',
    categoryId: 'learning',
    label: '九上背誦',
    url: 'https://recite.rdfz.net/',
    accessibilityLabel: '琅琅 · 九上古詩文背誦',
    order: 8,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'ai_words',
    categoryId: 'learning',
    label: 'AI 字詞',
    url: 'https://wygame.bdfz.net/',
    accessibilityLabel: 'AI 字詞',
    order: 9,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'ai_analects',
    categoryId: 'learning',
    label: 'AI 論語',
    url: 'https://kz.bdfz.net',
    accessibilityLabel: 'AI 論語',
    order: 10,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'analects_argument',
    categoryId: 'learning',
    label: '義戰論語',
    url: 'https://ly.bdfz.net/',
    accessibilityLabel: '義戰論語',
    order: 11,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'ai_non_continuous_text',
    categoryId: 'learning',
    label: 'AI 非連',
    url: 'https://flx.bdfz.net/',
    accessibilityLabel: 'AI 非連續性文本',
    order: 12,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'ai_composition',
    categoryId: 'learning',
    label: 'AI 作文',
    url: 'https://zw.bdfz.net/',
    accessibilityLabel: 'AI 作文',
    order: 13,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'ai_english',
    categoryId: 'learning',
    label: 'AI 英語',
    url: 'https://yd.bdfz.net/',
    accessibilityLabel: 'AI Gaokao English 高考英語閱讀',
    order: 14,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'ai_zhongkao',
    categoryId: 'learning',
    label: 'AI 中考',
    url: 'https://zk.bdfz.net/',
    accessibilityLabel: 'AI 中考',
    order: 15,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'gaokao_past_papers',
    categoryId: 'learning',
    label: '高考真題',
    url: 'https://gks.bdfz.net/',
    accessibilityLabel: '高考真題',
    order: 16,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'ai_poetry',
    categoryId: 'learning',
    label: 'AI 詩詞',
    url: 'https://shi.bdfz.net/',
    accessibilityLabel: '古詩詞鑑賞',
    order: 17,
    connectionMode: ConnectionMode.WEBVIEW
  },

  // Category: reference
  {
    id: 'chinese_terms',
    categoryId: 'reference',
    label: '語文術語',
    url: 'https://sy.bdfz.net/',
    accessibilityLabel: '語文術語圖谱',
    order: 1,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'chinese_course',
    categoryId: 'reference',
    label: '語文課',
    url: 'https://yw.bdfz.net/',
    accessibilityLabel: '語文課文',
    order: 2,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'ai_textbook',
    categoryId: 'reference',
    label: 'AI 教材',
    url: 'https://sun.bdfz.net/',
    accessibilityLabel: 'AI 高中教材',
    order: 3,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'textbook_pdf',
    categoryId: 'reference',
    label: '教材PDF',
    url: 'https://jc.bdfz.net/',
    accessibilityLabel: '教材 PDF',
    order: 4,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'jks_textbook',
    categoryId: 'reference',
    label: 'JKS教材',
    url: 'https://jks.bdfz.net/',
    accessibilityLabel: 'JKS 教材下載',
    order: 5,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'textbook_star_map',
    categoryId: 'reference',
    label: '課本星圖',
    url: 'https://xt.bdfz.net/',
    accessibilityLabel: '課本星圖 · 教材 3D 星圖',
    order: 6,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'people_star_map',
    categoryId: 'reference',
    label: '群賢星圖',
    url: 'https://qx.bdfz.net/',
    accessibilityLabel: '群賢星圖 · 全學科教材人物關係',
    order: 7,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'open_book_morality',
    categoryId: 'reference',
    label: '開卷道法',
    url: 'https://s.rdfz.net/',
    accessibilityLabel: '開卷 · 初中道德與法治速查台',
    order: 8,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'school_calendar',
    categoryId: 'reference',
    label: '校曆',
    url: 'https://cal.bdfz.net/',
    accessibilityLabel: '校曆',
    order: 9,
    connectionMode: ConnectionMode.WEBVIEW
  },

  // Category: community
  {
    id: 'forum',
    categoryId: 'community',
    label: '彣彰',
    url: 'https://forum.rdfzer.com',
    accessibilityLabel: '彣彰論壇',
    order: 1,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'treehole',
    categoryId: 'community',
    label: '樹洞',
    url: 'https://tree.bdfz.net/',
    accessibilityLabel: '匿名樹洞',
    order: 2,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'hourly_chat',
    categoryId: 'community',
    label: '時聊',
    url: 'https://chat.bdfz.net/',
    accessibilityLabel: 'Anon Hourly Chat 匿名整點聊天',
    order: 3,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'arena',
    categoryId: 'community',
    label: '心證場',
    url: 'https://arena.bdfz.net/',
    accessibilityLabel: '心證場',
    order: 4,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'parents',
    categoryId: 'community',
    label: '家長',
    url: 'https://h.bdfz.net/',
    accessibilityLabel: '家長',
    order: 5,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'blog',
    categoryId: 'community',
    label: 'BLOG',
    url: 'https://bdfz.net/',
    accessibilityLabel: 'SUEN 博客',
    order: 6,
    connectionMode: ConnectionMode.WEBVIEW
  },

  // Category: reading
  {
    id: 'co_reading',
    categoryId: 'reading',
    label: '共讀',
    url: 'https://coread.bdfz.net/',
    accessibilityLabel: '共讀書架 · 中國人的氣質 · 吶喊 · 邊城 · 論語 · 哈姆雷特 · 青史列傳 · 創意寫作文集',
    order: 1,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'cinema',
    categoryId: 'reading',
    label: '共覽',
    url: 'http://bdfz-cinema.bdfz.net:8765/',
    accessibilityLabel: '共覽 · BDFZ 视听中心',
    order: 2,
    connectionMode: ConnectionMode.EXTERNAL_BROWSER
  },
  {
    id: 'nine_hundred_months',
    categoryId: 'reading',
    label: '九百個月',
    url: 'https://900.bdfz.net/',
    accessibilityLabel: '九百個月 向死而生',
    order: 3,
    connectionMode: ConnectionMode.WEBVIEW
  },

  // Category: tools
  {
    id: 'universal_download',
    categoryId: 'tools',
    label: '下載萬物',
    url: 'https://xz.bdfz.net/',
    accessibilityLabel: '下載萬物 YT-DLP',
    order: 1,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'wechat_archive',
    categoryId: 'tools',
    label: '微信公號',
    url: 'https://wx.bdfz.net/',
    accessibilityLabel: '微信公號存檔',
    order: 2,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'voice',
    categoryId: 'tools',
    label: '人籟',
    url: 'https://voice.bdfz.net/',
    accessibilityLabel: '人籟 朗讀',
    order: 3,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'seiue_attendance',
    categoryId: 'tools',
    label: '希悅考勤',
    url: 'https://seiue.bdfz.net/',
    accessibilityLabel: '希悅考勤',
    order: 4,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'user_center',
    categoryId: 'tools',
    label: '老己',
    url: 'https://my.bdfz.net/',
    accessibilityLabel: '老己 用戶中心',
    order: 5,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'usage_monitor',
    categoryId: 'tools',
    label: '觀照',
    url: 'https://pulse.bdfz.net/',
    accessibilityLabel: '使用情況觀測站',
    order: 6,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'ai_marking',
    categoryId: 'tools',
    label: 'AI 閱卷',
    url: 'https://mark.bdfz.net/',
    accessibilityLabel: 'AI 閱卷',
    order: 7,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'gaokao_application',
    categoryId: 'tools',
    label: '高考報考',
    url: 'https://gk.rdfzer.com/',
    accessibilityLabel: '高考報考',
    order: 8,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'ai_school_selection',
    categoryId: 'tools',
    label: 'AI 選校',
    url: 'https://750.bdfz.net/',
    accessibilityLabel: 'AI 選校',
    order: 9,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'honor_documents',
    categoryId: 'tools',
    label: '榮譽文書',
    url: 'https://hp.bdfz.net/',
    accessibilityLabel: '榮譽文憑文書圖譜',
    order: 10,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'things_not_to_do',
    categoryId: 'tools',
    label: '不想做的',
    url: 'https://path.bdfz.net/',
    accessibilityLabel: '不想做的',
    order: 11,
    connectionMode: ConnectionMode.WEBVIEW
  },
  {
    id: 'things_not_to_test',
    categoryId: 'tools',
    label: '不想考的',
    url: 'https://nope.bdfz.net/',
    accessibilityLabel: '不想考的',
    order: 12,
    connectionMode: ConnectionMode.WEBVIEW
  }
];

export interface SiteLink {
  id: string;
  label: string;
  href: string;
  aria: string;
  connectionMode: ConnectionMode;
}

export interface SiteCategory {
  id: string;
  label: string;
  accentColor: string;
  links: SiteLink[];
}

const CATEGORY_ACCENT_COLORS: Record<string, string> = {
  learning: '#A78BFA', // Purple
  reference: '#34D399', // Emerald
  community: '#6366F1', // Indigo
  reading: '#F87171', // Red
  tools: '#FBBF24' // Amber
};

export const CATEGORIES: SiteCategory[] = CATEGORIES_LIST
  .sort((a, b) => a.order - b.order)
  .map(cat => ({
    id: cat.id,
    label: cat.label,
    accentColor: CATEGORY_ACCENT_COLORS[cat.id] || '#6B7280',
    links: SERVICES
      .filter(s => s.categoryId === cat.id && s.enabled !== false)
      .sort((a, b) => a.order - b.order)
      .map(s => ({
        id: s.id,
        label: s.label,
        href: s.url,
        aria: s.accessibilityLabel,
        connectionMode: s.connectionMode
      }))
  }));
