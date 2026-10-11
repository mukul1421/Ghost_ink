const PAGES = [
  { label: 'test',    href: 'index.html' },
  { label: 'gallery', href: 'gallery.html' }
];

function renderNavbar() {
  const currentFile = location.pathname.split('/').pop() || 'index.html';

  const links = PAGES.map(page => {
    const isActive = page.href === currentFile;
    return `<a class="nav-link${isActive ? ' active' : ''}" href="${page.href}">${page.label}</a>`;
  }).join('');

  document.getElementById('site-header').innerHTML = `
    <div class="nav-shell">
      <a class="brand" href="index.html">ghost<span>ink</span></a>
      <nav aria-label="Primary navigation">${links}</nav>
    </div>
  `;
}

renderNavbar();