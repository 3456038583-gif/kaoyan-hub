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
    audio.src = '/vocab/audio/' + src;
    audio.play().then(function () {
      if (btn) {
        btn.classList.add('playing');
        setTimeout(function () { btn.classList.remove('playing'); }, 1200);
      }
    }).catch(function () {});
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

  /* ------------------------------------------------------------ 背单词 */
  var study = { list: [], i: 0, revealed: false };
  function openStudy() {
    var pool = VIEW.length ? VIEW : ROWS;
    study.list = pool.filter(function (r) { return !known[r[0]]; });
    if (!study.list.length) study.list = pool.slice();
    study.list = study.list.slice(0, 400);
    study.i = 0;
    study.revealed = false;
    $('#study').hidden = false;
    $('#mask').hidden = false;
    document.body.style.overflow = 'hidden';
    $('#vsScope').textContent = (state.group === '@star' ? '生词本'
      : state.group === '@known' ? '已掌握'
      : state.group ? state.group : '全部词')
      + (state.unit ? ' Unit ' + state.unit : '')
      + ' · 本轮 ' + study.list.length + ' 词';
    renderStudy();
  }
  function closeStudy() {
    $('#study').hidden = true;
    $('#mask').hidden = true;
    document.body.style.overflow = '';
  }
  function renderStudy() {
    var r = study.list[study.i];
    if (!r) { closeStudy(); return; }
    $('#vsProg').textContent = (study.i + 1) + ' / ' + study.list.length;
    $('#vsBar').style.width = ((study.i + 1) / study.list.length * 100).toFixed(1) + '%';
    var w = r[0], ch = letterOf(w);
    var d = letters[ch] && letters[ch][w];
    var phon = d ? d[0] : [r[1], ''];
    var head = '<div class="vs-word"><h2>' + esc(w) + '</h2>'
      + '<div class="dphon">' + (phon[0] ? '<span><b>英</b>/' + esc(phon[0]) + '/</span>' : '')
      + (d && d[6] ? '<button class="play" type="button" data-play="' + esc(d[6]) + '">🔊 发音</button>' : '')
      + '</div></div>';
    var body = '';
    if (study.revealed) {
      body = '<div class="vs-reveal">'
        + '<section class="dsec" style="padding:0;border:0"><h3>释义</h3>' + senseHtml(d ? d[4] : []) + '</section>'
        + (d && d[5] && d[5].length ? '<section class="dsec" style="padding:0;border:0"><h3>例句</h3>' + exHtml(d[5].slice(0, 2), w) + '</section>' : '')
        + '</div>';
    } else {
      body = '<p class="vs-hint">想一下意思，再按空格或「显示释义」</p>';
    }
    $('#vsCard').innerHTML = head + body;
    if (!d) {
      loadLetter(ch).then(function () { if (study.list[study.i] === r) renderStudy(); });
    }
  }
  function next(knowIt) {
    var r = study.list[study.i];
    if (r) {
      if (knowIt) { known[r[0]] = 1; delete star[r[0]]; }
      else { star[r[0]] = 1; delete known[r[0]]; }
      persist('known.v1', known);
      persist('star.v1', star);
    }
    study.i++;
    study.revealed = false;
    renderStudy();
    renderGroups();
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
    $('#vsReveal').addEventListener('click', function () { study.revealed = true; renderStudy(); });
    $('#vsKnow').addEventListener('click', function () { next(true); });
    $('#vsAgain').addEventListener('click', function () { next(false); });
    $('#vsCard').addEventListener('click', function (e) {
      var p = e.target.closest('[data-play]');
      if (p) { play(p.dataset.play, p); return; }
      if (!study.revealed) { study.revealed = true; renderStudy(); }
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
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); study.revealed = true; renderStudy(); }
        else if (e.key === '1' || e.key === 'ArrowLeft') { e.preventDefault(); next(false); }
        else if (e.key === '2' || e.key === 'ArrowRight') { e.preventDefault(); next(true); }
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
