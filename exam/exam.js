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
  P.sections.forEach((s) => (s.questions || []).forEach((q) => allQ.push(q)));

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
    return `<div class="q${extra || ''}" id="q-${q.n}" data-n="${q.n}">
      <div class="q-top"><span class="q-num">${q.n}</span>${diffBadge(q)}${rateBadge(q)}${solLink(q)}</div>
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
    return `<div class="sec-head">
      <span class="lbl">${esc(s.label || '')}</span>
      <h2>${esc(s.title)}</h2>
      ${s.points ? `<span class="pts">${s.points} 分</span>` : ''}
    </div>`;
  }

  function renderSection(s) {
    let body = '';
    if (s.kind === 'cloze') {
      body = `<div class="duo">
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
      body = `<div class="duo">
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
      body = (s.parts || [])
        .map((p) => `<div class="wcard">
          <h3>${esc(p.label)} <span class="pts">${p.points || ''} 分</span></h3>
          ${(p.direction || []).map((d) => `<p class="${/^[A-Za-z]/.test(d) ? 'en' : ''}">${esc(d)}</p>`).join('')}
        </div>`)
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
        <button class="btn" id="btnZh">显示译文</button>
        <button class="btn" id="btnAns">显示答案</button>
        <button class="btn" id="btnClear">清空作答</button>
      </div>
      ${P.note ? `<p class="paper-note">${esc(P.note)}</p>` : ''}
    </div>
    <nav class="sec-nav" id="secNav">${navItems}</nav>
    <div class="paper-body">${P.sections.map(renderSection).join('')}</div>
    <div class="scorebar" id="scorebar">已答 <b id="scDone">0</b>/<span id="scAll">0</span> <span id="scRight"></span></div>
  `;

  /* ---------- 交互 ---------- */
  const btnZh = $('#btnZh'), btnAns = $('#btnAns'), btnClear = $('#btnClear');
  btnZh.addEventListener('click', () => {
    const on = document.body.classList.toggle('show-zh');
    btnZh.classList.toggle('on', on);
    btnZh.textContent = on ? '隐藏译文' : '显示译文';
  });
  btnAns.addEventListener('click', () => {
    const on = document.body.classList.toggle('show-ans');
    btnAns.classList.toggle('on', on);
    btnAns.textContent = on ? '隐藏答案' : '显示答案';
    paint();
  });
  btnClear.addEventListener('click', () => {
    if (!Object.keys(picks).length) return;
    if (!confirm('清空本卷的作答记录？')) return;
    picks = {};
    save();
    paint();
  });

  function paint() {
    const revealed = document.body.classList.contains('show-ans');
    let done = 0, right = 0;
    $$('.q').forEach((el) => {
      const n = el.dataset.n;
      const q = allQ.find((x) => String(x.n) === n);
      if (!q) return;
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
    $('#scDone').textContent = String(done);
    $('#scAll').textContent = String(allQ.length);
    $('#scRight').innerHTML = revealed ? `· 正确 <b style="color:var(--green)">${right}</b>` : '';
    document.body.classList.add('show-score');
  }

  root.addEventListener('click', (e) => {
    const opt = e.target.closest('.opt');
    if (opt && !document.body.classList.contains('show-ans')) {
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
