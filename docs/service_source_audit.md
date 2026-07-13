# BDFZ Companion App Service Source Audit Document

This document records the integration details, endpoints, cache policies, and rendering modes for all services in the BDFZ/RDFZ digital ecosystem.

## Categories Overview

1. **AI · 學習 (learning)**: Interactive learning portals for specific school and test topics.
2. **資料 · 課程 (reference)**: Curricular reading, maps, and schedules.
3. **社群 · 抒寫 (community)**: Discussion, anonymous treeholes, and blogs.
4. **披覽 · 共讀 (reading)**: Shared reader racks and audio-visual resources.
5. **器用 · 雜務 (tools)**: School operations, attendance, utilities, and download portals.

---

## Service Registry Audit List

| ID | Label | Category | URL | Integration Mode | Auth Required | Cache Policy | Safe for Native |
|---|---|---|---|---|---|---|---|
| `ai_gaokao` | AI 高考 | learning | `https://gk.bdfz.net` | WebView | Yes (Seiue/UC) | 24 Hours | No (Requires interactive LLM) |
| `ai_classical_chinese` | AI 文言 | learning | `https://gwyw.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `ai_prose` | AI 散文 | learning | `https://gksw.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `ai_language_application` | AI 語用 | learning | `https://yyjc.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `ai_dictation` | AI 默寫 | learning | `https://mx.bdfz.net` | WebView | Yes | 24 Hours | No |
| `gaokao_dictation` | 高考默寫 | learning | `https://mf.bdfz.net` | WebView | Yes | 24 Hours | No |
| `gaokao_recitation` | 高考背誦 | learning | `https://recite.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `grade_nine_recitation` | 九上背誦 | learning | `https://recite.rdfz.net/` | WebView | Yes | 24 Hours | No |
| `ai_words` | AI 字詞 | learning | `https://wygame.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `ai_analects` | AI 論語 | learning | `https://kz.bdfz.net` | WebView | Yes | 24 Hours | No |
| `analects_argument` | 義戰論語 | learning | `https://ly.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `ai_non_continuous_text` | AI 非連 | learning | `https://flx.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `ai_composition` | AI 作文 | learning | `https://zw.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `ai_english` | AI 英語 | learning | `https://yd.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `ai_zhongkao` | AI 中考 | learning | `https://zk.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `gaokao_past_papers` | 高考真題 | learning | `https://gks.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `ai_poetry` | AI 詩詞 | learning | `https://shi.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `chinese_terms` | 語文術語 | reference | `https://sy.bdfz.net/` | WebView | No | 24 Hours | No (Requires 3D Graph layout) |
| `chinese_course` | 語文課 | reference | `https://yw.bdfz.net/` | WebView | No | 24 Hours | No |
| `ai_textbook` | AI 教材 | reference | `https://sun.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `textbook_pdf` | 教材PDF | reference | `https://jc.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `jks_textbook` | JKS教材 | reference | `https://jks.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `textbook_star_map` | 課本星圖 | reference | `https://xt.bdfz.net/` | WebView | No | 24 Hours | No (Requires 3D rendering) |
| `people_star_map` | 群賢星圖 | reference | `https://qx.bdfz.net/` | WebView | No | 24 Hours | No |
| `open_book_morality` | 開卷道法 | reference | `https://s.rdfz.net/` | WebView | No | 24 Hours | No |
| `school_calendar` | 校曆 | reference | `https://cal.bdfz.net/` | WebView | No | 24 Hours | No |
| `forum` | 彣彰 | community | `https://forum.rdfzer.com` | WebView | Yes | 15 Minutes | No |
| `treehole` | 樹洞 | community | `https://tree.bdfz.net/` | WebView | Yes | 15 Minutes | No |
| `hourly_chat` | 時聊 | community | `https://chat.bdfz.net/` | WebView | No | 15 Minutes | No |
| `arena` | 心證場 | community | `https://arena.bdfz.net/` | WebView | Yes | 15 Minutes | No |
| `parents` | 家長 | community | `https://h.bdfz.net/` | WebView | Yes | 15 Minutes | No |
| `blog` | BLOG | community | `https://bdfz.net/` | WebView | No | 24 Hours | No |
| `co_reading` | 共讀 | reading | `https://coread.bdfz.net/` | Native/WebView | No | Local Persistent | Yes (Textbook content loaded locally) |
| `cinema` | 共覽 | reading | `http://bdfz-cinema.bdfz.net:8765/` | External browser only | No | Browser-managed | No |
| `nine_hundred_months` | 九百個月 | reading | `https://900.bdfz.net/` | WebView | No | 24 Hours | No |
| `universal_download` | 下載萬物 | tools | `https://xz.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `wechat_archive` | 微信公號 | tools | `https://wx.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `voice` | 人籟 | tools | `https://voice.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `seiue_attendance` | 希悅考勤 | tools | `https://seiue.bdfz.net/` | WebView | Yes | 10 Minutes | No |
| `user_center` | 老己 | tools | `https://my.bdfz.net/` | WebView/Native API | Yes | Local Session | Yes (Auth state bridged natively) |
| `usage_monitor` | 觀照 | tools | `https://pulse.bdfz.net/` | WebView | No | 10 Minutes | No |
| `ai_marking` | AI 閱卷 | tools | `https://mark.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `gaokao_application` | 高考報考 | tools | `https://gk.rdfzer.com/` | WebView | Yes | 24 Hours | No |
| `ai_school_selection` | AI 選校 | tools | `https://750.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `honor_documents` | 榮譽文書 | tools | `https://hp.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `things_not_to_do` | 不想做的 | tools | `https://path.bdfz.net/` | WebView | Yes | 24 Hours | No |
| `things_not_to_test` | 不想考的 | tools | `https://nope.bdfz.net/` | WebView | Yes | 24 Hours | No |

---

## Findings & Key Integrations

1. **Cleartext isolation**: The `cinema` service still exposes only HTTP. The app does not allow cleartext traffic inside its WebView and opens this one registry entry in the system browser without bridging the User Center session.
2. **Native Textbooks**: The `co_reading` books (Nahan, Biancheng, etc.) can be loaded locally inside the application's native reader using compiled JSON databases extracted from the respective source directories.
3. **Session interception**: Only `my.bdfz.net` and `uc.bdfz.net` may return a structurally valid `bdfz_uc_session` value to native `expo-secure-store`. Embedded navigation is limited to trusted BDFZ/RDFZ HTTPS hosts.
