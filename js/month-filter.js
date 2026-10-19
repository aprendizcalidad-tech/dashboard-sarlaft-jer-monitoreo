(function () {
  'use strict';
  const MONTHS = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
  const LABELS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const PRESETS = {
    ALL: MONTHS.slice(), Q1: MONTHS.slice(0, 3), Q2: MONTHS.slice(3, 6), Q3: MONTHS.slice(6, 9), Q4: MONTHS.slice(9, 12),
    H1: MONTHS.slice(0, 6), H2: MONTHS.slice(6, 12)
  };
  let selected = MONTHS.slice();
  let selectedPreset = 'ALL';
  const PRESET_LABELS = { ALL: 'Todos', Q1: 'T1', Q2: 'T2', Q3: 'T3', Q4: 'T4', H1: 'Sem. 1', H2: 'Sem. 2' };
  const toggle = document.getElementById('month-toggle');
  const popover = document.getElementById('month-popover');
  const checkboxes = document.getElementById('month-checkboxes');
  const count = document.getElementById('month-selected-count');

  function renderCheckboxes() {
    checkboxes.innerHTML = MONTHS.map((month, index) => '<label class="month-check"><input type="checkbox" value="' + month + '" ' + (selected.includes(month) ? 'checked' : '') + '><span>' + LABELS[index] + '</span></label>').join('');
    checkboxes.querySelectorAll('input').forEach((input) => input.addEventListener('change', () => {
      const values = Array.from(checkboxes.querySelectorAll('input:checked')).map((el) => el.value);
      selected = MONTHS.filter((month) => values.includes(month));
      selectedPreset = selected.length === 12 ? 'ALL' : 'CUSTOM';
      updateSummary();
    }));
    updateSummary();
  }
  function updateSummary() {
    const all = selected.length === 12;
    const summary = selectedPreset !== 'CUSTOM' ? (PRESET_LABELS[selectedPreset] || 'Todos') : (all ? 'Todos' : selected.length === 0 ? 'Ninguno' : selected.map((month) => LABELS[MONTHS.indexOf(month)].slice(0, 3)).join(', '));
    toggle.textContent = 'Meses: ' + summary;
    count.textContent = selected.length + (selected.length === 1 ? ' mes seleccionado' : ' meses seleccionados');
  }
  function set(values, presetKey) {
    selected = MONTHS.filter((month) => values.includes(month));
    if (presetKey && Object.prototype.hasOwnProperty.call(PRESETS, presetKey)) {
      selectedPreset = presetKey;
    } else {
      selectedPreset = selected.length === 12 ? 'ALL' : 'CUSTOM';
    }
    renderCheckboxes();
  }
  function positionPopover() {
    if (popover.hidden) return;
    const buttonRect = toggle.getBoundingClientRect();
    // El menú usa posición fija y se limita al viewport: nunca queda recortado por el header o el sidebar.
    const viewportPadding = 12;
    const rect = popover.getBoundingClientRect();
    const width = rect.width || Math.min(365, window.innerWidth - 24);
    const height = rect.height || 300;
    const left = Math.max(viewportPadding, Math.min(buttonRect.left, window.innerWidth - width - viewportPadding));
    let top = buttonRect.bottom + 8;
    if (top + height > window.innerHeight - viewportPadding) top = buttonRect.top - height - 8;
    top = Math.max(viewportPadding, Math.min(top, window.innerHeight - height - viewportPadding));
    popover.style.left = left + 'px';
    popover.style.top = top + 'px';
    popover.style.right = 'auto';
  }
  toggle.addEventListener('click', () => {
    const open = popover.hidden;
    popover.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) requestAnimationFrame(positionPopover);
  });
  window.addEventListener('resize', positionPopover);
  window.addEventListener('scroll', positionPopover, true);
  document.addEventListener('click', (event) => {
    if (popover.hidden || popover.contains(event.target) || toggle.contains(event.target)) return;
    popover.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  });
  document.getElementById('month-done').addEventListener('click', () => {
    if (!selected.length) {
      window.JERDashboard?.setStatus('Selecciona por lo menos un mes.', 'error');
      return;
    }
    popover.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('.month-preset').forEach((button) => button.addEventListener('click', () => {
    const presetKey = button.dataset.preset;
    set(PRESETS[presetKey] || MONTHS, presetKey);
  }));
  renderCheckboxes();
  window.JERMonthFilter = {
    getSelection: () => MONTHS.filter((month) => selected.includes(month)),
    setSelection: set,
    getPeriodPreset: () => selectedPreset,
    getLabel: () => selectedPreset !== 'CUSTOM' ? ({ ALL: 'TODOS LOS MESES', Q1: 'TRIMESTRE 1', Q2: 'TRIMESTRE 2', Q3: 'TRIMESTRE 3', Q4: 'TRIMESTRE 4', H1: 'SEMESTRE 1', H2: 'SEMESTRE 2' }[selectedPreset] || 'TODOS LOS MESES') : (selected.length === 12 ? 'TODOS LOS MESES' : selected.map((month) => LABELS[MONTHS.indexOf(month)].toUpperCase()).join(' · ')),
    monthOrder: MONTHS.slice()
  };
})();
