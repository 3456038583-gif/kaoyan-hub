/* 判断对错练习 · 第一部分：卡片内自测
   每张知识点卡片里的说法都可以点「正确 / 错误」，点「对照答案」后
   在该说法下面给出判定、正确答案、真题来源与解析。 */
(function () {
  var cards = [].slice.call(document.querySelectorAll('.kcard[data-tf]'));
  if (!cards.length) return;

  var KEY = 'kaoyan-jieti-tfcard.v1';
  var LAB = { T: '正确', F: '错误' };
  var store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { store = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }

  var api = [];                      // 每张卡的重置函数
  var statEl = null, statN = null;

  function stat() {
    if (!statN) return;
    var n = 0;
    cards.forEach(function (c) { if (store[c.dataset.tf]) n++; });
    statN.textContent = n;
  }

  cards.forEach(function (card) {
    var id = card.dataset.tf;
    var qs = [].slice.call(card.querySelectorAll('.tfq'));
    if (!qs.length) return;
    var picks = qs.map(function () { return ''; });
    var done = false;
    var cnt = card.querySelector('.tfbar-n b');
    var sub = card.querySelector('.tfsub');
    var redo = card.querySelector('.tfredo');
    var sum = card.querySelector('.tfbar-s');
    var score = card.querySelector('.tfscore');

    function row(q, i) {
      var ans = q.dataset.a;
      var mine = picks[i];
      var r = q.querySelector('.tfq-r');
      var x = q.querySelector('.tfq-x');
      var tg = q.querySelector('.tfq-s .ktag');
      if (!done) {
        r.hidden = true;
        r.innerHTML = '';
        if (x) x.hidden = true;
        return;
      }
      var verdict = !mine ? 'na' : (mine === ans ? 'ok' : 'no');
      r.innerHTML = '<span class="tfr-v ' + verdict + '">' +
        (verdict === 'ok' ? '✓ 答对' : verdict === 'no' ? '✗ 答错' : '未作答') + '</span>' +
        '<span class="tfr-a">正确答案 <b>' + (LAB[ans] || ans) + '</b></span>' +
        (tg ? '<span class="ktag t-src">' + tg.textContent + '</span>' : '');
      r.hidden = false;
      if (x) x.hidden = false;
    }

    function paint() {
      var n = 0, ok = 0;
      qs.forEach(function (q, i) {
        var ans = q.dataset.a, mine = picks[i];
        [].slice.call(q.querySelectorAll('.tfb')).forEach(function (b) {
          var on = mine === b.dataset.k;
          b.classList.toggle('on', on);
          b.setAttribute('aria-pressed', String(on));
          b.classList.toggle('hit', done && b.dataset.k === ans);
          b.classList.toggle('bad', done && on && b.dataset.k !== ans);
          b.disabled = done;
        });
        q.classList.toggle('tfq-done', done);
        q.classList.toggle('tfq-ok', done && mine === ans);
        q.classList.toggle('tfq-no', done && !!mine && mine !== ans);
        if (done && mine) { n++; if (mine === ans) ok++; }
        row(q, i);
      });
      if (cnt) cnt.textContent = done ? n : picks.filter(Boolean).length;
      if (sub) {
        sub.hidden = done;
        sub.disabled = picks.filter(Boolean).length === 0;
      }
      if (redo) redo.hidden = !done;
      if (score) {
        score.textContent = done ? ok + ' / ' + qs.length + ' 对'
          : picks.filter(Boolean).length + ' / ' + qs.length;
        score.className = 'tfscore' + (done && ok === qs.length ? ' all' : '');
      }
      if (sum) {
        sum.hidden = !done;
        var miss = qs.length - n;
        sum.innerHTML = '做对 <b>' + ok + '</b> / 共 ' + qs.length +
          (n < qs.length ? ' · 漏 ' + (n ? miss : qs.length) : '');
      }
      stat();
    }

    qs.forEach(function (q, i) {
      [].slice.call(q.querySelectorAll('.tfb')).forEach(function (b) {
        b.addEventListener('click', function () {
          if (done) return;
          picks[i] = picks[i] === b.dataset.k ? '' : b.dataset.k;
          paint();
        });
      });
    });

    if (sub) sub.addEventListener('click', function () {
      if (done) return;
      if (!picks.filter(Boolean).length) return;
      done = true;
      store[id] = { p: picks.map(function (v) { return v || '-'; }).join(''), d: 1 };
      save();
      paint();
    });

    if (redo) redo.addEventListener('click', function () {
      picks = qs.map(function () { return ''; });
      done = false;
      delete store[id];
      save();
      paint();
    });

    api.push(function reset() {
      picks = qs.map(function () { return ''; });
      done = false;
      paint();
    });

    var old = store[id];
    if (old && old.p) {
      var s = String(old.p);
      picks = qs.map(function (_, i) { var ch = s.charAt(i); return ch === '-' || !ch ? '' : ch; });
      done = true;
    }
    paint();
  });

  /* 挂到右下角统计条上，和第二部分共用一个「清空」 */
  var hud = document.querySelector('.quiz-hud');
  if (hud) {
    statEl = document.createElement('span');
    statEl.className = 'qh-tfc';
    statEl.innerHTML = '卡片自测 <b>0</b>/' + cards.length;
    statN = statEl.querySelector('b');
    var clear = hud.querySelector('.qh-r');
    hud.insertBefore(statEl, clear || null);
    stat();
  }
  window.addEventListener('quiz:reset', function () {
    store = {};
    save();
    api.forEach(function (f) { f(); });
    stat();
  });
})();
