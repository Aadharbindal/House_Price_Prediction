/**
 * House Price Prediction — Frontend Application Logic
 * Handles: API calls, form interactions, charts, history, modals, toasts
 */

const API_BASE = window.location.origin;

// ═══════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════
const state = {
  cities: [],
  selectedBhk: 3,
  amenities: { has_gym: false, has_pool: false, has_security: true, has_power_backup: true, has_clubhouse: false, has_parking: true },
  currentPredictionId: null,
  selectedRating: 0,
  cityChart: null,
  featureChart: null,
};

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  setupScrollReveal();
  setupNavbarScroll();
  setupSliders();
  setupSteppers();
  setupBhkChips();
  setupAmenityChips();
  setupFormSubmit();

  await loadCities();
  enhanceSelects();   // after the city options exist
  await loadAnalytics();

  // Load initial analytics stats for hero section
  updateHeroStats();
});

// ═══════════════════════════════════════════════════════
//  TAB NAVIGATION
// ═══════════════════════════════════════════════════════
const TAB_EXIT_MS = 160;   // must match .tab-content.is-leaving in styles.css

function switchTab(tab) {
  const outgoing = document.querySelector('.tab-content.active');
  const tabEl    = document.getElementById(`tab-${tab}`);

  // Already here - nothing to animate.
  if (outgoing && outgoing === tabEl) return;

  // Play the outgoing panel's exit before swapping. Removing it in the same
  // frame as the new one arrives gives the browser nothing to animate, which
  // is what made tab changes read as a hard cut.
  if (outgoing) {
    outgoing.classList.add('is-leaving');
    setTimeout(() => {
      outgoing.classList.remove('is-leaving', 'active');
      outgoing.classList.add('hidden');
    }, TAB_EXIT_MS);
  }

  document.querySelectorAll('.tab-content').forEach(el => {
    if (el !== outgoing) { el.classList.remove('active'); el.classList.add('hidden'); }
  });

  // Remove active from all nav links
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

  // Show selected tab
  const navEl = document.getElementById(`nav-${tab}`);
  const show = () => {
    if (tabEl) { tabEl.classList.remove('hidden'); tabEl.classList.add('active'); }
  };
  if (outgoing) setTimeout(show, TAB_EXIT_MS); else show();

  if (navEl) navEl.classList.add('active');

  // Load data for tab
  if (tab === 'analytics') loadAnalytics();
  if (tab === 'history')   loadHistory();
}

// ═══════════════════════════════════════════════════════
//  SLIDERS
// ═══════════════════════════════════════════════════════
function setupSliders() {
  const sliders = [
    { id: 'size_sqft',      display: 'sizeDisplay',  format: v => parseInt(v).toLocaleString('en-IN') },
    { id: 'property_age',   display: 'ageDisplay',   format: v => v },
    { id: 'distance_metro', display: 'metroDisplay', format: v => parseFloat(v).toFixed(1) },
  ];

  sliders.forEach(({ id, display, format }) => {
    const slider = document.getElementById(id);
    const disp   = document.getElementById(display);
    if (!slider || !disp) return;

    const update = () => {
      disp.textContent = format(slider.value);
      // Visual fill for size slider
      if (id === 'size_sqft') updateSliderFill(slider);
    };

    slider.addEventListener('input', update);
    update();
  });
}

function updateSliderFill(slider) {
  const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(to right, #10b981 ${pct}%, rgba(255,255,255,0.08) ${pct}%)`;
}

// ═══════════════════════════════════════════════════════
//  STEPPERS
// ═══════════════════════════════════════════════════════
function setupSteppers() {
  setupStepper('bathrooms', 'bathDisplay', 'bathDec', 'bathInc', 1, 8, 2);
  setupStepper('balconies', 'balcDisplay', 'balcDec', 'balcInc', 0, 5, 1);
}

function setupStepper(inputId, displayId, decId, incId, min, max, initial) {
  const input   = document.getElementById(inputId);
  const display = document.getElementById(displayId);
  const decBtn  = document.getElementById(decId);
  const incBtn  = document.getElementById(incId);

  let value = initial;
  const update = () => {
    input.value     = value;
    display.textContent = value;
    decBtn.disabled = value <= min;
    incBtn.disabled = value >= max;
  };

  decBtn.addEventListener('click', () => { if (value > min) { value--; update(); } });
  incBtn.addEventListener('click', () => { if (value < max) { value++; update(); } });
  update();
}

// ═══════════════════════════════════════════════════════
//  BHK CHIPS
// ═══════════════════════════════════════════════════════
function setupBhkChips() {
  document.querySelectorAll('.bhk-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.bhk-chip').forEach(c => { c.classList.remove('selected'); c.setAttribute('aria-pressed', 'false'); });
      chip.classList.add('selected');
      chip.setAttribute('aria-pressed', 'true');
      state.selectedBhk = parseInt(chip.dataset.bhk);
      document.getElementById('bhk').value = state.selectedBhk;

      // Auto-adjust size slider hint
      const sizeRanges = { 1: 600, 2: 1000, 3: 1500, 4: 2500, 5: 4000 };
      const slider = document.getElementById('size_sqft');
      slider.value = sizeRanges[state.selectedBhk] || 1500;
      slider.dispatchEvent(new Event('input'));
    });
  });
}

