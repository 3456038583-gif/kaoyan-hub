/* 考研英语词汇 · 2027 红宝书
   数据：/vocab/data/index.js（全部词条索引）+ /vocab/data/d/<字母>.js（详情，按需加载） */
(function () {
  'use strict';

  var DATA = window.__VOCAB__;
  if (!DATA || !DATA.words) {
    document.getElementById('list').innerHTML =
      '<p class="vmore">词库加载失败，请刷新重试。</p>';
    return;
  }
  var META = DATA.meta, ROWS = DATA.words, VER = META.v;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var LS = 'kaoyan-vocab.';
  function store(key, def) {
    try { return JSON.parse(localStorage.getItem(LS + key)) || def; } catch (e) { return def; }
  }
  function persist(key, val) {
    try { localStorage.setItem(LS + key, JSON.stringify(val)); } catch (e) {}
  }

  var star = store('star.v1', {});      // 生词本
  var known = store('known.v1', {});    // 已掌握
  var letters = {};                      // 已加载的字母详情
  var loading = {};

  /* ------------------------------------------------------------ 载入详情 */
  function loadLetter(ch) {
    if (letters[ch]) return Promise.resolve(letters[ch]);
    if (loading[ch]) return loading[ch];
    loading[ch] = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = '/vocab/data/d/' + encodeURIComponent(ch) + '.js?v=' + VER;
      s.onload = function () {
        var all = window.__VD__ || {};
        letters[ch] = all[ch] || {};
        res(letters[ch]);
      };
      s.onerror = function () { rej(new Error('load ' + ch)); };
      document.head.appendChild(s);
    });
    return loading[ch];
  }
  function letterOf(w) {
    var c = String(w).toLowerCase().charAt(0);
    return c >= 'a' && c <= 'z' ? c : '_';
  }

  /* ------------------------------------------------------------ 视图状态 */
  var state = { q: '', group: '', letter: '', unit: '', freq: '', sort: 'book', deep: false };
  var VIEW = [], shown = 0, curWord = '', observer = null;

  /* ------------------------------------------------------------ 顶部统计 */
  (function stats() {
    var g = META.groups || {};
    var html = '<span><b>' + META.n.toLocaleString() + '</b> 词条</span>';
    if (g['必考词']) html += '<span>必考词 <b>' + g['必考词'] + '</b></span>';
    if (g['基础词']) html += '<span>基础词 <b>' + g['基础词'] + '</b></span>';
    if (g['超纲词']) html += '<span>超纲词 <b>' + g['超纲词'] + '</b></span>';
    html += '<span>真题例句 <b>' + (META.examples || 0).toLocaleString() + '</b></span>';
    html += '<span>真人发音 <b>' + META.n.toLocaleString() + '</b></span>';
    $('#vstats').innerHTML = html;
  })();

  /* ------------------------------------------------------------ 筛选控件 */
  var GROUPS = [
    ['', '全部'], ['必考词', '必考词'], ['基础词', '基础词'], ['超纲词', '超纲词'],
    ['其他', '校勘补充'], ['@star', '生词本'], ['@known', '已掌握']
  ];
  function renderGroups() {
    $('#groupRow').innerHTML = GROUPS.map(function (g) {
      var k = g[0], n = '';
      if (k === '@star') n = Object.keys(star).length;
      else if (k === '@known') n = Object.keys(known).length;
      else if (!k) n = META.n;
      else n = (META.groups || {})[k] || 0;
      if (k && k !== '@star' && k !== '@known' && !n) return '';
      return '<button class="chip' + (state.group === k ? ' on' : '') + '" data-g="' + k + '">'
        + g[1] + (n ? '<i>' + n + '</i>' : '') + '</button>';
    }).join('');
  }
  function renderLetters() {
    var ls = (META.letters || []).filter(function (c) { return c !== '_'; });
    $('#letterRow').innerHTML = '<button class="chip letter' + (state.letter ? '' : ' on')
      + '" data-l="">全部</button>'
      + ls.map(function (c) {
        return '<button class="chip letter' + (state.letter === c ? ' on' : '') + '" data-l="' + c + '">'
          + c.toUpperCase() + '</button>';
      }).join('');
  }
  function renderUnits() {
    var sel = $('#unitSel'), g = state.group;
    var max = (META.units || {})[g] || 0;
    var opts = ['<option value="">全部单元</option>'];
    for (var i = 1; i <= max; i++) {
      opts.push('<option value="' + i + '"' + (state.unit == i ? ' selected' : '') + '>' + g + ' Unit ' + i + '</option>');
    }
    sel.innerHTML = opts.join('');
    sel.disabled = !max;
  }

  /* ------------------------------------------------------------ 过滤 */
  function norm(s) { return String(s == null ? '' : s).toLowerCase(); }

  function deepText(row) {
    var d = (letters[letterOf(row[0])] || {})[row[0]];
    if (!d) return '';
    var t = [row[8]];
    (d[4] || []).forEach(function (s) { t.push(s[0], s[1]); });
    (d[5] || []).forEach(function (e) { t.push(e[1], e[2], e[0]); });
    if (d[7]) {
      (d[7].r || []).forEach(function (x) { t.push(x[1]); });
      (d[7].d || []).forEach(function (x) { t.push(x[0], x[1]); });
    }
    return norm(t.join(' '));
  }

  function score(row, q) {
    var w = norm(row[0]), m = norm(row[8]);
    if (w === q) return 0;
    if (w.indexOf(q) === 0) return 1;
    if (w.indexOf(q) > 0) return 2;
    if (m.indexOf(q) >= 0) return 3;
    return -1;
  }

  function apply() {
    var q = norm(state.q).trim();
    var unitQ = null;
    var m = q.match(/^(?:unit|第)?\s*(\d{1,2})\s*(?:单元|unit)?$/);
    if (m && !/^[a-z]/.test(q)) unitQ = +m[1];

    var out = [];
    for (var i = 0; i < ROWS.length; i++) {
      var r = ROWS[i];
      if (state.group === '@star') { if (!star[r[0]]) continue; }
      else if (state.group === '@known') { if (!known[r[0]]) continue; }
      else if (state.group && r[2] !== state.group) continue;
      if (state.letter && norm(r[0]).charAt(0) !== state.letter) continue;
      if (state.unit && String(r[3]) !== String(state.unit)) continue;
      if (state.freq === 'hit' && !(r[6] > 0)) continue;
      if (state.freq === 'hot' && !(r[7] >= 3)) continue;
      if (state.freq === 'zero' && r[6] > 0) continue;
      var sc = -1;
      if (q) {
        sc = score(r, q);
        if (sc < 0 && unitQ && (r[3] === unitQ || r[4] === unitQ)) sc = 4;
        if (sc < 0 && state.deep) {
          var t = deepText(r);
          if (t && t.indexOf(q) >= 0) sc = 5;
        }
        if (sc < 0) continue;
      }
      out.push({ r: r, s: sc });
    }
    if (q && state.sort === 'book') {
      out.sort(function (a, b) { return a.s - b.s || a.r[4] - b.r[4]; });
    } else if (state.sort === 'freq') {
      out.sort(function (a, b) { return b.r[6] - a.r[6] || a.r[4] - b.r[4]; });
    } else if (state.sort === 'az') {
      out.sort(function (a, b) { return a.r[0].toLowerCase() < b.r[0].toLowerCase() ? -1 : 1; });
    }
    VIEW = out.map(function (x) { return x.r; });
    $('#vcount').textContent = VIEW.length.toLocaleString() + ' / ' + META.n.toLocaleString() + ' 词';
    renderList(true);
  }

  /* ------------------------------------------------------------ 列表 */
  var PAGE = 80;
  function rowHtml(r) {
    var unit = r[2] === '超纲词' ? ('超纲 ' + (r[3] || '')) : (r[2] + ' ' + (r[3] || ''));
    var occ = r[6] > 0 ? (r[6] + ' 次') : '—';
    return '<div class="wrow' + (curWord === r[0] ? ' on' : '') + '" data-w="' + esc(r[0]) + '" tabindex="0" role="button">'
      + '<div class="wl"><b>' + esc(r[0]) + '</b>' + (r[1] ? '<span class="ph">' + esc(r[1]) + '</span>' : '') + '</div>'
      + '<div class="wr"><span class="occ' + (r[6] ? '' : ' z') + '">' + occ + '</span>'
      + '<span>' + esc(unit) + '</span>' + (star[r[0]] ? '<span class="star">★</span>' : '') + '</div>'
      + '<div class="wm">' + esc(r[8] || '（释义见详情）') + '</div>'
      + '</div>';
  }
  function renderList(reset) {
    var box = $('#list');
    if (reset) {
      shown = 0;
      box.innerHTML = '';
      if (observer) { observer.disconnect(); observer = null; }
    }
    if (!VIEW.length) {
      box.innerHTML = '<p class="vmore">没有匹配的词。试试搜中文释义，或点「全部」清空筛选。</p>';
      return;
    }
    var frag = document.createElement('div');
    var end = Math.min(shown + PAGE, VIEW.length);
    var html = '';
    for (var i = shown; i < end; i++) html += rowHtml(VIEW[i]);
    frag.innerHTML = html;
    while (frag.firstChild) box.appendChild(frag.firstChild);
    shown = end;
    if (shown >= VIEW.length) {
      if (!box.querySelector('.vend')) {
        var p = document.createElement('p');
        p.className = 'vmore vend';
        p.textContent = '已到末尾 · 共 ' + VIEW.length.toLocaleString() + ' 词';
        box.appendChild(p);
      }
      return;
    }
    var more = box.querySelector('.vmore.js-more');
    if (!more) {
      more = document.createElement('div');
      more.className = 'vmore js-more';
      more.innerHTML = '<button type="button">继续加载</button>';
      box.appendChild(more);
      more.querySelector('button').addEventListener('click', function () { renderList(false); });
    }
    if (!observer && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) renderList(false);
      }, { rootMargin: '600px 0px' });
      observer.observe(more);
    } else if (!observer) {
      more.querySelector('button').addEventListener('click', function () { renderList(false); });
    }
  }

  /* ------------------------------------------------------------ 详情 */
  function senseHtml(d) {
    if (!d || !d.length) return '';
    return '<ul class="senses">' + d.map(function (s) {
      var pos = s[0] ? '<span class="pos">' + esc(s[0]) + '</span>' : '<span class="pos none">—</span>';
      var n = s[2] ? '<span class="hits">' + s[2] + ' 次</span>' : '<span class="hits z">0</span>';
      return '<li>' + pos + '<span class="mean">' + esc(s[1]) + '</span>' + n + '</li>';
    }).join('') + '</ul>';
  }
  function formsHtml(fm) {
    if (!fm || !fm.length) return '';
    var main = fm.filter(function (x) { return !x[2]; });
    var der = fm.filter(function (x) { return x[2]; });
    var h = '';
    if (main.length) {
      h += '<div class="forms">' + main.map(function (x) {
        return '<div><dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd></div>';
      }).join('') + '</div>';
    }
    if (der.length) {
      h += '<div class="forms" style="margin-top:8px">' + der.map(function (x) {
        return '<div class="derived"><dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd></div>';
      }).join('') + '</div>';
    }
    return h;
  }
  function etymHtml(et) {
    if (!et) return '';
    var h = '';
    if (et.r && et.r.length) {
      h += '<div class="etym">' + et.r.map(function (x) {
        return '<div><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></div>';
      }).join('') + '</div>';
    }
    if (et.d && et.d.length) {
      h += '<div class="etym" style="margin-top:9px">' + et.d.slice(0, 8).map(function (x) {
        return '<div class="derived"><b>派生</b><span>' + esc(x[0])
          + (x[1] ? '<i>' + esc(x[1]) + '</i>' : '') + '</span></div>';
      }).join('') + '</div>';
    }
    return h;
  }
  function markWord(txt, w) {
    var safe = esc(txt);
    try {
      var re = new RegExp('(' + String(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      return safe.replace(re, '<mark>$1</mark>');
    } catch (e) { return safe; }
  }
  function exHtml(list, w) {
    if (!list || !list.length) return '<p class="vempty-s">原书未给这个词配真题例句。</p>';
    return '<ul class="exlist">' + list.map(function (e, i) {
      var parts = String(e[0] || '').split(' · ');
      var head = parts.shift() || '';
      var tail = parts.join(' · ');
      return '<li' + (i === 0 ? ' class="first"' : '') + '>'
        + '<div class="exsrc"><em>' + esc(head) + '</em>'
        + (tail ? '<span>' + esc(tail) + '</span>' : '')
        + (e[3] ? '<i>' + esc(e[3]) + '</i>' : '') + '</div>'
        + '<p class="exen">' + markWord(e[1], w) + '</p>'
        + (e[2] ? '<p class="exzh">' + esc(e[2]) + '</p>' : '')
        + '</li>';
    }).join('') + '</ul>';
  }

  function detailHtml(w, r, d) {
    var phon = d ? d[0] : ['', ''];
    var lv = (d ? d[1] : String(r[5] || '').split(',')) || [];
    var freq = d ? d[3] : [r[6], r[7], 0, 0, 0];
    var senses = d ? d[4] : [];
    var exs = d ? d[5] : [];
    var au = d ? d[6] : '';
    var et = d ? d[7] : null;
    var unit = r[2] === '超纲词' ? ('超纲词 · ' + r[3]) : (r[2] + ' · Unit ' + r[3]);
    var tags = '<span class="tag g">' + esc(unit) + '</span>';
    if (r[4]) tags += '<span class="tag plain">全书第 ' + r[4] + ' 号</span>';
    if (freq[0]) tags += '<span class="tag hot">真题 ' + freq[0] + ' 次</span>';
    else tags += '<span class="tag plain">真题未考</span>';
    if (freq[2]) tags += '<span class="tag plain">覆盖 ' + freq[2] + ' / 44 套</span>';
    (lv || []).forEach(function (x) { if (x) tags += '<span class="tag">' + esc(x) + '</span>'; });

    var phonHtml = '';
    if (phon[0]) phonHtml += '<span><b>英</b>/' + esc(phon[0]) + '/</span>';
    if (phon[1]) phonHtml += '<span><b>美</b>/' + esc(phon[1]) + '/</span>';
    if (au) {
      phonHtml += '<button class="play" type="button" data-play="' + esc(au) + '">'
        + '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6.5 9H3v6h3.5L11 19z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>发音</button>';
    }
    var freqLine = '词频 ' + (freq[0] || 0) + ' 次';
    if (freq[3] || freq[4]) freqLine += '（阅读正文 ' + freq[3] + ' · 选项 ' + freq[4] + '）';

    return '<button class="dclose" type="button" aria-label="关闭">×</button>'
      + '<div class="dhead"><h2>' + esc(w) + '</h2>'
      + '<div class="dacts">'
      + '<button class="icon-btn' + (star[w] ? ' on' : '') + '" data-star="' + esc(w) + '" title="加入生词本" aria-label="加入生词本">★</button>'
      + '<button class="icon-btn' + (known[w] ? ' done' : '') + '" data-known="' + esc(w) + '" title="标记已掌握" aria-label="标记已掌握">✓</button>'
      + '<button class="icon-btn copy" data-copy="' + esc(w) + '" title="复制这个词条" aria-label="复制这个词条">复制</button>'
      + '</div>'
      + '<div class="dphon">' + phonHtml + '</div></div>'
      + '<div class="dmeta">' + tags + '</div>'
      + '<section class="dsec"><h3>释义</h3>' + senseHtml(senses) + '</section>'
      + (formsHtml(d ? d[2] : null) ? '<section class="dsec"><h3>词形变化</h3>' + formsHtml(d ? d[2] : null) + '</section>' : '')
      + (etymHtml(et) ? '<section class="dsec"><h3>词根词缀</h3>' + etymHtml(et) + '</section>' : '')
      + '<section class="dsec"><h3>真题例句</h3>' + exHtml(exs, w) + '</section>'
      + '<div class="dfoot"><span>' + esc(freqLine) + '</span><span>' + esc(unit) + '</span>'
      + '<a href="https://www.eudic.net/v4/en/app/search?word=' + encodeURIComponent(w) + '" target="_blank" rel="noopener">更多词典 →</a></div>'
      + '<div class="dnav"><button type="button" data-step="-1">← 上一个</button><button type="button" data-step="1">下一个 →</button></div>';
  }

  function renderDetail(w) {
    var r = null;
    for (var i = 0; i < ROWS.length; i++) if (ROWS[i][0] === w) { r = ROWS[i]; break; }
    if (!r) return;
    curWord = w;
    var box = $('#detail');
    var ch = letterOf(w);
    var cached = letters[ch] && letters[ch][w];
    box.innerHTML = detailHtml(w, r, cached);
    box.classList.add('open');
    paintSelected();
    if (!cached) {
      box.classList.add('loading');
      loadLetter(ch).then(function (dict) {
        if (curWord !== w) return;
        box.classList.remove('loading');
        box.innerHTML = detailHtml(w, r, dict[w]);
        paintSelected();
      }).catch(function () {
        box.classList.remove('loading');
      });
    }
    try { localStorage.setItem(LS + 'pos.v1', w); } catch (e) {}
    if (history.replaceState) history.replaceState(null, '', '#/w/' + encodeURIComponent(w));
    else location.hash = '/w/' + encodeURIComponent(w);
  }
  function paintSelected() {
    $$('.wrow.on').forEach(function (el) { el.classList.remove('on'); });
    var el = $('.wrow[data-w="' + CSS.escape(curWord) + '"]');
    if (el) {
      el.classList.add('on');
      var rect = el.getBoundingClientRect();
      if (rect.top < 120 || rect.bottom > window.innerHeight - 40) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }
  function closeDetail() {
    $('#detail').classList.remove('open');
    curWord = '';
    paintSelected();
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
  }

  /* ------------------------------------------------------------ 发音 */
  var audio = $('#vaudio');
  function play(src, btn) {
    if (!src) return;
    try { audio.pause(); } catch (e) {}
    audio.src = '/vocab/audio/' + src;
    audio.play().then(function () {
      if (btn) {
        btn.classList.add('playing');
        setTimeout(function () { btn.classList.remove('playing'); }, 1200);
      }
    }).catch(function () {});
  }
  /* 卡片出现时自动念一遍；同一个词重现（重新入队）会再念一次 */
  function autoSpeak(item) {
    if (!item || item.spoke) return;
    if (!plan.au) { item.spoke = 1; return; }
    var d = letters[letterOf(item.r[0])] && letters[letterOf(item.r[0])][item.r[0]];
    if (!d) return;            // 词库还没加载完，等下面 loadLetter 回来后再念
    item.spoke = 1;
    if (d[6]) play(d[6], $('#vsCard .play'));
  }

  /* ------------------------------------------------------------ 复制 */
  function copyCard(w) {
    loadLetter(letterOf(w)).then(function (dict) {
      var d = dict[w], r = null;
      for (var i = 0; i < ROWS.length; i++) if (ROWS[i][0] === w) { r = ROWS[i]; break; }
      var out = [w + (d && d[0][0] ? '  /' + d[0][0] + '/' : '')];
      if (r) out.push((r[2] === '超纲词' ? '超纲词' : r[2] + ' Unit ' + r[3]));
      (d && d[4] || []).forEach(function (s) { out.push((s[0] ? s[0] + ' ' : '') + s[1]); });
      if (d && d[5] && d[5].length) {
        var e = d[5][0];
        out.push('【真题例句】' + e[0]);
        out.push(e[1]);
        if (e[2]) out.push(e[2]);
      }
      var text = out.join('\n');
      var done = function (ok) {
        var btn = $('[data-copy]');
        if (btn) {
          btn.textContent = ok ? '已复制' : '失败';
          setTimeout(function () { btn.textContent = '复制'; }, 1400);
        }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done(ok);
      }
    });
  }

  /* ------------------------------------------------------------ 背单词 · 艾宾浩斯
     词表顺序即红宝书顺序（必考词 → 基础词 → 超纲词）。
     复习节点 IV：认识一次往后推一格；模糊回到 1 天；不认识清零并在本轮稍后重现。 */
  var IV = [1, 2, 4, 7, 15, 30, 60, 120, 240];
  var srs = store('srs.v2', {});      // 词 -> { l:等级, d:到期日, i:间隔, r:遍数, x:忘次, f:首学日, dc:统计日 }
  var plan = store('plan.v2', { size: 50, au: 1 });
  if (!(plan.size > 0)) plan.size = 50;
  var days = store('days.v2', {});    // 'YYYY-MM-DD' -> { new, rev, know, fuzzy, again, sec, done }
  var perf = store('perf.v2', { sec: 0, n: 0 });

  var S = { q: [], i: 0, reveal: false, t0: 0, req: {}, scope: null };

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function dayStr(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function today() { return dayStr(new Date()); }
  function addDays(s, n) {
    var p = s.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    d.setDate(d.getDate() + n);
    return dayStr(d);
  }
  function dayLog(t) {
    return days[t] || (days[t] = { new: 0, rev: 0, know: 0, fuzzy: 0, again: 0, sec: 0 });
  }
  function avgSec() { return perf.n ? perf.sec / perf.n : 8; }
  /* all=true 时忽略「只背当前筛选」的范围，用于列表页的计划条 */
  function scopeRows(all) {
    if (all || !S.scope) return ROWS;
    return ROWS.filter(function (r) { return S.scope[r[0]]; });
  }
  function freshPool(all) {
    return scopeRows(all).filter(function (r) { return !srs[r[0]] && !known[r[0]]; });
  }
  function duePool(all) {
    var t = today();
    var out = scopeRows(all).filter(function (r) { var s = srs[r[0]]; return s && s.d <= t; });
    out.sort(function (a, b) {
      var da = srs[a[0]].d, db = srs[b[0]].d;
      return da === db ? a[4] - b[4] : (da < db ? -1 : 1);
    });
    return out;
  }
  function todayQuota() { return Math.max(0, plan.size - dayLog(today()).new); }
  function dueTomorrow() {
    var t = addDays(today(), 1);
    return ROWS.filter(function (r) { var s = srs[r[0]]; return s && s.d <= t; }).length;
  }
  function planStats(all) {
    var due = duePool(all).length;
    var fresh = freshPool(all).length;
    var quota = Math.min(todayQuota(), fresh);
    var size = Math.max(1, plan.size | 0);
    var left = Math.ceil(fresh / size);
    var cards = due + quota;
    return {
      due: due, fresh: fresh, quota: quota, days: left,
      finish: addDays(today(), left),
      mins: Math.max(1, Math.round(cards * avgSec() / 60))
    };
  }
  function streakDays() {
    var n = 0, d = today();
    while (days[d] && days[d].done) { n++; d = addDays(d, -1); }
    return n;
  }
  function persistStudy() {
    persist('srs.v2', srs);
    persist('days.v2', days);
    persist('perf.v2', perf);
    persist('plan.v2', plan);
  }

  /* ---- 顶部计划条（列表页） ---- */
  function renderPlanBar() {
    var el = $('#planBar');
    if (!el) return;
    if (!ROWS.length) { el.hidden = true; return; }
    var st = planStats(true), l = dayLog(today());
    el.hidden = false;
    el.innerHTML =
      '<span class="vp-tag">背诵计划</span>' +
      '<span class="vp-n"><b>' + st.due + '</b> 待复习</span>' +
      '<span class="vp-n"><b>' + st.quota + '</b> 新词</span>' +
      '<span class="vp-n vp-d">每天 <b>' + plan.size + '</b> 词</span>' +
      '<span class="vp-est">还剩 <b>' + st.fresh + '</b> 词 · 预计 <b>' + st.days + '</b> 天背完（' +
        esc(st.finish.slice(5).replace('-', '/')) + '）</span>' +
      (l.done ? '<span class="vp-ok">今日已打卡 ✓</span>' : '') +
      '<button class="vp-go" type="button" id="planGo">' + (l.done ? '再背一组' : '开始背诵') + '</button>';
    el.querySelector('#planGo').addEventListener('click', function () { openStudy(); });
  }

  /* ---- 打开 / 切换视图 ---- */
  function paintVoice() {
    var b = $('#vsVoice');
    if (!b) return;
    var on = !!plan.au;
    b.classList.toggle('is-off', !on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.title = '自动发音：' + (on ? '开' : '关');
    b.setAttribute('aria-label', '自动发音：' + (on ? '开' : '关'));
  }
  function showView(which) {
    $('#vsPlan').hidden = which !== 'plan';
    $('#vsMain').hidden = which !== 'main';
    $('#vsDone').hidden = which !== 'done';
  }
  function openStudy() {
    if (filtered()) {
      S.scope = {};
      VIEW.forEach(function (r) { S.scope[r[0]] = 1; });
    } else {
      S.scope = null;
    }
    $('#study').hidden = false;
    $('#mask').hidden = false;
    document.body.style.overflow = 'hidden';
    paintVoice();
    renderPlanView();
    showView('plan');
  }
  function closeStudy() {
    $('#study').hidden = true;
    $('#mask').hidden = true;
    document.body.style.overflow = '';
    S.scope = null;
    renderPlanBar();
    renderGroups();
  }

  /* ---- 计划 / 设置 ---- */
  var PRESETS = [20, 30, 50, 80, 100, 150];
  function filtered() {
    return !!(state.group || state.unit || state.letter || state.freq || state.q);
  }
  function renderPlanView() {
    var st = planStats(), l = dayLog(today());
    var total = st.due + st.quota;
    var knownN = Object.keys(srs).length;
    var html = '<div class="vp-kick">TODAY · EBBINGHAUS</div>'
      + '<h2 class="vp-h">' + (st.due + st.quota ? '今天的背诵计划' : '今天的词已经背完了') + '</h2>'
      + (filtered() ? '<label class="vp-scope"><input type="checkbox" id="vpScope"' + (S.scope ? ' checked' : '') + '> 只背当前筛选（' + VIEW.length.toLocaleString() + ' 词）</label>' : '')
      + '<div class="vp-cards">'
      + '<div class="vp-card"><b>' + st.due + '</b><span>待复习</span><i>遗忘曲线到期</i></div>'
      + '<div class="vp-card"><b>' + st.quota + '</b><span>新词</span><i>每日上限 ' + plan.size + '</i></div>'
      + '<div class="vp-card"><b>' + st.days + '</b><span>天背完</span><i>' + (st.fresh ? esc(st.finish.slice(5).replace('-', '/')) : '已全部学过') + '</i></div>'
      + '</div>'
      + '<div class="vp-sec"><span class="vp-lb">每天新词</span><div class="vp-step">'
      + '<button type="button" data-size="-10" aria-label="减少">−</button>'
      + '<input id="planSize" type="number" min="5" max="300" step="5" value="' + plan.size + '" aria-label="每天新词数">'
      + '<button type="button" data-size="10" aria-label="增加">＋</button>'
      + '</div></div>'
      + '<div class="vp-presets">' + PRESETS.map(function (n) {
          return '<button type="button" class="vp-ps' + (n === plan.size ? ' on' : '') + '" data-set="' + n + '">' + n + '</button>';
        }).join('') + '</div>'
      + '<p class="vp-est2">按每天 <b>' + plan.size + '</b> 词：还剩 <b>' + st.fresh + '</b> 词，预计 <b>' + st.days + '</b> 天背完；'
      + '今天这组约 <b>' + st.mins + ' 分钟</b>（按你平均 ' + Math.round(avgSec()) + ' 秒/词）。</p>'
      + '<p class="vp-tip">不认识的词会在本轮隔几张后再次出现；认识后按 <b>1 / 2 / 4 / 7 / 15 / 30 / 60</b> 天的曲线安排复习。<br>'
      + '每轮词序都会打乱，不会连着背同一个首字母；单词出现时自动朗读（右上角 <b>🔊</b> 可关）。</p>'
      + '<div class="vp-round">今日已学 <b>' + l.new + '</b> 新词 · 复习 <b>' + l.rev + '</b> 词 · 累计学过 <b>' + knownN + '</b> 词</div>'
      + '<div class="vp-acts">'
      + '<button class="vbtn primary vp-start" type="button" id="vpStart"' + (total ? '' : ' disabled') + '>'
      + (total ? '开始背诵（' + total + ' 词）' : '今天没有待背的词') + '</button>'
      + '</div>'
      + '<button class="vp-reset" type="button" id="vpReset">清空背诵进度</button>';

    var box = $('#vsPlan');
    box.innerHTML = html;
    box.querySelectorAll('[data-size]').forEach(function (b) {
      b.addEventListener('click', function () { setSize(plan.size + (+b.dataset.size)); });
    });
    box.querySelectorAll('[data-set]').forEach(function (b) {
      b.addEventListener('click', function () { setSize(+b.dataset.set); });
    });
    $('#planSize').addEventListener('change', function () { setSize(+this.value); });
    var sc = box.querySelector('#vpScope');
    if (sc) sc.addEventListener('change', function () {
      if (this.checked) {
        S.scope = {};
        VIEW.forEach(function (r) { S.scope[r[0]] = 1; });
      } else {
        S.scope = null;
      }
      renderPlanView();
    });
    $('#vpStart').addEventListener('click', function () { if (total) startSession(); });
    $('#vpReset').addEventListener('click', function () {
      if (!confirm('清空后所有背诵进度、复习计划、打卡记录都会删除，确定吗？')) return;
      srs = {}; days = {}; perf = { sec: 0, n: 0 };
      persistStudy();
      renderPlanView(); renderPlanBar();
    });
  }
  function setSize(n) {
    n = Math.max(5, Math.min(300, Math.round(n || 50)));
    plan.size = n;
    persist('plan.v2', plan);
    renderPlanView();
    renderPlanBar();
  }

  /* ---- 顺序：随机打乱并避免相邻同首字母 ---- */
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function initialOf(item) {
    var w = item && (item.r ? item.r[0] : item[0]) || '';
    return w.charAt(0).toLowerCase();
  }
  function declump(list) {
    for (var i = 1; i < list.length; i++) {
      var prev = initialOf(list[i - 1]);
      if (initialOf(list[i]) !== prev) continue;
      for (var j = i + 1; j < list.length; j++) {
        if (initialOf(list[j]) === prev) continue;
        var t = list[i]; list[i] = list[j]; list[j] = t;
        break;
      }
    }
    return list;
  }

  /* ---- 一轮 ---- */
  function startSession(extra) {
    var due = declump(duePool());
    var fresh = shuffle(scopeRows().filter(function (r) { return !srs[r[0]] && !known[r[0]]; }))
      .slice(0, todayQuota() + (extra || 0));
    var q = [], di = 0, fi = 0;
    while (di < due.length || fi < fresh.length) {
      for (var k = 0; k < 2 && di < due.length; k++) q.push({ r: due[di++], isNew: false });
      if (fi < fresh.length) q.push({ r: fresh[fi++], isNew: true });
    }
    declump(q);
    S.q = q; S.i = 0; S.reveal = false; S.req = {};
    if (!q.length) { showView('plan'); renderPlanView(); return; }
    showView('main');
    renderCard();
  }

  function meaningHtml(r, d) {
    if (d && d[4] && d[4].length) return senseHtml(d[4]);
    var ms = String(r[8] || '').split(/[；;]/).filter(function (x) { return x.trim(); });
    if (!ms.length) return '<p class="vempty-s">（释义见词条详情）</p>';
    return '<ul class="senses">' + ms.slice(0, 6).map(function (m) {
      return '<li><span class="pos none">—</span><span class="mean">' + esc(m.trim()) + '</span><span class="hits z">0</span></li>';
    }).join('') + '</ul>';
  }

  function renderCard() {
    var item = S.q[S.i];
    if (!item) { finishSession(); return; }
    var r = item.r, w = r[0], s = srs[w], t = today();
    var ch = letterOf(w), d = letters[ch] && letters[ch][w];
    var phon = d ? d[0] : [r[1], ''];

    var tags = '<span class="vt g">' + esc(r[2] === '超纲词' ? '超纲词' : r[2] + ' Unit ' + r[3]) + '</span>';
    if (r[6]) tags += '<span class="vt hot">真题 ' + r[6] + ' 次</span>';
    if (s && s.f === t) tags += '<span class="vt new">新词</span>';
    else if (s && s.r) tags += '<span class="vt">复习 · 第 ' + s.r + ' 遍 · 间隔 ' + (s.i || 1) + ' 天</span>';
    if (s && s.d < t) tags += '<span class="vt late">已逾期 ' + Math.abs(Math.round((new Date(t) - new Date(s.d)) / 86400000)) + ' 天</span>';

    var head = '<div class="vc-tags">' + tags + '</div>'
      + '<div class="vs-word"><h2>' + esc(w) + '</h2><div class="dphon">'
      + (phon[0] ? '<span><b>英</b>/' + esc(phon[0]) + '/</span>' : '')
      + (phon[1] ? '<span><b>美</b>/' + esc(phon[1]) + '/</span>' : '')
      + (d && d[6] ? '<button class="play" type="button" data-play="' + esc(d[6]) + '">🔊 发音</button>' : '')
      + '</div></div>';

    var body;
    if (S.reveal) {
      body = '<div class="vs-reveal">'
        + '<section class="dsec vs-dsec"><h3>释义</h3>' + meaningHtml(r, d) + '</section>'
        + (d && d[5] && d[5].length ? '<section class="dsec vs-dsec"><h3>真题例句</h3>' + exHtml(d[5].slice(0, 1), w) + '</section>' : '')
        + '</div>';
    } else {
      body = '<p class="vs-hint">先想意思，再按空格 / 点下方按钮看释义</p>';
    }

    $('#vsCard').innerHTML = head + body;
    S.reveal = !!S.reveal;
    $('#vsReveal').hidden = S.reveal;
    $('#vsActs').hidden = !S.reveal;
    S.t0 = Date.now();
    updateHud();
    autoSpeak(item);
    if (!d) loadLetter(ch).then(function () { if (S.q[S.i] === item) renderCard(); }).catch(function () {});
  }

  function updateHud() {
    var l = dayLog(today());
    $('#vsProg').textContent = '剩余 ' + Math.max(0, S.q.length - S.i);
    $('#vsScope').textContent = '今日新词 ' + l.new + '/' + plan.size + ' · 复习 ' + l.rev;
    $('#vsBar').style.width = (S.i / Math.max(1, S.q.length) * 100).toFixed(1) + '%';
  }

  function reveal() {
    if (S.reveal || !S.q[S.i]) return;
    S.reveal = true;
    renderCard();
  }

  function requeue(gap, key, max) {
    var n = (S.req[key] = (S.req[key] || 0) + 1);
    if (n > max) return;
    var at = Math.min(S.i + 1 + gap, S.q.length);
    S.q.splice(at, 0, { r: S.q[S.i].r, isNew: false });
  }

  function answer(kind) {
    if (!S.reveal) return;
    var item = S.q[S.i];
    if (!item) return;
    var r = item.r, w = r[0], t = today();
    var s = srs[w];
    if (!s) s = srs[w] = { l: 0, i: 0, d: t, r: 0, x: 0, f: t };
    var l = dayLog(t);
    if (s.dc !== t) { s.dc = t; if (s.f === t) l.new++; else l.rev++; }

    var dt = (Date.now() - S.t0) / 1000;
    if (dt > 0.3 && dt < 180) { perf.sec += dt; perf.n++; l.sec += dt; }

    s.r++;
    if (kind === 'know') {
      s.l = Math.min(s.l + 1, IV.length);
      s.i = IV[Math.min(s.l - 1, IV.length - 1)];
      s.d = addDays(t, s.i);
      l.know++;
    } else if (kind === 'fuzzy') {
      s.l = Math.max(1, s.l);
      s.i = 1;
      s.d = addDays(t, 1);
      l.fuzzy++;
      requeue(8, 'f' + w, 1);
    } else {
      s.l = 0; s.i = 1; s.d = addDays(t, 1); s.x++;
      l.again++;
      star[w] = 1; persist('star.v1', star);
      requeue(5, 'a' + w, 6);
    }
    persistStudy();
    S.i++;
    S.reveal = false;
    renderCard();
  }

  function finishSession() {
    var l = dayLog(today());
    l.done = 1;
    persistStudy();
    var st = planStats();
    var ans = l.know + l.fuzzy + l.again;
    var rate = ans ? Math.round(l.know / ans * 100) : 0;
    var learned = Object.keys(srs).length;
    $('#vsDone').innerHTML = '<div class="vd-inner">'
      + '<p class="vd-kick">TODAY DONE</p>'
      + '<h2 class="vd-h">今日 <b>' + l.new + '</b> 词 · 打卡</h2>'
      + '<div class="vd-grid">'
      + '<div><b>' + l.new + '</b><span>新学</span></div>'
      + '<div><b>' + l.rev + '</b><span>复习</span></div>'
      + '<div><b>' + rate + '%</b><span>认识率</span></div>'
      + '</div>'
      + '<p class="vd-line">连续打卡 <b>' + streakDays() + '</b> 天 · 累计学过 <b>' + learned + '</b> 词</p>'
      + '<p class="vd-line vd-dim">明天有 <b>' + dueTomorrow() + '</b> 词到期复习 · 按每天 ' + plan.size + ' 词，预计 <b>'
        + st.days + '</b> 天后背完（' + esc(st.finish.slice(5).replace('-', '/')) + '）</p>'
      + '<div class="vd-acts">'
      + '<button class="vbtn" type="button" id="vdMore">再背一组</button>'
      + '<button class="vbtn primary" type="button" id="vdBack">完成</button>'
      + '</div></div>';
    showView('done');
    $('#vsProg').textContent = '今日完成';
    $('#vsScope').textContent = '新词 ' + l.new + ' · 复习 ' + l.rev;
    $('#vsBar').style.width = '100%';
    $('#vdMore').addEventListener('click', function () {
      startSession(plan.size);          // 已超额也能继续，多背一组
    });
    $('#vdBack').addEventListener('click', closeStudy);
    fireworks();
    renderPlanBar();
  }

  /* ---- 小烟花 ---- */
  function fireworks() {
    var cv = $('#vsFire');
    if (!cv) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var W = cv.clientWidth || window.innerWidth, H = cv.clientHeight || window.innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var ps = [], t0 = performance.now(), bursts = 0;
    var HUES = [41, 208, 340, 156];
    function burst() {
      var x = W * (0.22 + Math.random() * 0.56), y = H * (0.16 + Math.random() * 0.3);
      var hue = HUES[bursts % HUES.length], n = 44;
      for (var i = 0; i < n; i++) {
        var a = Math.PI * 2 * i / n + Math.random() * 0.12;
        var v = 2.1 + Math.random() * 3.2;
        ps.push({
          x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          life: 1, hue: hue + (Math.random() * 20 - 10), r: 1.5 + Math.random() * 1.7
        });
      }
      bursts++;
    }
    function frame(now) {
      var el = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      if (bursts < 5 && el > bursts * 0.33) burst();
      for (var i = ps.length - 1; i >= 0; i--) {
        var p = ps[i];
        p.vy += 0.052; p.vx *= 0.986; p.vy *= 0.986;
        p.x += p.vx; p.y += p.vy; p.life -= 0.01;
        if (p.life <= 0) { ps.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = 'hsl(' + p.hue.toFixed(0) + ' 90% 62%)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (el < 4.2 && (ps.length || bursts < 5)) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, W, H);
    }
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------ 深搜 */
  function enableDeep() {
    var btn = $('#deepBtn');
    if (state.deep) { state.deep = false; btn.setAttribute('aria-pressed', 'false'); btn.textContent = '深搜例句'; apply(); return; }
    btn.disabled = true;
    btn.textContent = '载入词库…';
    var all = (META.letters || []).map(loadLetter);
    Promise.all(all).then(function () {
      state.deep = true;
      btn.disabled = false;
      btn.setAttribute('aria-pressed', 'true');
      btn.textContent = '深搜中';
      apply();
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = '深搜例句';
    });
  }

  /* ------------------------------------------------------------ 事件 */
  function bind() {
    var input = $('#q');
    var t = null;
    input.addEventListener('input', function () {
      clearTimeout(t);
      $('#qclear').hidden = !input.value;
      t = setTimeout(function () { state.q = input.value; apply(); }, 110);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        clearTimeout(t);
        state.q = input.value;
        apply();
        if (VIEW.length) renderDetail(VIEW[0][0]);
      } else if (e.key === 'Escape') {
        input.value = ''; state.q = ''; $('#qclear').hidden = true; apply(); input.blur();
      }
    });
    $('#qclear').addEventListener('click', function () {
      input.value = ''; state.q = ''; $('#qclear').hidden = true; apply(); input.focus();
    });
    $('#groupRow').addEventListener('click', function (e) {
      var b = e.target.closest('[data-g]');
      if (!b) return;
      state.group = b.dataset.g;
      state.unit = '';
      renderGroups(); renderUnits(); apply();
    });
    $('#letterRow').addEventListener('click', function (e) {
      var b = e.target.closest('[data-l]');
      if (!b) return;
      state.letter = b.dataset.l;
      renderLetters(); apply();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    $('#unitSel').addEventListener('change', function () { state.unit = this.value; apply(); });
    $('#freqSel').addEventListener('change', function () { state.freq = this.value; apply(); });
    $('#sortSel').addEventListener('change', function () { state.sort = this.value; apply(); });

    $('#list').addEventListener('click', function (e) {
      var row = e.target.closest('.wrow');
      if (row) renderDetail(row.dataset.w);
    });
    $('#list').addEventListener('keydown', function (e) {
      var row = e.target.closest('.wrow');
      if (row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); renderDetail(row.dataset.w); }
    });

    $('#detail').addEventListener('click', function (e) {
      var w = curWord;
      if (e.target.closest('.dclose')) { closeDetail(); return; }
      var p = e.target.closest('[data-play]');
      if (p) { play(p.dataset.play, p); return; }
      var s = e.target.closest('[data-star]');
      if (s) { toggleSet('star', s.dataset.star); s.classList.toggle('on'); renderGroups(); paintSelected(); return; }
      var k = e.target.closest('[data-known]');
      if (k) { toggleSet('known', k.dataset.known); k.classList.toggle('done'); renderGroups(); paintSelected(); return; }
      var c = e.target.closest('[data-copy]');
      if (c) { copyCard(c.dataset.copy); return; }
      var st = e.target.closest('[data-step]');
      if (st) {
        var dir = +st.dataset.step;
        var list = VIEW.length ? VIEW : ROWS;
        var i = 0;
        for (var j = 0; j < list.length; j++) if (list[j][0] === w) { i = j; break; }
        var nx = list[Math.min(Math.max(i + dir, 0), list.length - 1)];
        if (nx) renderDetail(nx[0]);
        return;
      }
    });

    $('#studyBtn').addEventListener('click', openStudy);
    $('#vsClose').addEventListener('click', closeStudy);
    $('#mask').addEventListener('click', closeStudy);
    $('#vsReveal').addEventListener('click', reveal);
    $('#vsKnow').addEventListener('click', function () { answer('know'); });
    $('#vsFuzzy').addEventListener('click', function () { answer('fuzzy'); });
    $('#vsAgain').addEventListener('click', function () { answer('again'); });
    $('#vsVoice').addEventListener('click', function () {
      plan.au = plan.au ? 0 : 1;
      persist('plan.v2', plan);
      paintVoice();
      if (plan.au) {
        var item = S.q[S.i];
        if (item) { item.spoke = 0; autoSpeak(item); }
      } else {
        try { audio.pause(); } catch (e) {}
      }
    });
    $('#vsGear').addEventListener('click', function () {
      if (!$('#vsMain').hidden && S.q.length && S.i < S.q.length) {
        if (!confirm('回到计划页？这一轮没背完的进度会保留，下次继续。')) return;
      }
      renderPlanView();
      showView('plan');
    });
    $('#vsCard').addEventListener('click', function (e) {
      var p = e.target.closest('[data-play]');
      if (p) { play(p.dataset.play, p); return; }
      if (!S.reveal) reveal();
    });
    $('#deepBtn').addEventListener('click', enableDeep);

    $('#aboutBtn').addEventListener('click', function () {
      var b = $('#aboutBody');
      if (!b.dataset.on) {
        b.innerHTML = String(META.about || '').split(/(?<=。)\s*/).filter(Boolean)
          .map(function (s) { return '<p>' + esc(s) + '</p>'; }).join('');
        b.dataset.on = '1';
      }
      $('#aboutDlg').showModal();
    });

    document.addEventListener('keydown', function (e) {
      if (!$('#study').hidden) {
        if (e.key === 'Escape') { closeStudy(); return; }
        if ($('#vsMain').hidden) return;          // 计划页 / 完成页不响应背诵快捷键
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!S.reveal) reveal(); }
        else if (e.key === '1') { e.preventDefault(); answer('again'); }
        else if (e.key === '2') { e.preventDefault(); answer('fuzzy'); }
        else if (e.key === '3') { e.preventDefault(); answer('know'); }
        return;
      }
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if (e.key === '/' && !typing) { e.preventDefault(); $('#q').focus(); }
      else if (e.key === 'Escape') {
        if ($('#detail').classList.contains('open')) closeDetail();
      }
    });
  }

  function toggleSet(kind, w) {
    var set = kind === 'star' ? star : known;
    if (set[w]) delete set[w]; else set[w] = 1;
    persist(kind === 'star' ? 'star.v1' : 'known.v1', set);
    if (kind === 'star' && star[w]) delete known[w], persist('known.v1', known);
    if (kind === 'known' && known[w]) delete star[w], persist('star.v1', star);
  }

  /* ------------------------------------------------------------ 启动 */
  renderGroups();
  renderLetters();
  renderUnits();
  bind();
  apply();
  paintVoice();
  renderPlanBar();

  (function restore() {
    if (/^#\/study$/.test(location.hash)) { openStudy(); return; }
    var m = location.hash.match(/^#\/w\/(.+)$/);
    if (m) { renderDetail(decodeURIComponent(m[1])); return; }
    var qm = location.hash.match(/^#\/q\/(.+)$/);
    if (qm) {
      var q = decodeURIComponent(qm[1]);
      $('#q').value = q;
      $('#qclear').hidden = false;
      state.q = q;
      apply();
      return;
    }
    var last = store('pos.v1', '');
    if (last) {
      var r = ROWS.filter(function (x) { return x[0] === last; })[0];
      if (r) paintSelected();   // 只在列表里高亮上次看的词，不自动弹详情
    }
  })();
})();
