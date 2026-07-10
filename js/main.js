/* Shared nav, footer, and theme for bernharddalheimer.com */

(function () {
  /* ── Theme ────────────────────────────────────────────────── */
  const root   = document.documentElement;
  const KEY    = 'bd-theme';
  const sysDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  let theme = localStorage.getItem(KEY) || (sysDark() ? 'dark' : 'light');

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    const sun  = document.getElementById('icon-sun');
    const moon = document.getElementById('icon-moon');
    if (sun)  sun.style.display  = t === 'dark' ? 'none' : '';
    if (moon) moon.style.display = t === 'dark' ? ''     : 'none';
  }

  /* ── Nav ──────────────────────────────────────────────────── */
  const pages = [
    { name: 'Research',     href: '/research.html' },
    { name: 'Publications', href: '/publications.html' },
    { name: 'Talks',        href: '/talks.html' },
    { name: 'Teaching',     href: '/teaching.html' },
    { name: 'Advising',     href: '/advising.html' },
    { name: 'Media',        href: '/media.html' },
    { name: 'Software',     href: '/software.html' },
    { name: 'Price Monitor', href: '/dashboard/' },
  ];

  function isActive(href) {
    const path = window.location.pathname;
    if (href === '/') return path === '/' || path === '/index.html';
    if (href.endsWith('/')) return path === href || path.startsWith(href);
    return path === href || path.endsWith(href);
  }

  const navLinks = pages
    .map(p => `<li><a href="${p.href}"${isActive(p.href) ? ' class="active"' : ''}>${p.name}</a></li>`)
    .join('');

  const navHTML = `
<nav>
  <div class="nav-inner">
    <a class="nav-name" href="/">Bernhard Dalheimer</a>
    <ul class="nav-links">${navLinks}</ul>
    <button class="theme-btn" id="theme-toggle" aria-label="Toggle colour theme">
      <svg id="icon-sun" width="15" height="15" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      <svg id="icon-moon" width="15" height="15" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:none">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
      </svg>
    </button>
  </div>
</nav>`;

  /* ── Footer ───────────────────────────────────────────────── */
  const footerHTML = `
<footer>
  <div class="footer-inner">
    <div>
      <p class="footer-heading">Affiliation</p>
      <p class="footer-body">
        Bernhard Dalheimer<br>
        Assistant Professor of International Trade<br>
        and Macroeconomics<br>
        Purdue University
      </p>
    </div>
    <div>
      <p class="footer-heading">Contact</p>
      <p class="footer-body">
        <a href="mailto:bdalheim@purdue.edu">bdalheim@purdue.edu</a><br><br>
        Department of Agricultural Economics<br>
        403 Mitch Daniels Blvd.<br>
        West Lafayette, IN 47907
      </p>
    </div>
    <div>
      <p class="footer-heading">Links</p>
      <p class="footer-body">
        <a href="https://scholar.google.de/citations?user=sBxpsF8AAAAJ&hl=de" target="_blank" rel="noopener">Google Scholar</a><br>
        <a href="https://github.com/BDalheimer" target="_blank" rel="noopener">GitHub</a><br>
        <a href="https://www.linkedin.com/in/bernhard-dalheimer-3171318a/" target="_blank" rel="noopener">LinkedIn</a><br>
        <a href="https://www.youtube.com/channel/UCRgmIYjSsUOJIoXQwQUqpmQ" target="_blank" rel="noopener">YouTube</a><br>
        <a href="/cv/CVonline.pdf" target="_blank">CV (PDF)</a>
      </p>
    </div>
  </div>
  <p class="footer-copy">© ${new Date().getFullYear()} Bernhard Dalheimer</p>
</footer>`;

  /* ── Init ─────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    const navEl    = document.getElementById('site-nav');
    const footerEl = document.getElementById('site-footer');
    if (navEl)    navEl.innerHTML    = navHTML;
    if (footerEl) footerEl.innerHTML = footerHTML;

    applyTheme(theme);

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        theme = theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem(KEY, theme);
        applyTheme(theme);
      });
    }

    /* Research card toggles */
    document.querySelectorAll('.research-card-header').forEach(function (h) {
      h.addEventListener('click', function () {
        h.closest('.research-card').classList.toggle('open');
      });
    });
  });
})();
