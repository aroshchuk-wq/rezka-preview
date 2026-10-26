/* Нативные ссылки и кнопки: прокрутка карточек не должна открывать страницу/диалог. */
(() => {
  const tracks = document.querySelectorAll('.services-grid.mobile-slider, .portfolio-grid.mobile-slider');
  tracks.forEach(track => {
    let start = null, dragged = false, suppressUntil = 0;
    track.addEventListener('pointerdown', event => {
      start = {x:event.clientX,y:event.clientY}; dragged = false;
    }, {passive:true});
    track.addEventListener('pointermove', event => {
      if (start && Math.hypot(event.clientX-start.x,event.clientY-start.y)>10) dragged=true;
    }, {passive:true});
    const finish = () => {if (dragged) suppressUntil=Date.now()+600; start=null;};
    track.addEventListener('pointerup',finish,{passive:true});
    track.addEventListener('pointercancel',finish,{passive:true});
    track.addEventListener('click',event => {
      // detail=0: активация с клавиатуры остаётся доступной.
      if (event.detail>0 && Date.now()<suppressUntil) {event.preventDefault();event.stopImmediatePropagation();}
    },true);
  });
})();
