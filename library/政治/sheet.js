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

  var t = document.getElementById('ansToggle');
  var grid = document.querySelector('.ans-grid');
  if (t && grid) {
    t.addEventListener('click', function () {
      var hidden = grid.classList.toggle('ans-hidden');
      t.textContent = hidden ? '显示答案' : '遮住答案';
    });
  }
})();
