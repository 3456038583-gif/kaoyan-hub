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
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify({ picks, t: Date.now() })); } catch (e) {}
  };

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
      if (pick) { done++; bySec[m.sec].done++; if (m.obj) objDone++; }
      if (m.obj && pick && pick === m.answer) {
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
      <div class="q-top"><span class="q-num">${q.n}</span>${diffBadge(q)}${ansVal}${rateBadge(q)}<span class="q-tools">${ansBtn}${solLink(q)}</span></div>
      ${q.stem ? `<p class="q-stem">${esc(q.stem)}</p>` : ''}
      ${optsHtml(q)}
      ${q.ref ? `<div class="q-ref"><b>参考译文</b>${esc(q.ref)}</div>` : ''}
    </div>`;
  }

  function parasHtml(paras) {
    return (paras || [])
      .map((p) => {
        const en = esc(p.en).replace(/\{\{(\d+)\}\}/g, (_, n) => `<span class="blank" data-n="${n}">${n}</span>`);
        return `<p>${en}</p>${p.zh ? `<div class="zh">${esc(p.zh)}</div>` : ''}`;
      })
      .join('');
  }

  function secHead(s) {
    const hasZh = s.kind === 'translation' && (s.paras || []).some((p) => p.zh);
    return `<div class="sec-head">
      <span class="lbl">${esc(s.label || '')}</span>
      <h2>${esc(s.title)}</h2>
      ${hasZh ? '<button class="sec-btn" type="button" data-tr="1">全文译文</button>' : ''}
      ${s.points ? `<span class="pts">${s.points} 分</span>` : ''}
    </div>
    ${s.topic ? `<p class="sec-topic"><b>主题</b>${esc(s.topic)}</p>` : ''}`;
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
        .map((it) => `<div class="item" data-k="${esc(it.key)}"><span class="k">[${esc(it.key)}]</span>${esc(it.text)}</div>`)
        .join('');
      body = `<div class="duo newtype">
        <div class="passage">${parasHtml(s.paras)}</div>
        <div class="qcol">
          ${(s.questions || []).map((q) => qHtml(q)).join('')}
          <div class="items">${items}</div>
        </div>
      </div>`;
    } else if (s.kind === 'translation') {
      body = `<div class="duo">
        <div class="passage">${parasHtml(s.paras)}</div>
        <div class="qcol sticky">${(s.questions || []).map((q) => qHtml(q)).join('')}</div>
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
    return `<section class="sec" id="sec-${esc(s.id)}">
      ${secHead(s)}
      ${s.direction ? `<div class="direction">${esc(s.direction)}</div>` : ''}
      ${body}
    </section>`;
  }

  const navItems = P.sections.map((s) => `<a href="#sec-${esc(s.id)}" data-sec="${esc(s.id)}">${esc(s.nav || s.title)}</a>`).join('');

  /* ---------- 试卷切换器 ---------- */
  const PAPERS = window.__PAPERS__ || [];
  const curSet = (/-(y[12])$/.exec(P.id) || [, 'y1'])[1];

  function switchHtml() {
    const sets = ['y1', 'y2'].filter((s) => PAPERS.some((p) => p.s === s));
    if (!sets.length) return '';
    const tabs = sets
      .map(
        (s) =>
          `<button class="ps-tab${s === curSet ? ' on' : ''}" type="button" data-set="${s}">${
            s === 'y2' ? '英语（二）' : '英语（一）'
          }</button>`
      )
      .join('');
    const groups = sets
      .map((s) => {
        const chips = PAPERS.filter((p) => p.s === s)
          .map((p) => `<a class="ps-yr${p.id === P.id ? ' on' : ''}" href="/exam/${esc(p.id)}">${p.y}</a>`)
          .join('');
        return `<div class="ps-years" data-set="${s}"${s === curSet ? '' : ' hidden'}>${chips}</div>`;
      })
      .join('');
    return `<span class="ps-wrap">
          <a class="btn" href="/exam/">← 全部试卷</a>
          <button class="btn ps-toggle" type="button" id="psToggle" aria-expanded="false" aria-haspopup="true">切换试卷 ▾</button>
          <div class="ps-menu" id="psMenu" hidden>
            <div class="ps-tabs">${tabs}</div>
            ${groups}
          </div>
        </span>
        <span class="ph-sep"></span>`;
  }

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
          ${P.sol ? `<a class="chip gold" href="${P.sol}" target="_blank" rel="noopener">原卷解析 PDF ↗</a>` : ''}
        </div>
      </div>
      <div class="ph-actions" style="margin-top:10px">
        ${switchHtml()}
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
      <span>已答 <b id="scDone">0</b>/<span id="scAll">0</span></span>
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
      const revealed = allRevealed || el.classList.contains('revealed');
      syncAnsText(el);
      const pick = picks[n];
      if (pick) done++;
      $$('.opt', el).forEach((o) => {
        const k = o.dataset.k;
        o.classList.toggle('pick', !revealed && pick === k);
        o.classList.toggle('right', revealed && q.answer === k);
        o.classList.toggle('wrong', revealed && pick === k && q.answer !== k);
      });
      if (revealed && pick && pick === q.answer) right++;
      el.classList.toggle('ok', revealed && pick === q.answer);
    });
    $$('.blank').forEach((b) => {
      const p = picks[b.dataset.n];
      b.classList.toggle('done', !!p);
      b.textContent = p || b.dataset.n;
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
        <thead><tr><th>题型</th><th>题数</th><th>已答</th><th>正确</th><th>得分</th><th>正确率</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="stat-tip">客观题（完形、阅读、新题型）自动计分；翻译与写作属主观题，需自行估分。作答记录保存在本机浏览器。</p>`;
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
      const on = sec.classList.toggle('show-tr');
      trBtn.classList.toggle('on', on);
      trBtn.textContent = on ? '收起译文' : '全文译文';
      return;
    }
    const ansBtn = e.target.closest('.q-ans');
    if (ansBtn) {
      ansBtn.closest('.q').classList.toggle('revealed');
      paint();
      return;
    }
    const opt = e.target.closest('.opt');
    if (opt && !document.body.classList.contains('show-ans') && !opt.closest('.q').classList.contains('revealed')) {
      const n = opt.dataset.n;
      if (picks[n] === opt.dataset.k) delete picks[n];
      else picks[n] = opt.dataset.k;
      save();
      paint();
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
