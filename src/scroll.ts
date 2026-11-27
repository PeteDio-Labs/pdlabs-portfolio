// Scroll film engine: writes --sc-p (0 to 1) on every [data-sc] element while a frame is scrolling. No dependencies.
//   data-sc="film": progress across a tall pinned element, 0 when its top meets the screen's top, 1 when its bottom meets the screen's bottom.
//   data-sc="view": progress of an element crossing the screen, 0 as it enters at the bottom, 1 as it leaves at the top.
// It adds .sc-on to <html> only while data-motion is "on", which the head script and the motion switch set, so reduced motion
// and the switch both get the plain page. Elements are read again on every frame, so a client-side route change needs no hook.
const clamp = (n: number) => Math.min(1, Math.max(0, n));

export function initScroll(root: HTMLElement = document.documentElement) {
  let queued = false;
  const frame = () => {
    queued = false;
    const on = root.dataset.motion === 'on';
    root.classList.toggle('sc-on', on);
    if (!on) return;
    const vh = innerHeight;
    for (const el of document.querySelectorAll<HTMLElement>('[data-sc]')) {
      const r = el.getBoundingClientRect();
      // A film that is not pinned (a phone, or a screen too short for the hero) shows its last frame, so nothing waits on a scroll.
      const pinned = el.dataset.sc === 'film' && r.height > vh && getComputedStyle(el.firstElementChild!).position === 'sticky';
      const p = el.dataset.sc === 'film' ? (pinned ? clamp(-r.top / (r.height - vh)) : 1) : clamp((vh - r.top) / (vh + r.height));
      el.style.setProperty('--sc-p', p.toFixed(3));
    }
  };
  const ask = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', ask, { passive: true });
  addEventListener('resize', ask);
  addEventListener('popstate', ask);
  new MutationObserver(ask).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
  // The film sits inside route content, which the app swaps. A cheap observer on #root, which stays, catches that swap.
  const main = document.getElementById('root');
  if (main) new MutationObserver(ask).observe(main, { childList: true, subtree: true });
  ask();
}
