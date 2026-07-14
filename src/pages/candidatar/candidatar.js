/* ==========================================================================
   src/pages/candidatar/candidatar.js — Application form page
   Reads ?job= from URL, populates job details, handles form validation and
   triggers client-side mailto redirect to submit the application.
   ========================================================================== */

let currentJob = null;

document.addEventListener('DOMContentLoaded', async () => {
  const jobId = new URLSearchParams(window.location.search).get('job');
  if (!jobId) { window.location.href = '../../../index.html'; return; }

  try {
    const data = await loadJobs();
    const job = getJob(data, jobId);
    if (!job) { window.location.href = '../../../index.html'; return; }
    currentJob = job;
    populateJobDetails(data, job);
    document.getElementById('apply-form').addEventListener('submit', onSubmit);
  } catch (err) {
    console.error('[candidatar] Init error:', err);
  }
});

function populateJobDetails(data, job) {
  const area = getArea(data, job.area);
  document.title = `Candidatar-me · ${job.title} — HAVELAR`;

  const backLink = document.getElementById('back-link');
  if (backLink) {
    backLink.href = `../vagas/vagas.html?area=${job.area}`;
    const label = backLink.querySelector('[data-area-name]');
    if (label && area) label.textContent = area.name;
  }

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('job-title', job.title);
  set('job-type', job.type);
  set('job-location', job.location);
  set('job-summary', job.summary);
  set('success-job-title', job.title);

  const resp = document.getElementById('job-responsibilities');
  if (resp) resp.innerHTML = job.responsibilities.map(r => `<li>${r}</li>`).join('');

  const reqs = document.getElementById('job-requirements');
  if (reqs) reqs.innerHTML = job.requirements.map(r => `<li>${r}</li>`).join('');
}

/* ── Form submission ─────────────────────────────────────────────────────── */
async function onSubmit(e) {
  e.preventDefault();
  clearAllErrors();

  const fullName = v('full_name');
  const email = v('email');
  const phone = v('phone');
  const city = v('city');
  const linkedin = v('linkedin');
  const education = v('education');
  const experience = v('experience_years');
  const coverLetter = v('cover_letter');

  let ok = true;
  if (fullName.length < 2 || fullName.length > 120) { setErr('full_name', 'Nome inválido (2–120 caracteres)'); ok = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('email', 'Email inválido'); ok = false; }
  if (phone.length < 6 || phone.length > 30) { setErr('phone', 'Telefone inválido'); ok = false; }
  if (linkedin && !linkedin.startsWith('http')) { setErr('linkedin', 'URL inválido'); ok = false; }

  if (!ok) { showToast('Corrige os erros antes de enviar.', 'error'); return; }

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> A abrir e-mail…';

  try {
    // Construct the prefilled email body in Portuguese with form details
    const subject = `Candidatura: ${currentJob.title} - ${fullName}`;
    const emailBody = `Olá Recrutamento HAVELAR,

Venho por este meio apresentar a minha candidatura à vaga de "${currentJob.title}" (${currentJob.type}).

Informações de Candidatura:
--------------------------------------------------
Nome Completo: ${fullName}
Email: ${email}
Telefone: ${phone}
Cidade: ${city || 'Não especificada'}
LinkedIn: ${linkedin || 'Não especificado'}
Anos de Experiência: ${experience || 'Não especificados'}
Formação Académica: ${education || 'Não especificada'}

Mensagem / Carta de Apresentação:
--------------------------------------------------
${coverLetter || 'Sem mensagem adicional.'}

Com os melhores cumprimentos,
${fullName}`;

    // RECRUITMENT_EMAIL is loaded globally from core/data.js
    const emailTo = typeof RECRUITMENT_EMAIL !== 'undefined' ? RECRUITMENT_EMAIL : 'recrutamento@havelar.com';
    const mailtoUrl = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    // Open the user's email client
    window.location.href = mailtoUrl;

    // Show success view
    document.getElementById('form-view').classList.add('hidden');
    document.getElementById('success-view').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    console.error('[candidatar] Submit error:', err);
    showToast('Erro ao preparar e-mail. Tente novamente.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Enviar candidatura';
  }
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const v = id => (document.getElementById(id)?.value || '').trim();

function setErr(field, msg) {
  const el = document.getElementById(`err-${field}`);
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}
function clearErr(field) {
  const el = document.getElementById(`err-${field}`);
  if (el) { el.textContent = ''; el.classList.add('hidden'); }
}
function clearAllErrors() {
  document.querySelectorAll('.form-error').forEach(el => { el.textContent = ''; el.classList.add('hidden'); });
}
