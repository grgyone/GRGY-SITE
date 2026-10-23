(() => {
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#site-navigation');
  const worksToggle = document.querySelector('.works-toggle');
  const categories = document.querySelector('#work-categories');
  if (!toggle || !navigation) return;
  const mobile = window.matchMedia('(max-width: 760px)');
  const setMenu = open => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('span').textContent = open ? '−' : '+';
    navigation.hidden = mobile.matches && !open;
  };
  toggle.hidden = false;
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  mobile.addEventListener('change', () => setMenu(false));
  setMenu(false);
  if (worksToggle && categories) {
    worksToggle.hidden = false;
    worksToggle.addEventListener('click', () => {
      const open = worksToggle.getAttribute('aria-expanded') !== 'true';
      worksToggle.setAttribute('aria-expanded', String(open));
      worksToggle.querySelector('span').textContent = open ? '−' : '+';
      categories.hidden = !open;
    });
  }
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobile.matches && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
})();
