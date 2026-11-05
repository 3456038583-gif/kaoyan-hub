/* 英语真题首页 · 我的练习记录（读各卷 localStorage 快照） */
(function () {
  const host = document.getElementById('myStats');
  if (!host) return;

  const rows = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || k.indexOf('kaoyan-exam-sum:') !== 0) continue;
      try {
        const v = JSON.parse(localStorage.getItem(k) || 'null');
        if (!v || !v.id) continue;
        if (!v.objDone) continue;
        rows.push(v);
      } catch (e) {}
    }
  } catch (e) {
    return;
  }
  if (!rows.length) {
    host.innerHTML = '<div class="ms-head"><h2>我的练习记录</h2></div>'
      + '<p class="ms-empty">还没有作答记录。打开任意一年试卷，选几个选项就会自动记在这里。</p>';
    host.hidden = false;
    return;
  }

  rows.sort((a, b) => (b.t || 0) - (a.t || 0));

  const fmt = (v) => (Math.abs(v - Math.round(v)) < 0.05 ? String(Math.round(v)) : v.toFixed(1));
  const sum = rows.reduce((a, r) => a + (r.score || 0), 0);
  const avg = sum / rows.length;
  const best = rows.reduce((a, r) => Math.max(a, r.score || 0), 0);
  const fmtDate = (t) => {
    const d = new Date(t || Date.now());
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };

  const body = rows
    .map((r) => {
      const rate = r.objDone ? Math.round((r.right / r.objDone) * 100) : 0;
      const full = r.full || 60;
      const pct = Math.round((r.score / full) * 100);
      return `<tr>
        <td><a href="/exam/${r.id}">${r.title || r.id}</a></td>
        <td class="num">${fmt(r.score)} / ${fmt(full)}</td>
        <td class="num">${rate}%</td>
        <td class="num">${r.objDone}/${r.total || '—'}</td>
        <td class="num">${fmtDate(r.t)}</td>
        <td class="bar-cell"><span class="mini-bar" style="width:${Math.min(100, pct)}%"></span></td>
      </tr>`;
    })
    .join('');

  host.innerHTML = `
    <div class="ms-head">
      <h2>我的练习记录</h2>
      <span class="ms-sub">客观题得分（满分 60）· 保存在本机浏览器</span>
    </div>
    <div class="ms-kpi">
      <div><span>已练</span><b>${rows.length}<i> 套</i></b></div>
      <div><span>平均分</span><b>${fmt(avg)}<i> / 60</i></b></div>
      <div><span>最高分</span><b>${fmt(best)}<i> / 60</i></b></div>
    </div>
    <table class="ms-table">
      <thead><tr><th>试卷</th><th>客观题</th><th>正确率</th><th>已答/总题</th><th>最近作答</th><th></th></tr></thead>
      <tbody>${body}</tbody>
    </table>`;
  host.hidden = false;
})();