// ═══════════════════════════════════════════════════════
//  AMENITY CHIPS
// ═══════════════════════════════════════════════════════
function setupAmenityChips() {
  document.querySelectorAll('.amenity-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const amenityKey = chip.dataset.amenity;
      state.amenities[amenityKey] = !state.amenities[amenityKey];
      chip.classList.toggle('active', state.amenities[amenityKey]);
      chip.setAttribute('aria-pressed', state.amenities[amenityKey] ? 'true' : 'false');
    });
  });
}

// ═══════════════════════════════════════════════════════
//  CITY & LOCALITY LOADER
// ═══════════════════════════════════════════════════════
async function loadCities() {
  try {
    const res = await fetch(`${API_BASE}/api/cities`);
    if (!res.ok) throw new Error('Failed to load cities');
    state.cities = await res.json();
    populateCityDropdown();
  } catch (err) {
    showToast('Could not load cities. Ensure the backend is running.', 'error');
    console.error(err);
  }
}

function populateCityDropdown() {
  const citySelect = document.getElementById('city');
  citySelect.innerHTML = '<option value="">Select City</option>';

  state.cities.forEach(cityInfo => {
    const opt = document.createElement('option');
    opt.value = cityInfo.city;
    opt.textContent = cityInfo.city;
    citySelect.appendChild(opt);
  });

  citySelect.addEventListener('change', () => {
    populateLocalities(citySelect.value);
  });
}

function populateLocalities(cityName) {
  const localitySelect = document.getElementById('locality');
  localitySelect.innerHTML = '<option value="">Select Locality</option>';
  localitySelect.disabled = !cityName;

  if (!cityName) return;

  const cityInfo = state.cities.find(c => c.city === cityName);
  if (!cityInfo) return;

  // Sort by tier: Premium first, then Mid, then Budget
  const tierOrder = { 'Premium': 0, 'Mid': 1, 'Budget': 2 };
  const sorted = [...cityInfo.localities].sort((a, b) => tierOrder[a.price_tier] - tierOrder[b.price_tier]);

  sorted.forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc.name;
    const tierEmoji = loc.price_tier === 'Premium' ? '💎' : loc.price_tier === 'Mid' ? '🌟' : '💰';
    opt.textContent = `${tierEmoji} ${loc.name} — ₹${loc.avg_price_sqft.toLocaleString('en-IN')}/sqft`;
    localitySelect.appendChild(opt);
  });
}

// getCityEmoji lived here. It mapped each city to a decorative emoji -
// Mumbai to a wave, Indore to a broom - which rendered differently on every
// machine and carried no meaning. The history cards now use one location pin
// and the city dropdown just names the city.

// ═══════════════════════════════════════════════════════
//  FORM SUBMISSION & PREDICTION
// ═══════════════════════════════════════════════════════
function setupFormSubmit() {
  document.getElementById('predictionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handlePrediction();
  });
}

