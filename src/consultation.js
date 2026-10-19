// Consultation questionnaire: collects answers in the browser and opens WhatsApp
// with a prefilled message. Nothing is sent to a server or stored.

// Hamza's own WhatsApp number, international format, digits only (no "+", spaces or brackets).
// This is NOT NAQI's number. Change it here if it ever changes.
const WHATSAPP_NUMBER = '962779295122';

const form = document.getElementById('consult-form');
if (form) {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const steps = $$('.step', form);
  const LAST_INPUT_STEP = 5;
  const REVIEW = 6;
  const fill = $('#stepper-fill');
  const label = $('#stepper-label');
  const live = $('#form-live');
  const errBox = $('#form-error');
  const btnBack = $('#btn-back');
  const btnNext = $('#btn-next');
  const btnSend = $('#btn-send');
  const summary = $('#summary');
  const preview = $('#msg-preview');

  let current = 1;
  let fromReview = false;

  const val = (name) => (form.elements[name] && form.elements[name].value ? form.elements[name].value.trim() : '');
  const checked = (name) => $$(`input[name="${name}"]:checked`, form).map((i) => i.value);

  // ---------- conditional fields ----------
  const toggle = (el, show) => { el.hidden = !show; };
  const syncConditional = () => {
    toggle($('#f-other-wrap'), $('#f-other-box').checked);
    const site = val('site');
    toggle($('#f-url-wrap'), site === 'Yes' || site === 'It is currently being developed');
    const contact = val('contact');
    toggle($('#f-phone-wrap'), contact === 'A phone call');
    toggle($('#f-email-wrap'), contact === 'Email');
  };
  form.addEventListener('change', syncConditional);
  syncConditional();

  // ---------- validation ----------
  const normalizeUrl = (v) => {
    if (!v) return '';
    const withProto = /^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`;
    try {
      const u = new URL(withProto);
      if (!/^https?:$/.test(u.protocol) || !u.hostname.includes('.')) return null;
      return u.href;
    } catch { return null; }
  };

  const rules = {
    1: () => {
      const e = {};
      if (!val('name')) e['f-name'] = 'Please enter your name.';
      if (!checked('stage').length) e['f-stage'] = 'Please choose one option.';
      return e;
    },
    2: () => {
      const e = {};
      if (!checked('needs').length) e['f-needs'] = 'Please select at least one option.';
      if ($('#f-other-box').checked && !val('other')) e['f-other'] = 'Please tell me what you need.';
      return e;
    },
    3: () => {
      const e = {};
      const goal = val('goal');
      if (!goal) e['f-goal'] = 'Please describe what you would like to achieve.';
      else if (goal.length < 10) e['f-goal'] = 'Please add a little more detail (at least 10 characters).';
      if (!checked('site').length) e['f-site'] = 'Please choose one option.';
      const url = val('url');
      if (!$('#f-url-wrap').hidden && url && normalizeUrl(url) === null) e['f-url'] = 'Please enter a valid address, for example https://example.com.';
      return e;
    },
    4: () => {
      const e = {};
      if (!checked('budget').length) e['f-budget'] = 'Please choose a range, or “Not sure yet”.';
      if (!checked('timeline').length) e['f-time'] = 'Please choose one option.';
      return e;
    },
    5: () => {
      const e = {};
      const c = val('contact');
      if (!c) e['f-contact'] = 'Please choose one option.';
      if (c === 'A phone call') {
        const digits = val('phone').replace(/\D/g, '');
        if (!val('phone')) e['f-phone'] = 'Please enter a phone number so I can call you.';
        else if (digits.length < 7) e['f-phone'] = 'Please enter a valid phone number.';
      }
      if (c === 'Email') {
        if (!val('email')) e['f-email'] = 'Please enter your email address.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email'))) e['f-email'] = 'Please enter a valid email address.';
      }
      return e;
    },
  };

  const clearErrors = () => {
    $$('.field__err', form).forEach((p) => { p.hidden = true; p.textContent = ''; });
    $$('[aria-invalid]', form).forEach((i) => i.removeAttribute('aria-invalid'));
    errBox.hidden = true; errBox.textContent = '';
  };

  const showErrors = (errs) => {
    clearErrors();
    const keys = Object.keys(errs);
    keys.forEach((k) => {
      const p = document.getElementById(`${k}-err`);
      if (p) { p.textContent = errs[k]; p.hidden = false; }
      const input = document.getElementById(k);
      if (input) input.setAttribute('aria-invalid', 'true');
    });
    errBox.textContent = keys.length === 1 ? 'Please fix the item below to continue.' : `Please fix the ${keys.length} items below to continue.`;
    errBox.hidden = false;
    const first = document.getElementById(`${keys[0]}-err`);
    const target = document.getElementById(keys[0]) || (first && first.parentElement.querySelector('input,textarea'));
    if (target) target.focus({ preventScroll: false });
  };

  // ---------- message + summary ----------
  const needsText = () => checked('needs').map((n) => (n === 'Other' && val('other') ? `Other (${val('other')})` : n)).join(', ');

  const rows = () => {
    const url = val('url') && !$('#f-url-wrap').hidden ? normalizeUrl(val('url')) || val('url') : '';
    const contact = val('contact');
    let contactText = contact;
    if (contact === 'A phone call' && val('phone')) contactText += ` (${val('phone')})`;
    if (contact === 'Email' && val('email')) contactText += ` (${val('email')})`;
    return [
      { k: 'Name', v: val('name'), step: 1, msg: 'Name' },
      { k: 'Business', v: val('business'), step: 1, msg: 'Business' },
      { k: 'Business stage', v: checked('stage')[0] || '', step: 1, msg: 'Business stage' },
      { k: 'Project type', v: needsText(), step: 2, msg: 'Project type' },
      { k: 'Goal / details', v: val('goal'), step: 3, msg: 'Goal/details' },
      { k: 'Existing website or system', v: checked('site')[0] || '', step: 3, msg: 'Existing website/system' },
      { k: 'Website address', v: url, step: 3, msg: 'Website URL' },
      { k: 'Estimated budget', v: checked('budget')[0] || '', step: 4, msg: 'Estimated budget' },
      { k: 'Timeline', v: checked('timeline')[0] || '', step: 4, msg: 'Timeline' },
      { k: 'Preferred contact method', v: contactText, step: 5, msg: 'Preferred contact method' },
    ];
  };

  const buildMessage = () => {
    const lines = ['Hello! I would like to discuss a project.', ''];
    rows().forEach((r) => { if (r.v) lines.push(`${r.msg}: ${r.v}`); });
    lines.push('', 'Please let me know how we can proceed.');
    return lines.join('\n');
  };

  const buildSummary = () => {
    summary.textContent = '';
    rows().forEach((r) => {
      const wrap = document.createElement('div');
      const dt = document.createElement('dt'); dt.textContent = r.k;
      const dd = document.createElement('dd');
      const span = document.createElement('span'); span.textContent = r.v || 'Not provided';
      if (!r.v) span.className = 'muted';
      const edit = document.createElement('button');
      edit.type = 'button'; edit.className = 'link-btn'; edit.textContent = 'Edit';
      edit.setAttribute('aria-label', `Edit ${r.k}`);
      edit.addEventListener('click', () => { fromReview = true; go(r.step); });
      dd.append(span, edit);
      wrap.append(dt, dd);
      summary.append(wrap);
    });
    const msg = buildMessage();
    preview.value = msg;
    btnSend.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  // ---------- navigation ----------
  const go = (n) => {
    current = n;
    steps.forEach((s) => { s.hidden = Number(s.dataset.step) !== n; });
    const isReview = n === REVIEW;
    fill.style.width = `${Math.min(n, LAST_INPUT_STEP) / LAST_INPUT_STEP * 100}%`;
    label.textContent = isReview ? 'Review' : `Step ${n} of ${LAST_INPUT_STEP}`;
    btnBack.hidden = n === 1;
    btnNext.hidden = isReview;
    btnSend.hidden = !isReview;
    if (!isReview) {
      btnNext.firstChild.textContent = fromReview ? 'Back to review ' : (n === LAST_INPUT_STEP ? 'Review answers ' : 'Next ');
    }
    if (isReview) buildSummary();
    clearErrors();
    const step = steps.find((s) => Number(s.dataset.step) === n);
    live.textContent = `${isReview ? 'Review your answers' : `Step ${n} of ${LAST_INPUT_STEP}: ${step.dataset.title}`}`;
    const legend = $('legend', step);
    form.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    legend.focus({ preventScroll: true });
  };

  btnNext.addEventListener('click', () => {
    const errs = rules[current] ? rules[current]() : {};
    if (Object.keys(errs).length) { showErrors(errs); return; }
    if (fromReview) { fromReview = false; go(REVIEW); return; }
    go(current >= LAST_INPUT_STEP ? REVIEW : current + 1);
  });

  btnBack.addEventListener('click', () => {
    fromReview = false;
    go(current === REVIEW ? LAST_INPUT_STEP : current - 1);
  });

  // Enter in a text input moves forward instead of submitting
  form.addEventListener('submit', (e) => { e.preventDefault(); });
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input:not([type=radio]):not([type=checkbox])')) {
      e.preventDefault();
      if (!btnNext.hidden) btnNext.click();
    }
  });

  // Clear a field's error as soon as the user fixes it
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t.getAttribute && t.getAttribute('aria-invalid')) { t.removeAttribute('aria-invalid'); const p = document.getElementById(`${t.id}-err`); if (p) { p.hidden = true; p.textContent = ''; } }
  });

  btnSend.addEventListener('click', () => {
    // Re-check everything before handing over to WhatsApp
    for (let n = 1; n <= LAST_INPUT_STEP; n += 1) {
      const errs = rules[n]();
      if (Object.keys(errs).length) { go(n); showErrors(errs); return; }
    }
    buildSummary();
    live.textContent = 'WhatsApp is opening with your message. If nothing opens, press the button again.';
  });

  go(1);
}
