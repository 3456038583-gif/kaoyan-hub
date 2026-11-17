/* 解题手册：左侧目录高亮 / 窄屏折叠 / 答案遮挡 */
(function () {
  var nav = document.getElementById('opSideNav');
  if (nav) {
    var links = [].slice.call(nav.querySelectorAll('a'));
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    function highlight() {
      var y = window.scrollY + 130, cur = 0;
      for (var i = 0; i < targets.length; i++) {
        var t = targets[i];
        if (t && t.getBoundingClientRect().top + window.scrollY <= y) cur = i;
      }
      for (var j = 0; j < links.length; j++) links[j].classList.toggle('on', j === cur);
    }
    window.addEventListener('scroll', highlight, { passive: true });
    window.addEventListener('resize', highlight);
    highlight();

    var btn = document.getElementById('opSideBtn');
    var side = document.getElementById('opSide');
    if (btn && side) {
      btn.addEventListener('click', function () {
        var open = side.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
        btn.textContent = open ? '目录 ▴' : '目录 ▾';
      });
      nav.addEventListener('click', function (e) {
        if (e.target.closest('a') && window.innerWidth <= 1080) {
          side.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          btn.textContent = '目录 ▾';
        }
      });
    }
  }

  /* 侧栏折叠：默认显示，可隐藏，状态记在本地 */
  (function () {
    var layout = document.querySelector('.op-layout');
    if (!layout) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-toggle';
    document.body.appendChild(btn);
    var K = 'kaoyan-jieti-nav.v1';
    function apply(off, persist) {
      layout.classList.toggle('nav-off', off);
      btn.textContent = '☰ 目录';
      btn.hidden = !off;
      btn.setAttribute('aria-expanded', String(!off));
      btn.title = off ? '显示左侧目录' : '隐藏左侧目录';
      if (persist) { try { localStorage.setItem(K, off ? 'off' : 'on'); } catch (e) {} }
    }
    var off = false;
    try { off = localStorage.getItem(K) === 'off'; } catch (e) {}
    apply(off, false);
    btn.addEventListener('click', function () { apply(false, true); });
    var hideBtn = document.querySelector('.op-side-hide');
    if (hideBtn) hideBtn.addEventListener('click', function () { apply(true, true); });
  })();

  /* 答题：单选/多选统一先选选项，点「提交」后判定并展开答案与解析 */
  (function () {
    var KEY = 'kaoyan-jieti-ans.v1' + (document.body.classList.contains('tf-page') ? ':tf' : '');
    var LAB = { T: '正确', F: '错误' };
    var cards = [].slice.call(document.querySelectorAll('.qcard[data-ans]'));
    if (!cards.length) return;
    var store = {};
    try { store = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { store = {}; }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
    function same(a, b) { return a.split('').sort().join('') === b.split('').sort().join(''); }

    var hud = document.createElement('div');
    hud.className = 'quiz-hud';
    hud.innerHTML = '<span>已答 <b class="qh-n">0</b> / ' + cards.length +
      ' · 对 <b class="qh-ok">0</b></span><button type="button" class="qh-r">清空</button>';
    document.body.appendChild(hud);
    var hudN = hud.querySelector('.qh-n');
    var hudOk = hud.querySelector('.qh-ok');

    function stat() {
      var n = 0, ok = 0;
      cards.forEach(function (q) {
        var r = store[q.dataset.no];
        if (r) { n++; if (r.ok) ok++; }
      });
      hudN.textContent = n;
      hudOk.textContent = ok;
    }

    cards.forEach(function (q) {
      var no = q.dataset.no;
      var ans = q.dataset.ans || '';
      var multi = q.dataset.type === 'multi';
      var opts = [].slice.call(q.querySelectorAll('.opt'));
      var sub = q.querySelector('.qsub');
      var redo = q.querySelector('.qredo');
      var res = q.querySelector('.qres');
      var sel = [];
      var done = false;

      function paint() {
        opts.forEach(function (b) {
          var k = b.dataset.k;
          var on = sel.indexOf(k) >= 0;
          var hit = ans.indexOf(k) >= 0;
          b.classList.toggle('sel', !done && on);
          b.classList.toggle('tru', done && hit && (on || !multi));
          b.classList.toggle('err', done && on && !hit);
          b.classList.toggle('miss', done && multi && !on && hit);
          b.setAttribute('aria-pressed', String(on));
          b.disabled = done;
        });
        var right = done && same(sel.join(''), ans);
        q.classList.toggle('done-ok', right);
        q.classList.toggle('done-no', done && !right);
        if (sub) {
          sub.hidden = done;
          sub.textContent = '提交';
          sub.disabled = !sel.length;
        }
        if (redo) redo.hidden = !done;
      }

      function fmt(a) { return a ? a.split('').map(function (c) { return LAB[c] || c; }).join('') : '—'; }

      function reveal() {
        var mine = sel.slice().sort().join('');
        var right = same(mine, ans);
        res.innerHTML = '<p class="qline"><span class="qtag">正确答案</span><b class="qans">' + fmt(ans) +
          '</b><span class="qtag">你的作答</span><b class="qans ' + (right ? 'qgood' : 'qbad') + '">' +
          fmt(mine) + '</b><span class="' + (right ? 'qgood' : 'qbad') + '">' +
          (right ? '答对了' : '答错了') + '</span></p>'
          + '<p class="qexp-h">解析</p><div class="qexp"></div>';
        var src = document.getElementById('a' + ('000' + no).slice(-3));
        var body = src && src.querySelector('.kbody');
        if (body) res.querySelector('.qexp').innerHTML = body.innerHTML;
        res.hidden = false;
      }

      function commit() {
        done = true;
        var mine = sel.slice().sort().join('');
        store[no] = { c: mine, ok: same(mine, ans) };
        save();
        paint();
        reveal();
        stat();
      }

      opts.forEach(function (b) {
        b.addEventListener('click', function () {
          if (done) return;
          var k = b.dataset.k;
          if (multi) {
            var i = sel.indexOf(k);
            if (i >= 0) sel.splice(i, 1); else sel.push(k);
          } else {
            sel = (sel[0] === k) ? [] : [k];
          }
          paint();
        });
      });
      if (sub) sub.addEventListener('click', function () { if (!done && sel.length) commit(); });
      if (redo) redo.addEventListener('click', function () {
        sel = [];
        done = false;
        delete store[no];
        save();
        res.hidden = true;
        res.innerHTML = '';
        paint();
        stat();
      });

      var old = store[no];
      if (old) {
        sel = (old.c || '').split('');
        done = true;
        paint();
        reveal();
      } else {
        paint();
      }
    });

    hud.querySelector('.qh-r').addEventListener('click', function () {
      if (!confirm('清空全部作答记录？')) return;
      store = {};
      save();
      cards.forEach(function (q) {
        var res = q.querySelector('.qres');
        var redo = q.querySelector('.qredo');
        [].slice.call(q.querySelectorAll('.opt')).forEach(function (b) {
          b.disabled = false;
          b.className = 'opt';
          b.setAttribute('aria-pressed', 'false');
        });
        q.classList.remove('done-ok', 'done-no');
        if (res) { res.hidden = true; res.innerHTML = ''; }
        if (redo) redo.hidden = true;
        var sub = q.querySelector('.qsub');
        if (sub) { sub.hidden = false; sub.textContent = '提交'; sub.disabled = true; }
      });
      stat();
      window.dispatchEvent(new CustomEvent('quiz:reset'));
    });

    stat();
  })();
})();