async function handlePrediction() {
  const btn = document.getElementById('predictBtn');

  // Validate required fields
  const city     = document.getElementById('city').value;
  const locality = document.getElementById('locality').value;
  if (!city)     { showToast('Please select a city', 'error'); return; }
  if (!locality) { showToast('Please select a locality', 'error'); return; }

  // Build payload
  const payload = {
    city,
    locality,
    bhk:           state.selectedBhk,
    size_sqft:     parseFloat(document.getElementById('size_sqft').value),
    property_type: document.getElementById('property_type').value,
    furnishing:    document.getElementById('furnishing').value,
    bathrooms:     parseInt(document.getElementById('bathrooms').value),
    balconies:     parseInt(document.getElementById('balconies').value),
    property_age:  parseInt(document.getElementById('property_age').value),
    distance_metro:parseFloat(document.getElementById('distance_metro').value),
    ...state.amenities,
    session_id: getSessionId(),
  };

  // UI loading state
  btn.classList.add('loading');
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Prediction failed');
    }

    const data = await res.json();
    state.currentPredictionId = data.prediction_id;

    displayResult(data, payload);
    showToast('Price estimate generated successfully!', 'success');
    updateHeroStats();

  } catch (err) {
    showToast(err.message || 'Prediction failed. Please try again.', 'error');
    console.error(err);
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

// ═══════════════════════════════════════════════════════
//  DISPLAY RESULT
// ═══════════════════════════════════════════════════════
function displayResult(data, payload) {
  // Hide placeholder, show results
  document.getElementById('resultsPlaceholder').style.display = 'none';
  const resultContent = document.getElementById('resultContent');
  resultContent.classList.remove('hidden');

  // Format price display
  const isAboveCrore = data.price_in_lakhs >= 100;
  const displayValue = isAboveCrore ? data.price_in_crores.toFixed(2) : data.price_in_lakhs.toFixed(2);
  const displayUnit  = isAboveCrore ? 'Crores' : 'Lakhs';

  // Animate the price number
  animateCounter(document.getElementById('priceValue'), 0, parseFloat(displayValue), 1000);
  document.getElementById('priceUnit').textContent = displayUnit;
  document.getElementById('pricePsf').textContent  = `₹${Math.round(data.price_per_sqft).toLocaleString('en-IN')}`;

  // Range
  const lowLakhs  = (data.price_low  / 100000).toFixed(1);
  const highLakhs = (data.price_high / 100000).toFixed(1);
  document.getElementById('rangeLow').textContent  = `₹${lowLakhs}L`;
  document.getElementById('rangeHigh').textContent = `₹${highLakhs}L`;

  // Summary
  renderSummary(data, payload);

  // Feature impact bars
  renderFeatureImpacts(data.feature_impacts);

  // Scroll results into view on mobile
  resultContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function animateCounter(el, from, to, duration) {
  // Write the real figure first, then animate over it.
  //
  // requestAnimationFrame does not run in a backgrounded tab. If the count-up
  // were the only thing that ever set this text, a prediction that finished
  // while the tab was hidden would leave the user looking at the placeholder
  // when they came back. Putting the value in immediately means the number is
  // always correct, and the animation is decoration on top of it.
  el.textContent = to.toFixed(2);

  // Counting up is motion for its own sake. Anyone who has asked for less of
  // it keeps the figure they came for and skips the tick.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const startTime = performance.now();
  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = (from + (to - from) * eased).toFixed(2);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = to.toFixed(2);
  };
  requestAnimationFrame(update);
}


/* One icon per summary row, keyed to what the row actually reports. Replaces
   emoji, which arrived in a different colour, weight and baseline on every
   machine and clashed with the SVG used everywhere else. */
const SUMMARY_ICONS = {
  location:   '<path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  type:       '<path d="M3 9.5 12 2.5l9 7V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20Z"/><path d="M9.5 21.5v-7h5v7"/>',
  bhk:        '<path d="M3 17v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/><path d="M3 17h18v3"/><path d="M6.5 11V8.5A1.5 1.5 0 0 1 8 7h8a1.5 1.5 0 0 1 1.5 1.5V11"/>',
  size:       '<path d="M3.5 20.5 20.5 3.5"/><path d="M3.5 14v6.5H10"/><path d="M20.5 10V3.5H14"/>',
  bathrooms:  '<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z"/><path d="M7 12V6.5A2.5 2.5 0 0 1 11.5 5"/><path d="M8.5 22l-1 1.5M15.5 22l1 1.5"/>',
  balconies:  '<path d="M3 10h18"/><path d="M5 10v10M19 10v10M3 20h18"/><path d="M9 10v10M15 10v10"/><path d="M6 10 12 4l6 6"/>',
  furnishing: '<path d="M4 17v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5"/><path d="M2 17h20v3H2Z"/><path d="M6 10V7.5A1.5 1.5 0 0 1 7.5 6h9A1.5 1.5 0 0 1 18 7.5V10"/>',
  age:        '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/>',
};

const summaryIcon = (key) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SUMMARY_ICONS[key] || ''}</svg>`;

function renderSummary(data, payload) {
  const grid = document.getElementById('summaryGrid');
  const items = [
    { icon: summaryIcon('location'), label: 'Location', value: `${data.city}, ${data.locality}` },
    { icon: summaryIcon('type'), label: 'Type',     value: payload.property_type },
    { icon: summaryIcon('bhk'), label: 'BHK',      value: `${payload.bhk} BHK` },
    { icon: summaryIcon('size'), label: 'Size',      value: `${payload.size_sqft.toLocaleString('en-IN')} sq.ft` },
    { icon: summaryIcon('bathrooms'), label: 'Bathrooms', value: payload.bathrooms },
    { icon: summaryIcon('balconies'), label: 'Balconies', value: payload.balconies },
    { icon: summaryIcon('furnishing'), label: 'Furnishing',value: payload.furnishing },
    { icon: summaryIcon('age'), label: 'Age',       value: `${payload.property_age} yr${payload.property_age !== 1 ? 's' : ''}` },
  ];

  // --i drives the staggered entrance in the stylesheet. The animate-in class
  // is deliberately not applied: it carries its own fadeInUp, and two
  // animations on one element race rather than combine.
  grid.innerHTML = items.map(({ icon, label, value }, i) => `
    <div class="summary-item" style="--i: ${i}">
      <span class="summary-icon">${icon}</span>
      <div class="summary-info">
        <span class="summary-label">${label}</span>
        <span class="summary-value">${value}</span>
      </div>
    </div>
  `).join('');
}

function renderFeatureImpacts(impacts) {
  const list = document.getElementById('impactList');
  list.innerHTML = impacts.map(({ feature, impact_percent, direction }, i) => `
    <div class="impact-item" style="--i: ${i}">
      <div class="impact-header">
        <span class="impact-name">${feature}</span>
        <span class="impact-pct">${impact_percent.toFixed(1)}%</span>
      </div>
      <div class="impact-bar-bg">
        <div class="impact-bar-fill ${direction}"
             style="width: 0%"
             data-width="${impact_percent}"></div>
      </div>
    </div>
  `).join('');

  // Grow the bars from zero.
  //
  // Reading offsetWidth forces the browser to commit the 0% starting width
  // before the real one is assigned, which is what gives the CSS transition
  // two values to move between. The previous version deferred this to
  // requestAnimationFrame, which does not run in a backgrounded tab - so a
  // prediction that completed while the tab was hidden left every bar sitting
  // at 0% next to a percentage label that disagreed with it.
  document.querySelectorAll('.impact-bar-fill').forEach(bar => {
    void bar.offsetWidth;
    bar.style.width = bar.dataset.width + '%';
  });
}

// ═══════════════════════════════════════════════════════
//  ANALYTICS
// ═══════════════════════════════════════════════════════
async function loadAnalytics() {
  try {
    const res = await fetch(`${API_BASE}/api/analytics`);
    if (!res.ok) throw new Error();
    const data = await res.json();

    renderAnalyticsStats(data);
    renderCityChart(data);
    renderFeatureChart(data);
    renderCityTable();
  } catch (err) {
    console.warn('Analytics load failed:', err);
  }
}

function renderAnalyticsStats(data) {
  const mi = data.model_info || {};
  const r2El  = document.getElementById('analyticsR2');
  const maeEl = document.getElementById('analyticsMAE');
  const predEl= document.getElementById('analyticsPredictions');

  if (r2El)   r2El.textContent  = mi.r2_score ? mi.r2_score.toFixed(3) : '—';
  if (maeEl)  maeEl.textContent = mi.mae ? `₹${(mi.mae/100000).toFixed(1)}L` : '—';
  if (predEl) predEl.textContent = (data.total_predictions || 0).toLocaleString('en-IN');
}

function renderCityChart(data) {
  const canvas = document.getElementById('cityPriceChart');
  if (!canvas) return;

  const prices = data.baseline_city_prices || {};
  const entries = Object.entries(prices).sort((a, b) => b[1] - a[1]);
  const labels = entries.map(([c]) => c);
  const values = entries.map(([, v]) => Math.round(v));

  if (state.cityChart) state.cityChart.destroy();

  state.cityChart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Avg ₹/sq.ft',
        data: values,
        // One hue, with intensity scaled by the value.
        //
        // This was a palette of eight colours that Chart.js cycled through for
        // twenty-odd cities, which meant the colour said nothing: every bar is
        // the same measurement, so a rainbow only competes with the heights
        // that carry the actual information. Tying opacity to the value makes
        // the colour restate the magnitude instead of contradicting it.
        backgroundColor: values.map((v) => {
          const max = Math.max(...values);
          const min = Math.min(...values);
          const t = max === min ? 1 : (v - min) / (max - min);
          return `rgba(16, 185, 129, ${(0.32 + t * 0.6).toFixed(3)})`;
        }),
        hoverBackgroundColor: 'rgba(52, 211, 153, 1)',
        borderColor: 'transparent',
        borderRadius: 8,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ₹${ctx.parsed.y.toLocaleString('en-IN')}/sq.ft`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8', font: { size: 11, family: 'Inter' } },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: {
          ticks: {
            color: '#94a3b8',
            font: { size: 11 },
            callback: v => `₹${(v/1000).toFixed(0)}k`,
          },
          grid: { color: 'rgba(255,255,255,0.06)' },
        },
      },
    },
  });
}

