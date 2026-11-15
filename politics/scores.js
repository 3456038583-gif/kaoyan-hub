/* 考研政治 · 成绩台账
   手动录入各套卷的单选 / 多选得分，与逐题作答（kaoyan-politics:*）完全分开存放。
   存储键：kaoyan-politics-scorelog.v1
*/
(function () {
  'use strict';

  const F_SINGLE = 16;                 // 单选 16 题 × 1 分
  const F_MULTI = 34;                  // 多选 17 题 × 2 分
  const F_ALL = F_SINGLE + F_MULTI;    // 选择题合计 50 分
  const PASS = 40;                     // 参考线：选择题 40 分
  const KEY = 'kaoyan-politics-scorelog.v1';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pad2 = (n) => (n < 10 ? '0' : '') + n;
  const fmtD = (t) => { const d = new Date(t || Date.now()); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); };
  const fmtN = (v) => (Math.abs(v - Math.round(v)) < 0.05 ? String(Math.round(v)) : v.toFixed(1));
  const pctN = (v) => Math.round(v * 100);
  const sum = (l) => l.s + l.m;
  const days = (t) => Math.floor((Date.now() - t) / 86400000);

  /* ---------------- 试卷表（内置） ---------------- */
  const REAL = [];
  for (let y = 2010; y <= 2026; y++) REAL.push({ pid: 'real-' + y, name: y + ' 年', tag: '真题', href: '/politics/' + y });
  const MOCK = [];
  for (let i = 1; i <= 8; i++) MOCK.push({ pid: 'xiao8-' + i, name: '肖八 · 第 ' + i + ' 套', tag: '模拟', href: '/politics/xiao8-' + i });
  for (let i = 1; i <= 4; i++) MOCK.push({ pid: 'xiao4-' + i, name: '肖四 · 第 ' + i + ' 套', tag: '模拟' });

  /* ---------------- 存储 ---------------- */
  let S = { logs: [], customs: [] };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && Array.isArray(raw.logs)) {
      S.logs = raw.logs.filter((l) => l && typeof l.p === 'string' && isFinite(l.s) && isFinite(l.m));
    }
    if (raw && Array.isArray(raw.customs)) {
      S.customs = raw.customs.filter((c) => c && c.id && c.name);
    }
  } catch (e) { /* 存储不可用时退化为本次会话 */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

  const draft = {};        // pid -> {s, m}：尚未提交的输入
  const opened = {};       // pid -> true：历史展开状态
  const state = { group: 'real' };

  function paperOf(pid) {
    for (let i = 0; i < REAL.length; i++) if (REAL[i].pid === pid) return REAL[i];
    for (let i = 0; i < MOCK.length; i++) if (MOCK[i].pid === pid) return MOCK[i];
    for (let i = 0; i < S.customs.length; i++) {
      if ('custom-' + S.customs[i].id === pid) {
        return { pid: pid, name: S.customs[i].name, tag: '自建', custom: true, cid: S.customs[i].id };
      }
    }
    return { pid: pid, name: '已删除的试卷', tag: '' };
  }

  function listOf(group) {
    if (group === 'real') return REAL;
    if (group === 'mock') return MOCK;
    return S.customs.map((c) => ({ pid: 'custom-' + c.id, name: c.name, tag: '自建', custom: true, cid: c.id }));
  }

  /* 单套汇总 */
  function agg(pid) {
    const ls = S.logs.filter((l) => l.p === pid).sort((a, b) => a.t - b.t);
    if (!ls.length) return null;
    let best = 0, sumAll = 0;
    ls.forEach((l) => { const v = sum(l); sumAll += v; if (v > best) best = v; });
    return { n: ls.length, last: ls[ls.length - 1], best: best, avg: sumAll / ls.length, logs: ls };
  }

  /* 全局汇总 */
  function overall() {
    const n = S.logs.length;
    if (!n) return null;
    let all = 0, ss = 0, sm = 0, best = 0, bestPid = '';
    S.logs.forEach((l) => {
      const v = sum(l);
      all += v; ss += l.s; sm += l.m;
      if (v > best) { best = v; bestPid = l.p; }
    });
    const logs = S.logs.slice().sort((a, b) => a.t - b.t);
    return { n: n, avg: all / n, ss: ss / n, sm: sm / n, best: best, bestPid: bestPid, last: logs[logs.length - 1], logs: logs };
  }

  /* ---------------- 顶部 KPI ---------------- */
  function renderKpi() {
    const host = $('#slKpi');
    const k = overall();
    if (!k) {
      host.innerHTML = '<div class="sl-kpi-empty"><b>还没有记录</b>下面挑一套卷，把单选、多选各得几分填进去就行。同一套卷可以记多次，重刷不会覆盖旧成绩。</div>';
      return;
    }
    host.innerHTML =
      '<div class="sl-kpi-item"><span>已录</span><b>' + k.n + '<i>次</i></b></div>' +
      '<div class="sl-kpi-item"><span>平均</span><b>' + fmtN(k.avg) + '<i>/ 50</i></b></div>' +
      '<div class="sl-kpi-item"><span>最高</span><b>' + k.best + '<i>/ 50</i></b></div>' +
      '<div class="sl-kpi-item"><span>最近</span><b>' + sum(k.last) + '<i>/ 50</i></b></div>';
  }

  /* ---------------- 录分卡片 ---------------- */
  function cardHtml(p) {
    const a = agg(p.pid);
    const d = draft[p.pid] || {};
    const sv = d.s == null ? '' : d.s;
    const mv = d.m == null ? '' : d.m;
    const odd = (d.m != null && d.m !== '' && (+d.m) % 2 === 1);

    let meta;
    if (a) {
      const hist = a.logs.slice().reverse().map((l) =>
        '<li><span class="slh-date">' + fmtD(l.t) + '</span>' +
        '<span class="slh-detail">' + l.s + ' + ' + l.m + ' = <b>' + sum(l) + '</b></span>' +
        '<button type="button" class="slh-del" data-del="' + p.pid + '" data-t="' + l.t + '" title="删除这条记录">×</button></li>'
      ).join('');
      meta =
        '<div class="sl-meta">' +
          '<span>最近 <b>' + sum(a.last) + '</b> 分</span>' +
          '<span>最高 <b>' + a.best + '</b></span>' +
          '<span>平均 <b>' + fmtN(a.avg) + '</b></span>' +
        '</div>' +
        '<details class="sl-hist"' + (opened[p.pid] ? ' open' : '') + ' data-pid="' + p.pid + '">' +
          '<summary>' + a.n + ' 次记录</summary><ul>' + hist + '</ul>' +
        '</details>';
    } else {
      meta = '<div class="sl-meta sl-meta-empty">还没记录过</div>';
    }

    return '<article class="sl-card' + (a ? ' has' : '') + '" data-pid="' + p.pid + '">' +
      '<div class="sl-card-head">' +
        '<div class="sl-name">' + esc(p.name) + '<span class="sl-tag">' + esc(p.tag) + '</span>' +
          (a ? '<span class="sl-done" aria-label="已记录">✓</span>' : '') +
        '</div>' +
        '<span class="sl-head-tools">' +
          (p.href ? '<a class="sl-go" href="' + p.href + '">看试卷</a>' : '') +
          (p.custom ? '<button type="button" class="sl-delpaper" data-delpaper="' + p.cid + '" title="删除这套试卷">删除</button>' : '') +
        '</span>' +
      '</div>' +
      '<div class="sl-form">' +
        '<label class="sl-field"><span>单选</span>' +
          '<input type="number" inputmode="numeric" min="0" max="' + F_SINGLE + '" step="1" data-in="s" value="' + sv + '" placeholder="" aria-label="单选题得分">' +
          '<em>/ ' + F_SINGLE + '</em></label>' +
        '<label class="sl-field"><span>多选</span>' +
          '<input type="number" inputmode="numeric" min="0" max="' + F_MULTI + '" step="2" data-in="m" value="' + mv + '" placeholder="" aria-label="多选题得分">' +
          '<em>/ ' + F_MULTI + '</em></label>' +
        '<button type="button" class="sl-save" data-save="' + p.pid + '">记一笔</button>' +
      '</div>' +
      '<p class="sl-hint"' + (odd ? '' : ' hidden') + '>多选每题 2 分，得分一般是偶数，是不是记错了？</p>' +
      meta +
    '</article>';
  }

  /* 标签页上的「已写 / 总数」，直接回答还有哪些没写 */
  function renderTabs() {
    const groups = { real: REAL, mock: MOCK, custom: listOf('custom') };
    $$('#slTabs button').forEach((b) => {
      if (!b.dataset.label) b.dataset.label = b.textContent.trim();
      const list = groups[b.dataset.g] || [];
      const done = list.filter((p) => !!agg(p.pid)).length;
      b.innerHTML = '<span>' + esc(b.dataset.label) + '</span>' +
        '<i class="sl-tab-n' + (list.length && done === list.length ? ' all' : '') + '">' + done + '/' + list.length + '</i>';
    });
  }

  function renderList() {
    renderTabs();
    const g = state.group;
    const list = listOf(g);
    let head = '';
    if (g === 'real') head = '<p class="sl-lead">2010–2026 共 17 套真题，做完一套填一次。作文分析题不算在这里，只记选择题 50 分。</p>';
    else if (g === 'mock') head = '<p class="sl-lead">肖八 8 套、肖四 4 套，按卷记录。肖四目前还没有在线题目，只在这里记分数。</p>';
    else head = '<p class="sl-lead">自己加的卷子（徐六、腿四、米鹏等）都在这里，删除试卷会连带删掉它的成绩。</p>';

    const addForm = g === 'custom'
      ? '<form class="sl-new" id="slNew"><input type="text" maxlength="24" placeholder="试卷名称，如：徐六 · 第 1 套" aria-label="试卷名称"><button type="submit">添加试卷</button></form>'
      : '';

    const grid = list.length
      ? '<div class="sl-grid">' + list.map(cardHtml).join('') + '</div>'
      : '<p class="sl-empty">还没有自定义试卷，用上面的输入框加一套。</p>';

    $('#slList').innerHTML = head + addForm + grid;
  }

  /* ---------------- 分析 ---------------- */
  function insightHtml(k) {
    const out = [];
    const logs = k.logs;
    const n = logs.length;

    if (n >= 6) {
      const r3 = logs.slice(-3), p3 = logs.slice(-6, -3);
      const a = r3.reduce((s, l) => s + sum(l), 0) / r3.length;
      const b = p3.reduce((s, l) => s + sum(l), 0) / p3.length;
      const d = a - b;
      if (d >= 0.5) out.push('最近 3 套平均 <b>' + fmtN(a) + '</b> 分，比之前 3 套高 <b>' + fmtN(d) + '</b> 分，在往上走。');
      else if (d <= -0.5) out.push('最近 3 套平均 <b>' + fmtN(a) + '</b> 分，比之前 3 套低 <b>' + fmtN(-d) + '</b> 分，注意复盘。');
      else out.push('最近 3 套平均 <b>' + fmtN(a) + '</b> 分，和之前基本持平。');
    }

    const sr = k.ss / F_SINGLE, mr = k.sm / F_MULTI;
    if (mr + 0.06 < sr) {
      out.push('单选得分率 <b>' + pctN(sr) + '%</b>，多选 <b>' + pctN(mr) + '%</b>，多选低了 ' + (pctN(sr) - pctN(mr)) + ' 个百分点，是主要失分点。');
    } else if (sr + 0.06 < mr) {
      out.push('单选得分率 <b>' + pctN(sr) + '%</b>，比多选还低，基础题丢分要留意。');
    } else {
      out.push('单选 <b>' + pctN(sr) + '%</b>、多选 <b>' + pctN(mr) + '%</b>，两块得分率比较均衡。');
    }

    const realLogs = logs.filter((l) => l.p.indexOf('real-') === 0);
    const mockLogs = logs.filter((l) => l.p.indexOf('real-') !== 0);
    if (realLogs.length && mockLogs.length) {
      const ra = realLogs.reduce((s, l) => s + sum(l), 0) / realLogs.length;
      const ma = mockLogs.reduce((s, l) => s + sum(l), 0) / mockLogs.length;
      out.push('真题平均 <b>' + fmtN(ra) + '</b> 分，模拟卷平均 <b>' + fmtN(ma) + '</b> 分' +
        (ma - ra >= 2 ? '，模拟卷做得更顺，真题更接近考场手感。' : (ra - ma >= 2 ? '，真题反而更顺，说明模拟卷对你更难。' : '，两者差不多。')));
    }

    const pass = logs.filter((l) => sum(l) >= PASS).length;
    out.push('选择题 ' + PASS + ' 分以上 <b>' + pass + ' / ' + n + '</b> 套（' + Math.round((pass / n) * 100) + '%）。');

    const low = logs.filter((l) => sum(l) < PASS).sort((a, b) => sum(a) - sum(b)).slice(0, 3);
    if (low.length) {
      const names = low.map((l) => esc(paperOf(l.p).name) + '（' + sum(l) + '）').join('、');
      out.push('低于 ' + PASS + ' 分的是：' + names + '。');
    }

    return '<div class="sl-insight"><h3>小结</h3><ul>' + out.map((t) => '<li>' + t + '</li>').join('') + '</ul></div>';
  }

  function barRow(label, val, full, cls) {
    const p = full ? Math.max(0, Math.min(100, (val / full) * 100)) : 0;
    return '<div class="sl-bar-row' + (cls ? ' ' + cls : '') + '">' +
      '<span class="sl-bar-lab">' + esc(label) + '</span>' +
      '<span class="sl-bar"><i style="width:' + p.toFixed(1) + '%"></i></span>' +
      '<b class="sl-bar-val">' + fmtN(val) + '<i>/ ' + full + '</i></b>' +
    '</div>';
  }

  function renderAnalysis() {
    const host = $('#slAnalysis');
    const k = overall();
    if (!k) { host.innerHTML = ''; return; }

    /* 有记录的卷，按最好成绩排序 */
    const groups = [
      { key: 'real', title: '真题最好成绩', list: REAL },
      { key: 'mock', title: '模拟卷最好成绩', list: MOCK },
      { key: 'custom', title: '自建试卷', list: listOf('custom') }
    ];
    let bars = '';
    groups.forEach((g) => {
      const rows = g.list.map((p) => ({ p: p, a: agg(p.pid) })).filter((x) => x.a).sort((x, y) => y.a.best - x.a.best);
      if (!rows.length) return;
      bars += '<div class="sl-bars-group"><h4>' + g.title + '</h4>' +
        rows.map((x) => barRow(x.p.name, x.a.best, F_ALL, x.a.best >= PASS ? 'ok' : 'low')).join('') +
        '</div>';
    });

    host.innerHTML =
      '<div class="sl-an-head"><h2>数据分析</h2><span>' + k.n + ' 次记录 · 平均 ' + fmtN(k.avg) + ' / 50</span></div>' +
      '<div class="sl-an-grid">' +
        '<div class="sl-an-card sl-an-chart"><h3>得分走势</h3><div class="sl-chart" id="slChart"></div>' +
          '<p class="sl-an-note">横轴按记录时间排列，金色虚线是 ' + PASS + ' 分参考线。</p></div>' +
        '<div class="sl-an-card"><h3>单选 / 多选</h3>' +
          barRow('单选', k.ss, F_SINGLE, k.ss / F_SINGLE >= 0.75 ? 'ok' : 'low') +
          barRow('多选', k.sm, F_MULTI, k.sm / F_MULTI >= 0.7 ? 'ok' : 'low') +
          '<div class="sl-split"><span>单选平均 ' + fmtN(k.ss) + ' / ' + F_SINGLE + '（' + pctN(k.ss / F_SINGLE) + '%）</span>' +
          '<span>多选平均 ' + fmtN(k.sm) + ' / ' + F_MULTI + '（' + pctN(k.sm / F_MULTI) + '%）</span></div>' +
        '</div>' +
      '</div>' +
      (bars ? '<div class="sl-an-card sl-an-bars"><div class="sl-bars-head"><h3>各套最好成绩</h3>' +
        '<span class="sl-legend"><i class="ok"></i>' + PASS + ' 分以上<i class="low"></i>低于 ' + PASS + '</span></div>' + bars + '</div>' : '') +
      insightHtml(k);

    drawChart(k.logs);
  }

  /* 折线图：宽度按容器实测，避免文字被缩放 */
  function drawChart(logs) {
    const box = $('#slChart');
    if (!box) return;
    const w = box.clientWidth || 600;
    const h = w < 520 ? 172 : 214;
    const pad = { l: 42, r: 18, t: 24, b: 26 };
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    const n = logs.length;
    const xAt = (i) => (n <= 1 ? pad.l + iw / 2 : pad.l + (i / (n - 1)) * iw);
    const yAt = (v) => pad.t + ih - (Math.max(0, Math.min(F_ALL, v)) / F_ALL) * ih;

    let g = '';
    [0, 10, 20, 30, 40, 50].forEach((v) => {
      const y = yAt(v).toFixed(1);
      g += '<line x1="' + pad.l + '" y1="' + y + '" x2="' + (pad.l + iw) + '" y2="' + y + '" stroke="var(--line-soft)" stroke-width="1"/>';
      g += '<text x="' + (pad.l - 7) + '" y="' + (+y + 3.5) + '" text-anchor="end" font-size="10" fill="var(--muted)" font-family="var(--mono)">' + v + '</text>';
    });
    /* 40 分参考线 */
    g += '<line x1="' + pad.l + '" y1="' + yAt(PASS).toFixed(1) + '" x2="' + (pad.l + iw) + '" y2="' + yAt(PASS).toFixed(1) + '" stroke="var(--gold)" stroke-width="1" stroke-dasharray="4 4" opacity=".75"/>';

    const pts = logs.map((l, i) => [xAt(i), yAt(sum(l))]);
    let d = '';
    pts.forEach((p, i) => { d += (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); });
    g += '<path d="' + d + '" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';

    let hi = 0;
    logs.forEach((l, i) => { if (sum(l) > sum(logs[hi])) hi = i; });
    pts.forEach((p, i) => {
      const isHi = i === hi;
      g += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (isHi ? 4 : 3) + '" fill="' + (isHi ? 'var(--gold)' : 'var(--surface)') + '" stroke="' + (isHi ? 'var(--gold)' : 'var(--accent)') + '" stroke-width="1.6"/>';
    });

    /* 数值标签：点距够宽才逐点标，否则只标最高与最后一条 */
    const showAll = n > 0 && iw / n >= 52;
    logs.forEach((l, i) => {
      if (!showAll && i !== hi && i !== n - 1) return;
      const p = pts[i];
      const ty = p[1] - 9;
      const anchor = p[0] <= pad.l + 8 ? 'start' : (p[0] >= pad.l + iw - 8 ? 'end' : 'middle');
      const tx = anchor === 'start' ? p[0] - 2 : (anchor === 'end' ? p[0] + 2 : p[0]);
      g += '<text x="' + tx.toFixed(1) + '" y="' + ty.toFixed(1) + '" text-anchor="' + anchor + '" font-size="10.5" font-weight="600" fill="var(--ink)" font-family="var(--mono)">' + sum(l) + '</text>';
    });

    /* 横轴日期：首、中、末 */
    const idx = n <= 2 ? [0, n - 1] : [0, Math.floor((n - 1) / 2), n - 1];
    idx.filter((v, i, arr) => arr.indexOf(v) === i).forEach((i) => {
      const anchor = i === 0 ? 'start' : (i === n - 1 ? 'end' : 'middle');
      const x = i === 0 ? pad.l : (i === n - 1 ? pad.l + iw : pts[i][0]);
      g += '<text x="' + x.toFixed(1) + '" y="' + (h - 7) + '" text-anchor="' + anchor + '" font-size="10" fill="var(--muted)" font-family="var(--mono)">' + fmtD(logs[i].t).slice(5) + '</text>';
    });

    box.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="' + h + '" role="img" aria-label="得分走势折线图">' + g + '</svg>';
  }

  /* ---------------- 事件 ---------------- */
  let toastTimer = 0;
  function toast(msg) {
    const el = $('#slToast');
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('on'), 1800);
  }

  function render() {
    renderKpi();
    renderList();
    renderAnalysis();
  }

  $('#slTabs').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-g]');
    if (!b) return;
    state.group = b.dataset.g;
    $$('#slTabs button').forEach((x) => {
      const on = x === b;
      x.classList.toggle('on', on);
      x.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    renderList();
  });

  const listHost = $('#slList');

  listHost.addEventListener('input', (e) => {
    const inp = e.target.closest('input[data-in]');
    if (!inp) return;
    const card = inp.closest('.sl-card');
    const pid = card.dataset.pid;
    const d = draft[pid] || (draft[pid] = {});
    d[inp.dataset.in] = inp.value;
    if (inp.dataset.in === 'm') {
      const hint = $('.sl-hint', card);
      const odd = inp.value !== '' && (+inp.value) % 2 === 1;
      hint.hidden = !odd;
    }
  });

  /* 输入框失焦 / 回车时把数字夹到合法区间 */
  listHost.addEventListener('change', (e) => {
    const inp = e.target.closest('input[data-in]');
    if (!inp || inp.value === '') return;
    const max = inp.dataset.in === 's' ? F_SINGLE : F_MULTI;
    let v = Math.round(+inp.value);
    if (!isFinite(v)) v = 0;
    v = Math.max(0, Math.min(max, v));
    inp.value = String(v);
    const pid = inp.closest('.sl-card').dataset.pid;
    const d = draft[pid] || (draft[pid] = {});
    d[inp.dataset.in] = String(v);
  });

  listHost.addEventListener('submit', (e) => {
    if (e.target.id !== 'slNew') return;
    e.preventDefault();
    const inp = $('input', e.target);
    const name = inp.value.trim();
    if (!name) { inp.focus(); return; }
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    S.customs.push({ id: id, name: name });
    save();
    inp.value = '';
    renderList();
    toast('已添加「' + name + '」');
  });

  listHost.addEventListener('click', (e) => {
    /* 记一笔 */
    const btn = e.target.closest('[data-save]');
    if (btn) {
      const card = btn.closest('.sl-card');
      const pid = btn.dataset.save;
      const sIn = $('input[data-in="s"]', card), mIn = $('input[data-in="m"]', card);
      const sRaw = sIn.value.trim(), mRaw = mIn.value.trim();
      if (sRaw === '' || mRaw === '') {
        toast('单选和多选都要填，没做可以填 0');
        (sRaw === '' ? sIn : mIn).focus();
        return;
      }
      const s = Math.max(0, Math.min(F_SINGLE, Math.round(+sRaw)));
      const m = Math.max(0, Math.min(F_MULTI, Math.round(+mRaw)));
      S.logs.push({ p: pid, s: s, m: m, t: Date.now() });
      save();
      delete draft[pid];
      opened[pid] = false;
      render();
      toast(paperOf(pid).name + ' 记下 ' + (s + m) + ' 分');
      return;
    }

    /* 删一条记录 */
    const del = e.target.closest('[data-del]');
    if (del) {
      const pid = del.dataset.del, t = +del.dataset.t;
      const i = S.logs.findIndex((l) => l.p === pid && l.t === t);
      if (i < 0) return;
      S.logs.splice(i, 1);
      save();
      render();
      toast('已删除一条记录');
      return;
    }

    /* 删除自定义试卷 */
    const delP = e.target.closest('[data-delpaper]');
    if (delP) {
      const cid = delP.dataset.delpaper;
      const p = S.customs.find((c) => c.id === cid);
      if (!p) return;
      const n = S.logs.filter((l) => l.p === 'custom-' + cid).length;
      if (!confirm('删除试卷「' + p.name + '」' + (n ? '及其 ' + n + ' 条成绩' : '') + '？')) return;
      S.customs = S.customs.filter((c) => c.id !== cid);
      S.logs = S.logs.filter((l) => l.p !== 'custom-' + cid);
      save();
      renderList();
      renderKpi();
      renderAnalysis();
      toast('已删除');
    }
  });

  /* 展开历史时记住状态，重绘后不收起 */
  listHost.addEventListener('toggle', (e) => {
    const d = e.target;
    if (!d.classList || !d.classList.contains('sl-hist')) return;
    opened[d.dataset.pid] = d.open;
  }, true);

  /* 导出 / 导入 */
  $('#slExport').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ v: 1, logs: S.logs, customs: S.customs }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '政治成绩台账-' + fmtD(Date.now()) + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });

  $('#slImportBtn').addEventListener('click', () => $('#slImport').click());
  $('#slImport').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const d = JSON.parse(String(fr.result));
        const logs = Array.isArray(d.logs) ? d.logs.filter((l) => l && typeof l.p === 'string' && isFinite(l.s) && isFinite(l.m)) : [];
        const customs = Array.isArray(d.customs) ? d.customs.filter((c) => c && c.id && c.name) : [];
        if (!logs.length && !customs.length) throw new Error('empty');
        if (!confirm('导入会并入现有数据（同一时间点的重复记录会跳过），继续？')) return;
        const seen = {};
        S.logs.forEach((l) => { seen[l.p + '@' + l.t] = 1; });
        logs.forEach((l) => { if (!seen[l.p + '@' + l.t]) S.logs.push(l); });
        S.customs.forEach((c) => { seen['c' + c.id] = 1; });
        customs.forEach((c) => { if (!seen['c' + c.id]) S.customs.push(c); });
        save();
        render();
        toast('导入完成');
      } catch (err) {
        toast('文件格式不对，导入失败');
      }
      e.target.value = '';
    };
    fr.readAsText(f);
  });

  let rz = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => { const k = overall(); if (k) drawChart(k.logs); }, 180);
  });

  render();
})();
