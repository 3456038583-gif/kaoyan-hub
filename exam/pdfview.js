/* 试卷 PDF：点按钮先在本页预览，再决定「下载」还是「新窗口打开」
   用法：<button data-pdf="/path.pdf" data-pdf-title="2026 英语（一） · 原卷">原卷 PDF</button>
   英语真题 / 政治真题 共用，样式在 /exam/shell.css。 */
(function () {
  var sheet = null;
  var panelEl = null;
  var frame = null;
  var titleEl = null;
  var openEl = null;
  var dlEl = null;

  function build() {
    sheet = document.createElement('div');
    sheet.className = 'pdfsheet';
    sheet.hidden = true;
    sheet.innerHTML =
      '<div class="pdfpanel" role="dialog" aria-modal="true" aria-label="PDF 预览" tabindex="-1">' +
        '<div class="pdfbar">' +
          '<span class="ptitle"></span>' +
          '<a class="pbtn" data-open target="_blank" rel="noopener">新窗口打开</a>' +
          '<a class="pbtn pbtn--dl" data-dl download>下载</a>' +
          '<button class="pclose" type="button" aria-label="关闭">×</button>' +
        '</div>' +
        '<iframe title="PDF 预览"></iframe>' +
      '</div>';
    document.body.appendChild(sheet);
    panelEl = sheet.querySelector('.pdfpanel');
    frame = sheet.querySelector('iframe');
    titleEl = sheet.querySelector('.ptitle');
    openEl = sheet.querySelector('[data-open]');
    dlEl = sheet.querySelector('[data-dl]');
  }

  function open(path, title) {
    if (!sheet) build();
    titleEl.textContent = title || 'PDF';
    frame.src = path;
    openEl.href = path;
    dlEl.href = path;
    /* 下载名跟随标题：2026 英语（一） · 原卷 → 2026-英语（一）-原卷.pdf */
    var name = (title || '')
      .replace(/[\\/:*?"<>|]+/g, '')
      .replace(/[\s·]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    dlEl.setAttribute('download', (name || 'paper') + '.pdf');
    sheet.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    /* 焦点给面板本身：Esc 关、读屏能定位，又不至于在关闭按钮上画一圈焦点框 */
    panelEl.focus();
  }

  function close() {
    if (!sheet || sheet.hidden) return;
    sheet.hidden = true;
    frame.src = 'about:blank';
    document.documentElement.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-pdf]');
    if (trigger) {
      e.preventDefault();
      open(trigger.getAttribute('data-pdf'), trigger.getAttribute('data-pdf-title'));
      return;
    }
    if (!sheet || sheet.hidden) return;
    if (e.target.closest('.pclose') || e.target === sheet) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();
