# 考研资料总库

一个纯静态的考研资料站点，把数学真题、数学 / 英语知识库、英语一答案速查和英语真题逐题练习整合在同一个入口下。

线上地址：<https://kaoyan.feikntn111.us.ci>（短域名 <https://k.feikntn111.us.ci>；
数学真题另有一个独立站 <https://math.feikntn111.us.ci>，源码在同级目录 `../kaoyan-math-standalone/`）
源码仓库：<https://github.com/3456038583-gif/kaoyan-hub>（只含网页与题目数据，不含 PDF）

## 站点结构

| 路径 | 内容 |
|---|---|
| `/` | 总库首页，四个模块的入口 |
| `/math/` | 考研数学真题速查：2010—2026 数一 / 数二 / 数三，逐题 LaTeX 还原，可按年份、题型、难度筛选，带错题本与成绩统计 |
| `/library/` | 数学 / 英语知识库：Obsidian 笔记预渲染成静态页，支持全文搜索、双向链接、KaTeX 公式 |
| `/exam/` | 英语真题逐题练习：英语一 2006—2026、英语二 2010—2026，共 38 套；进入即最新一年的整卷 |
| `/politics/` | 政治真题逐题练习：2010—2026 共 17 套，单选 / 多选自动计分；进入即 2026 年整卷 |
| `/english/` | 英语一答案速查：一刷 / 二刷阅读答案与成绩记录 |

## 英语真题模块

- **逐题还原**：完形、四篇阅读、新题型、翻译、写作按原卷题号编排；题干与选项逐字照录，修掉 OCR 断词与错行。
- **一屏做题**：文章与题目左右分栏，阅读题在窄屏下自动堆叠；页面顶部按小节跳转。
- **难度标注**：每题标「易 / 中 / 难」，点「显示答案」核对作答，成绩栏实时统计已答 / 正确数。
- **全文精翻**：点「显示译文」展开逐段中文精译。
- **原卷解析**：每题右上角的「解析 p.N」直接跳到随站解析 PDF 的对应页。站内不重写解析，只记录答案。

少数原卷或解析书本身有缺损，页面顶部会给出说明：2023 英语（二）的解析书缺第 29、30、36—40 题，这几题答案取自公开答案汇编；2025 英语（二）原卷缺 Text 1 末段与 Text 2 中段，已按原文补回。

数据按试卷存在 `exam/data/<年份>-<y1|y2>.js`，格式为 `window.__PAPER__ = {...}`；渲染逻辑在 `exam/exam.js`。

首页 `/exam/` 不再有年份列表中转页：进来就是最新一年的英语（一）整卷，页面顶部一条 sticky 的「英语（一）| 英语（二）+ 年份条」，切板块时保留当前年份，切年份时保留当前板块。`/exam/records.html` 汇总本机保存的各卷作答记录。

## 政治真题模块

- **进入即整卷**：`/politics/` 直接渲染最新一年（2026）整卷，顶部年份条 2010—2026 一键切换，旁边是「练习记录」「政治一页纸」。
- **自动计分**：单选 1 分、多选 2 分（少选错选不得分），底部实时显示已答 / 得分 / 正确率，弹窗按题型拆分统计。
- **分析题**：材料与小问整段还原；解析册里的参考答案收在每题下方的「参考答案」折叠块里，不干扰先做题。
- **作答记录**：存在本机 `localStorage`（`kaoyan-politics:<年份>`），`/politics/records.html` 汇总。

数据在 `politics/data/<年份>.js`（`window.__PPAPER__`），渲染逻辑在 `politics/politics.js`。17 套 × 38 题共 646 题，构建时校验：无空题干、四个选项齐全、多选答案 2—4 个字母。

部分年份的原卷是扫描件，文字层残缺（页边界丢行、形近字误识）。已知且已处理的情况：2010 单选 9、2022 多选 11、2023 多选 3 / 11 的题干按原页图片人工补齐；`笫 / 井 / 地苺` 一类形近错字、`25. 5%` 被拆成两个小数、「光明H报」等按规则批量修正。2026 年用的是苏一版真题（原文档本身只给题目与答案、不含材料），材料部分以 PDF 为准。

## 目录结构

```
index.html            总库首页
site.css              全站顶部导航条
math/index.html       数学真题速查（配合根目录的 app.js / data*.js / meta*.js）
library/              知识库构建产物（note.css / note.js / nav.json / search.json）
exam/
  index.html          英语真题（进入即最新一年整卷）
  records.html        英语练习记录汇总
  exam.js / exam.css  逐题练习的渲染与交互
  data/*.js           各套试卷数据
  pdf/*-sol.pdf       压缩后的原卷解析（不随仓库分发）
politics/
  index.html          政治真题（进入即 2026 整卷）
  records.html        政治练习记录汇总
  politics.js/.css    政治卷渲染（客观题计分 + 分析题参考答案折叠）
  data/*.js           各年试卷数据
english/index.html    英语一答案速查单页
pdfs/                 数学真题与解析 PDF（不随仓库分发）
figs/                 数学题目配图
vendor/katex/         KaTeX
wrangler.jsonc        Cloudflare Workers 静态资源配置
```

## 构建与更新

知识库、英语真题索引与政治题库由同级目录 `../build-tools/` 生成（仓库 [kaoyan-build-tools](https://github.com/3456038583-gif/kaoyan-build-tools)）：

```bash
# 重新生成 exam/index.html 与各套试卷页
node ~/File_no_iCloud/kaoyan-website/build-tools/build-exam.mjs

# 重新生成 politics/ 与政治题库（读 PDF + OCR 缓存）
python3 ~/File_no_iCloud/kaoyan-website/build-tools/build-politics-site.py

# 重新生成 knowledge base（读取 Obsidian 仓库）
node ~/File_no_iCloud/kaoyan-website/build-tools/build-library.mjs

# 部署
cd ~/File_no_iCloud/kaoyan-website/kaoyan-hub
NODE_OPTIONS=--dns-result-order=ipv4first npx wrangler@latest deploy
```

## 说明

- 仓库只包含网页、脚本与题目数据，**不含 PDF**：`pdfs/` 与 `exam/pdf/` 加起来约 1.3 GB，超过 GitHub 的合理容量，PDF 随站点部署、通过网页链接访问。
- 真题、解析与笔记的版权归原作者及出版方所有，本仓库仅用于个人学习与检索，请勿用于商业用途。题目文本、译文、难度标注与网页代码为本项目整理成果。
