/* ==========================================================================
   src/pages/vagas/vagas.js — Area jobs listing page
   Reads ?area= from URL, renders header and job cards from JSON data.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const areaId = new URLSearchParams(window.location.search).get('area');
  if (!areaId) { window.location.href = '../../../index.html'; return; }

  try {
    const data = await loadJobs();
    const area = getArea(data, areaId);
    if (!area) { window.location.href = '../../../index.html'; return; }

    // Update page header
    document.getElementById('area-icon').textContent  = area.icon;
    document.getElementById('area-title').textContent = area.name;
    document.getElementById('area-desc').textContent  = area.description;
    document.title = `${area.name} — Carreiras HAVELAR`;

    renderJobsList(data, areaId);
  } catch (err) {
    console.error('[vagas] Failed to load jobs:', err);
  }
});

function renderJobsList(data, areaId) {
  const list = document.getElementById('jobs-list');
  if (!list) return;
  const jobs = jobsByArea(data, areaId);

  if (!jobs.length) {
    list.innerHTML = `
      <div class="jobs-empty">
        Sem vagas ativas nesta área de momento — envia uma candidatura espontânea a
        <a href="mailto:recrutamento@havelar.com">recrutamento@havelar.com</a>.
      </div>`;
    return;
  }

  list.innerHTML = '';
  jobs.forEach(job => {
    const a = document.createElement('a');
    a.href = `../candidatar/candidatar.html?job=${job.id}`;
    a.className = 'card job-card';
    a.innerHTML = `
      <div class="job-card__body">
        <div class="job-card__meta">
          <span class="badge badge--primary">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect width="20" height="14" x="2" y="7" rx="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            ${job.type}
          </span>
          <span class="badge badge--subtle">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            ${job.location}
          </span>
        </div>
        <h2 class="job-card__title">${job.title}</h2>
        <p class="job-card__summary">${job.summary}</p>
      </div>
      <svg class="job-card__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
      </svg>
    `;
    list.appendChild(a);
  });
}
