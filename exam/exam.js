/* 考研英语真题 · 逐题练习 */
(function () {
  const P = window.__PAPER__;
  if (!P) return;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const KEY = 'kaoyan-exam:' + P.id;
  let store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { store = {}; }
  /** @type {Record<string,string>} */
  let picks = store.picks || {};
  /** 已提交的题型：{secId: true} —— 提交后才判对错、才计分 */
  let submittedSec = store.submittedSec || {};
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify({ picks, submittedSec, t: Date.now() })); } catch (e) {}
  };

  /* 记住上次打开的卷子：从数学/政治等板块切回来时直接回到这套卷 */
  try {
    localStorage.setItem('kaoyanExam.position.v1', JSON.stringify({ id: P.id, t: Date.now() }));
  } catch (e) { /* 禁用存储时仅本次会话有效 */ }

  const allQ = [];
  /* 合并主题表：完形取 cloze，写作按 Part A / Part B 分配 */
  const TP = (window.__TOPICS__ || {})[P.id] || {};
  P.sections.forEach((s) => {
    if (TP.cloze && (s.kind === 'cloze' || s.kind === 'use')) s.topic = s.topic || TP.cloze;
    if (TP.small || TP.big) {
      (s.parts || []).forEach((p) => {
        const lab = p.label || '';
        if (/Part\s*A|小作文/i.test(lab) && TP.small) p.topic = p.topic || TP.small;
        if (/Part\s*B|大作文/i.test(lab) && TP.big) p.topic = p.topic || TP.big;
      });
    }
  });
  P.sections.forEach((s) => (s.questions || []).forEach((q) => allQ.push(q)));

  /* ---------- 计分 ---------- */
  const OBJ_KINDS = ['cloze', 'reading', 'newtype'];
  const qMeta = {};
  let objFull = 0;
  P.sections.forEach((s) => {
    const qs = s.questions || [];
    const per = qs.length ? (s.points || 0) / qs.length : 0;
    const isObj = OBJ_KINDS.indexOf(s.kind) >= 0;
    if (isObj) objFull += s.points || 0;
    qs.forEach((q) => {
      qMeta[q.n] = { sec: s.id, kind: s.kind, per, obj: isObj, answer: q.answer };
    });
  });
  const fmtScore = (v) => (Math.abs(v - Math.round(v)) < 0.05 ? String(Math.round(v)) : v.toFixed(1));

  function scoreStat() {
    let done = 0, right = 0, score = 0, objDone = 0;
    const bySec = {};
    P.sections.forEach((s) => {
      bySec[s.id] = { title: s.nav || s.title, kind: s.kind, points: s.points || 0, n: (s.questions || []).length, done: 0, right: 0, score: 0 };
    });
    allQ.forEach((q) => {
      const m = qMeta[q.n];
      const pick = picks[q.n];
      if (!m) return;
      const sub = !!submittedSec[m.sec];      // 只统计已提交的题型
      if (pick && sub) { done++; bySec[m.sec].done++; if (m.obj) objDone++; }
      if (m.obj && sub && pick && pick === m.answer) {
        right++; score += m.per;
        bySec[m.sec].right++;
        bySec[m.sec].score += m.per;
      }
    });
    return { done, right, score, objDone, bySec };
  }

  /* ---------- 渲染 ---------- */
  const diffBadge = (q) =>
    q.diff ? `<span class="q-diff" data-d="${esc(q.diff)}" title="难度标注">${esc(q.diff)}</span>` : '';
  const rateBadge = (q) => (q.rate ? `<span class="q-rate">正确率 ${q.rate}%</span>` : '');
  const solLink = (q) =>
    q.solPage && P.sol ? `<a class="q-sol" href="${P.sol}#page=${q.solPage}" target="_blank" rel="noopener">解析 p.${q.solPage}</a>` : '';

  function optsHtml(q) {
    const opts = q.options || [];
    /* 选项本身就是字母（新题型 A–G）时只显示字母键，不再重复文本 */
    const letterOpts = opts.length > 2 && opts.every((o) => /^[A-H]$/.test(o));
    const isTF = opts.length === 2 && /^[TF]$/.test(q.answer || '');
    const labels = q.labels || (letterOpts ? opts : isTF ? ['T', 'F'] : 'ABCD');
    const texts = letterOpts ? opts.map(() => '') : isTF ? ['True', 'False'] : opts;
    return `<div class="opts${letterOpts ? ' letter-opts' : ''}">${texts
      .map((t, i) => `<div class="opt" data-n="${q.n}" data-k="${labels[i]}"><span class="k">${labels[i]}</span>${t ? `<span>${esc(t)}</span>` : ''}</div>`)
      .join('')}</div>`;
  }

  function qHtml(q, extra) {
    const hasAns = !!(q.answer || q.ref);
    const ansBtn = hasAns ? `<button class="q-ans" type="button" data-n="${q.n}">答案</button>` : '';
    const ansVal = q.answer ? `<span class="q-ansval">答案 <b>${esc(q.answer)}</b></span>` : '';
    return `<div class="q${extra || ''}" id="q-${q.n}" data-n="${q.n}">
      <div class="q-top"><span class="q-num">${q.n}</span>${diffBadge(q)}${ansVal}${rateBadge(q)}<span class="q-verdict"></span><span class="q-tools">${ansBtn}${solLink(q)}</span></div>
      ${q.stem ? `<p class="q-stem">${esc(q.stem)}</p>` : ''}
      ${optsHtml(q)}
      ${q.note ? `<div class="q-note"><b>订正</b> ${esc(q.note)}</div>` : ''}
      ${q.ref ? `<div class="q-ref"><b>参考译文</b>${esc(q.ref)}</div>` : ''}
    </div>`;
  }

  /* 译文按段落紧跟在对应英文段落下面，展开时一段一段对照，不会把文章顶到看不见 */
  function zhParaHtml(zh) {
    if (!zh) return '';
    // 译文里的 {{41}} / [[41]] 是原文空位，渲染成小徽标
    const body = esc(zh).replace(/\{\{(\d+)\}\}|\[\[\s*(\d+)\s*\]\]/g, (_, a, b) => `<span class="zh-blank">${a || b}</span>`);
    return `<div class="zh">${body}</div>`;
  }

  function parasHtml(paras) {
    return (paras || [])
      .map((p) => {
        const raw = String(p.en || '');
        // 段落排序题的空位独占一行（整段就是 {{41}}），标成 slot-line 便于放大居中
        const solo = /^\s*\{\{\d+\}\}\s*$/.test(raw);
        const en = esc(raw).replace(/\{\{(\d+)\}\}/g, (_, n) => `<span class="blank" data-n="${n}">${n}</span>`);
        return `<p${solo ? ' class="slot-line"' : ''}>${en}</p>${zhParaHtml(p.zh)}`;
      })
      .join('');
  }

  /* 翻译：把要译的句子在原文里划出来（和试卷一样），不再重复列句子 */
  const normEn = (t) => String(t || '').replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
  function markSentences(paras, qs) {
    const list = qs.map((q) => ({ n: q.n, s: String(q.stem || '').trim() })).filter((x) => x.s.length > 20);
    const rxOf = (s) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'), 'i');
    return (paras || [])
      .map((p) => {
        // {{46}} 占位符在划线方案下不需要，先去干净；再用哨兵标记命中句，最后统一转义成 <u>
        let raw = String(p.en || '').replace(/\{\{\d+\}\}/g, '').replace(/\s{2,}/g, ' ');
        list.forEach(({ n, s }) => {
          if (raw.indexOf(`\u0000${n}\u0000`) >= 0) return;
          const m = raw.match(rxOf(s));
          if (m) raw = raw.slice(0, m.index) + `\u0000${n}\u0000` + m[0] + '\u0001' + raw.slice(m.index + m[0].length);
        });
        let html = esc(raw)
          .replace(/\u0000(\d+)\u0000/g, '<u class="tr-u" data-n="$1">')
          .replace(/\u0001/g, '</u>')
          .replace(/(<u class="tr-u" data-n="(\d+)">)([\s\S]*?)<\/u>/g, (_, a, n, body) => `${a}${body}<sup>${n}</sup></u>`);
        return `<p>${html}</p>`;
      })
      .join('');
  }

  function trHtml(q) {
    return `<div class="q q-tr" id="q-${q.n}" data-n="${q.n}">
      <div class="q-top">
        <span class="q-num">${q.n}</span>
        <span class="tr-hint">划线句翻译</span>
        <span class="q-tools">${q.ref ? `<button class="q-ans" type="button" data-n="${q.n}">参考译文</button>` : ''}</span>
      </div>
      ${q.ref ? `<div class="q-ref"><b>参考译文</b>${esc(q.ref)}</div>` : ''}
    </div>`;
  }

  function secHead(s) {
    // 翻译板块本身就有逐句参考译文，不再重复挂「全文译文」
    const hasZh = s.kind !== 'translation' && (s.paras || []).some((p) => p && p.zh);
    return `<div class="sec-head">
      <span class="lbl">${esc(s.label || '')}</span>
      <h2>${esc(s.title)}</h2>
      ${hasZh ? '<button class="sec-btn sec-tr" type="button" data-tr="1" aria-expanded="false">全文译文</button>' : ''}
      ${s.points ? `<span class="pts">${s.points} 分</span>` : ''}
    </div>
    ${s.topic ? `<p class="sec-topic"><b>主题</b>${esc(s.topic)}</p>` : ''}`;
  }

  /* 段落排序题：左栏通读全部段落（A–H 全文），右栏只放试卷上的排列顺序
     （41 · [A] · 42 · [E] · 43 · [H] · 44 · 45）——点空框就地展开 A–H，
     不用在「原文空位」和「右侧答题卡」之间来回找 */
  function orderBody(s) {
    const items = s.items || [];
    const qs = s.questions || [];
    const bare = (x) => String(x || '').replace(/^\[[A-H]\]\s*/, '').replace(/\s+/g, ' ').trim();
    /* 已给定位置的段落，很多年没写 [X] 前缀，就按正文前 36 字回查选项库取字母 */
    const keyOf = (txt) => {
      const probe = bare(txt).slice(0, 36);
      const hit = items.find((it) => bare(it.text).slice(0, 36) === probe);
      if (hit) return hit.key;
      const m = String(txt).match(/^\[([A-H])\]/);
      return m ? m[1] : '';
    };
    const given = new Set();
    const rows = (s.paras || [])
      .map((p) => {
        const raw = String(p.en || '').trim();
        const slot = /^\{\{(\d+)\}\}$/.exec(raw);
        if (!slot) {
          const k = keyOf(raw);
          if (k) given.add(k);
          return `<li class="seq-given"><b class="seq-k">${esc(k || '·')}</b><span class="seq-tag">试卷已给定</span></li>`;
        }
        const n = slot[1];
        const q = qs.find((x) => String(x.n) === n) || {};
        const keys = q.options && q.options.length ? q.options : items.map((it) => it.key);
        return `<li class="seq-slot" data-n="${esc(n)}">
          <button class="seq-row" type="button" aria-expanded="false">
            <span class="seq-n">${esc(n)}</span>
            <span class="blank" data-n="${esc(n)}">${esc(n)}</span>
            ${q.diff ? `<span class="q-diff" data-d="${esc(q.diff)}">${esc(q.diff)}</span>` : ''}
            <span class="seq-caret" aria-hidden="true">选</span>
          </button>
          <div class="seq-picks">${keys
            .map((k) => `<span class="opt seq-pick" data-n="${esc(n)}" data-k="${esc(k)}"><span class="k">${esc(k)}</span></span>`)
            .join('')}</div>
        </li>`;
      })
      .join('');
    const itemHtml = items
      .map((it) => {
        const on = given.has(it.key);
        return `<div class="item${on ? ' is-given' : ''}" data-k="${esc(it.key)}"><b class="k">${esc(it.key)}</b><span class="item-txt">${esc(it.text)}</span>${on ? '<span class="item-tag">已给定</span>' : ''}</div>`;
      })
      .join('');
    const lastPage = qs.reduce((a, q) => (q.solPage && (!a || q.solPage < a) ? q.solPage : a), 0);
    return `<div class="nt nt-order">
      <div class="nt-main">
        <div class="nt-opts nt-opts-wide">
          <h3>选项 A–${esc((items.slice(-1)[0] || {}).key || 'G')} · 段落顺序是打乱的</h3>
          ${itemHtml}
        </div>
      </div>
      <aside class="nt-side">
        <div class="nt-sheet">
          <div class="nt-sheet-head">
            <h3>试卷顺序</h3>
            ${lastPage ? `<a class="q-sol" href="${P.sol}#page=${lastPage}" target="_blank" rel="noopener">解析 p.${lastPage}</a>` : ''}
          </div>
          <ol class="nt-seq">${rows}</ol>
          <p class="nt-sheet-tip">点方框就地选字母；标「试卷已给定」的是原卷上已经排好的段落，不用作答。</p>
        </div>
      </aside>
    </div>`;
  }

  function renderSection(s) {
    let body = '';
    if (s.kind === 'cloze') {
      body = `<div class="duo cloze">
        <div class="passage">${parasHtml(s.paras)}</div>
        <div class="qcol cloze-grid">${(s.questions || []).map((q) => qHtml(q)).join('')}</div>
      </div>`;
    } else if (s.kind === 'reading') {
      body = `<div class="duo">
        <div class="passage">${s.source ? `<p class="src">${esc(s.source)}</p>` : ''}${parasHtml(s.paras)}</div>
        <div class="qcol sticky">${(s.questions || []).map((q) => qHtml(q)).join('')}</div>
      </div>`;
    } else if (s.kind === 'newtype') {
      const items = (s.items || [])
        .map((it) => `<div class="item" data-k="${esc(it.key)}"><b class="k">${esc(it.key)}</b>${esc(it.text)}</div>`)
        .join('');
      // 按题型给容器加类：排序 / 小标题 / 七选五 的答题框大小分别适配
      const t = s.title || '';
      const ntCls = /排序/.test(t) ? ' nt-order'
        : /小标题/.test(t) ? ' nt-head'
        : /七选五/.test(t) ? ' nt-insert' : ' nt-match';
      // 正误判断（T/F）的陈述句较长，单独给一个类，作答卡里字号收小
      const isTF = (s.questions || []).some((q) => (q.options || []).join('') === 'TF');
      if (ntCls === ' nt-order') {
        // 排序题：段落本身就是选项，左栏通读全部段落，右栏只留试卷上的排列顺序
        body = orderBody(s);
      } else {
        // 左文右栏：右边是作答卡 + 选项库，随页面滚动固定在视口内，文章再长也能对照
        body = `<div class="nt${ntCls}${isTF ? ' nt-tf' : ''}">
        <div class="nt-main">
          <div class="passage nt-passage">${parasHtml(s.paras)}</div>
        </div>
        <aside class="nt-side">
          <div class="nt-answers">${(s.questions || []).map((q) => qHtml(q, ' q-nt')).join('')}</div>
          ${items ? `<div class="nt-opts"><h3>选项 A–${esc((s.items || []).slice(-1)[0].key || 'G')}</h3>${items}</div>` : ''}
        </aside>
      </div>`;
      }
    } else if (s.kind === 'translation') {
      const qs = s.questions || [];
      const multi = qs.filter((q) => q.stem && q.stem.length > 20).length > 1;
      // 整段翻译（英语二）只有一张作答卡，右侧栏会空着，退回单栏更像试卷
      body = `<div class="tr${multi ? '' : ' tr-solo'}">
        <div class="tr-main">
          <div class="passage tr-passage">
            ${s.source ? `<p class="src">${esc(s.source)}</p>` : ''}
            ${multi ? markSentences(s.paras, qs) : parasHtml(s.paras)}
          </div>
        </div>
        <aside class="tr-side">
          <div class="tr-qs">
            ${multi ? qs.map(trHtml).join('') : qs.map((q) => `<div class="q q-tr" id="q-${q.n}" data-n="${q.n}">
                <div class="q-top"><span class="q-num">${q.n}</span><span class="tr-hint">整段翻译</span>
                <span class="q-tools">${q.ref ? `<button class="q-ans" type="button" data-n="${q.n}">参考译文</button>` : ''}</span></div>
                ${q.ref ? `<div class="q-ref"><b>参考译文</b>${esc(q.ref)}</div>` : ''}
              </div>`).join('')}
          </div>
        </aside>
      </div>`;
    } else if (s.kind === 'writing') {
      const ES = (window.__ESSAYS__ || {})[P.id] || {};
      body = (s.parts || [])
        .map((p) => {
          const isBig = /Part\s*B|大作文/.test(p.label || '');
          const fig = isBig
            ? `<div class="wfig-wrap"><img class="wfig" src="/exam/figs/writing/${esc(P.id)}.png" alt="${esc(P.title)} 作文配图" loading="lazy" onerror="this.parentNode.remove()"></div>`
            : '';
          const model = ES[isBig ? 'big' : 'small'] || '';
          const nWords = model ? model.trim().split(/\s+/).length : 0;
          const modelBlock = model
            ? `<div class="w-model">
            <button class="w-model-btn" type="button" aria-expanded="false">参考范文<span>约 ${nWords} 词</span></button>
            <div class="w-model-body" hidden>${model
              .split(/\n{2,}/)
              .map((para) => `<p>${esc(para).replace(/\n/g, '<br>')}</p>`)
              .join('')}</div>
          </div>`
            : '';
          return `<div class="wcard">
          <h3>${esc(p.label)} <span class="pts">${p.points || ''} 分</span></h3>
          ${p.topic ? `<p class="w-topic"><b>主题</b>${esc(p.topic)}</p>` : ''}
          ${(p.direction || []).map((d) => `<p class="${/^[A-Za-z]/.test(d) ? 'en' : ''}">${esc(d)}</p>`).join('')}
          ${fig}
          ${modelBlock}
        </div>`;
        })
        .join('');
    } else if (s.kind === 'text') {
      body = `<div class="wcard">${(s.paras || []).map((p) => `<p>${esc(p.en)}</p>`).join('')}</div>`;
    }
    // 「提交本部分」紧跟在板块标题下方（和政治的提交按钮一致），板块再长也第一眼能看到
    const isObj = OBJ_KINDS.indexOf(s.kind) >= 0 && (s.questions || []).length > 0;
    const secSubmit = isObj
      ? `<button class="sec-submit" type="button" data-sec="${esc(s.id)}" disabled>提交本部分</button>`
      : '';
    return `<section class="sec" id="sec-${esc(s.id)}">
      ${secHead(s)}
      ${secSubmit}
      ${s.direction ? `<div class="direction">${esc(s.direction)}</div>` : ''}
      ${body}
    </section>`;
  }

  const navItems = P.sections.map((s) => `<a href="#sec-${esc(s.id)}" data-sec="${esc(s.id)}">${esc(s.nav || s.title)}</a>`).join('');

  /* 原卷 PDF：由解析 PDF 的文件名推出（y1-2021-sol.pdf → y1-2021-paper.pdf） */
  function paperPdf(p) {
    return p && p.sol ? String(p.sol).replace(/-sol\.pdf$/, '-paper.pdf') : '';
  }

  /* ---------- 试卷切换器 ---------- */
  const PAPERS = window.__PAPERS__ || [];
  const curSet = (/-(y[12])$/.exec(P.id) || [, 'y1'])[1];

  const root = $('#paper');
  root.innerHTML = `
    <div class="paper-head">
      <div class="ph-line">
        <div>
          <p class="kicker">${esc(P.kicker || '')}</p>
          <h1 class="ph-title">${esc(P.title)}</h1>
        </div>
        <div class="ph-meta">
          ${(P.meta || []).map((m) => `<span class="chip">${esc(m)}</span>`).join('')}
          ${paperPdf(P) ? `<a class="chip gold" href="${paperPdf(P)}" download>原卷 PDF ↓</a>` : ''}
          ${P.sol ? `<a class="chip gold" href="${P.sol}" target="_blank" rel="noopener">原卷解析 PDF ↗</a>` : ''}
        </div>
      </div>
      <div class="ph-actions" style="margin-top:10px">
        <button class="btn" id="btnZh">显示译文</button>
        <button class="btn" id="btnAns">显示答案</button>
        <button class="btn" id="btnStat">统计</button>
        <button class="btn" id="btnClear">清空作答</button>
      </div>
      ${P.note ? `<p class="paper-note">${esc(P.note)}</p>` : ''}
    </div>
    <nav class="sec-nav" id="secNav">${navItems}</nav>
    <div class="paper-body">${P.sections.map(renderSection).join('')}</div>
    <div class="scorebar" id="scorebar">
      <span>已提交 <b id="scDone">0</b>/<span id="scAll">0</span></span>
      <span class="sb-score">客观题 <b id="scScore">0</b>/<span id="scFull">${fmtScore(objFull)}</span> 分</span>
      <span id="scPct" class="sb-pct"></span>
    </div>
    <div class="stat-mask" id="statMask" hidden>
      <div class="stat-panel" role="dialog" aria-modal="true" aria-label="本卷统计">
        <div class="stat-head">
          <h3>${esc(P.title)} · 作答统计</h3>
          <button class="stat-close" type="button" id="statClose" aria-label="关闭">×</button>
        </div>
        <div class="stat-body" id="statBody"></div>
      </div>
    </div>
  `;

  /* ---------- 交互 ---------- */
  const btnZh = $('#btnZh'), btnAns = $('#btnAns'), btnClear = $('#btnClear');
  const psToggle = $('#psToggle'), psMenu = $('#psMenu');
  if (psToggle && psMenu) {
    const closePs = () => {
      psMenu.hidden = true;
      psToggle.setAttribute('aria-expanded', 'false');
    };
    psToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = psMenu.hidden;
      psMenu.hidden = !open;
      psToggle.setAttribute('aria-expanded', String(open));
    });
    psMenu.addEventListener('click', (e) => {
      const tab = e.target.closest('.ps-tab');
      if (tab) {
        $$('.ps-tab', psMenu).forEach((t) => t.classList.toggle('on', t === tab));
        $$('.ps-years', psMenu).forEach((g) => {
          g.hidden = g.dataset.set !== tab.dataset.set;
        });
        e.stopPropagation();
        return;
      }
      if (e.target.closest('.ps-yr')) closePs();
    });
    document.addEventListener('click', () => { if (!psMenu.hidden) closePs(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePs(); });
  }
  btnZh.addEventListener('click', () => {
    const on = document.body.classList.toggle('show-zh');
    btnZh.classList.toggle('on', on);
    btnZh.textContent = on ? '隐藏译文' : '显示译文';
  });
  btnAns.addEventListener('click', () => {
    const on = document.body.classList.toggle('show-ans');
    btnAns.classList.toggle('on', on);
    btnAns.textContent = on ? '隐藏答案' : '显示答案';
    $$('.q').forEach((el) => el.classList.remove('revealed'));
    paint();
  });
  btnClear.addEventListener('click', () => {
    if (!Object.keys(picks).length) return;
    if (!confirm('清空本卷的作答记录？')) return;
    picks = {};
    submittedSec = {};
    save();
    paint();
  });

  function syncAnsText(el) {
    const b = $('.q-ans', el);
    if (!b) return;
    const on = el.classList.contains('revealed') || document.body.classList.contains('show-ans');
    b.textContent = on ? '收起' : '答案';
  }

  function paint() {
    const allRevealed = document.body.classList.contains('show-ans');
    let done = 0, right = 0;
    $$('.q').forEach((el) => {
      const n = el.dataset.n;
      const q = allQ.find((x) => String(x.n) === n);
      if (!q) return;
      const m = qMeta[n];
      const sub = !!(m && submittedSec[m.sec]);
      const revealed = allRevealed || sub || el.classList.contains('revealed');
      syncAnsText(el);
      const pick = picks[n];
      if (pick && sub) done++;
      $$('.opt', el).forEach((o) => {
        const k = o.dataset.k;
        o.classList.toggle('pick', !revealed && pick === k);
        o.classList.toggle('right', revealed && q.answer === k);
        o.classList.toggle('wrong', revealed && pick === k && q.answer !== k);
      });
      if (revealed && pick && pick === q.answer) right++;
      el.classList.toggle('ok', revealed && pick === q.answer);
      el.classList.toggle('submitted', sub);
      const vd = $('.q-verdict', el);
      if (vd) {
        vd.className = 'q-verdict' + (sub && q.answer ? (pick === q.answer ? ' ok' : ' bad') : '');
        vd.textContent = sub && q.answer && pick ? (pick === q.answer ? '正确' : '答错') : '';
      }
    });
    /* 题型级提交按钮状态 */
    $$('.sec-submit').forEach((b) => {
      const secId = b.dataset.sec;
      const qs = allQ.filter((q) => qMeta[q.n] && qMeta[q.n].sec === secId && qMeta[q.n].obj);
      if (!qs.length) { b.hidden = true; return; }
      const isSub = !!submittedSec[secId];
      const ready = qs.filter((q) => picks[q.n]).length;
      const got = qs.reduce((a, q) => a + (picks[q.n] === qMeta[q.n].answer ? qMeta[q.n].per : 0), 0);
      const full = qs.reduce((a, q) => a + qMeta[q.n].per, 0);
      b.classList.toggle('done', isSub);
      b.disabled = !isSub && !ready;
      b.textContent = isSub
        ? `已提交 · ${fmtScore(got)} / ${fmtScore(full)} 分 · 点此重做`
        : (ready ? `提交本部分（已答 ${ready}/${qs.length}）` : '提交本部分');
    });
    $$('.blank').forEach((b) => {
      const n = b.dataset.n;
      const p = picks[n];
      const m = qMeta[n];
      const sub = !!(m && submittedSec[m.sec]);
      /* 排序题的方框就是答题卡：提交/显示答案后没填的空直接把正解填进去 */
      const sheet = b.closest('.nt-sheet');
      const showAns = !!sheet && !p && m && (allRevealed || sub) ? m.answer : '';
      b.classList.toggle('done', !!p && !(sub && p !== m.answer));
      b.classList.toggle('mark', !!(sub && p && p !== m.answer));
      b.classList.toggle('ans', !!showAns);
      b.textContent = p || showAns || (sheet ? '—' : n);
    });
    /* 排序题方框展开的字母条，状态跟作答卡保持一致 */
    $$('.seq-pick').forEach((o) => {
      const n = o.dataset.n, k = o.dataset.k, m = qMeta[n];
      if (!m) return;
      const p = picks[n];
      const rev = allRevealed || !!submittedSec[m.sec];
      o.classList.toggle('pick', !rev && p === k);
      o.classList.toggle('right', rev && m.answer === k);
      o.classList.toggle('wrong', rev && p === k && m.answer !== k);
    });
    const st = scoreStat();
    $('#scDone').textContent = String(st.done);
    $('#scAll').textContent = String(allQ.length);
    $('#scScore').textContent = fmtScore(st.score);
    const pct = st.objDone ? Math.round((st.right / st.objDone) * 100) : 0;
    $('#scPct').textContent = st.objDone ? `正确率 ${pct}%` : '';
    $('#scPct').className = 'sb-pct' + (st.objDone ? (pct >= 60 ? ' good' : ' bad') : '');
    document.body.classList.add('show-score');
    try {
      localStorage.setItem(
        'kaoyan-exam-sum:' + P.id,
        JSON.stringify({ id: P.id, title: P.title, score: st.score, full: objFull, right: st.right, objDone: st.objDone, done: st.done, total: allQ.length, t: Date.now() })
      );
    } catch (e) {}
    if (statMask && !statMask.hidden) renderStat();
  }

  /* ---------- 统计面板 ---------- */
  const statMask = $('#statMask'), statBody = $('#statBody');
  const SEC_NAME = {
    cloze: '完形填空', reading: '阅读理解', newtype: '新题型',
    translation: '翻译（主观）', writing: '写作（主观）',
  };
  function renderStat() {
    const st = scoreStat();
    const rows = P.sections
      .filter((s) => (s.questions || []).length)
      .map((s) => {
        const d = st.bySec[s.id];
        const isObj = OBJ_KINDS.indexOf(s.kind) >= 0;
        const rate = d.done ? Math.round((d.right / d.done) * 100) : 0;
        const label = s.kind === 'reading' ? s.nav || '阅读' : SEC_NAME[s.kind] || s.nav || d.title;
        return `<tr>
          <td>${esc(label)}</td>
          <td class="num">${d.n}</td>
          <td class="num">${d.done}</td>
          <td class="num">${isObj ? d.right : '—'}</td>
          <td class="num">${isObj ? `${fmtScore(d.score)} / ${fmtScore(d.points)}` : '—'}</td>
          <td class="num">${isObj && d.done ? rate + '%' : '—'}</td>
        </tr>`;
      })
      .join('');
    const pct = st.objDone ? Math.round((st.right / st.objDone) * 100) : 0;
    statBody.innerHTML = `
      <div class="stat-kpi">
        <div><span>客观题得分</span><b>${fmtScore(st.score)}<i> / ${fmtScore(objFull)}</i></b></div>
        <div><span>已答</span><b>${st.done}<i> / ${allQ.length}</i></b></div>
        <div><span>正确率</span><b class="${pct >= 60 ? 'good' : 'bad'}">${st.objDone ? pct + '%' : '—'}</b></div>
      </div>
      <table class="stat-table">
        <thead><tr><th>题型</th><th>题数</th><th>已提交</th><th>正确</th><th>得分</th><th>正确率</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="stat-tip">完形、阅读、新题型做完后点各部分的「提交本部分」，才会判对错并计分；翻译与写作属主观题，需自行估分。作答记录保存在本机浏览器。</p>`;
  }
  const btnStat = $('#btnStat');
  if (btnStat) {
    btnStat.addEventListener('click', () => {
      renderStat();
      statMask.hidden = false;
    });
    statMask.addEventListener('click', (e) => {
      if (e.target === statMask || e.target.closest('#statClose')) statMask.hidden = true;
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') statMask.hidden = true;
    });
  }

  root.addEventListener('click', (e) => {
    /* 点原文里的划线句 → 高亮并展开右侧对应的作答卡 */
    const trU = e.target.closest('.tr-u');
    if (trU) {
      const card = document.getElementById(`q-${trU.dataset.n}`);
      if (!card) return;
      $$('.tr-u.on').forEach((x) => x.classList.remove('on'));
      $$('.q-tr.focus').forEach((x) => x.classList.remove('focus'));
      trU.classList.add('on');
      card.classList.add('focus', 'revealed');
      const side = card.closest('.tr-side');
      if (side && side.scrollHeight > side.clientHeight) {
        side.scrollTo({ top: Math.max(0, card.offsetTop - 8), behavior: 'smooth' });
      } else {
        card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      return;
    }
    const modelBtn = e.target.closest('.w-model-btn');
    if (modelBtn) {
      const box = modelBtn.closest('.w-model');
      const bodyEl = box.querySelector('.w-model-body');
      const open = bodyEl.hidden;
      bodyEl.hidden = !open;
      modelBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      modelBtn.classList.toggle('on', open);
      return;
    }
    const trBtn = e.target.closest('[data-tr]');
    if (trBtn) {
      const sec = trBtn.closest('.sec');
      if (!sec || !sec.querySelector('.passage .zh')) return;
      const on = !sec.classList.contains('show-tr');
      sec.classList.toggle('show-tr', on);
      trBtn.classList.toggle('on', on);
      trBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
      trBtn.textContent = on ? '收起译文' : '全文译文';
      return;
    }
    const ansBtn = e.target.closest('.q-ans');
    if (ansBtn) {
      ansBtn.closest('.q').classList.toggle('revealed');
      paint();
      return;
    }
    const secBtn = e.target.closest('.sec-submit');
    if (secBtn) {
      const secId = secBtn.dataset.sec;
      if (submittedSec[secId]) {
        if (!confirm('重做本部分？这一部分已选的答案会清空。')) return;
        allQ.forEach((q) => {
          const m = qMeta[q.n];
          if (m && m.sec === secId) delete picks[q.n];
        });
        delete submittedSec[secId];
      } else {
        submittedSec[secId] = true;
      }
      save();
      paint();
      return;
    }
    const opt = e.target.closest('.opt');
    if (opt && !document.body.classList.contains('show-ans')) {
      const card = opt.closest('.q');
      if (card && card.classList.contains('revealed')) return;
      const n = opt.dataset.n;
      const m = qMeta[n];
      if (m && submittedSec[m.sec]) return;   // 已提交的题型锁定，先点「重做」
      if (picks[n] === opt.dataset.k) delete picks[n];
      else picks[n] = opt.dataset.k;
      save();
      paint();
      // 排序题选完就把字母条收起来，视线回到顺序条
      const slot = opt.closest('.seq-slot');
      if (slot) {
        slot.classList.remove('open');
        const row = slot.querySelector('.seq-row');
        if (row) row.setAttribute('aria-expanded', 'false');
      }
      return;
    }
    /* 排序题：点顺序条上的空框，就地展开 A–H */
    const seqRow = e.target.closest('.seq-row');
    if (seqRow) {
      const slot = seqRow.closest('.seq-slot');
      const open = !slot.classList.contains('open');
      $$('.seq-slot.open').forEach((x) => {
        x.classList.remove('open');
        const r = x.querySelector('.seq-row');
        if (r) r.setAttribute('aria-expanded', 'false');
      });
      slot.classList.toggle('open', open);
      seqRow.setAttribute('aria-expanded', String(open));
      return;
    }
    const blank = e.target.closest('.blank');
    if (blank) {
      const el = document.getElementById('q-' + blank.dataset.n);
      if (el) {
        $$('.q').forEach((q) => q.classList.remove('focus'));
        el.classList.add('focus');
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  });

  /* 小节导航高亮 */
  const nav = $('#secNav');
  const secEls = $$('.sec');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          $$('a', nav).forEach((a) => a.classList.toggle('on', a.dataset.sec === en.target.id.slice(4)));
        }
      },
      { rootMargin: '-15% 0px -70% 0px' }
    );
    secEls.forEach((el) => io.observe(el));
  }

  paint();

  /* ---------- 深链：#sec-text2 / #q-31 ---------- */
  function jumpToHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h) return;
    const el = document.getElementById(h);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
  }
  jumpToHash();
  window.addEventListener('hashchange', jumpToHash);
})();
