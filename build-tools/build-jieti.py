#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把《27 考研政治一页纸 · 解题方法手册》PDF 转成保留原配色与版式的网页。

沿用 build-onepage.py 的复刻思路：
- 每个 PDF 页渲染成一张固定版心的「纸」，文字按原始坐标绝对定位（可选中、可搜索）
- 颜色、字号、粗体取自 span 属性；底色块取自页面绘图对象；内嵌符号导出为 PNG
- 整体放大 1.5 倍，正文在桌面端直接可读（原 12pt → 18px）

与知识点手册互不影响：独立的 assets 目录、独立的 CSS/JS、独立的输出文件。
输出：library/政治/解题手册.html、library/政治/assets-jieti/*、library/政治/sheet.css|sheet.js
     pdfs/politics/27-jieti.pdf
"""
import json
import re
import shutil
from pathlib import Path

import pymupdf

SRC = Path('/Users/feikntn111/Desktop/考研政治资料/澄潇宇一页纸/27考研政治一页纸-解题方法手册.pdf')
SITE = Path.home() / 'File_no_iCloud/kaoyan-website/kaoyan-hub'
OUT = SITE / 'library/政治'
ASSETS_REL = '/library/政治/assets-jieti'
ASSETS = OUT / 'assets-jieti'
PDF_OUT = SITE / 'pdfs/politics/27-jieti.pdf'
PAGE = '解题手册.html'
SCALE = 1.5          # 整体放大倍数：原 A4 版心 596×842 → 894×1263


def rgb(c):
    if c is None:
        return None
    if isinstance(c, (int, float)):
        v = int(round(c * 255))
        return f'#{v:02x}{v:02x}{v:02x}'
    if len(c) == 1:
        v = int(round(c[0] * 255))
        return f'#{v:02x}{v:02x}{v:02x}'
    r, g, b = (int(round(x * 255)) for x in c[:3])
    return f'#{r:02x}{g:02x}{b:02x}'


def esc(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;'))


def font_class(name):
    n = name.lower()
    if 'song' in n or 'kai' in n or 'fang' in n or 'serif' in n:
        return 'f-serif'
    return 'f-sans'


# 样式池：把 size/color/weight 组合压成 class，避免每个 span 重复写 inline style
_CLASSES = {}
_CSS_RULES = []


def style_class(size, color, weight):
    key = (round(size, 1), color, weight)
    if key not in _CLASSES:
        name = f's{len(_CLASSES) + 1}'
        _CLASSES[key] = name
        _CSS_RULES.append(f'.{name}{{font-size:{size:.1f}px;color:{color};font-weight:{weight}}}')
    return _CLASSES[key]


def is_fw(ch):
    """全角字符（汉字、全角标点）在 Type3 里固定 1em 宽，合并后位置不会漂"""
    o = ord(ch)
    return (0x2E80 <= o <= 0x9FFF or 0xF900 <= o <= 0xFAFF
            or 0xFF00 <= o <= 0xFF60 or 0x3000 <= o <= 0x303F)


def render_page(doc, pno, page_no_label):
    pg = doc[pno]
    W, H = pg.rect.width * SCALE, pg.rect.height * SCALE
    parts = []

    # 1) 底色块 / 分隔线（大块先画，小块后画，避免白底盖住彩色条）
    draws = sorted(pg.get_drawings(), key=lambda d: -(d['rect'].width * d['rect'].height))
    for dr in draws:
        r = dr['rect']
        fill = rgb(dr.get('fill'))
        stroke = rgb(dr.get('color'))
        if fill is None and stroke is None:
            continue
        w, h = r.width, r.height
        style = [f'left:{r.x0 * SCALE:.1f}px', f'top:{r.y0 * SCALE:.1f}px',
                 f'width:{max(w, 0.8) * SCALE:.1f}px', f'height:{max(h, 0.8) * SCALE:.1f}px']
        if fill:
            style.append(f'background:{fill}')
        if stroke:
            style.append(f'border:{0.6 * SCALE:.1f}px solid {stroke}')
        if not fill and w < 1.5:
            style.append('background:currentColor')
        parts.append(f'<i class="sh-b" style="{";".join(style)}"></i>')

    # 2) 内嵌图片（✓ ✗ 图标、插图）
    for xref, *_ in pg.get_images(full=True):
        try:
            rects = pg.get_image_rects(xref)
        except Exception:
            rects = []
        if not rects:
            continue
        try:
            pix = pymupdf.Pixmap(doc, xref)
        except Exception:
            continue
        if pix.n - pix.alpha >= 4:
            pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
        name = f'p{pno + 1}-{xref}.png'
        if pix.width >= 6 and pix.height >= 6:
            pix.save(ASSETS / name)
            # 整页背景大图（封面渐变等）用 PNG 会到 2~3MB，转 JPEG 压到几百 KB
            f_path = ASSETS / name
            if f_path.stat().st_size > 250_000 and pix.alpha == 0:
                try:
                    from PIL import Image as _Img
                    im = _Img.open(f_path).convert('RGB')
                    jpg = f_path.with_suffix('.jpg')
                    im.save(jpg, 'JPEG', quality=92, optimize=True, subsampling=0)
                    if jpg.stat().st_size < f_path.stat().st_size:
                        f_path.unlink()
                        name = jpg.name
                    else:
                        jpg.unlink()
                except Exception:
                    pass
            for r in rects:
                parts.append(
                    f'<img class="sh-img" src="{ASSETS_REL}/{name}" alt="" '
                    f'style="left:{r.x0 * SCALE:.1f}px;top:{r.y0 * SCALE:.1f}px;'
                    f'width:{r.width * SCALE:.1f}px;height:{r.height * SCALE:.1f}px">')

    # 3) 文字：逐字 span 先按「同行 + 同字号同色 + 紧邻 + 全角」合并，再输出
    for b in pg.get_text('dict')['blocks']:
        if b['type'] != 0:
            continue
        for line in b['lines']:
            dirx, diry = line.get('dir', (1, 0))
            rotated = abs(diry) > 0.01
            runs = []
            cur = None
            for sp in line['spans']:
                txt = ''.join(ch for ch in sp['text'] if ch == '\t' or ord(ch) >= 32)
                if not txt:
                    continue
                # 注意：Type3 字体是「每个字一个字体资源」，font 名带 xref，不能进签名，
                # 否则同为中文的相邻字永远合并不了。
                sig = (round(sp['size'], 2), sp['color'], font_class(sp['font']))
                prev_x1 = cur['x1'] if cur else None
                can_merge = (
                    cur is not None and cur['sig'] == sig
                    and abs(sp['bbox'][0] - prev_x1) < 0.6
                    and all(is_fw(c) for c in cur['text'] + txt)
                )
                if can_merge:
                    cur['text'] += txt
                    cur['x1'] = sp['bbox'][2]
                else:
                    if cur:
                        runs.append(cur)
                    cur = {'sig': sig, 'x0': sp['bbox'][0], 'y0': sp['bbox'][1],
                           'x1': sp['bbox'][2], 'text': txt, 'size': sp['size']}
            if cur:
                runs.append(cur)

            for r in runs:
                if not r['text'].strip():
                    continue
                col = r['sig'][1]
                color = rgb(((col >> 16 & 255) / 255, (col >> 8 & 255) / 255, (col & 255) / 255))
                fl = r['sig'][2].lower()
                weight = '600' if any(k in fl for k in ('bold', 'semibold', 'medium', 'hei')) else '400'
                cls = style_class(r['size'] * SCALE, color, weight)
                st = [f'left:{r["x0"] * SCALE:.1f}px', f'top:{r["y0"] * SCALE:.1f}px']
                if rotated:
                    st.append(f'transform:rotate({-diry * 57.3:.1f}deg)')
                fam = font_class(r['sig'][2])
                parts.append(f'<span class="sh-t {fam} {cls}" style="{";".join(st)}">{esc(r["text"])}</span>')

    return (f'<section class="sheet" id="p{pno + 1}" data-p="{pno + 1}" '
            f'style="width:{W:.0f}px;height:{H:.0f}px">\n'
            f'  <div class="sheet-pad"></div>\n  ' + '\n  '.join(parts) +
            f'\n  <div class="sheet-no">{page_no_label}</div>\n</section>')


def scan_index(doc):
    """提取每页的知识点 / 习题编号，用于顶部索引导航"""
    items = []      # [{kind, no, title, page}]
    for pno in range(doc.page_count):
        pg = doc[pno]
        rows = []
        for b in pg.get_text('dict')['blocks']:
            if b['type'] != 0:
                continue
            for line in b['lines']:
                txt = ''.join(s['text'] for s in line['spans']).strip()
                if not txt:
                    continue
                sp = line['spans'][0]
                m = re.match(r'^(知识点|习题)\s*(\d{1,3})', txt)
                if m:
                    rows.append((line['bbox'][1], line['bbox'][0], m.group(1), int(m.group(2))))
        # 卡片标题：同栏内、编号下方最近的一条较大字号文本
        for y, x, kind, no in rows:
            title = ''
            best = None
            for b in pg.get_text('dict')['blocks']:
                if b['type'] != 0:
                    continue
                for line in b['lines']:
                    ly, lx = line['bbox'][1], line['bbox'][0]
                    if ly <= y + 1 or abs(lx - x) > 12 or ly - y > 34:
                        continue
                    sz = max((s['size'] for s in line['spans']), default=0)
                    txt = ''.join(s['text'] for s in line['spans']).strip()
                    if not txt or re.match(r'^(知识点|习题)', txt):
                        continue
                    if best is None or sz > best[0]:
                        best = (sz, txt, ly)
            if best and best[0] >= 9.5:
                title = re.sub(r'[\u2B50\u2605\u2606\uFE0F\s]+$', '', best[1]).strip()
            items.append({'kind': kind, 'no': no, 'title': title, 'page': pno + 1})
    # 同一编号在页眉与卡片内各出现一次，按编号去重（保留首次出现）
    seen = {}
    for r in items:
        k = (r['kind'], r['no'])
        if k not in seen:
            seen[k] = r
        elif not seen[k]['title'] and r['title']:
            seen[k]['title'] = r['title']
    items = list(seen.values())
    items.sort(key=lambda r: (r['kind'] != '知识点', r['no']))
    return items


CSS = """/* 解题手册 · 原版版式逐页复刻 */
.op-page { background: var(--paper); }
.op-wrap { max-width: 1000px; margin: 0 auto; padding: 0 20px 80px; }
.op-head { padding: 26px 0 14px; border-bottom: 1px solid var(--line); margin-bottom: 18px; }
.crumbs { font-size: 12px; color: var(--muted); margin-bottom: 10px; }
.crumbs a:hover { color: var(--accent); }
.crumbs .sep { margin: 0 6px; opacity: .6; }
.op-head h1 { margin: 0; font-family: var(--serif); font-size: clamp(22px, 3vw, 30px); letter-spacing: .03em; }
.op-sub { margin: 8px 0 14px; font-size: 13px; color: var(--muted); }
.op-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.op-btn {
  appearance: none; cursor: pointer; font-size: 12.5px;
  padding: 7px 13px; border-radius: 5px; border: 1px solid var(--line);
  background: var(--surface); color: var(--muted); transition: all .15s;
  font-family: var(--sans);
}
.op-btn:hover { color: var(--accent); border-color: var(--accent); }
.op-btn.solid { background: #98521c; border-color: #98521c; color: #fff; }
.op-btn.solid:hover { filter: brightness(1.08); color: #fff; }

.op-pages {
  display: flex; flex-wrap: wrap; gap: 5px; align-items: center;
  margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--line);
}
.op-pages-lbl { font-size: 11.5px; color: var(--muted); margin-right: 4px; }
.op-pages a {
  font-family: var(--mono); font-size: 11px; color: var(--muted);
  border: 1px solid var(--line); border-radius: 3px; padding: 2px 6px;
}
.op-pages a:hover { color: var(--accent); border-color: var(--accent); }

/* 索引（知识点 / 习题） */
.op-index { margin-top: 14px; }
.op-index summary {
  cursor: pointer; list-style: none; width: max-content;
  font-family: var(--mono); font-size: 12px; letter-spacing: .02em;
  color: var(--muted); border: 1px solid var(--line); border-radius: 3px; padding: 3px 10px;
}
.op-index summary::-webkit-details-marker { display: none; }
.op-index summary::before { content: '＋ '; }
.op-index[open] summary::before { content: '－ '; }
.op-index summary:hover { color: var(--accent); border-color: var(--accent); }
.op-index-body {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
  gap: 2px 14px; margin-top: 12px; padding: 14px 16px;
  background: var(--surface); border: 1px solid var(--line); border-radius: 6px;
}
.op-index-group {
  grid-column: 1 / -1; margin: 8px 0 2px; padding-bottom: 4px;
  font-family: var(--sans); font-size: 12px; font-weight: 600; letter-spacing: .1em;
  color: var(--gold); border-bottom: 1px solid var(--line-soft);
}
.op-index-group:first-child { margin-top: 0; }
.op-index-item {
  display: flex; gap: 8px; align-items: baseline;
  padding: 3px 0; font-size: 12.5px; line-height: 1.5; color: var(--ink);
}
.op-index-item:hover { color: var(--accent); }
.op-index-no { flex: none; font-family: var(--mono); font-size: 11px; color: var(--muted); }
.op-index-t { flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.op-index-ex {
  grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 5px;
  margin: 4px 0 2px;
}
.op-index-ex a {
  font-family: var(--mono); font-size: 11px; color: var(--muted);
  border: 1px solid var(--line); border-radius: 3px; padding: 2px 7px;
}
.op-index-ex a:hover { color: var(--accent); border-color: var(--accent); }

.op-body { display: flex; flex-direction: column; gap: 26px; align-items: center; }
.op-tip { display: none; }
.sheet {
  position: relative; flex: none;
  background: #fff; color: #000;
  box-shadow: 0 1px 2px rgba(30, 25, 15, .1), 0 12px 30px -18px rgba(30, 25, 15, .45);
  border: 1px solid #e7e3d8; border-radius: 2px;
  transform-origin: top center;
  overflow: hidden;
}
.op-body.zoomed { align-items: flex-start; overflow-x: auto; }
.sheet-pad { position: absolute; inset: 0; pointer-events: none; }
.sh-b { position: absolute; display: block; }
.sh-img { position: absolute; display: block; }
.sh-t {
  position: absolute; white-space: pre; line-height: 1;
  font-kerning: none; letter-spacing: 0;
  transform-origin: left top;
}
.sh-t.f-sans { font-family: "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; }
.sh-t.f-serif { font-family: "Noto Serif SC", "Songti SC", "STSong", "SimSun", serif; }
.sheet-no {
  position: absolute; right: 10px; bottom: 6px;
  font-family: var(--mono); font-size: 9px; color: #b9b3a4;
}
.op-foot { margin-top: 34px; padding-top: 14px; border-top: 1px solid var(--line); font-size: 12px; color: var(--muted); }
.op-foot a { border-bottom: 1px solid var(--line); }

@media (max-width: 720px) {
  .op-wrap { padding: 0 12px 60px; }
  .op-head h1 { font-size: 21px; }
  .op-index-body { grid-template-columns: minmax(0, 1fr); padding: 12px; }
  .op-tip {
    display: block; margin: 0 0 14px; padding: 10px 13px;
    background: var(--accent-soft); border-left: 3px solid var(--accent);
    border-radius: 0 5px 5px 0;
    font-size: 12.5px; line-height: 1.75; color: var(--muted);
  }
  .op-tip b { color: var(--ink); }
}
"""

JS = """/* 解题手册：按容器宽度缩放每一页，保证小屏也能看全 */
(function () {
  var sheets = [].slice.call(document.querySelectorAll('.sheet'));
  var body = document.getElementById('opBody');
  var zoomed = false;
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
"""


def build():
    _CLASSES.clear()
    _CSS_RULES.clear()
    doc = pymupdf.open(SRC)
    OUT.mkdir(parents=True, exist_ok=True)
    if ASSETS.exists():
        shutil.rmtree(ASSETS)
    ASSETS.mkdir(parents=True, exist_ok=True)
    PDF_OUT.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(SRC, PDF_OUT)

    sheets, kept = [], []
    for pno in range(doc.page_count):
        pg = doc[pno]
        if not pg.get_text().strip() and not pg.get_images() and not pg.get_drawings():
            continue          # 真正的空白页
        sheets.append(render_page(doc, pno, f'{pno + 1} / {doc.page_count}'))
        kept.append(pno + 1)

    index = scan_index(doc)
    kps = [r for r in index if r['kind'] == '知识点']
    exs = [r for r in index if r['kind'] == '习题']

    def idx_block(title, rows):
        if not rows:
            return ''
        out = [f'<p class="op-index-group">{title}（{len(rows)} 条）</p>']
        for r in rows:
            label = f"{r['kind']} {r['no']:03d}"
            name = r['title'] or '—'
            out.append(f'<a class="op-index-item" href="#p{r["page"]}">'
                       f'<span class="op-index-no">{label}</span>'
                       f'<span class="op-index-t">{esc(name)}</span></a>')
        return ''.join(out)

    # 习题没有标题，只有题号 → 用紧凑的编号块，不做两栏列表
    ex_chips = ''.join(
        f'<a href="#p{r["page"]}" title="第 {r["page"]} 页">{r["no"]:03d}</a>' for r in exs
    )
    ex_block = (f'<p class="op-index-group">遴选题（{len(exs)} 道，点题号跳到所在页）</p>'
                f'<div class="op-index-ex">{ex_chips}</div>') if exs else ''

    nav_chips = '\n'.join(f'<a href="#p{i}">{i:02d}</a>' for i in kept)

    html = f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>27 考研政治一页纸 · 解题方法手册 · 知识库</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@600;700&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<link rel="stylesheet" href="/site.css">
<link rel="stylesheet" href="/library/note.css">
<link rel="stylesheet" href="/library/政治/sheet.css">
<style>{''.join(_CSS_RULES)}</style>
<script src="/countdown.js" defer></script>
</head>
<body class="note-page op-page">

<nav class="sitebar" aria-label="站点导航">
  <a class="sb-brand" href="/">考研资料总库</a>
  <div class="sb-links">
    <a href="/math/">数学真题</a>
    <a href="/exam/">英语真题</a>
    <a href="/politics/">政治真题</a>
    <a href="/english/">英语速查</a>
    <a href="/library/" class="on">知识库</a>
  </div>
</nav>

<div class="op-wrap">
  <header class="op-head">
    <nav class="crumbs"><a href="/library/">知识库</a> <span class="sep">/</span> <a href="/library/政治/">政治</a> <span class="sep">/</span> <span>解题手册</span></nav>
    <h1>27 考研政治一页纸 · 解题方法手册</h1>
    <p class="op-sub">澄潇宇一页纸 · {len(sheets)} 页 · {len(kps)} 个知识点卡片 + {len(exs)} 道遴选题 · 按原版配色还原，文字可选中、可检索</p>
    <div class="op-actions">
      <a class="op-btn solid" href="/pdfs/politics/27-jieti.pdf" target="_blank" rel="noopener">打开原版 PDF ↗</a>
      <a class="op-btn" href="/pdfs/politics/27-jieti.pdf" download>下载 PDF</a>
      <a class="op-btn" href="/library/政治/一页纸.html">配套知识点手册</a>
      <a class="op-btn" href="/politics/">政治真题练习</a>
      <button class="op-btn" type="button" id="zoomBtn">放大</button>
    </div>
    <details class="op-index" id="opIndex">
      <summary>知识点 / 习题索引</summary>
      <div class="op-index-body">
        {idx_block('知识点卡片', kps)}
        {ex_block}
      </div>
    </details>
    <div class="op-pages" id="opPages">
      <span class="op-pages-lbl">页码</span>
{nav_chips}
    </div>
  </header>

  <p class="op-tip">手机上整页显示时字会偏小：点上方 <b>放大</b> 后左右拖动可看清细节，或直接 <b>打开原版 PDF</b> 阅读。</p>

  <main class="op-body" id="opBody">
{''.join(sheets)}
  </main>

  <footer class="op-foot">
    <p>内容与配色取自《27 考研政治一页纸 · 解题方法手册》原文档，仅供复习查阅。</p>
    <p><a href="/pdfs/politics/27-jieti.pdf" target="_blank" rel="noopener">原版 PDF</a> · <a href="/library/政治/一页纸.html">知识点手册</a> · <a href="/library/">返回知识库</a></p>
  </footer>
</div>

<script src="/library/政治/sheet.js"></script>
</body>
</html>
"""
    (OUT / PAGE).write_text(html, encoding='utf-8')
    (OUT / 'sheet.css').write_text(CSS, encoding='utf-8')
    (OUT / 'sheet.js').write_text(JS, encoding='utf-8')
    print(f'✓ 解题手册：{len(sheets)} 页（跳过 {doc.page_count - len(sheets)} 页空白）')
    print(f'  知识点 {len(kps)} 条 / 习题 {len(exs)} 条')
    print(f'  图片 {len(list(ASSETS.glob("*.png")))} 张，HTML {len(html) / 1024:.0f} KB')
    return kps, exs


if __name__ == '__main__':
    build()
