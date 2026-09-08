// ThirdWorld 공통 UI 스크립트: 툴팁 탭/호버 + 화면 안으로 위치 보정
(function () {
  var SEL = '.has-tip, .inventoryItem button, .charItem button, .actualContent';

  function placeTip(host) {
    var tip = host.querySelector('.itemTooltip');
    if (!tip) return;
    tip.style.left = '';
    tip.style.right = '';
    tip.style.top = '';
    tip.style.bottom = '';
    tip.style.transform = '';
    var r = tip.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight, pad = 8;
    if (r.right > vw - pad) {
      tip.style.left = 'auto';
      tip.style.right = '0';
      r = tip.getBoundingClientRect();
      if (r.left < pad) { tip.style.right = 'auto'; tip.style.left = (pad - host.getBoundingClientRect().left) + 'px'; }
    } else if (r.left < pad) {
      tip.style.left = (pad - host.getBoundingClientRect().left) + 'px';
    }
    r = tip.getBoundingClientRect();
    if (r.bottom > vh - pad && r.height < host.getBoundingClientRect().top - pad) {
      tip.style.top = 'auto';
      tip.style.bottom = 'calc(100% + 6px)';
    }
  }

  function closeAll(except) {
    var open = document.querySelectorAll('.tip-open');
    for (var i = 0; i < open.length; i++) if (open[i] !== except) open[i].classList.remove('tip-open');
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest(SEL);
    closeAll(t);
    if (!t || e.target.closest('.itemTooltip') || !t.querySelector('.itemTooltip')) return;
    if (t.classList.contains('tip-open')) {
      t.classList.remove('tip-open');
    } else {
      t.classList.add('tip-open');
      placeTip(t);
    }
  });

  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest(SEL);
    if (t && t.querySelector('.itemTooltip')) placeTip(t);
  });
})();
