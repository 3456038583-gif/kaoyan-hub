/* 数据备份 · 导出 / 恢复本机学习记录
   数据全部来自 localStorage，本页只做序列化与写回，不向任何服务器发送。 */
(function () {
  'use strict';

  var APP = 'kaoyan-hub';
  var KIND = 'study-data';
  var VER = 1;

  /* ───────────────── 板块定义 ─────────────────
     match：这个键属于哪一块；data：是不是学习记录（false 视为界面偏好） */
  var SECTIONS = [
    {
      id: 'math', code: '数', label: '数学真题', href: '/math/',
      desc: '数一 / 数二 / 数三 逐卷记分、错题本、模拟卷、计时',
      match: function (k) { return k.indexOf('kaoyanMath.') === 0; },
      data: function (k) { return /^kaoyanMath\.(scores|wrong|mocks|timers|yearDone)\.v1$/.test(k); }
    },
    {
      id: 'exam', code: '英', label: '英语真题', href: '/exam/',
      desc: '英语一 2006—2026、英语二 2010—2026 的作答与得分',
      match: function (k) { return /^(kaoyan-exam:|kaoyan-exam-sum:|kaoyanExam\.)/.test(k); },
      data: function (k) { return /^(kaoyan-exam:|kaoyan-exam-sum:)/.test(k); }
    },
    {
      id: 'politics', code: '政', label: '政治真题', href: '/politics/',
      desc: '2010—2026 真题与肖八的作答、得分、成绩台账',
      match: function (k) {
        return /^(kaoyan-politics:|kaoyan-politics-sum:|kaoyan-politics-scorelog\.v1|kaoyanPolitics\.)/.test(k);
      },
      data: function (k) {
        return /^(kaoyan-politics:|kaoyan-politics-sum:|kaoyan-politics-scorelog\.v1)/.test(k);
      }
    },
    {
      id: 'english', code: '速', label: '英语一刷 / 二刷', href: '/exam/',
      desc: '一刷 / 二刷的完形、阅读、新题型得分与计时',
      match: function (k) {
        return /^(kaoyan-eng1-|kaoyanEnglish\.|kaoyan-set$|kaoyan-y1-year$|kaoyan-y2-year$)/.test(k);
      },
      data: function (k) {
        return /^(kaoyan-eng1-scores-v1|kaoyan-eng1-timers-v1|kaoyanEnglish\.yearDone\.v1)$/.test(k);
      }
    },
    {
      id: 'library', code: '库', label: '知识库', href: '/library/',
      desc: '解题手册作答、判断题卡片自测进度',
      match: function (k) { return k.indexOf('kaoyan-jieti-') === 0; },
      data: function () { return true; }
    }
  ];

  var OTHER = { id: 'other', code: '·', label: '其它记录', href: '', desc: '没有归入以上板块的零星数据' };

  /* ───────────────── 小工具 ───────────────── */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };

  function fmtD(t) {
    if (!t) return '—';
    var d = new Date(t);
    if (isNaN(d.getTime())) return '—';
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function fmtDT(t) {
    if (!t) return '—';
    var d = new Date(t);
    if (isNaN(d.getTime())) return '—';
    return fmtD(t) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function fmtSize(b) {
    if (!b) return '0 KB';
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1024 / 1024).toFixed(2) + ' MB';
  }
  function isObj(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
  function countKeys(o) { return isObj(o) ? Object.keys(o).length : 0; }
  function sumArr(a) { var s = 0; for (var i = 0; i < a.length; i++) s += Number(a[i]) || 0; return s; }

  /* 从任意结构里找最近一次写入时间（只认 13 位毫秒时间戳字段） */
  function latestOf(v, depth) {
    if (!v || typeof v !== 'object' || (depth || 0) > 4) return 0;
    var best = 0, i;
    if (Array.isArray(v)) {
      for (i = 0; i < v.length; i++) best = Math.max(best, latestOf(v[i], (depth || 0) + 1));
      return best;
    }
    var ks = Object.keys(v);
    for (i = 0; i < ks.length; i++) {
      var k = ks[i], x = v[k];
      if ((k === 't' || k === 'savedAt' || k === 'at') && typeof x === 'number' && x > 1e12) {
        best = Math.max(best, x);
      } else if (x && typeof x === 'object') {
        best = Math.max(best, latestOf(x, (depth || 0) + 1));
      }
    }
    return best;
  }

  /* 读 localStorage：能 JSON 解析就解析，否则留原字符串 */
  function readKey(k) {
    var raw;
    try { raw = localStorage.getItem(k); } catch (e) { return undefined; }
    if (raw === null) return undefined;
    try { return JSON.parse(raw); } catch (e) { return raw; }
  }

  /* ───────────────── 扫描 ───────────────── */
  function scan(includePref) {
    var all = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('kaoyan') === 0) all.push(k);
      }
    } catch (e) { /* 隐私模式 */ }

    var buckets = {};
    SECTIONS.forEach(function (s) { buckets[s.id] = { data: {}, pref: {} }; });
    buckets.other = { data: {}, pref: {} };

    all.forEach(function (k) {
      var sec = null;
      for (var j = 0; j < SECTIONS.length; j++) {
        if (SECTIONS[j].match(k)) { sec = SECTIONS[j]; break; }
      }
      var v = readKey(k);
      if (v === undefined) return;
      if (!sec) { buckets.other.data[k] = v; return; }
      if (sec.data(k)) buckets[sec.id].data[k] = v;
      else buckets[sec.id].pref[k] = v;
    });

    var out = [];
    var defs = SECTIONS.concat([OTHER]);
    defs.forEach(function (d) {
      var b = buckets[d.id];
      var dataN = Object.keys(b.data).length;
      var prefN = Object.keys(b.pref).length;
      if (d.id === 'other' && !dataN) return;
      var used = includePref ? mergeMaps(b.data, b.pref) : b.data;
      var bytes = 0, last = 0;
      Object.keys(used).forEach(function (k) {
        var raw;
        try { raw = localStorage.getItem(k) || ''; } catch (e) { raw = ''; }
        bytes += (k.length + raw.length) * 2;
        last = Math.max(last, latestOf(used[k]));
      });
      out.push({
        id: d.id, code: d.code, label: d.label, href: d.href, desc: d.desc,
        data: b.data, pref: b.pref,
        dataN: dataN, prefN: prefN,
        records: countRecords(d.id, used),
        bytes: bytes, last: last,
        empty: !Object.keys(used).length
      });
    });

    var tot = { sections: 0, records: 0, bytes: 0, last: 0, keys: 0 };
    out.forEach(function (s) {
      if (s.empty) return;
      tot.sections++;
      tot.records += s.records;
      tot.bytes += s.bytes;
      tot.last = Math.max(tot.last, s.last);
      tot.keys += Object.keys(s.data).length + (includePref ? Object.keys(s.pref).length : 0);
    });
    return { list: out, totals: tot };
  }

  function mergeMaps(a, b) {
    var o = {};
    Object.keys(a).forEach(function (k) { o[k] = a[k]; });
    Object.keys(b).forEach(function (k) { o[k] = b[k]; });
    return o;
  }

  /* 记录条数：按板块自身语义算，不用「键数」糊弄 */
  function countRecords(id, keys) {
    var n = 0;
    if (id === 'math') {
      n += countKeys(keys['kaoyanMath.scores.v1']);
      var w = keys['kaoyanMath.wrong.v1'];
      n += Array.isArray(w) ? w.length : 0;
      var m = keys['kaoyanMath.mocks.v1'];
      n += Array.isArray(m) ? m.length : 0;
      n += countKeys(keys['kaoyanMath.yearDone.v1']);
      n += countKeys(keys['kaoyanMath.timers.v1']);
      return n;
    }
    if (id === 'exam') {
      var set = {};
      Object.keys(keys).forEach(function (k) {
        if (k.indexOf('kaoyan-exam:') === 0) set[k.slice('kaoyan-exam:'.length)] = 1;
        else if (k.indexOf('kaoyan-exam-sum:') === 0) set[k.slice('kaoyan-exam-sum:'.length)] = 1;
      });
      return Object.keys(set).length;
    }
    if (id === 'politics') {
      var set2 = {};
      Object.keys(keys).forEach(function (k) {
        if (k.indexOf('kaoyan-politics:') === 0) set2[k.slice('kaoyan-politics:'.length)] = 1;
        else if (k.indexOf('kaoyan-politics-sum:') === 0) set2[k.slice('kaoyan-politics-sum:'.length)] = 1;
      });
      n = Object.keys(set2).length;
      var sl = keys['kaoyan-politics-scorelog.v1'];
      if (isObj(sl)) {
        n += Array.isArray(sl.logs) ? sl.logs.length : 0;
        n += Array.isArray(sl.customs) ? sl.customs.length : 0;
      }
      return n;
    }
    if (id === 'english') {
      var sc = keys['kaoyan-eng1-scores-v1'];
      if (isObj(sc)) {
        ['r1', 'r2'].forEach(function (s) { n += countKeys(sc[s]); });
      }
      n += countKeys(keys['kaoyanEnglish.yearDone.v1']);
      n += countKeys(keys['kaoyan-eng1-timers-v1']);
      return n;
    }
    if (id === 'library') {
      n += countKeys(keys['kaoyan-jieti-tfcard.v1']);
      n += countKeys(keys['kaoyan-jieti-ans.v1']);
      n += countKeys(keys['kaoyan-jieti-ans.v1:tf']);
      return n;
    }
    Object.keys(keys).forEach(function (k) {
      var v = keys[k];
      n += Array.isArray(v) ? v.length : (isObj(v) ? 1 : 1);
    });
    return n;
  }

  /* ───────────────── 打包 ───────────────── */
  function buildPayload(scope, includePref) {
    var st = scan(includePref);
    var now = Date.now();
    var sections = {};
    var keysN = 0;

    st.list.forEach(function (s) {
      if (scope !== 'all' && s.id !== scope) return;
      var used = includePref ? mergeMaps(s.data, s.pref) : s.data;
      var ks = Object.keys(used);
      if (!ks.length) return;
      var box = {};
      ks.forEach(function (k) { box[k] = used[k]; });
      sections[s.id] = { label: s.label, keys: box };
      keysN += ks.length;
    });

    return {
      _meta: {
        app: APP,
        kind: KIND,
        version: VER,
        scope: scope,
        exportedAt: new Date(now).toISOString(),
        exportedAtLocal: fmtDT(now),
        origin: location.protocol + '//' + location.host,
        userAgent: navigator.userAgent.slice(0, 120),
        sections: Object.keys(sections).length,
        keys: keysN,
        withPrefs: !!includePref
      },
      sections: sections
    };
  }

  function download(name, text, mime) {
    var blob = new Blob([text], { type: (mime || 'application/json') + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
  }

  function stamp() {
    var d = new Date();
    return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + '-' + pad2(d.getHours()) + pad2(d.getMinutes());
  }

  /* ───────────────── CSV ───────────────── */
  var CSV_HEAD = ['板块', '类型', '名称', '得分', '满分', '正确数', '已答', '题数', '用时', '日期', '备注'];

  function csvCell(v) {
    var s = v === null || v === undefined ? '' : String(v);
    if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  }
  function toCSV(rows) {
    var out = [CSV_HEAD.map(csvCell).join(',')];
    rows.forEach(function (r) {
      var line = [];
      for (var i = 0; i < CSV_HEAD.length; i++) line.push(csvCell(r[i]));
      out.push(line.join(','));
    });
    return '\ufeff' + out.join('\r\n');
  }

  function yearOf(k) { return (/(\d{4})/.exec(String(k)) || [])[1] || ''; }
  function subjName(v) { return ['一', '二', '三'][Number(v) - 1] || ''; }

  function rowsOfMath(keys) {
    var rows = [];
    var sc = keys['kaoyanMath.scores.v1'];
    if (isObj(sc)) {
      Object.keys(sc).sort().forEach(function (k) {
        var m = /^(\d{4})-([123])$/.exec(k);
        var rec = isObj(sc[k]) ? sc[k] : {};
        var sel = isObj(rec.sel) ? rec.sel : {};
        var big = isObj(rec.big) ? rec.big : {};
        var selKeys = Object.keys(sel);
        var selOk = selKeys.filter(function (n) { return Number(sel[n]) > 0; }).length;
        var bigKeys = Object.keys(big);
        var bigSum = sumArr(bigKeys.map(function (n) { return big[n]; }));
        var qn = m ? (Number(m[1]) >= 2021 ? 22 : 23) : '';
        rows.push([
          '数学真题', '真题记分',
          m ? m[1] + ' 年 · 数' + subjName(m[2]) : k,
          '', '', selOk, selKeys.length, qn, '',
          '',
          '选填 ' + selOk + '/' + selKeys.length + ' 对 · 大题 ' + bigKeys.length + ' 题共 ' + bigSum + ' 分'
        ]);
      });
    }
    var mocks = keys['kaoyanMath.mocks.v1'];
    if (Array.isArray(mocks)) {
      mocks.forEach(function (mo) {
        if (!isObj(mo)) return;
        rows.push(['数学真题', '模拟卷', mo.name || '未命名模拟卷', '', '', '', '', '', '', fmtD(mo.t),
          mo.subject ? '数' + subjName(mo.subject) : '']);
      });
    }
    var wrong = keys['kaoyanMath.wrong.v1'];
    if (Array.isArray(wrong)) {
      wrong.forEach(function (k) {
        var m = /^(\d{4})-([123])-(\d+)$/.exec(String(k));
        rows.push(['数学真题', '错题', m ? m[1] + ' 年 · 数' + subjName(m[2]) + ' 第 ' + m[3] + ' 题' : String(k),
          '', '', '', '', '', '', '', '']);
      });
    }
    var done = keys['kaoyanMath.yearDone.v1'];
    if (isObj(done)) {
      Object.keys(done).forEach(function (k) {
        var m = /^(\d{4})-([123])$/.exec(k);
        if (!m || done[k] !== true) return;
        rows.push(['数学真题', '标记完成', m[1] + ' 年 · 数' + subjName(m[2]), '', '', '', '', '', '', '', '手动标记']);
      });
    }
    var timers = keys['kaoyanMath.timers.v1'];
    if (isObj(timers)) {
      Object.keys(timers).sort().forEach(function (k) {
        var t = timers[k];
        var ms = t ? Number(t.acc) || 0 : 0;
        if (!ms) return;
        rows.push(['数学真题', '计时', String(k).split('|')[0], '', '', '', '', '',
          Math.round(ms / 60000) + ' 分', '', '']);
      });
    }
    return rows;
  }

  function rowsOfExam(keys) {
    var rows = [];
    Object.keys(keys).forEach(function (k) {
      if (k.indexOf('kaoyan-exam-sum:') !== 0) return;
      var v = keys[k];
      if (!isObj(v) || !v.id) return;
      rows.push(['英语真题', '真题', v.title || v.id, v.score, v.full, v.right, v.objDone, v.total, '', fmtD(v.t), '']);
    });
    Object.keys(keys).forEach(function (k) {
      if (k.indexOf('kaoyan-exam:') !== 0) return;
      var id = k.slice('kaoyan-exam:'.length);
      if (keys['kaoyan-exam-sum:' + id]) return;      // 已有快照就不重复列
      var v = keys[k];
      if (!isObj(v)) return;
      var picks = isObj(v.picks) ? v.picks : {};
      var subs = isObj(v.submittedSec) ? v.submittedSec : {};
      rows.push(['英语真题', '真题 · 未提交', id, '', '', '', Object.keys(picks).length, '',
        '', fmtD(v.t), Object.keys(subs).length + ' 个题型已提交']);
    });
    return rows;
  }

  function politicsPaperName(pid, customs) {
    var m = /^real-(\d{4})$/.exec(pid);
    if (m) return m[1] + ' 年真题';
    m = /^xiao8-(\d+)$/.exec(pid);
    if (m) return '肖八 · 第 ' + m[1] + ' 套';
    m = /^xiao4-(\d+)$/.exec(pid);
    if (m) return '肖四 · 第 ' + m[1] + ' 套';
    m = /^custom-(.+)$/.exec(pid);
    if (m && customs) {
      for (var i = 0; i < customs.length; i++) {
        if (customs[i] && customs[i].id === m[1]) return customs[i].name || '自建试卷';
      }
      return '自建试卷';
    }
    return pid;
  }

  function rowsOfPolitics(keys) {
    var rows = [];
    var sl = keys['kaoyan-politics-scorelog.v1'];
    var customs = isObj(sl) && Array.isArray(sl.customs) ? sl.customs : [];

    Object.keys(keys).forEach(function (k) {
      if (k.indexOf('kaoyan-politics-sum:') !== 0) return;
      var v = keys[k];
      if (!isObj(v) || !v.id) return;
      rows.push(['政治真题', '真题', v.title || (v.year ? v.year + ' 年' : v.id), v.score, v.full,
        v.right, v.objDone, v.total, '', fmtD(v.t), '']);
    });

    if (Array.isArray(sl && sl.logs)) {
      sl.logs.slice().sort(function (a, b) { return (a.t || 0) - (b.t || 0); }).forEach(function (l) {
        if (!isObj(l)) return;
        var s = Number(l.s) || 0, mm = Number(l.m) || 0;
        rows.push(['政治真题', '成绩台账', politicsPaperName(l.p, customs), s + mm, 50,
          '', '', '', '', fmtD(l.t), '单选 ' + s + '/16 · 多选 ' + mm + '/34']);
      });
    }
    if (customs.length) {
      customs.forEach(function (c) {
        if (!c || !c.name) return;
        rows.push(['政治真题', '自建试卷', c.name, '', '', '', '', '', '', '', '']);
      });
    }
    return rows;
  }

  function rowsOfEnglish(keys) {
    var rows = [];
    var sc = keys['kaoyan-eng1-scores-v1'];
    if (isObj(sc)) {
      ['r1', 'r2'].forEach(function (set) {
        var src = sc[set];
        if (!isObj(src)) return;
        Object.keys(src).sort().forEach(function (year) {
          var rec = isObj(src[year]) ? src[year] : {};
          var pick = function (key) { return Number.isInteger(rec[key]) ? rec[key] : null; };
          var cloze = pick('cloze'), b = pick('partB');
          var ts = ['t1', 't2', 't3', 't4'].map(pick);
          var filled = 0, score = 0, note = [];
          if (cloze !== null) { filled++; score += cloze * 0.5; note.push('完形 ' + cloze + '/20'); }
          var readOk = ts.filter(function (x) { return x !== null; }).length;
          if (readOk) {
            filled += readOk;
            score += ts.reduce(function (a, x) { return a + (x || 0); }, 0) * 2;
            note.push('阅读 ' + ts.map(function (x) { return x === null ? '—' : x; }).join('/'));
          }
          if (b !== null) { filled++; score += b * 2; note.push('新题型 ' + b + '/5'); }
          var rounded = Math.round(score * 10) / 10;
          var right = (cloze || 0) + ts.reduce(function (a, x) { return a + (x || 0); }, 0) + (b || 0);
          rows.push(['英语速查', set === 'r1' ? '一刷' : '二刷', year + ' 年',
            rounded, 60, right, '', 45, '', '', note.join(' · ')]);
        });
      });
    }
    var done = keys['kaoyanEnglish.yearDone.v1'];
    if (isObj(done)) {
      Object.keys(done).sort().forEach(function (k) {
        if (done[k] !== true) return;
        var m = /^(r[12])-(\d{4})$/.exec(k);
        rows.push(['英语速查', '标记完成', m ? (m[1] === 'r1' ? '一刷 ' : '二刷 ') + m[2] + ' 年' : k,
          '', '', '', '', '', '', '', '手动标记']);
      });
    }
    var timers = keys['kaoyan-eng1-timers-v1'];
    if (isObj(timers)) {
      Object.keys(timers).sort().forEach(function (k) {
        var ms = Number(timers[k] && timers[k].acc) || 0;
        if (!ms) return;
        rows.push(['英语速查', '计时', String(k).split('|')[0], '', '', '', '', '',
          Math.round(ms / 60000) + ' 分', '', String(k).split('|')[1] || '']);
      });
    }
    return rows;
  }

  function rowsOfLibrary(keys) {
    var rows = [];
    var tf = keys['kaoyan-jieti-tfcard.v1'];
    if (isObj(tf)) {
      Object.keys(tf).sort().forEach(function (id) {
        var rec = tf[id];
        var p = isObj(rec) && rec.p ? String(rec.p) : '';
        var answered = p ? p.replace(/-/g, '').length : 0;
        rows.push(['知识库', '卡片自测', '卡 ' + id, '', '', '', answered,
          p ? p.length : '', '', '', p ? '作答 ' + p : '']);
      });
    }
    ['kaoyan-jieti-ans.v1', 'kaoyan-jieti-ans.v1:tf'].forEach(function (key) {
      var store = keys[key];
      if (!isObj(store)) return;
      Object.keys(store).sort().forEach(function (no) {
        var r = store[no];
        if (!isObj(r)) return;
        rows.push(['知识库', key.slice(-3) === ':tf' ? '判断题' : '解题手册',
          '第 ' + no + ' 题', '', '', '', '', '', '', '', r.ok ? '答对' : '答错']);
      });
    });
    return rows;
  }

  function rowsOf(sectionId, keys) {
    if (sectionId === 'math') return rowsOfMath(keys);
    if (sectionId === 'exam') return rowsOfExam(keys);
    if (sectionId === 'politics') return rowsOfPolitics(keys);
    if (sectionId === 'english') return rowsOfEnglish(keys);
    if (sectionId === 'library') return rowsOfLibrary(keys);
    return Object.keys(keys).map(function (k) {
      var v = keys[k];
      var n = Array.isArray(v) ? v.length : (isObj(v) ? Object.keys(v).length : 1);
      return ['其它', '记录', k, '', '', '', '', n, '', '', ''];
    });
  }

  /* ───────────────── 渲染 ───────────────── */
  var state = { scan: null };

  function render() {
    var withPref = $('#optPref').checked;
    var st = scan(withPref);
    state.scan = st;

    $('#stSec').textContent = st.totals.sections || 0;
    $('#stRec').textContent = st.totals.records || 0;
    $('#stSize').textContent = fmtSize(st.totals.bytes);
    var lastEl = $('#stLast');
    lastEl.textContent = st.totals.last ? fmtD(st.totals.last) : '—';
    lastEl.className = st.totals.last ? '' : 'dim';

    var none = !st.totals.records && !st.totals.keys;
    $('#btnAll').disabled = none;
    $('#btnCsv').disabled = none;
    $('#boardHint').textContent = none
      ? '这台设备上还没有任何学习记录。先在真题页做几道题，再回来备份。'
      : '数据只存在这台设备的浏览器里，导出之前不会上传到任何地方。';

    var host = $('#secList');
    host.innerHTML = '';
    st.list.forEach(function (s) {
      var row = document.createElement('article');
      row.className = 'sec-row' + (s.empty ? ' empty' : '');
      row.setAttribute('data-id', s.id);

      var code = document.createElement('div');
      code.className = 'sec-code';
      code.textContent = s.code;

      var main = document.createElement('div');
      main.className = 'sec-main';
      var h3 = document.createElement('h3');
      if (s.href) {
        var a = document.createElement('a');
        a.href = s.href;
        a.textContent = s.label;
        h3.appendChild(a);
      } else {
        h3.textContent = s.label;
      }
      var p = document.createElement('p');
      p.textContent = s.desc;
      main.appendChild(h3);
      main.appendChild(p);

      var num = document.createElement('div');
      num.className = 'sec-num';
      num.setAttribute('data-size', fmtSize(s.bytes));
      num.innerHTML = '<b>' + (s.records || 0) + '</b><span>条</span>';

      var size = document.createElement('div');
      size.className = 'sec-size';
      size.textContent = fmtSize(s.bytes);

      var acts = document.createElement('div');
      acts.className = 'sec-acts';
      var bj = document.createElement('button');
      bj.type = 'button';
      bj.setAttribute('data-json', '1');
      bj.textContent = 'JSON';
      bj.disabled = s.empty;
      bj.title = '导出「' + s.label + '」的完整数据';
      var bc = document.createElement('button');
      bc.type = 'button';
      bc.setAttribute('data-csv', '1');
      bc.textContent = 'CSV';
      bc.disabled = s.empty;
      bc.title = '导出「' + s.label + '」的可读表格';
      acts.appendChild(bj);
      acts.appendChild(bc);

      row.appendChild(code);
      row.appendChild(main);
      row.appendChild(num);
      row.appendChild(size);
      row.appendChild(acts);
      host.appendChild(row);
    });
  }

  /* ───────────────── 导出动作 ───────────────── */
  function exportJSON(scope) {
    var withPref = $('#optPref').checked;
    var payload = buildPayload(scope, withPref);
    if (!Object.keys(payload.sections).length) { toast('这块还没有记录', 'bad'); return; }
    var label = scope === 'all' ? '全站' : (payload.sections[scope] ? payload.sections[scope].label : scope);
    var name = (scope === 'all' ? 'kaoyan-hub-全部数据-' : 'kaoyan-hub-' + label + '-') + stamp() + '.json';
    download(name, JSON.stringify(payload, null, 2));
    toast('已导出「' + label + '」' + payload._meta.keys + ' 项 · ' + payload._meta.sections + ' 个板块', 'good');
  }

  function exportCSV(scope) {
    var withPref = $('#optPref').checked;
    var st = scan(withPref);
    var rows = [];
    st.list.forEach(function (s) {
      if (scope !== 'all' && s.id !== scope) return;
      rows = rows.concat(rowsOf(s.id, s.data));
    });
    if (!rows.length) { toast('这块还没有可导出的记录', 'bad'); return; }
    var label = scope === 'all' ? '全部成绩' : s_label(scope);
    download('kaoyan-hub-' + label + '-' + stamp() + '.csv', toCSV(rows), 'text/csv');
    toast('已导出 ' + rows.length + ' 行 CSV', 'good');
  }

  function s_label(id) {
    for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].id === id) return SECTIONS[i].label;
    return id;
  }

  /* ───────────────── 恢复 ───────────────── */
  function deepMerge(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
      var out = a.slice(), seen = {};
      a.forEach(function (x) { seen[JSON.stringify(x)] = 1; });
      b.forEach(function (x) {
        var key = JSON.stringify(x);
        if (!seen[key]) { seen[key] = 1; out.push(x); }
      });
      return out;
    }
    if (isObj(a) && isObj(b)) {
      var o = {}, k;
      for (k in a) if (Object.prototype.hasOwnProperty.call(a, k)) o[k] = a[k];
      for (k in b) {
        if (!Object.prototype.hasOwnProperty.call(b, k)) continue;
        o[k] = Object.prototype.hasOwnProperty.call(o, k) ? deepMerge(o[k], b[k]) : b[k];
      }
      return o;
    }
    return a;   // 冲突时保留本机
  }

  /* 计时器不能相加（会重复计），同键取累计更长的那个 */
  function mergeTimers(a, b) {
    if (!isObj(a) || !isObj(b)) return a;
    var o = {}, k;
    for (k in a) o[k] = a[k];
    for (k in b) {
      if (!isObj(o[k])) { o[k] = b[k]; continue; }
      var accA = Number(o[k].acc) || 0, accB = Number(b[k].acc) || 0;
      o[k] = {
        acc: Math.max(accA, accB),
        at: o[k].at || b[k].at || null,
        savedAt: Math.max(Number(o[k].savedAt) || 0, Number(b[k].savedAt) || 0) || undefined
      };
    }
    return o;
  }

  var TIMER_KEYS = { 'kaoyanMath.timers.v1': 1, 'kaoyan-eng1-timers-v1': 1 };

  function applyRestore(pack, mode) {
    var res = { added: 0, merged: 0, replaced: 0, kept: 0, failed: 0 };
    var sections = pack.sections || {};

    Object.keys(sections).forEach(function (sid) {
      var box = sections[sid];
      var keys = (box && box.keys) || {};
      Object.keys(keys).forEach(function (k) {
        if (k.indexOf('kaoyan') !== 0) { res.failed++; return; }
        var incoming = keys[k];
        var cur = readKey(k);

        try {
          if (mode === 'replace') {
            localStorage.setItem(k, typeof incoming === 'string' ? incoming : JSON.stringify(incoming));
            res.replaced++;
            return;
          }
          if (cur === undefined) {
            localStorage.setItem(k, typeof incoming === 'string' ? incoming : JSON.stringify(incoming));
            res.added++;
            return;
          }
          var merged = TIMER_KEYS[k] ? mergeTimers(cur, incoming) : deepMerge(cur, incoming);
          var before = JSON.stringify(cur), after = JSON.stringify(merged);
          localStorage.setItem(k, after);
          if (before === after) res.kept++;
          else res.merged++;
        } catch (e) {
          res.failed++;
        }
      });
    });
    return res;
  }

  function showConfirm(pack, file) {
    var old = $('.confirm');
    if (old) old.remove();

    var meta = pack._meta || {};
    var secN = Object.keys(pack.sections || {}).length;
    var keysN = 0;
    Object.keys(pack.sections || {}).forEach(function (s) {
      keysN += Object.keys((pack.sections[s] && pack.sections[s].keys) || {}).length;
    });

    var box = document.createElement('div');
    box.className = 'confirm';
    box.innerHTML =
      '<div class="confirm-box" role="dialog" aria-modal="true" aria-labelledby="cfTitle">' +
        '<h3 id="cfTitle">恢复备份</h3>' +
        '<p>这份文件来自 ' + esc(meta.origin || '未知站点') + '，确认后写入本机浏览器。</p>' +
        '<dl>' +
          '<dt>备份时间</dt><dd>' + esc(meta.exportedAtLocal || '—') + '</dd>' +
          '<dt>板块</dt><dd>' + secN + ' 个</dd>' +
          '<dt>数据项</dt><dd>' + keysN + ' 项</dd>' +
          '<dt>文件名</dt><dd style="word-break:break-all">' + esc(file.name) + '</dd>' +
        '</dl>' +
        '<label class="chk"><input type="checkbox" id="cfReplace"> ' +
          '<span>用文件覆盖本机同名数据（不勾选则只补缺失的记录）</span></label>' +
        '<div class="confirm-acts">' +
          '<button type="button" data-x="cancel">取消</button>' +
          '<button type="button" class="ok" data-x="ok">开始恢复</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(box);
    box.querySelector('[data-x="cancel"]').addEventListener('click', function () { box.remove(); });
    box.addEventListener('click', function (e) { if (e.target === box) box.remove(); });
    box.querySelector('[data-x="ok"]').addEventListener('click', function () {
      var mode = box.querySelector('#cfReplace').checked ? 'replace' : 'merge';
      var res = applyRestore(pack, mode);
      box.remove();
      render();
      var parts = [];
      if (res.added) parts.push('新增 ' + res.added + ' 项');
      if (res.merged) parts.push('合并 ' + res.merged + ' 项');
      if (res.replaced) parts.push('覆盖 ' + res.replaced + ' 项');
      if (res.kept) parts.push('已是最新 ' + res.kept + ' 项');
      if (res.failed) parts.push('失败 ' + res.failed + ' 项');
      toast('恢复完成：' + (parts.join(' · ') || '没有需要写入的数据') +
        '。打开对应板块就能看到，个别页面需要刷新一次。', res.failed ? 'bad' : 'good');
    });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function handleFile(file) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast('文件超过 8 MB，可能不是备份文件', 'bad'); return; }
    var fr = new FileReader();
    fr.onload = function () {
      var pack;
      try { pack = JSON.parse(String(fr.result)); } catch (e) { pack = null; }
      if (!pack || !pack._meta || pack._meta.kind !== KIND || !pack.sections) {
        toast('这不是本站导出的备份文件', 'bad');
        return;
      }
      if (pack._meta.app !== APP) {
        toast('备份来自别的站点（' + esc(pack._meta.app) + '），已停止', 'bad');
        return;
      }
      showConfirm(pack, file);
    };
    fr.onerror = function () { toast('文件读不出来，换一个试试', 'bad'); };
    fr.readAsText(file);
  }

  /* ───────────────── 提示条 ───────────────── */
  var toastTimer = 0;
  function toast(msg, kind) {
    var el = $('#toast');
    el.textContent = msg;
    el.className = 'toast on' + (kind ? ' ' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.className = 'toast' + (kind ? ' ' + kind : ''); }, 4200);
  }

  /* ───────────────── 事件 ───────────────── */
  $('#btnAll').addEventListener('click', function () { exportJSON('all'); });
  $('#btnCsv').addEventListener('click', function () { exportCSV('all'); });
  $('#btnImport').addEventListener('click', function () { $('#fileIn').click(); });
  $('#optPref').addEventListener('change', render);

  $('#fileIn').addEventListener('change', function (e) {
    handleFile(e.target.files && e.target.files[0]);
    e.target.value = '';
  });

  $('#secList').addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var row = btn.closest('.sec-row');
    if (!row) return;
    var id = row.getAttribute('data-id');
    if (btn.hasAttribute('data-json')) exportJSON(id);
    else if (btn.hasAttribute('data-csv')) exportCSV(id);
  });

  /* 从板块页带 #politics 之类的锚点过来，直接定位到那一行 */
  function focusHash() {
    var id = String(location.hash || '').replace('#', '');
    if (!id) return;
    var row = $('.sec-row[data-id="' + id + '"]');
    if (!row) return;
    row.scrollIntoView({ block: 'center', behavior: 'smooth' });
    row.classList.add('hit');
    setTimeout(function () { row.classList.remove('hit'); }, 2400);
  }

  /* 从其它标签页写回数据后回来，统计要跟着变 */
  window.addEventListener('storage', function () { render(); });
  window.addEventListener('focus', function () { render(); });
  window.addEventListener('hashchange', focusHash);

  render();
  focusHash();
})();
