// ============================================================
// supabase-client.js  v3
// Підключити в index.html ПЕРЕД script.js:
//   <script src="supabase-client.js"></script>
//   <script src="script.js"></script>
// ============================================================

const SUPABASE_URL      = 'https://fihxmpmxygthisgcxelj.supabase.co'; // замінити
const SUPABASE_ANON_KEY = 'sb_publishable_hm5W8KKVYexq6_3zucap_A_3qcexFOF';               // замінити

// ── SVG іконки для категорій ─────────────────────────────────
const CAT_ICONS = {
  hair:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z"/><path d="M5 19H19" stroke-width="1.5"/></svg>`,
  colorist:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="M20 4L8.12 15.88"/><path d="M14.47 14.48L20 20"/></svg>`,
  permanent: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12c0-3.5 4-6 8-6s8 2.5 8 6-4 6-8 6-8-2.5-8-6z"/><path d="M14 13l4 6" stroke-width="1.4"/></svg>`,
  nails:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 14v4a3 3 0 0 0 3 3h1a3 3 0 0 0 3-3v-4"/><path d="M7 14c0-2 1-3 3-3s3 1 3 3"/></svg>`,
  brows:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14c3-4 8-6 16-2"/><path d="M4 15c3-4 8-6 16-2" opacity="0.5"/></svg>`,
  massage:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="7" r="2.5"/><path d="M4 18c0-2 2-3 5-3s5 1 5 3v2H4v-2z"/><circle cx="18" cy="5" r="2.5" opacity="0.8"/></svg>`,
};

// ── Fetch helper ─────────────────────────────────────────────
async function sbGet(table, order = 'position,id') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&order=${order}`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  return res.ok ? res.json() : [];
}

// ── Render services grid ─────────────────────────────────────
function renderServices(categories) {
  const grid = document.querySelector('.services-grid');
  if (!grid || !categories.length) return;

  grid.innerHTML = categories.map((cat, i) => `
    <article class="service-card animate-on-scroll" data-service="${cat.slug}" data-delay="${i}">
      <div class="card-icon" aria-hidden="true">
        ${CAT_ICONS[cat.slug] || CAT_ICONS.massage}
      </div>
      <h3>${cat.name}</h3>
      <p>${cat.description || ''}</p>
    </article>
  `).join('');

  // Re-observe for scroll animation
  if (window._scrollObserver) {
    grid.querySelectorAll('.animate-on-scroll').forEach(el => window._scrollObserver.observe(el));
  }

  // Re-bind click → price modal (script.js може вже завантажитись)
  grid.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.getAttribute('data-service');
      if (key && typeof openPriceModal === 'function') openPriceModal(key);
    });
  });
}

// ── Render schedule ──────────────────────────────────────────
function renderSchedule(schedule) {
  const el = document.querySelector('.location-schedule');
  if (!el || !schedule.length) return;
  el.innerHTML = schedule
    .map(s => `${s.day_label}: ${(s.open_time||'').slice(0,5)} – ${(s.close_time||'').slice(0,5)}`)
    .join('<br>');
}

// ── Build servicesData for price modal ───────────────────────
// Структура: { [slug]: { title, masters:[{name,role,photo}], prices:[{name,master?,top?,isHeader?}] } }
function buildServicesData(categories, masters, services, prices) {
  const data = {};

  categories.forEach(cat => {
    const catMasters = masters.filter(m => m.category_id === cat.id)
                              .sort((a,b) => a.position - b.position);
    const catSvcs    = services.filter(s => s.category_id === cat.id)
                               .sort((a,b) => a.position - b.position);

    // Визначаємо "Майстер" та "Топ-майстер" для колонок
    const masterCol = catMasters.find(m => m.role !== 'Топ-майстер');
    const topCol    = catMasters.find(m => m.role === 'Топ-майстер');

    const priceRows = catSvcs.map(svc => {
      const row = { name: svc.name };
      catMasters.forEach(m => {
        const p = prices.find(pr => pr.service_id === svc.id && pr.master_id === m.id);
        if (!p) return;
        const val = p.label || (p.price_to ? `${p.price_from}–${p.price_to} ₴` : `${p.price_from} ₴`);
        if (m.role === 'Топ-майстер') row.top = val;
        else row.master = val;
      });
      return row;
    });

    data[cat.slug] = {
      title:   cat.name,
      masters: catMasters.map(m => ({
        name:  m.name,
        role:  m.role || 'Майстер',
        photo: m.avatar || '',
      })),
      prices: priceRows,
    };
  });

  return data;
}

// ── Main ─────────────────────────────────────────────────────
async function initSupabase() {
  try {
    const [categories, masters, services, prices, schedule] = await Promise.all([
      sbGet('categories'), sbGet('masters'), sbGet('services'),
      sbGet('prices'), sbGet('schedule'),
    ]);

    // 1. Картки послуг
    renderServices(categories);

    // 2. Графік роботи
    renderSchedule(schedule);

    // 3. Дані для прайс-модалу
    window.servicesData = buildServicesData(categories, masters, services, prices);

  } catch (err) {
    // Якщо Supabase недоступний — сайт показує статичні дані
    console.warn('[Milan] Supabase unavailable, using static data:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', initSupabase);