function renderFeatureChart(data) {
  const canvas = document.getElementById('featureImportanceChart');
  if (!canvas) return;

  const importance = data.model_info?.group_importance || {
    'Location (City & Locality)': 42,
    'Size & BHK':                 28,
    'Property Type':              12,
    'Furnishing':                  8,
    'Amenities':                   6,
    'Age & Connectivity':          4,
  };

  const labels = Object.keys(importance);
  const values = Object.values(importance);

  if (state.featureChart) state.featureChart.destroy();

  state.featureChart = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: [
          'rgba(16,185,129,0.85)', 'rgba(99,102,241,0.85)', 'rgba(245,158,11,0.85)',
          'rgba(236,72,153,0.85)', 'rgba(59,130,246,0.85)', 'rgba(168,85,247,0.85)',
        ],
        borderColor: '#080c14',
        borderWidth: 3,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94a3b8',
            font: { size: 11, family: 'Inter' },
            padding: 12,
            usePointStyle: true,
            pointStyleWidth: 10,
          },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed.toFixed(1)}%`,
          },
        },
      },
    },
  });
}

function renderCityTable() {
  const tbody = document.getElementById('cityTableBody');
  if (!tbody || !state.cities.length) return;

  const marketTrends = { 'Bangalore': 'Rising', 'Hyderabad': 'Rising', 'Pune': 'Rising' };
  const tiers = {
    'Mumbai': 'Premium', 'Delhi NCR': 'Premium', 'Bangalore': 'Premium', 'Goa': 'Premium',
    'Pune': 'Mid', 'Hyderabad': 'Mid', 'Chennai': 'Mid', 'Kochi': 'Mid', 'Chandigarh': 'Mid',
    'Ahmedabad': 'Budget', 'Surat': 'Budget', 'Jaipur': 'Budget', 'Lucknow': 'Budget',
    'Nagpur': 'Budget', 'Indore': 'Budget', 'Bhopal': 'Budget', 'Coimbatore': 'Budget',
    'Vizag': 'Budget', 'Mysore': 'Budget', 'Kolkata': 'Budget'
  };

  tbody.innerHTML = state.cities.map(city => {
    const trend = marketTrends[city.city] || 'Stable';
    const tier  = tiers[city.city] || 'Mid';
    const trendClass = `trend-${trend.toLowerCase()}`;
    const tierClass  = `tier-${tier.toLowerCase()}`;
    const trendIcon  = trend === 'Rising' ? '↑' : trend === 'Declining' ? '↓' : '→';

    return `
      <tr>
        <td>
          <div class="city-name-cell">
            <svg class="cell-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/>
            </svg>${city.city}
          </div>
        </td>
        <td>₹${Math.round(city.base_price_sqft).toLocaleString('en-IN')}/sq.ft</td>
        <td><span class="trend-badge ${trendClass}">${trendIcon} ${trend}</span></td>
        <td><span class="tier-badge ${tierClass}">${tier}</span></td>
      </tr>
    `;
  }).join('');
}

// ═══════════════════════════════════════════════════════
//  HISTORY
// ═══════════════════════════════════════════════════════
async function loadHistory() {
  const grid  = document.getElementById('historyGrid');
  const empty = document.getElementById('historyEmpty');

  try {
    const res = await fetch(`${API_BASE}/api/history?limit=24`);
    if (!res.ok) throw new Error();
    const history = await res.json();

    if (history.length === 0) {
      grid.innerHTML = '';
      grid.appendChild(empty);
      return;
    }

    // One pin for every city, rather than a per-city emoji. The old map paired
    // Mumbai with a wave and Indore with a broom - arbitrary associations that
    // rendered differently on every machine and told the reader nothing.
    const pin = `<svg class="hcard-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>`;

    const clock = `<svg class="hcard-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/></svg>`;

    grid.innerHTML = history.map((item, i) => `
      <div class="history-card" style="--i: ${Math.min(i, 11)}">
        <div class="hcard-header">
          <div class="hcard-place">
            <div class="hcard-city">${pin}${item.city}</div>
            <div class="hcard-locality">${item.locality}</div>
          </div>
          <div class="hcard-amount">
            <div class="hcard-price">₹${item.price_in_lakhs.toFixed(1)}L</div>
            <div class="hcard-price-label">Estimated</div>
          </div>
        </div>
        <div class="hcard-tags">
          <span class="hcard-tag">${item.bhk} BHK</span>
          <span class="hcard-tag">${Math.round(item.size_sqft).toLocaleString('en-IN')} sq.ft</span>
          <span class="hcard-tag">${item.property_type}</span>
          <span class="hcard-tag hcard-tag--rate">₹${Math.round(item.price_per_sqft).toLocaleString('en-IN')}/sqft</span>
        </div>
        <div class="hcard-time">${clock}${formatDate(item.created_at)}</div>
      </div>
    `).join('');

  } catch (err) {
    grid.innerHTML = `<div class="history-empty" style="grid-column:1/-1">
      <span>⚠️</span><p>Could not load history. Make sure the backend is running.</p>
    </div>`;
  }
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

