/* ==========================================================================
   src/pages/home/home.js — Homepage logic
   Fetches jobs.json data, renders statistics, and builds the areas grid.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await loadJobs();
    renderStats(data);
    renderAreasGrid(data);
  } catch (err) {
    console.error('[home] Failed to load jobs:', err);
  }
});

function renderStats(data) {
  const totalJobs  = data.jobs.length;
  const totalAreas = data.areas.length;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl('stat-jobs',  totalJobs);
  setEl('stat-areas', totalAreas);
  setEl('hero-badge-count', totalJobs);
}

function renderAreasGrid(data) {
  const grid = document.getElementById('areas-grid');
  if (!grid) return;
  grid.innerHTML = '';

  data.areas.forEach(area => {
    const count = jobsByArea(data, area.id).length;
    const label = count === 1 ? 'vaga' : 'vagas';

    const a = document.createElement('a');
    a.href = `src/pages/vagas/vagas.html?area=${area.id}`;
    a.className = 'card area-card';
    a.innerHTML = `
      <div class="area-card__icon">${area.icon}</div>
      <h3 class="area-card__title">${area.name}</h3>
      <p class="area-card__desc">${area.description}</p>
      <div class="area-card__footer">
        <span class="badge badge--primary">${count} ${label}</span>
        <span class="area-card__cta">
          Ver vagas
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </span>
      </div>
    `;
    grid.appendChild(a);
  });
}
