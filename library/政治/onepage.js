/* 一页纸：按容器宽度缩放每一页，保证小屏也能看全 */
(function () {
  var sheets = [].slice.call(document.querySelectorAll('.sheet'));
  var body = document.getElementById('opBody');
  var zoomed = false;
  function fit() {
    if (zoomed) { sheets.forEach(function (s) { s.style.transform = 'none'; }); return; }
    var w = body.clientWidth;
    sheets.forEach(function (s) {
      var base = parseFloat(s.style.width) || s.offsetWidth;
      var k = Math.min(1, w / base);
      s.style.transform = 'scale(' + k + ')';
      s.style.height = (base ? parseFloat(s.getAttribute('data-h') || 0) : 0) + 'px';
    });
  }
  /* 缩放后父容器高度要跟着变，否则会留白/重叠 */
  function sectionH(s) {
    var h = parseFloat(s.style.height) || s.offsetHeight;
    return h;
  }
  function relayout() {
    var w = body.clientWidth;
    sheets.forEach(function (s) {
      if (!s.dataset.w) {
        s.dataset.w = s.style.width;
        s.dataset.h = s.style.height;
      }
      var bw = parseFloat(s.dataset.w), bh = parseFloat(s.dataset.h);
      var k = zoomed ? 1 : Math.min(1, w / bw);
      s.style.width = bw + 'px';
      s.style.transform = 'scale(' + k + ')';
      s.style.marginBottom = (k < 1 ? -(bh * (1 - k)) : 0) + 'px';
    });
  }
  document.getElementById('zoomBtn').addEventListener('click', function () {
    zoomed = !zoomed;
    body.classList.toggle('zoomed', zoomed);
    this.textContent = zoomed ? '适应宽度' : '放大';
    relayout();
  });
  window.addEventListener('resize', relayout);
  relayout();
})();