// ═══════════════════════════════════════════════════════
//  FEEDBACK MODAL
// ═══════════════════════════════════════════════════════
function openFeedbackModal() {
  if (!state.currentPredictionId) { showToast('Make a prediction first!', 'info'); return; }
  document.getElementById('feedbackModal').classList.remove('hidden');
  resetStars();
}

function closeFeedbackModal() {
  document.getElementById('feedbackModal').classList.add('hidden');
}

function resetStars() {
  state.selectedRating = 0;
  document.querySelectorAll('.star').forEach(s => { s.classList.remove('active'); });
  document.getElementById('ratingLabel').textContent = 'Select a rating';
}

// Star rating setup
document.addEventListener('DOMContentLoaded', () => {
  const ratingLabels = ['', 'Very Inaccurate', 'Below Average', 'Acceptable', 'Good Estimate', 'Spot On! 🎯'];

  document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', () => {
      state.selectedRating = parseInt(star.dataset.rating);
      document.querySelectorAll('.star').forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.rating) <= state.selectedRating);
      });
      document.getElementById('ratingLabel').textContent = ratingLabels[state.selectedRating];
    });

    star.addEventListener('mouseover', () => {
      const hoverRating = parseInt(star.dataset.rating);
      document.querySelectorAll('.star').forEach(s => {
        s.style.color = parseInt(s.dataset.rating) <= hoverRating ? '#f59e0b' : '';
      });
    });

    star.addEventListener('mouseout', () => {
      document.querySelectorAll('.star').forEach(s => { s.style.color = ''; });
    });
  });
});

