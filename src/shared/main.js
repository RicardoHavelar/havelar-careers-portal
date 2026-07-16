/* ==========================================================================
   src/shared/main.js — Shared page behaviors (header scroll, reveal, toast)
   Loaded by every HTML page.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initReveal();
  initFooter();
});

/* ── Header scrolled effect ──────────────────────────────────────────────── */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Scroll-Reveal (IntersectionObserver) ───────────────────────────────── */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -20px 0px' }
  );
  els.forEach(el => io.observe(el));
}

/* ── Dynamic Footer Component ────────────────────────────────────────────── */
function initFooter() {
  const footer = document.querySelector('.footer');
  if (!footer) return;
  const isSubpage = window.location.pathname.includes('/src/pages/');
  const logoSrc = isSubpage ? '../../assets/havelar-logo.png' : 'src/assets/havelar-logo.png';
  const vagasHref = isSubpage ? '../../../index.html#areas' : '#areas';

  footer.innerHTML = `
    <div class="container footer__grid">
      <div>
        <img src="${logoSrc}" alt="HAVELAR" class="footer__logo">
        <p>Impressão 3D de habitação. Construímos o futuro, construímos talento.</p>
      </div>
      <div>
        <p class="footer__heading">Recrutamento</p>
        <p>Ricardo Lemos — Gestor de Recursos Humanos</p>
        <a href="mailto:recrutamento@havelar.com" class="footer__email">recrutamento@havelar.com</a>
      </div>
      <div>
        <p class="footer__heading">Links</p>
        <div class="footer__links">
          <a href="${vagasHref}">Ver vagas</a>
          <a href="https://www.linkedin.com/company/havelar/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          <a href="https://www.instagram.com/_havelar_" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
          <a href="https://www.havelar.com/home-pt/" target="_blank" rel="noopener noreferrer">havelar.com ↗</a>
        </div>
      </div>
    </div>
    <div class="footer__bottom">
      &copy; ${new Date().getFullYear()} HAVELAR. Todos os direitos reservados.
    </div>
  `;
}

/* ── Toast notifications (globally available) ───────────────────────────── */
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4500);
}
