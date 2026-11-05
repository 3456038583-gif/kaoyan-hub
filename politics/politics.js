/* 考研政治真题 · 逐题练习 */
(function () {
  const P = window.__PPAPER__;
  if (!P) return;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const KEY = 'kaoyan-politics:' + P.id;
  let store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { store = {}; }
  let picks = store.picks || {};
  let submitted = store.submitted || {};   // 已点「提交」的题号 → 才判对错、才计分
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify({ picks, submitted, t: Date.now() })); } catch (e) {}
  };

  /* 记住上次打开的年份：从数学/英语等板块切回来时直接回到这一年 */
  try {
    localStorage.setItem('kaoyanPolitics.position.v1', JSON.stringify({ y: Number(P.id) || Number(P.year) }));
  } catch (e) { /* 禁用存储时仅本次会话有效 */ }
  const isSub = (n) => !!submitted[n];

  /* ---------- 计分规则：单选 1 分/题，多选 2 分/题（全对才得分） ---------- */
  const PER = { single: 1, multi: 2 };
  const allQ = [];
  const qMeta = {};
  let objFull = 0;
  P.sections.forEach((s) => {
    const per = PER[s.kind] || 0;
    const qs = s.questions || [];
    if (per) objFull += per * qs.length;
    qs.forEach((q) => {
      allQ.push(q);
      qMeta[q.n] = { sec: s.id, kind: s.kind, per, answer: q.answer || '' };
    });
  });
  const objQ = allQ.filter((q) => qMeta[q.n].per);
  const fmt = (v) => (Math.abs(v - Math.round(v)) < 0.05 ? String(Math.round(v)) : v.toFixed(1));
  const sortPick = (s) => [...new Set(s.split(''))].sort().join('');

  function stat() {
    let done = 0, right = 0, score = 0, objDone = 0;
    const bySec = {};
    P.sections.forEach((s) => {
      bySec[s.id] = { n: (s.questions || []).length, per: PER[s.kind] || 0, done: 0, right: 0, score: 0 };
    });
    objQ.forEach((q) => {
      const m = qMeta[q.n];
      const pick = picks[q.n];
      if (!pick || !submitted[q.n]) return;      // 只统计已提交的题
      done++; objDone++; bySec[m.sec].done++;
      if (pick === m.answer) {
        right++; score += m.per; bySec[m.sec].right++; bySec[m.sec].score += m.per;
      }
    });
    return { done, right, score, objDone, bySec };
  }

  /* ---------- 渲染 ---------- */
  function qHtml(q, kind) {
    const showAns = !!q.answer;
    const opts = (q.options || []).map((t, i) => {
      const k = 'ABCD'[i];
      return `<div class="opt" data-n="${q.n}" data-k="${k}"><span class="k">${k}</span><span>${esc(t)}</span></div>`;
    }).join('');
    const multi = kind === 'multi';
    return `<div class="q${multi ? ' q-multi' : ''}" id="q-${q.n}" data-n="${q.n}" data-kind="${kind}">
      <div class="q-top">
        <span class="q-num">${q.n}</span>
        ${multi ? '<span class="q-tag">多选</span>' : ''}
        ${showAns ? `<span class="q-ansval">答案 <b>${esc(q.answer)}</b></span>` : ''}
        <span class="q-tools">${showAns ? `<button class="q-ans" type="button" data-n="${q.n}">答案</button>` : ''}</span>
      </div>
      ${q.stem ? `<p class="q-stem">${esc(q.stem)}</p>` : ''}
      <div class="opts">${opts}</div>
      <div class="q-foot">
        <button class="q-submit" type="button" data-n="${q.n}" disabled>提交</button>
        <button class="q-redo" type="button" data-n="${q.n}" hidden>重做</button>
        <span class="q-verdict"></span>
      </div>
    </div>`;
  }

  function essayHtml(q) {
    const paras = (q.paras || [q.stem || '']).map((p) => `<p>${esc(p)}</p>`).join('');
    const ans = (q.ans || []).map((p) => `<p>${esc(p)}</p>`).join('');
    const ansHtml = ans
      ? `<details class="essay-ans"><summary>参考答案</summary><div class="ea-body">${ans}</div></details>`
      : '';
    return `<div class="q q-essay" id="q-${q.n}" data-n="${q.n}">
      <div class="q-top"><span class="q-num">${q.n}</span><span class="q-tag">分析题 · 10 分</span></div>
      <div class="essay-body">${paras}</div>
      ${ansHtml}
    </div>`;
  }

  function secHead(s) {
    return `<div class="sec-head">
      <span class="lbl">${esc(s.label || '')}</span>
      <h2>${esc(s.title)}</h2>
      ${s.points ? `<span class="pts">${s.points} 分</span>` : ''}
    </div>`;
  }

  function renderSection(s) {
    const body = s.kind === 'essay'
      ? `<div class="q-list essay-list">${(s.questions || []).map(essayHtml).join('')}</div>`
      : `<div class="q-list">${(s.questions || []).map((q) => qHtml(q, s.kind)).join('')}</div>`;
    const secSubmit = s.kind === 'essay' ? ''
      : `<button class="sec-submit" type="button" data-sec="${esc(s.id)}" disabled>提交本部分</button>`;
    return `<section class="sec" id="sec-${esc(s.id)}">
      ${secHead(s)}${secSubmit}
      ${s.direction ? `<div class="direction">${esc(s.direction)}</div>` : ''}
      ${body}
    </section>`;
  }

  const navItems = P.sections.map((s) => `<a href="#sec-${esc(s.id)}" data-sec="${esc(s.id)}">${esc(s.nav || s.title)}</a>`).join('');
  const PAPERS = window.__PAPERS__ || [];

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
          ${P.paper ? `<a class="chip" href="${P.paper}" target="_blank" rel="noopener">原卷 PDF ↗</a>` : ''}
          ${P.sol ? `<a class="chip gold" href="${P.sol}" target="_blank" rel="noopener">答案与解析 PDF ↗</a>` : ''}
        </div>
      </div>
      <div class="ph-actions" style="margin-top:10px">
        <button class="btn" id="btnAns">显示答案</button>
        <button class="btn" id="btnStat">统计</button>
        <button class="btn" id="btnClear">清空作答</button>
      </div>
      <p class="paper-note">单选 1 分、多选 2 分（多选少选错选均不得分），客观题共 50 分。选好答案后点「提交」，才会判对错并计分；分析题的参考答案在题目下方点开。</p>
    </div>
    <nav class="sec-nav" id="secNav">${navItems}</nav>
    <div class="paper-body">${P.sections.map(renderSection).join('')}</div>
    <div class="scorebar" id="scorebar">
      <span>已提交 <b id="scDone">0</b>/<span id="scAll">0</span></span>
      <span class="sb-score">客观题 <b id="scScore">0</b>/<span id="scFull">${fmt(objFull)}</span> 分</span>
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

  const btnAns = $('#btnAns'), btnClear = $('#btnClear');
  const psToggle = $('#psToggle'), psMenu = $('#psMenu');
  if (psToggle && psMenu) {
    const closePs = () => { psMenu.hidden = true; psToggle.setAttribute('aria-expanded', 'false'); };
    psToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = psMenu.hidden;
      psMenu.hidden = !open;
      psToggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', () => { if (!psMenu.hidden) closePs(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePs(); });
  }

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
    submitted = {};
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
    $$('.q').forEach((el) => {
      const n = el.dataset.n;
      const m = qMeta[n];
      if (!m || !m.per) return;
      const sub = !!submitted[n];
      const revealed = allRevealed || el.classList.contains('revealed') || sub;
      syncAnsText(el);
      const pick = picks[n] || '';
      $$('.opt', el).forEach((o) => {
        const k = o.dataset.k;
        const mine = pick.indexOf(k) >= 0;
        o.classList.toggle('pick', mine && !revealed);
        o.classList.toggle('right', revealed && m.answer.indexOf(k) >= 0);
        o.classList.toggle('wrong', revealed && mine && m.answer.indexOf(k) < 0);
        o.classList.toggle('miss', revealed && !mine && m.answer.indexOf(k) >= 0);
      });
      el.classList.toggle('ok', revealed && pick && pick === m.answer);
      el.classList.toggle('has-pick', !!pick);
      el.classList.toggle('submitted', sub);
      const sb = $('.q-submit', el);
      if (sb) { sb.hidden = sub || !pick; sb.disabled = !pick || sub; }
      const rb = $('.q-redo', el);
      if (rb) rb.hidden = !sub;
      const vd = $('.q-verdict', el);
      if (vd) {
        vd.className = 'q-verdict' + (sub ? (pick === m.answer ? ' ok' : ' bad') : '');
        vd.textContent = sub
          ? (pick === m.answer ? `回答正确 +${m.per} 分` : `回答错误 · 正确答案 ${m.answer}`)
          : (pick ? '已选，点「提交」判分' : '');
      }
    });
    /* 各部分的「提交本部分」状态 */
    $$('.sec-submit').forEach((b) => {
      const sec = b.dataset.sec;
      const qs = objQ.filter((q) => qMeta[q.n].sec === sec);
      if (!qs.length) { b.hidden = true; return; }
      const sub = qs.filter((q) => submitted[q.n]).length;
      const ready = qs.filter((q) => picks[q.n] && !submitted[q.n]).length;
      const all = sub === qs.length;
      const got = qs.reduce((a, q) => a + (picks[q.n] === qMeta[q.n].answer ? qMeta[q.n].per : 0), 0);
      const full = qs.reduce((a, q) => a + qMeta[q.n].per, 0);
      b.classList.toggle('done', all);
      b.disabled = !ready;
      b.textContent = all ? `本部分已提交 · ${fmt(got)} / ${fmt(full)} 分` : (ready ? `提交本部分（${ready} 题待判）` : '提交本部分');
    });
    const st = stat();
    $('#scDone').textContent = String(st.done);
    $('#scAll').textContent = String(objQ.length);
    $('#scScore').textContent = fmt(st.score);
    const pct = st.objDone ? Math.round((st.right / st.objDone) * 100) : 0;
    $('#scPct').textContent = st.objDone ? `正确率 ${pct}%` : '';
    $('#scPct').className = 'sb-pct' + (st.objDone ? (pct >= 60 ? ' good' : ' bad') : '');
    document.body.classList.add('show-score');
    try {
      localStorage.setItem(
        'kaoyan-politics-sum:' + P.id,
        JSON.stringify({ id: P.id, year: P.year, title: P.title, score: st.score, full: objFull, right: st.right, objDone: st.objDone, done: st.done, total: allQ.length, t: Date.now() })
      );
    } catch (e) {}
    if (statMask && !statMask.hidden) renderStat();
  }

  const statMask = $('#statMask'), statBody = $('#statBody');
  function renderStat() {
    const st = stat();
    const rows = P.sections
      .filter((s) => (s.questions || []).length)
      .map((s) => {
        const d = st.bySec[s.id];
        const isObj = !!d.per;
        const rate = d.done ? Math.round((d.right / d.done) * 100) : 0;
        const full = isObj ? d.per * d.n : 0;
        return `<tr>
          <td>${esc(s.nav || s.title)}</td>
          <td class="num">${d.n}</td>
          <td class="num">${d.done}</td>
          <td class="num">${isObj ? d.right : '—'}</td>
          <td class="num">${isObj ? `${fmt(d.score)} / ${fmt(full)}` : '—'}</td>
          <td class="num">${isObj && d.done ? rate + '%' : '—'}</td>
        </tr>`;
      })
      .join('');
    const wrong = objQ.filter((q) => picks[q.n] && picks[q.n] !== qMeta[q.n].answer).map((q) => q.n);
    const pct = st.objDone ? Math.round((st.right / st.objDone) * 100) : 0;
    statBody.innerHTML = `
      <div class="stat-kpi">
        <div><span>客观题得分</span><b>${fmt(st.score)}<i> / ${fmt(objFull)}</i></b></div>
        <div><span>已答</span><b>${st.done}<i> / ${objQ.length}</i></b></div>
        <div><span>正确率</span><b class="${pct >= 60 ? 'good' : 'bad'}">${st.objDone ? pct + '%' : '—'}</b></div>
      </div>
      <table class="stat-table">
        <thead><tr><th>题型</th><th>题数</th><th>已答</th><th>正确</th><th>得分</th><th>正确率</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${wrong.length ? `<p class="stat-wrong"><b>错题</b>${wrong.map((n) => `<a href="#q-${n}">第 ${n} 题</a>`).join('')}</p>` : ''}
      <p class="stat-tip">客观题（单选、多选）自动计分，多选须完全一致才得分；分析题为主观题，需自行对照解析。作答记录保存在本机浏览器。</p>`;
  }

  const btnStat = $('#btnStat');
  btnStat.addEventListener('click', () => { renderStat(); statMask.hidden = false; });
  statMask.addEventListener('click', (e) => {
    if (e.target === statMask || e.target.closest('#statClose')) statMask.hidden = true;
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') statMask.hidden = true; });

  root.addEventListener('click', (e) => {
    const ansBtn = e.target.closest('.q-ans');
    if (ansBtn) {
      ansBtn.closest('.q').classList.toggle('revealed');
      paint();
      return;
    }
    const subBtn = e.target.closest('.q-submit');
    if (subBtn) {
      const n = subBtn.dataset.n;
      if (!picks[n]) return;
      submitted[n] = 1;
      save();
      paint();
      return;
    }
    const redoBtn = e.target.closest('.q-redo');
    if (redoBtn) {
      const n = redoBtn.dataset.n;
      delete submitted[n];
      delete picks[n];
      save();
      paint();
      return;
    }
    const secBtn = e.target.closest('.sec-submit');
    if (secBtn) {
      const sec = secBtn.dataset.sec;
      objQ.forEach((q) => { if (qMeta[q.n].sec === sec && picks[q.n]) submitted[q.n] = 1; });
      save();
      paint();
      return;
    }
    const opt = e.target.closest('.opt');
    if (!opt) return;
    const q = opt.closest('.q');
    if (document.body.classList.contains('show-ans') || q.classList.contains('revealed')) return;
    const n = opt.dataset.n, k = opt.dataset.k;
    if (submitted[n]) return;                 // 已提交的题锁定，点「重做」才能改
    if (qMeta[n] && qMeta[n].kind === 'multi') {
      const cur = picks[n] || '';
      const next = cur.indexOf(k) >= 0 ? cur.replace(k, '') : sortPick(cur + k);
      if (next) picks[n] = sortPick(next); else delete picks[n];
    } else {
      picks[n] = picks[n] === k ? '' : k;
      if (!picks[n]) delete picks[n];
    }
    save();
    paint();
  });

  const nav = $('#secNav');
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
    $$('.sec').forEach((el) => io.observe(el));
  }

  paint();

  function jumpToHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h) return;
    const el = document.getElementById(h);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
  }
  jumpToHash();
  window.addEventListener('hashchange', jumpToHash);
})();
