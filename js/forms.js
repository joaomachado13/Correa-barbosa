const WHATSAPP_NUMBER = '5534999227667';

export function isValidPhone(value) {
  const digits = value.replace(/\D/g, '');
  return /^[+\d\s().-]+$/.test(value.trim()) && digits.length >= 10 && digits.length <= 15;
}

export function buildWhatsAppMessage(fields, context) {
  const lines = fields.filter(({ value }) => value.trim()).map(({ label, value }) => `${label}: ${value.trim()}`);
  return [`Olá, equipe CBE! Gostaria de atendimento para ${context}.`, '', ...lines].join('\n');
}

export function createWhatsAppURL(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function initGuidedForms() {
  document.querySelectorAll('form[data-guided]').forEach(form => {
    if (form.dataset.guidedInitialized) return;
    form.dataset.guidedInitialized = 'true';
    const steps = [...form.querySelectorAll('[data-step]')];
    const progress = form.querySelector('.guided-progress');
    const navigation = form.querySelector('.guided-navigation');
    const previous = form.querySelector('.guided-prev');
    const next = form.querySelector('.guided-next');
    const submit = form.querySelector('[type="submit"]');
    let active = 0;
    function show(index, focus = true) {
      active = index;
      steps.forEach((step, i) => {
        step.hidden = i !== active;
        step.disabled = i !== active;
      });
      previous.disabled = active === 0;
      next.hidden = active === steps.length - 1;
      submit.hidden = active !== steps.length - 1;
      progress.textContent = `Etapa ${active + 1} de ${steps.length}`;
      if (focus) steps[active].querySelector('input, select, textarea')?.focus();
      form.querySelector('.form-feedback').hidden = true;
    }
    function advance() {
      const fields = [...steps[active].querySelectorAll('input, select, textarea')];
      fields.forEach(field => {
        field.setCustomValidity(field.required && !field.value.trim() ? 'Preencha este campo.' : '');
      });
      const invalid = fields.find(field => !field.checkValidity());
      if (invalid) { invalid.reportValidity(); return; }
      if (active < steps.length - 1) show(active + 1);
    }
    navigation.hidden = false;
    previous.onclick = () => show(active - 1);
    next.onclick = advance;
    form.addEventListener('submit', event => {
      if (active < steps.length - 1) {
        event.preventDefault();
        event.stopImmediatePropagation();
        advance();
      }
    }, true);
    show(0, false);
  });
}

export function initFormInteractions() {
  const subject = document.getElementById('ct_assunto');
  const chips = document.querySelectorAll('.topic-chip');
  function syncChips() {
    chips.forEach(chip => {
      const active = chip.dataset.topic === subject?.value;
      chip.classList.toggle('active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
  }
  chips.forEach(chip => {
    chip.onclick = () => {
      subject.value = chip.dataset.topic;
      subject.dispatchEvent(new Event('change', { bubbles: true }));
      syncChips();
    };
  });
  if (subject) subject.onchange = syncChips;
  const front = document.getElementById('ct_frente');
  const requestedFront = new URLSearchParams(window.location.search).get('frente');
  if (front && requestedFront && [...front.options].some(option => option.value === requestedFront)) {
    front.value = requestedFront;
    if (subject && requestedFront !== 'quadros-eletricos') subject.value = 'outro';
  }
  syncChips();

  document.querySelectorAll('form[data-contact-form]').forEach(form => {
    if (form.dataset.initialized) return;
    form.dataset.initialized = 'true';
    form.querySelector('button[type="submit"]').disabled = false;
    const fields = [...form.querySelectorAll('input, select, textarea')];
    const feedback = form.querySelector('.form-feedback');
    const status = feedback.querySelector('[role="status"]');
    const continueLink = feedback.querySelector('.whatsapp-continue');
    const preview = feedback.querySelector('.message-preview');

    function invalidatePreview() {
      // Any edit invalidates the previous draft, so the link cannot send stale data.
      feedback.hidden = true;
      continueLink.removeAttribute('href');
      status.textContent = '';
    }
    fields.forEach(field => {
      field.addEventListener('input', () => {
        field.setCustomValidity('');
        invalidatePreview();
      });
      field.addEventListener('change', invalidatePreview);
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      fields.filter(field => field.type === 'tel').forEach(field => {
        field.setCustomValidity(isValidPhone(field.value) ? '' : 'Informe um telefone com DDD, usando de 10 a 15 dígitos.');
      });
      fields.filter(field => field.required && field.type !== 'tel').forEach(field => {
        field.setCustomValidity(field.value.trim() ? '' : 'Preencha este campo.');
      });
      if (!form.reportValidity()) return;

      const data = fields.map(field => ({
        label: field.labels?.[0]?.textContent.trim() || field.name,
        value: field.tagName === 'SELECT' ? (field.value ? field.selectedOptions[0].textContent : '') : field.value
      }));
      const message = buildWhatsAppMessage(data, form.dataset.contactForm);
      continueLink.href = createWhatsAppURL(message);
      preview.textContent = message;
      feedback.hidden = false;
      status.textContent = 'Mensagem pronta para revisão. Ela ainda não foi enviada. Abra o WhatsApp e confirme o envio para a CBE.';
      // Keep data in the form; opening WhatsApp is not a delivery acknowledgement.
      continueLink.focus();
    });
  });
}