async function submitFeedback() {
  if (state.selectedRating === 0) { showToast('Please select a star rating', 'error'); return; }

  const btn = document.getElementById('submitFeedbackBtn');
  btn.disabled = true;
  btn.querySelector('.btn-text').textContent = 'Submitting...';

  const actualPriceRaw = document.getElementById('actualPrice').value;
  const payload = {
    prediction_id: state.currentPredictionId,
    rating: state.selectedRating,
    comment: document.getElementById('feedbackComment').value || null,
    actual_price: actualPriceRaw ? parseFloat(actualPriceRaw) * 100000 : null,
  };

  try {
    const res = await fetch(`${API_BASE}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error();

    closeFeedbackModal();
    showToast('Thank you for your feedback! 🙏', 'success');
    document.getElementById('feedbackComment').value = '';
    document.getElementById('actualPrice').value = '';

  } catch (err) {
    showToast('Failed to submit feedback. Please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.querySelector('.btn-text').textContent = 'Submit Feedback';
  }
}

// ═══════════════════════════════════════════════════════
//  RESET FORM
// ═══════════════════════════════════════════════════════
function resetForm() {
  document.getElementById('predictionForm').reset();

  // Reset BHK
  document.querySelectorAll('.bhk-chip').forEach(c => { c.classList.remove('selected'); c.setAttribute('aria-pressed', 'false'); });
  document.querySelector('[data-bhk="3"]').classList.add('selected');
  document.querySelector('[data-bhk="3"]').setAttribute('aria-pressed', 'true');
  state.selectedBhk = 3;
  document.getElementById('bhk').value = 3;

  // Reset amenities
  state.amenities = { has_gym: false, has_pool: false, has_security: true, has_power_backup: true, has_clubhouse: false, has_parking: true };
  document.querySelectorAll('.amenity-chip').forEach(chip => {
    const key = chip.dataset.amenity;
    chip.classList.toggle('active', state.amenities[key]);
    chip.setAttribute('aria-pressed', state.amenities[key] ? 'true' : 'false');
  });

  // Reset sliders
  document.getElementById('size_sqft').value = 1500;
  document.getElementById('property_age').value = 3;
  document.getElementById('distance_metro').value = 2.0;
  document.querySelectorAll('.range-slider').forEach(s => s.dispatchEvent(new Event('input')));

  // Reset steppers
  document.getElementById('bathrooms').value = 2;
  document.getElementById('bathDisplay').textContent = 2;
  document.getElementById('balconies').value = 1;
  document.getElementById('balcDisplay').textContent = 1;

  // Reset locality
  const localitySelect = document.getElementById('locality');
  localitySelect.innerHTML = '<option value="">Select Locality</option>';
  localitySelect.disabled = true;

  // Hide result
  document.getElementById('resultsPlaceholder').style.display = '';
  document.getElementById('resultContent').classList.add('hidden');
  state.currentPredictionId = null;
}

// ═══════════════════════════════════════════════════════
//  HERO STATS
// ═══════════════════════════════════════════════════════
async function updateHeroStats() {
  // Hero stats elements have been removed
}

// ═══════════════════════════════════════════════════════
//  TOAST SYSTEM
// ═══════════════════════════════════════════════════════
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span class="toast-message">${message}</span>
    <span class="toast-dismiss" onclick="dismissToast(this.parentElement)" aria-label="Dismiss">✕</span>
  `;

  container.appendChild(toast);

  setTimeout(() => dismissToast(toast), duration);
}

function dismissToast(toast) {
  if (!toast || !toast.parentElement) return;
  toast.classList.add('removing');
  toast.addEventListener('animationend', () => toast.remove(), { once: true });
}

// ═══════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════
function getSessionId() {
  let id = sessionStorage.getItem('hppSessionId');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).substr(2, 12);
    sessionStorage.setItem('hppSessionId', id);
  }
  return id;
}

