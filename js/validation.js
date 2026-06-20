// validation.js - Form validation and submission

export function initValidation() {
  const forms = document.querySelectorAll('form[data-validate]');
  forms.forEach(setupForm);

  // Phone digit-only filter for ALL tel inputs on page
  document.querySelectorAll('input[type="tel"]').forEach(applyPhoneFilter);
}

function applyPhoneFilter(input) {
  input.addEventListener('keydown', (e) => {
    const allowed = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'Tab', 'Enter', '+', '(', ')', '-', ' '
    ];
    if (!allowed.includes(e.key) && !/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  });

  input.addEventListener('input', () => {
    const pos = input.selectionStart;
    const raw = input.value;
    // Keep only: digits, +, (, ), -, spaces
    const cleaned = raw.replace(/[^\d+()\- ]/g, '');
    if (cleaned !== raw) {
      input.value = cleaned;
      input.setSelectionRange(pos - 1, pos - 1);
    }
  });

  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    const cleaned = pasted.replace(/[^\d+()\- ]/g, '');
    document.execCommand('insertText', false, cleaned);
  });
}

function setupForm(form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validate(form)) {
      submitForm(form);
    }
  });

  // Real-time validation
  form.querySelectorAll('input[required], textarea[required]').forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('is-error')) validateField(field);
    });
  });

  // Apply phone filter to tel inputs in forms
  form.querySelectorAll('input[type="tel"]').forEach(applyPhoneFilter);
}

function validateField(field) {
  const value = field.value.trim();
  let valid = true;
  let message = '';

  if (!value) {
    valid = false;
    message = 'Это поле обязательно';
  } else if (field.type === 'tel') {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length < 10) {
      valid = false;
      message = 'Введите корректный номер телефона';
    }
  } else if (field.type === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      valid = false;
      message = 'Введите корректный e-mail';
    }
  }

  setFieldState(field, valid, message);
  return valid;
}

function setFieldState(field, valid, message) {
  field.classList.toggle('is-error', !valid);
  field.classList.toggle('is-valid', valid);

  let hint = field.parentElement.querySelector('.form__hint');
  if (!valid) {
    if (!hint) {
      hint = document.createElement('span');
      hint.className = 'form__hint';
      field.parentElement.appendChild(hint);
    }
    hint.textContent = message;
  } else {
    hint?.remove();
  }
}

function validate(form) {
  const fields = form.querySelectorAll('input[required], textarea[required]');
  let allValid = true;
  fields.forEach((field) => {
    if (!validateField(field)) allValid = false;
  });
  return allValid;
}

function submitForm(form) {
  const btn = form.querySelector('[type="submit"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Отправляем...';
  }

  // Simulate API call
  setTimeout(() => {
    form.reset();
    form.querySelectorAll('.is-valid').forEach((el) => el.classList.remove('is-valid'));
    if (btn) {
      btn.disabled = false;
      btn.textContent = btn.dataset.original || 'Отправить';
    }
    // Show success modal
    const modal = document.querySelector('#modal-success');
    if (modal) {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  }, 1200);
}
