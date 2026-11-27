/* 考研政治一页纸（知识点手册 / 解题方法手册）专属双人贴贴亲亲小宠物 */
(function () {
  'use strict';
  if (document.getElementById('opCouplePet')) return;

  var FOLD_KEY = 'kaoyan.polPet.fold.v1';
  var POS_KEY = 'kaoyan.polPet.pos.v1';
  var HEARTS = ['💗', '💖', '💕', '💞', '💓', '✨'];
  var BUBBLES = ['mua~ 💗', '啵唧~ 💕', '贴贴 💗', '亲亲 💖', '么么哒 💞', '好甜呀 ✨', '一起上岸 💗', '政治必胜 💕'];

  var css = [
    '.op-pet{position:fixed;right:18px;bottom:20px;z-index:46;user-select:none;-webkit-user-select:none;touch-action:none;font-family:-apple-system,"PingFang SC","Noto Sans SC",sans-serif;}',
    '.op-pet.above-hud{bottom:68px;}',
    '.op-pet-stage{position:relative;display:flex;align-items:flex-end;justify-content:center;gap:6px;padding:12px 10px 8px;border-radius:999px;cursor:grab;transition:transform .2s ease;}',
    '.op-pet-stage:active{cursor:grabbing;}',
    '.op-pet-stage::before{content:"";position:absolute;inset:16px 4px 2px;border-radius:999px;background:radial-gradient(ellipse at 50% 60%,rgba(255,182,213,.28),rgba(255,255,255,.58) 70%,rgba(255,255,255,.15));backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,133,179,.32);box-shadow:0 8px 24px -10px rgba(236,72,153,.35),0 2px 8px rgba(0,0,0,.06);pointer-events:none;transition:box-shadow .25s ease,border-color .25s ease;}',
    ':root[data-theme="dark"] .op-pet-stage::before{background:radial-gradient(ellipse at 50% 60%,rgba(244,114,182,.22),rgba(24,28,34,.78) 72%);border-color:rgba(244,114,182,.35);}',
    '.op-pet:hover .op-pet-stage::before,.op-pet.is-kiss .op-pet-stage::before{border-color:rgba(244,114,182,.65);box-shadow:0 10px 28px -8px rgba(244,114,182,.48),0 2px 10px rgba(0,0,0,.08);}',

    '.op-pet-char{position:relative;z-index:2;width:58px;height:58px;border-radius:50%;will-change:transform;transition:transform .32s cubic-bezier(.34,1.56,.64,1);}',
    '.op-pet-char img{display:block;width:100%;height:100%;object-fit:cover;border-radius:50%;border:2.5px solid #fff;box-shadow:0 4px 12px rgba(219,39,119,.2),0 2px 6px rgba(0,0,0,.14);pointer-events:none;-webkit-user-drag:none;}',
    ':root[data-theme="dark"] .op-pet-char img{border-color:#fce7f3;}',
    '.op-pet-char::after{content:"";position:absolute;left:18%;right:18%;bottom:-5px;height:6px;border-radius:50%;background:rgba(190,24,93,.18);filter:blur(2px);pointer-events:none;transition:transform .3s ease;}',

    /* 腮红 */
    '.op-pet-blush{position:absolute;bottom:14px;width:11px;height:6px;border-radius:50%;background:rgba(255,94,148,.62);filter:blur(1.6px);opacity:.22;pointer-events:none;transition:opacity .28s ease,transform .28s ease;}',
    '.op-pet-blush.bl{left:7px;}',
    '.op-pet-blush.br{right:7px;}',
    '.op-pet.is-kiss .op-pet-blush,.op-pet.is-nuzzle .op-pet-blush,.op-pet:hover .op-pet-blush{opacity:.88;transform:scale(1.15);}',

    /* 待机轻轻晃悠 */
    '.op-pet-char.is-l{animation:opPetBobL 2.8s ease-in-out infinite;}',
    '.op-pet-char.is-r{animation:opPetBobR 2.8s ease-in-out infinite;}',
    '@keyframes opPetBobL{0%,100%{transform:translateY(0) rotate(-3deg);}50%{transform:translateY(-4px) rotate(3deg);}}',
    '@keyframes opPetBobR{0%,100%{transform:translateY(-2px) rotate(3deg);}50%{transform:translateY(-5px) rotate(-3deg);}}',

    /* 亲亲动作：两人向中间倾身贴脸 + Q弹 */
    '.op-pet.is-kiss .op-pet-char.is-l{animation:opPetKissL 1.35s cubic-bezier(.34,1.45,.64,1) forwards;}',
    '.op-pet.is-kiss .op-pet-char.is-r{animation:opPetKissR 1.35s cubic-bezier(.34,1.45,.64,1) forwards;}',
    '@keyframes opPetKissL{0%{transform:translate(0,0) rotate(-3deg) scale(1);}24%{transform:translate(11px,-3px) rotate(13deg) scale(1.07,.95);}46%{transform:translate(13px,-4px) rotate(15deg) scale(1.09,.93);}66%{transform:translate(10px,-3px) rotate(11deg) scale(1.05,.97);}84%{transform:translate(-2px,-5px) rotate(-5deg) scale(.97,1.04);}100%{transform:translate(0,0) rotate(-3deg) scale(1);}}',
    '@keyframes opPetKissR{0%{transform:translate(0,-2px) rotate(3deg) scale(1);}24%{transform:translate(-11px,-3px) rotate(-13deg) scale(1.07,.95);}46%{transform:translate(-13px,-4px) rotate(-15deg) scale(1.09,.93);}66%{transform:translate(-10px,-3px) rotate(-11deg) scale(1.05,.97);}84%{transform:translate(2px,-5px) rotate(5deg) scale(.97,1.04);}100%{transform:translate(0,-2px) rotate(3deg) scale(1);}}',

    /* 贴贴蹭蹭动作 */
    '.op-pet.is-nuzzle .op-pet-char.is-l{animation:opPetNuzL 1.25s ease-in-out forwards;}',
    '.op-pet.is-nuzzle .op-pet-char.is-r{animation:opPetNuzR 1.25s ease-in-out forwards;}',
    '@keyframes opPetNuzL{0%,100%{transform:translate(0,0) rotate(-2deg);}22%{transform:translate(8px,-2px) rotate(8deg);}42%{transform:translate(10px,-5px) rotate(12deg);}62%{transform:translate(7px,-1px) rotate(6deg);}80%{transform:translate(9px,-4px) rotate(10deg);}}',
    '@keyframes opPetNuzR{0%,100%{transform:translate(0,0) rotate(2deg);}22%{transform:translate(-8px,-4px) rotate(-10deg);}42%{transform:translate(-10px,-1px) rotate(-6deg);}62%{transform:translate(-7px,-5px) rotate(-12deg);}80%{transform:translate(-9px,-2px) rotate(-8deg);}}',

    /* 中间跳动小爱心 */
    '.op-pet-heart{position:absolute;left:50%;top:4px;z-index:4;transform:translateX(-50%) scale(.92);font-size:17px;line-height:1;pointer-events:none;filter:drop-shadow(0 2px 5px rgba(236,72,153,.45));animation:opHeartIdle 1.8s ease-in-out infinite;}',
    '.op-pet.is-kiss .op-pet-heart{animation:opHeartPop 1.35s ease forwards;}',
    '@keyframes opHeartIdle{0%,100%{transform:translateX(-50%) scale(.88);}50%{transform:translateX(-50%) scale(1.06);}}',
    '@keyframes opHeartPop{0%{transform:translateX(-50%) scale(.9);}30%{transform:translateX(-50%) translateY(-5px) scale(1.48);}55%{transform:translateX(-50%) translateY(-3px) scale(1.2);}75%{transform:translateX(-50%) translateY(-6px) scale(1.42);}100%{transform:translateX(-50%) scale(.92);}}',

    /* 飘起的爱心与泡泡层 */
    '.op-pet-fx{position:absolute;left:50%;bottom:54px;width:0;height:0;pointer-events:none;z-index:6;}',
    '.op-pet-fh{position:absolute;left:0;top:0;font-size:15px;line-height:1;opacity:0;animation:opFloatHeart var(--dur,1.25s) ease-out forwards;}',
    '@keyframes opFloatHeart{0%{opacity:0;transform:translate(-50%,6px) scale(.45) rotate(0deg);}18%{opacity:1;transform:translate(calc(-50% + var(--dx,0px)*0.3),-12px) scale(var(--sc,1.1)) rotate(var(--rot,8deg));}100%{opacity:0;transform:translate(calc(-50% + var(--dx,0px)),var(--dy,-58px)) scale(.75) rotate(var(--rot2,16deg));}}',
    '.op-pet-bub{position:absolute;left:0;top:-8px;transform:translate(-50%,0);white-space:nowrap;padding:3px 9px;border-radius:999px;background:rgba(255,245,250,.96);border:1px solid rgba(244,114,182,.45);color:#be185d;font-size:11.5px;font-weight:600;letter-spacing:.02em;box-shadow:0 4px 12px rgba(236,72,153,.2);opacity:0;animation:opBubPop 1.45s ease-out forwards;}',
    ':root[data-theme="dark"] .op-pet-bub{background:rgba(40,22,34,.94);color:#f9a8d4;border-color:rgba(244,114,182,.5);}',
    '@keyframes opBubPop{0%{opacity:0;transform:translate(-50%,6px) scale(.75);}18%{opacity:1;transform:translate(-50%,-10px) scale(1.03);}72%{opacity:1;transform:translate(-50%,-18px) scale(1);}100%{opacity:0;transform:translate(-50%,-28px) scale(.94);}}',

    /* 收起按钮 */
    '.op-pet-min{position:absolute;top:2px;right:-2px;z-index:5;width:20px;height:20px;padding:0;border:1px solid rgba(244,114,182,.4);border-radius:50%;background:rgba(255,255,255,.94);color:#9d4d70;font-size:13px;line-height:18px;text-align:center;cursor:pointer;opacity:0;transform:scale(.85);transition:opacity .18s,transform .18s,background .15s,color .15s;box-shadow:0 2px 6px rgba(0,0,0,.1);}',
    '.op-pet:hover .op-pet-min,.op-pet:focus-within .op-pet-min{opacity:1;transform:scale(1);}',
    '.op-pet-min:hover{background:#f472b6;color:#fff;border-color:#f472b6;}',
    ':root[data-theme="dark"] .op-pet-min{background:rgba(34,24,32,.92);color:#f9a8d4;}',

    /* 收起态小爱心胶囊 */
    '.op-pet-pill{display:none;align-items:center;gap:5px;height:36px;padding:0 12px 0 9px;border:1px solid rgba(244,114,182,.45);border-radius:999px;background:rgba(255,248,252,.95);color:#be185d;font-size:12.5px;font-weight:600;cursor:pointer;box-shadow:0 6px 18px rgba(236,72,153,.24);transition:transform .16s,box-shadow .16s;}',
    '.op-pet-pill:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(236,72,153,.35);}',
    ':root[data-theme="dark"] .op-pet-pill{background:rgba(36,24,32,.94);color:#f9a8d4;}',
    '.op-pet.is-folded .op-pet-stage{display:none;}',
    '.op-pet.is-folded .op-pet-pill{display:inline-flex;}',

    '@media (max-width:720px){.op-pet{right:10px;bottom:14px;}.op-pet.above-hud{bottom:54px;}.op-pet-char{width:48px;height:48px;}.op-pet-stage{padding:10px 8px 6px;gap:5px;}.op-pet-heart{font-size:15px;}.op-pet-min{opacity:.85;transform:scale(1);width:18px;height:18px;font-size:12px;line-height:16px;}}',
    '@media (prefers-reduced-motion:reduce){.op-pet-char,.op-pet-heart{animation:none !important;}}',
    '@media print{.op-pet{display:none !important;}}'
  ].join('');

  var st = document.createElement('style');
  st.id = 'opCouplePetStyle';
  st.textContent = css;
  document.head.appendChild(st);

  var root = document.createElement('div');
  root.id = 'opCouplePet';
  root.className = 'op-pet';
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', '政治一页纸双人小宠物');
  root.innerHTML =
    '<div class="op-pet-stage" title="点一下亲亲 💗 · 可拖动位置">' +
      '<div class="op-pet-fx" aria-hidden="true"></div>' +
      '<div class="op-pet-char is-l">' +
        '<img src="/library/政治/pet/a.jpg" alt="小宠物左" draggable="false">' +
        '<span class="op-pet-blush bl"></span><span class="op-pet-blush br"></span>' +
      '</div>' +
      '<span class="op-pet-heart" aria-hidden="true">💗</span>' +
      '<div class="op-pet-char is-r">' +
        '<img src="/library/政治/pet/b.jpg" alt="小宠物右" draggable="false">' +
        '<span class="op-pet-blush bl"></span><span class="op-pet-blush br"></span>' +
      '</div>' +
      '<button class="op-pet-min" type="button" title="收起小宠物" aria-label="收起小宠物">×</button>' +
    '</div>' +
    '<button class="op-pet-pill" type="button" title="呼出亲亲小宠物" aria-label="呼出亲亲小宠物"><span>💗</span><span>贴贴</span></button>';

  function syncHudOffset() {
    if (!root.style.left) {
      root.classList.toggle('above-hud', !!document.querySelector('.quiz-hud'));
    }
  }

  document.body.appendChild(root);
  syncHudOffset();
  setTimeout(syncHudOffset, 150);

  var stage = root.querySelector('.op-pet-stage');
  var fx = root.querySelector('.op-pet-fx');
  var minBtn = root.querySelector('.op-pet-min');
  var pillBtn = root.querySelector('.op-pet-pill');

  var folded = false;
  try { folded = localStorage.getItem(FOLD_KEY) === '1'; } catch (e) {}
  function setFolded(v, persist) {
    folded = !!v;
    root.classList.toggle('is-folded', folded);
    if (persist) { try { localStorage.setItem(FOLD_KEY, folded ? '1' : '0'); } catch (e) {} }
  }
  setFolded(folded, false);

  function clampPos(left, top) {
    var r = root.getBoundingClientRect();
    var w = r.width || 140;
    var h = r.height || 80;
    var maxX = Math.max(8, window.innerWidth - w - 8);
    var maxY = Math.max(8, window.innerHeight - h - 8);
    return {
      left: Math.min(maxX, Math.max(8, left)),
      top: Math.min(maxY, Math.max(8, top))
    };
  }

  function applyPos(left, top) {
    var p = clampPos(left, top);
    root.style.left = p.left + 'px';
    root.style.top = p.top + 'px';
    root.style.right = 'auto';
    root.style.bottom = 'auto';
  }

  try {
    var saved = JSON.parse(localStorage.getItem(POS_KEY) || 'null');
    if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
      requestAnimationFrame(function () { applyPos(saved.x, saved.y); });
    }
  } catch (e) {}

  window.addEventListener('resize', function () {
    if (root.style.left) {
      applyPos(parseFloat(root.style.left) || 12, parseFloat(root.style.top) || 12);
    }
  });

  function spawnHeart(delayMs, big) {
    setTimeout(function () {
      var el = document.createElement('span');
      el.className = 'op-pet-fh';
      el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
      var dx = (Math.random() - 0.5) * (big ? 78 : 52);
      var dy = -(44 + Math.random() * (big ? 36 : 24));
      var rot = (Math.random() - 0.5) * 32;
      el.style.setProperty('--dx', dx.toFixed(1) + 'px');
      el.style.setProperty('--dy', dy.toFixed(1) + 'px');
      el.style.setProperty('--rot', rot.toFixed(1) + 'deg');
      el.style.setProperty('--rot2', (rot * 1.6).toFixed(1) + 'deg');
      el.style.setProperty('--sc', (big ? 1.15 : 0.92) + (Math.random() * 0.25));
      el.style.setProperty('--dur', (1.1 + Math.random() * 0.45).toFixed(2) + 's');
      fx.appendChild(el);
      setTimeout(function () { el.remove(); }, 1650);
    }, delayMs);
  }

  function spawnBubble(text) {
    var old = fx.querySelector('.op-pet-bub');
    if (old) old.remove();
    var b = document.createElement('span');
    b.className = 'op-pet-bub';
    b.textContent = text || BUBBLES[Math.floor(Math.random() * BUBBLES.length)];
    fx.appendChild(b);
    setTimeout(function () { b.remove(); }, 1550);
  }

  var actTimer = 0;
  var idleTimer = 0;
  var kissCount = 0;

  function triggerLove(opts) {
    if (folded) return;
    opts = opts || {};
    var mode = opts.mode || (Math.random() < 0.72 ? 'kiss' : 'nuzzle');
    var cls = mode === 'kiss' ? 'is-kiss' : 'is-nuzzle';
    root.classList.remove('is-kiss', 'is-nuzzle');
    void root.offsetWidth;
    root.classList.add(cls);

    var n = opts.big ? 6 : (mode === 'kiss' ? 4 : 3);
    for (var i = 0; i < n; i++) spawnHeart(i * 95, !!opts.big);
    if (opts.bubble || mode === 'kiss') {
      spawnBubble(opts.text || (mode === 'nuzzle' ? '贴贴蹭蹭 💕' : undefined));
    }

    clearTimeout(actTimer);
    actTimer = setTimeout(function () {
      root.classList.remove('is-kiss', 'is-nuzzle');
    }, 1400);
  }

  function scheduleNext() {
    clearTimeout(idleTimer);
    var wait = 5200 + Math.floor(Math.random() * 3400);
    idleTimer = setTimeout(function () {
      if (!folded && !document.hidden) triggerLove();
      scheduleNext();
    }, wait);
  }

  /* 拖拽 + 点击触发亲亲 */
  var dragging = false;
  var moved = false;
  var startX = 0, startY = 0, origL = 0, origT = 0;

  stage.addEventListener('pointerdown', function (e) {
    if (e.target.closest('.op-pet-min')) return;
    dragging = true;
    moved = false;
    var r = root.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    origL = r.left;
    origT = r.top;
    if (stage.setPointerCapture) {
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    }
  });

  stage.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    if (!moved && Math.hypot(dx, dy) < 5) return;
    moved = true;
    applyPos(origL + dx, origT + dy);
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    if (moved) {
      var r = root.getBoundingClientRect();
      try { localStorage.setItem(POS_KEY, JSON.stringify({ x: Math.round(r.left), y: Math.round(r.top) })); } catch (err) {}
    } else {
      kissCount++;
      var special = kissCount % 5 === 0 ? '亲亲暴击 💗💗' : undefined;
      triggerLove({ mode: 'kiss', big: true, bubble: true, text: special });
      scheduleNext();
    }
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  minBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    setFolded(true, true);
  });

  pillBtn.addEventListener('click', function () {
    setFolded(false, true);
    requestAnimationFrame(function () {
      if (root.style.left) {
        applyPos(parseFloat(root.style.left) || 12, parseFloat(root.style.top) || 12);
      }
      triggerLove({ mode: 'kiss', big: true, bubble: true, text: '回来贴贴啦 💗' });
      scheduleNext();
    });
  });

  /* 初次进来 1.4 秒先打个招呼亲一口 */
  setTimeout(function () {
    if (!folded && !document.hidden) {
      triggerLove({ mode: 'kiss', bubble: true, text: 'mua~ 💗' });
    }
    scheduleNext();
  }, 1400);
})();