// Close modal when clicking overlay background
document.addEventListener('click', (e) => {
  const modal = document.getElementById('feedbackModal');
  if (e.target === modal) closeFeedbackModal();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeFeedbackModal();
});

/* ══════════════════════════════════════════════════════════════════════════
   Scroll reveal

   Sections below the fold start displaced and settle as they scroll into
   view, once each. Marking them from JS rather than in the HTML means a
   browser without IntersectionObserver simply never adds the attribute, so
   the content stays visible instead of being stranded at opacity 0.
   ══════════════════════════════════════════════════════════════════════════ */

function setupScrollReveal() {
  if (!('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll(
    '.analytics-layout > *, .history-layout > *, .charts-row > *, ' +
    '.model-stats-row > *, .table-card, .footer'
  );
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      // Reveal once. Leaving it observed would replay the entrance every time
      // the user scrolled back past it, which reads as a glitch rather than
      // as polish.
      observer.unobserve(entry.target);
    });
  }, {
    // Fires slightly before the element reaches the fold, so it is already
    // settled by the time it is properly in view.
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.05,
  });

  targets.forEach((el, i) => {
    el.setAttribute('data-reveal', '');
    el.style.transitionDelay = `${Math.min(i, 6) * 60}ms`;
    observer.observe(el);
  });
}

/* The navbar solidifies once the page scrolls under it. Passive listener so
   the handler can never block scrolling, and the class is only touched when
   the state actually changes rather than on every scroll event. */
function setupNavbarScroll() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  let solid = false;
  const sync = () => {
    const shouldBeSolid = window.scrollY > 12;
    if (shouldBeSolid === solid) return;
    solid = shouldBeSolid;
    nav.classList.toggle('is-scrolled', solid);
  };

  sync();
  window.addEventListener('scroll', sync, { passive: true });
}

/* ══════════════════════════════════════════════════════════════════════════
   Styled selects

   A native <select> renders its option list through the operating system.
   That is why the dropdowns opened as a plain grey Windows list on a dark
   page - no amount of CSS on <option> can reach it.

   This enhances rather than replaces. The real <select> stays in the DOM and
   remains the source of truth, so everything already reading .value, listening
   for 'change', or repopulating <option> elements (the city -> locality
   cascade) keeps working untouched. Only the visible list is ours.
   ══════════════════════════════════════════════════════════════════════════ */

// Option labels carry decorative emoji that render differently on every
// machine. The list draws its own icons, so the text is stripped to the words.
const stripEmoji = (text) =>
  text.replace(/^[\p{Extended_Pictographic}️‍\s]+/u, '').trim();

function enhanceSelects() {
  document.querySelectorAll('.select-wrapper > select').forEach(enhanceSelect);
}

