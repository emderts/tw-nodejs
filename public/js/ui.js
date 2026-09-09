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

  // 마우스 hover 위치 보정은 실제 hover가 되는 기기(데스크톱)에서만.
  // 터치 기기에서 mouseover 중 화면을 바꾸면 크롬이 click을 삼켜버림.
  if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest(SEL);
      if (t && !t.classList.contains('tip-open') && t.querySelector('.itemTooltip')) placeTip(t);
    });
  }
})();

// ---- 두 번 눌러 실행하는 버튼: 브라우저 기본 submit에 의존하지 않고 직접 처리 ----
// (페이지 head에 정의된 invClick(thisNode, event)를 대체. 수동전투 페이지의 invClick(idx)는 건드리지 않음)
(function () {
  if (typeof window.invClick === 'function' && window.invClick.length !== 2) return;

  function disarmAll(except) {
    var armed = document.querySelectorAll('button[onclick^="invClick"][type="submit"]');
    for (var i = 0; i < armed.length; i++) if (armed[i] !== except) armed[i].setAttribute('type', 'button');
  }
  function fire(node) {
    var form = node.form || node.closest('form');
    if (!form) return;
    if (form.requestSubmit) form.requestSubmit(); else form.submit();
  }

  window.invClick = function (thisNode, event) {
    if (event) event.preventDefault();
    if (thisNode.getAttribute('type') === 'submit') {
      fire(thisNode);            // 두 번째 탭: 실행
      return;
    }
    disarmAll(thisNode);
    thisNode.setAttribute('type', 'submit');   // 첫 탭: 준비 상태
  };

  // 터치 기기에서 click이 씹히는 경우를 대비한 보험: 준비된 버튼을 (스크롤 없이) 탭하면 실행
  var startX = 0, startY = 0, startTarget = null;
  document.addEventListener('touchstart', function (e) {
    var t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    startTarget = e.target.closest('button[onclick^="invClick"]');
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (!startTarget) return;
    var t = e.changedTouches[0];
    var moved = Math.abs(t.clientX - startX) > 10 || Math.abs(t.clientY - startY) > 10;
    var node = startTarget; startTarget = null;
    if (moved || node.disabled) return;
    if (node.getAttribute('type') === 'submit') {
      e.preventDefault();       // 뒤따르는 click 방지 (중복 실행 차단)
      fire(node);
    }
  }, { passive: false });
})();