function enhanceSelect(select) {
  const wrapper = select.parentElement;
  wrapper.classList.add('cselect');

  // The stock arrow belongs to the native control we are covering.
  wrapper.querySelector('.select-arrow')?.remove();

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'cselect-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  if (select.id) trigger.setAttribute('aria-labelledby', `${select.id}-label`);

  const label = document.createElement('span');
  label.className = 'cselect-value';

  const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  chevron.setAttribute('class', 'cselect-chevron');
  chevron.setAttribute('viewBox', '0 0 16 16');
  chevron.setAttribute('fill', 'none');
  chevron.innerHTML = '<path d="M4 6.5 8 10.5 12 6.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>';

  trigger.append(label, chevron);

  const list = document.createElement('ul');
  list.className = 'cselect-list';
  list.setAttribute('role', 'listbox');
  list.hidden = true;

  wrapper.append(trigger, list);

  let open = false;
  let activeIndex = 0;

  const options = () => [...select.options];

  const syncLabel = () => {
    const chosen = select.options[select.selectedIndex];
    const text = chosen ? stripEmoji(chosen.textContent) : '';
    label.textContent = text;
    // Placeholder options carry an empty value; grey them out like one.
    label.classList.toggle('is-placeholder', !select.value);
    trigger.disabled = select.disabled;
    wrapper.classList.toggle('is-disabled', select.disabled);
  };

  const buildList = () => {
    list.innerHTML = '';
    options().forEach((opt, i) => {
      const li = document.createElement('li');
      li.className = 'cselect-option';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === select.selectedIndex));
      if (i === select.selectedIndex) li.classList.add('is-selected');
      li.dataset.index = String(i);

      const text = document.createElement('span');
      text.textContent = stripEmoji(opt.textContent);
      li.append(text);

      if (i === select.selectedIndex) {
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        tick.setAttribute('class', 'cselect-check');
        tick.setAttribute('viewBox', '0 0 16 16');
        tick.setAttribute('fill', 'none');
        tick.innerHTML = '<path d="M3.5 8.5 6.5 11.5 12.5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>';
        li.append(tick);
      }

      // Staggered entrance, capped so a 260-locality list does not deal
      // itself out one row at a time.
      li.style.setProperty('--i', String(Math.min(i, 10)));
      list.append(li);
    });
  };

  const setActive = (i) => {
    activeIndex = Math.max(0, Math.min(i, options().length - 1));
    [...list.children].forEach((li, idx) => li.classList.toggle('is-active', idx === activeIndex));
    list.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  };

  const openList = () => {
    if (select.disabled || !options().length) return;
    buildList();
    list.hidden = false;
    open = true;
    wrapper.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    setActive(Math.max(select.selectedIndex, 0));
  };

  const closeList = () => {
    list.hidden = true;
    open = false;
    wrapper.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  };

  const commit = (i) => {
    const opt = select.options[i];
    if (!opt) return;
    select.selectedIndex = i;
    syncLabel();
    closeList();
    // Dispatched so existing listeners - the city -> locality cascade above
    // all - fire exactly as they did with the native control.
    select.dispatchEvent(new Event('change', { bubbles: true }));
  };

  trigger.addEventListener('click', () => (open ? closeList() : openList()));

  trigger.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); open ? setActive(activeIndex + 1) : openList(); break;
      case 'ArrowUp':   e.preventDefault(); open ? setActive(activeIndex - 1) : openList(); break;
      case 'Home':      if (open) { e.preventDefault(); setActive(0); } break;
      case 'End':       if (open) { e.preventDefault(); setActive(options().length - 1); } break;
      case 'Enter':
      case ' ':         e.preventDefault(); open ? commit(activeIndex) : openList(); break;
      case 'Escape':    if (open) { e.preventDefault(); closeList(); } break;
      case 'Tab':       closeList(); break;
    }
  });

  list.addEventListener('mousedown', (e) => e.preventDefault());  // keep focus on the trigger
  list.addEventListener('click', (e) => {
    const li = e.target.closest('.cselect-option');
    if (li) commit(Number(li.dataset.index));
  });
  list.addEventListener('mouseover', (e) => {
    const li = e.target.closest('.cselect-option');
    if (li) setActive(Number(li.dataset.index));
  });

  document.addEventListener('mousedown', (e) => {
    if (open && !wrapper.contains(e.target)) closeList();
  });

  // The city dropdown rewrites the locality options at runtime, and disables
  // or enables it. Watching the element keeps the visible list honest without
  // that code needing to know this enhancement exists.
  new MutationObserver(() => { syncLabel(); if (open) buildList(); })
    .observe(select, { childList: true, attributes: true, attributeFilter: ['disabled'] });

  // Anything setting select.value directly still needs the label to follow.
  select.addEventListener('change', syncLabel);

  syncLabel();
}
