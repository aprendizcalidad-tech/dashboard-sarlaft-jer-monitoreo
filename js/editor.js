(function () {
  'use strict';
  const root = document.getElementById('report-pages');
  const DEFAULT_LOGO = 'assets/jer-logo.png';
  const help = document.getElementById('editor-help');
  const editToggle = document.getElementById('edit-toggle');
  const insertButton = document.getElementById('insert-text');
  const addButton = document.getElementById('add-page');
  const deleteButton = document.getElementById('delete-page');
  const upButton = document.getElementById('move-page-up');
  const downButton = document.getElementById('move-page-down');
  const logoButton = document.getElementById('change-logo');
  const logoInput = document.getElementById('logo-file');
  const exportButton = document.getElementById('export-settings');
  const importButton = document.getElementById('import-settings');
  const settingsInput = document.getElementById('settings-file');
  const undoButton = document.getElementById('undo-action');
  const redoButton = document.getElementById('redo-action');
  const deleteTextButton = document.getElementById('delete-text-block');
  const fontFamilySelect = document.getElementById('font-family-select');
  const applyFontFamilyButton = document.getElementById('apply-font-family');
  const fontSizeSelect = document.getElementById('font-size-select');
  const applyFontSizeButton = document.getElementById('apply-font-size');
  const fontSizeDownButton = document.getElementById('font-size-down');
  const fontSizeUpButton = document.getElementById('font-size-up');
  let state = window.JERLocalStore.defaults();
  let editing = false;
  let insertMode = false;
  let selectedPageId = null;
  let selectedTextKey = null;
  let selectedBlockId = null;
  let saveTimer = null;
  let fitTimer = null;
  let undoStack = [];
  let redoStack = [];
  let historyPaused = false;
  let toolsEnabled = false;
  const HISTORY_LIMIT = 80;
  let readyPromise = loadInitialState();

  async function loadInitialState() {
    try {
      state = normalizeState(await window.JERLocalStore.getState());
      applyGlobalTypography();
    } catch (error) {
      console.warn('No se pudo recuperar la configuración local:', error);
      state = normalizeState(window.JERLocalStore.defaults());
      applyGlobalTypography();
      notify('No fue posible leer la edición local guardada. El informe se abrirá sin esos cambios.', 'error');
    }
    return state;
  }

  function notify(message, kind) {
    const banner = document.getElementById('status-banner');
    if (banner) {
      banner.textContent = message;
      banner.className = 'status-banner' + (kind ? ' ' + kind : '');
    }
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function slug(text) {
    return String(text || 'pagina').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'pagina';
  }

  function debounceSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => window.JERLocalStore.saveState(state).catch((e) => notify(e.message, 'error')), 250);
  }

  async function saveNow() {
    clearTimeout(saveTimer);
    await window.JERLocalStore.saveState(state);
  }

  function normalizeState(raw) {
    const base = window.JERLocalStore.defaults();
    const value = Object.assign(base, raw || {});
    value.edits = value.edits && typeof value.edits === 'object' ? value.edits : {};
    value.customPages = Array.isArray(value.customPages) ? value.customPages : [];
    value.deletedPages = Array.isArray(value.deletedPages) ? value.deletedPages : [];
    value.pageOrder = Array.isArray(value.pageOrder) ? value.pageOrder : [];
    value.customBlocks = Array.isArray(value.customBlocks) ? value.customBlocks : [];
    value.elementStyles = value.elementStyles && typeof value.elementStyles === 'object' ? value.elementStyles : {};
    value.typography = Object.assign({ fontFamily: 'Comic Sans MS', defaultFontSize: 17 }, value.typography || {});
    return value;
  }

  function deepClone(value) { return JSON.parse(JSON.stringify(value)); }

  // Mantiene el data URL del logo como cadena inmutable compartida entre snapshots,
  // para no duplicar varios MB cada vez que se pulsa una tecla.
  function cloneStateForHistory(value) {
    return {
      edits: deepClone(value.edits || {}),
      customPages: deepClone(value.customPages || []),
      deletedPages: deepClone(value.deletedPages || []),
      pageOrder: deepClone(value.pageOrder || []),
      customBlocks: deepClone(value.customBlocks || []),
      logoDataUrl: value.logoDataUrl || null,
      typography: deepClone(value.typography || { fontFamily: 'Comic Sans MS', defaultFontSize: 17 }),
      elementStyles: deepClone(value.elementStyles || {})
    };
  }

  function historyElementKey(element) {
    if (!element) return null;
    if (element.dataset.editKey) return 'edit:' + element.dataset.editKey;
    if (element.dataset.customBlockId) return 'block:' + element.dataset.customBlockId;
    return null;
  }

  function syncDomToState() {
    root.querySelectorAll('[data-edit-key]').forEach((element) => {
      state.edits[element.dataset.editKey] = element.innerText.replace(/\u00a0/g, ' ');
    });
    root.querySelectorAll('[data-custom-block-id]').forEach((element) => {
      const block = state.customBlocks.find((candidate) => candidate.id === element.dataset.customBlockId);
      if (block) block.text = element.innerText.replace(/\u00a0/g, ' ');
    });
  }

  function currentSnapshot() {
    return { state: cloneStateForHistory(state), selectedPageId, selectedTextKey, selectedBlockId };
  }

  function updateHistoryButtons() {
    if (undoButton) undoButton.disabled = !toolsEnabled || undoStack.length === 0;
    if (redoButton) redoButton.disabled = !toolsEnabled || redoStack.length === 0;
    if (deleteTextButton) deleteTextButton.disabled = !toolsEnabled || !selectedBlockId || !state.customBlocks.some((block) => block.id === selectedBlockId);
    const canSize = toolsEnabled && Boolean(selectedTextKey && findTextElement(selectedTextKey));
    if (applyFontSizeButton) applyFontSizeButton.disabled = !canSize;
    if (fontSizeDownButton) fontSizeDownButton.disabled = !canSize;
    if (fontSizeUpButton) fontSizeUpButton.disabled = !canSize;
  }

  function pushHistory() {
    if (historyPaused) return;
    syncDomToState();
    undoStack.push(currentSnapshot());
    if (undoStack.length > HISTORY_LIMIT) undoStack.shift();
    redoStack = [];
    updateHistoryButtons();
  }

  function applyGlobalTypography() {
    const family = (state.typography && state.typography.fontFamily) || 'Comic Sans MS';
    const stack = family === 'Comic Sans MS'
      ? '\"Comic Sans MS\", \"Comic Sans\", cursive'
      : '\"' + family.replace(/\"/g, '') + '\", \"Comic Sans MS\", sans-serif';
    document.documentElement.style.setProperty('--report-font-family', stack);
    if (fontFamilySelect) fontFamilySelect.value = family;
    if (window.Chart && window.Chart.defaults) window.Chart.defaults.font.family = family;
  }

  function findTextElement(key) {
    if (!key) return null;
    if (key.startsWith('edit:')) {
      const actual = key.slice(5);
      return Array.from(root.querySelectorAll('[data-edit-key]')).find((element) => element.dataset.editKey === actual) || null;
    }
    if (key.startsWith('block:')) {
      const actual = key.slice(6);
      return Array.from(root.querySelectorAll('[data-custom-block-id]')).find((element) => element.dataset.customBlockId === actual) || null;
    }
    return null;
  }

  function applySavedElementStyles(page) {
    page.querySelectorAll('[data-edit-key], [data-custom-block-id]').forEach((element) => {
      const key = historyElementKey(element);
      const style = key && state.elementStyles[key];
      if (style && Number.isFinite(Number(style.fontSize))) element.style.fontSize = Number(style.fontSize) + 'px';
    });
  }

  function updateTextSelection(element) {
    root.querySelectorAll('.selected-text-element').forEach((item) => item.classList.remove('selected-text-element'));
    selectedTextKey = historyElementKey(element);
    selectedBlockId = element && element.dataset.customBlockId ? element.dataset.customBlockId : null;
    if (element && selectedTextKey) {
      element.classList.add('selected-text-element');
      const current = parseFloat(getComputedStyle(element).fontSize) || 17;
      const options = Array.from(fontSizeSelect.options).map((option) => Number(option.value));
      const nearest = options.reduce((best, value) => Math.abs(value - current) < Math.abs(best - current) ? value : best, options[0]);
      fontSizeSelect.value = String(nearest);
    }
    updateHistoryButtons();
  }

  function autoFitTextPages() {
    const textPages = root.querySelectorAll('.cover-page, .activities-page, .narrative-page, .custom-text-page, .closing-page');
    textPages.forEach((page) => {
      const body = page.querySelector('.page-body');
      if (!body) return;
      let target = null;
      if (page.classList.contains('cover-page')) target = page.querySelector('.cover-copy');
      else if (page.classList.contains('activities-page')) target = page.querySelector('.activity-list');
      else if (page.classList.contains('narrative-page')) target = page.querySelector('.narrative-box');
      else if (page.classList.contains('custom-text-page')) target = page.querySelector('.custom-page-copy');
      else if (page.classList.contains('closing-page')) target = page.querySelector('.close-message');
      if (!target) return;
      const key = historyElementKey(target);
      const savedStyle = key && state.elementStyles[key];
      if (savedStyle && Number.isFinite(Number(savedStyle.fontSize))) {
        target.dataset.autoFitOverflow = 'false';
        return;
      }
      const bodyStyle = getComputedStyle(body);
      const available = Math.max(90, body.clientHeight - parseFloat(bodyStyle.paddingTop || 0) - parseFloat(bodyStyle.paddingBottom || 0) - 12);
      const old = { flex: target.style.flex, flexGrow: target.style.flexGrow, flexShrink: target.style.flexShrink, flexBasis: target.style.flexBasis, height: target.style.height, maxHeight: target.style.maxHeight, overflow: target.style.overflow };
      target.style.flex = '0 0 auto';
      target.style.height = 'auto';
      target.style.maxHeight = 'none';
      target.style.overflow = 'visible';
      let low = 8, high = 48, best = 8;
      for (let i = 0; i < 9; i++) {
        const mid = (low + high) / 2;
        target.style.fontSize = mid.toFixed(1) + 'px';
        const naturalHeight = Math.max(target.scrollHeight, target.getBoundingClientRect().height);
        if (naturalHeight <= available * 0.94) { best = mid; low = mid; } else { high = mid; }
      }
      target.style.fontSize = Math.max(8, Math.min(48, best)).toFixed(1) + 'px';
      const finalHeight = Math.max(target.scrollHeight, target.getBoundingClientRect().height);
      target.dataset.autoFitOverflow = String(finalHeight > available + 4);
      target.style.flex = old.flex;
      target.style.flexGrow = old.flexGrow;
      target.style.flexShrink = old.flexShrink;
      target.style.flexBasis = old.flexBasis;
      target.style.height = old.height;
      target.style.maxHeight = old.maxHeight;
      target.style.overflow = old.overflow;
    });
  }

  function scheduleAutoFit() {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(() => requestAnimationFrame(autoFitTextPages), 120);
  }

  async function restoreSnapshot(snapshot) {
    historyPaused = true;
    try {
      state = normalizeState(cloneStateForHistory(snapshot.state));
      selectedPageId = snapshot.selectedPageId || null;
      selectedTextKey = snapshot.selectedTextKey || null;
      selectedBlockId = snapshot.selectedBlockId || null;
      applyGlobalTypography();
      await saveNow();
      if (window.JERDashboard) await window.JERDashboard.renderCurrent();
      const selected = findTextElement(selectedTextKey);
      if (selected) updateTextSelection(selected);
      else updateTextSelection(null);
    } finally {
      historyPaused = false;
    }
    updateHistoryButtons();
    scheduleAutoFit();
  }

  async function undo() {
    if (!undoStack.length) return;
    syncDomToState();
    redoStack.push(currentSnapshot());
    const snapshot = undoStack.pop();
    await restoreSnapshot(snapshot);
    notify('Cambio deshecho.', 'success');
  }

  async function redo() {
    if (!redoStack.length) return;
    syncDomToState();
    undoStack.push(currentSnapshot());
    const snapshot = redoStack.pop();
    await restoreSnapshot(snapshot);
    notify('Cambio rehecho.', 'success');
  }

  function elementsByLayoutKey(page, key) {
    if (!key) return null;
    return Array.from(page.querySelectorAll('[data-layout-key]')).find((el) => el.dataset.layoutKey === key) || null;
  }

  function assignLayoutKeys(page) {
    const counters = Object.create(null);
    const selector = '.page-body, .metric-stack, .metric-panel, .metric-chart-wrap, .chart-slot, .general-two-col, .general-card, .card-content, .cover-content, .cover-copy, .activity-list, .narrative-box, .custom-page-copy, .data-table, .detail-table-wrap';
    page.querySelectorAll(selector).forEach((el) => {
      const role = Array.from(el.classList).find((name) => [
        'page-body','metric-stack','metric-panel','metric-chart-wrap','chart-slot','general-two-col','general-card','card-content','cover-content','cover-copy','activity-list','narrative-box','custom-page-copy','data-table','detail-table-wrap'
      ].includes(name)) || 'layout';
      counters[role] = (counters[role] || 0) + 1;
      el.dataset.layoutKey = page.dataset.pageId + '::' + role + ':' + counters[role];
    });
  }

  function assignEditableKeys(page) {
    const pageId = page.dataset.pageId;
    function tag(selector, role) {
      page.querySelectorAll(selector).forEach((element, index) => {
        element.dataset.editKey = pageId + '|' + role + '|' + index;
        const saved = state.edits[element.dataset.editKey];
        if (typeof saved === 'string') element.textContent = saved;
      });
    }
    tag('.page-header h1', 'page-title');
    tag('.cover-copy', 'cover-copy');
    tag('.activity-list li', 'activity-item');
    tag('.narrative-box', 'narrative');
    tag('.page-note', 'page-note');
    tag('.metric-heading', 'metric-heading');
    tag('.general-card h2', 'card-heading');
    tag('.detail-intro', 'detail-intro');
    tag('.close-message strong', 'closing-role');
    tag('.close-message span', 'closing-thanks');
  }

  function createCustomPage(pageData, index) {
    const page = document.createElement('section');
    page.className = 'report-page custom-text-page';
    page.dataset.pageId = pageData.id;
    page.innerHTML = '<header class="page-header"><h1></h1><div class="brand-mark"><img src="' + DEFAULT_LOGO + '" alt="Logotipo JER"></div><span class="period-chip">PÁGINA EDITABLE</span></header><div class="page-body"><div class="custom-page-copy"></div></div><footer class="page-footer"></footer>';
    page.querySelector('.page-header h1').textContent = pageData.title || ('Página nueva ' + (index + 1));
    page.querySelector('.custom-page-copy').textContent = pageData.text || 'Escribe aquí el contenido de esta página.';
    page.querySelector('.page-header h1').dataset.editKey = pageData.id + '|custom-title|0';
    page.querySelector('.custom-page-copy').dataset.editKey = pageData.id + '|custom-text|0';
    if (typeof state.edits[pageData.id + '|custom-title|0'] === 'string') page.querySelector('.page-header h1').textContent = state.edits[pageData.id + '|custom-title|0'];
    if (typeof state.edits[pageData.id + '|custom-text|0'] === 'string') page.querySelector('.custom-page-copy').textContent = state.edits[pageData.id + '|custom-text|0'];
    return page;
  }

  function insertStoredBlocks(page) {
    const pageId = page.dataset.pageId;
    (state.customBlocks || []).filter((block) => block.pageId === pageId).forEach((block) => {
      const parent = elementsByLayoutKey(page, block.parentKey);
      if (!parent) return;
      const node = document.createElement('div');
      node.className = 'editor-text-block';
      node.dataset.customBlockId = block.id;
      node.textContent = block.text || 'Escribe aquí…';
      const before = elementsByLayoutKey(page, block.beforeKey);
      if (before && before.parentElement === parent) parent.insertBefore(node, before);
      else parent.appendChild(node);
    });
  }

  function applyPageOrder() {
    const pages = Array.from(root.querySelectorAll('.report-page'));
    const ids = pages.map((page) => page.dataset.pageId);
    const order = Array.isArray(state.pageOrder) ? state.pageOrder.filter((id) => ids.includes(id)) : [];
    ids.forEach((id) => { if (!order.includes(id)) order.push(id); });
    state.pageOrder = order;
    order.forEach((id) => {
      const page = pages.find((candidate) => candidate.dataset.pageId === id);
      if (page) root.appendChild(page);
    });
  }

  function updatePageNumbers() {
    const pages = Array.from(root.querySelectorAll('.report-page'));
    pages.forEach((page, index) => {
      const footer = page.querySelector('.page-footer');
      if (footer) footer.textContent = (index + 1) + ' / ' + pages.length;
      page.classList.toggle('selected-page', page.dataset.pageId === selectedPageId);
    });
  }

  function applyLogo() {
    const logo = state.logoDataUrl || DEFAULT_LOGO;
    root.querySelectorAll('.brand-mark img').forEach((image) => { image.src = logo; });
  }

  function decorateReport(reportRoot) {
    const existingPages = Array.from(reportRoot.querySelectorAll('.report-page'));
    state.deletedPages = Array.isArray(state.deletedPages) ? state.deletedPages : [];
    existingPages.forEach((page) => {
      if (state.deletedPages.includes(page.dataset.pageId)) page.remove();
    });
    (state.customPages || []).forEach((pageData, index) => {
      reportRoot.appendChild(createCustomPage(pageData, index));
    });
    Array.from(reportRoot.querySelectorAll('.report-page')).forEach((page) => {
      assignLayoutKeys(page);
      assignEditableKeys(page);
    });
    Array.from(reportRoot.querySelectorAll('.report-page')).forEach(insertStoredBlocks);
    Array.from(reportRoot.querySelectorAll('.report-page')).forEach((page) => {
      page.querySelectorAll('[data-edit-key]').forEach((element) => {
        const saved = state.edits[element.dataset.editKey];
        if (typeof saved === 'string') element.textContent = saved;
        element.contentEditable = editing ? 'true' : 'false';
        element.classList.toggle('editing-text', editing);
        element.spellcheck = editing;
      });
      page.querySelectorAll('[data-custom-block-id]').forEach((element) => {
        const block = (state.customBlocks || []).find((candidate) => candidate.id === element.dataset.customBlockId);
        if (block) element.textContent = block.text || '';
        element.contentEditable = editing ? 'true' : 'false';
        element.classList.toggle('editing-text', editing);
        element.spellcheck = editing;
      });
    });
    applyLogo();
    applyGlobalTypography();
    Array.from(reportRoot.querySelectorAll('.report-page')).forEach(applySavedElementStyles);
    applyPageOrder();
    updatePageNumbers();
    scheduleAutoFit();
    const selected = findTextElement(selectedTextKey);
    if (selected) selected.classList.add('selected-text-element');
    updateHistoryButtons();
    saveNow().catch((e) => console.warn('No se pudo guardar la configuración local:', e));
  }

  function setEditing(enabled) {
    editing = Boolean(enabled);
    editToggle.setAttribute('aria-pressed', String(editing));
    editToggle.textContent = editing ? 'Terminar edición' : 'Editar textos';
    root.querySelectorAll('[data-edit-key]').forEach((element) => {
      element.contentEditable = editing ? 'true' : 'false';
      element.classList.toggle('editing-text', editing);
      element.spellcheck = editing;
    });
    root.querySelectorAll('[data-custom-block-id]').forEach((element) => {
      element.contentEditable = editing ? 'true' : 'false';
      element.classList.toggle('editing-text', editing);
      element.spellcheck = editing;
    });
    notify(editing ? 'Edición activada: pulsa sobre los títulos o textos con borde y modifica su contenido. Los cambios se guardan en este navegador.' : 'Edición de textos desactivada. Los cambios guardados localmente se conservarán en este navegador.', 'success');
  }

  function setInsertMode(enabled) {
    insertMode = Boolean(enabled);
    insertButton.setAttribute('aria-pressed', String(insertMode));
    insertButton.classList.toggle('button-mode-active', insertMode);
    help.hidden = !insertMode;
    help.textContent = 'Modo T activo: haz clic en el bloque o la gráfica donde deseas insertar texto. Se insertará en el flujo del contenido, no como una capa que tape los datos.';
    root.classList.toggle('insert-text-mode', insertMode);
  }

  function chooseInsertionPoint(page, target) {
    let anchor = null;
    let parent = null;
    const chartSlot = target.closest('.chart-slot');
    const panel = target.closest('.metric-panel');
    const card = target.closest('.general-card');
    if (chartSlot) {
      anchor = chartSlot;
      parent = chartSlot.parentElement;
    } else if (panel && panel.parentElement) {
      anchor = panel;
      parent = panel.parentElement;
    } else if (card && card.parentElement) {
      const content = card.querySelector('.card-content');
      if (content) {
        parent = content;
        anchor = content.firstElementChild;
      } else {
        anchor = card;
        parent = card.parentElement;
      }
    } else {
      const block = target.closest('.cover-copy, .activity-list, .narrative-box, .page-note, .custom-page-copy, .detail-table-wrap, .general-two-col, .metric-stack, .cover-content');
      if (block && block.parentElement) {
        anchor = block;
        parent = block.parentElement;
      } else {
        parent = page.querySelector('.page-body');
        anchor = parent ? parent.firstElementChild : null;
      }
    }
    if (!parent) return null;
    const parentKey = parent.dataset.layoutKey;
    const beforeKey = anchor ? anchor.dataset.layoutKey : null;
    return { parent, anchor, parentKey, beforeKey };
  }

  function insertTextBlock(page, target) {
    const point = chooseInsertionPoint(page, target);
    if (!point || !point.parentKey) {
      notify('No se encontró un punto de inserción válido. Haz clic sobre una gráfica, tabla, bloque o espacio de la página.', 'error');
      return;
    }
    pushHistory();
    const id = 'text-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
    const block = { id, pageId: page.dataset.pageId, parentKey: point.parentKey, beforeKey: point.beforeKey, text: 'Escribe aquí tu texto…' };
    state.customBlocks.push(block);
    const node = document.createElement('div');
    node.className = 'editor-text-block';
    node.dataset.customBlockId = id;
    node.contentEditable = 'true';
    node.spellcheck = true;
    node.textContent = block.text;
    if (point.anchor && point.anchor.parentElement === point.parent) point.parent.insertBefore(node, point.anchor);
    else point.parent.appendChild(node);
    selectedPageId = page.dataset.pageId;
    updateTextSelection(node);
    updatePageNumbers();
    setInsertMode(false);
    setEditing(true);
    node.focus();
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    saveNow().catch((error) => notify(error.message, 'error'));
    notify('Cuadro de texto insertado. Escribe el contenido; se guardará en este navegador.', 'success');
  }

  function ensureSelectedPage() {
    if (!selectedPageId) {
      notify('Primero haz clic en la página que deseas seleccionar.', 'error');
      return null;
    }
    return Array.from(root.querySelectorAll('.report-page')).find((page) => page.dataset.pageId === selectedPageId) || null;
  }

  root.addEventListener('click', (event) => {
    const page = event.target.closest('.report-page');
    if (!page) return;
    if (insertMode) {
      event.preventDefault();
      event.stopPropagation();
      insertTextBlock(page, event.target);
      return;
    }
    selectedPageId = page.dataset.pageId;
    const textElement = event.target.closest('[data-edit-key], [data-custom-block-id]');
    updateTextSelection(textElement);
    updatePageNumbers();
  }, true);

  root.addEventListener('beforeinput', (event) => {
    const element = event.target;
    if (!editing || historyPaused || !element.isContentEditable || (!element.dataset.editKey && !element.dataset.customBlockId)) return;
    pushHistory();
  });

  root.addEventListener('input', (event) => {
    const element = event.target;
    if (element.dataset.editKey) state.edits[element.dataset.editKey] = element.innerText.replace(/\u00a0/g, ' ');
    if (element.dataset.customBlockId) {
      const block = state.customBlocks.find((candidate) => candidate.id === element.dataset.customBlockId);
      if (block) block.text = element.innerText.replace(/\u00a0/g, ' ');
    }
    debounceSave();
    scheduleAutoFit();
  });

  editToggle.addEventListener('click', () => setEditing(!editing));
  insertButton.addEventListener('click', () => setInsertMode(!insertMode));
  addButton.addEventListener('click', async () => {
    pushHistory();
    await saveNow();
    const id = 'custom-page-' + Date.now().toString(36);
    state.customPages.push({ id, title: 'Página nueva', text: 'Escribe aquí el contenido de esta página.' });
    state.pageOrder.push(id);
    selectedPageId = id;
    selectedTextKey = null; selectedBlockId = null;
    if (window.JERDashboard) await window.JERDashboard.renderCurrent();
    setEditing(true);
    notify('Página de texto agregada. Puedes editar el título y el contenido.', 'success');
  });
  deleteButton.addEventListener('click', async () => {
    const page = ensureSelectedPage();
    if (!page) return;
    const title = page.querySelector('.page-header h1')?.textContent || 'esta página';
    if (!window.confirm('¿Eliminar "' + title + '" del informe y del PDF? Esto no elimina datos de Google Sheets.')) return;
    pushHistory();
    await saveNow();
    if (page.classList.contains('custom-text-page')) state.customPages = state.customPages.filter((item) => item.id !== selectedPageId);
    else state.deletedPages.push(selectedPageId);
    state.customBlocks = state.customBlocks.filter((block) => block.pageId !== selectedPageId);
    state.pageOrder = state.pageOrder.filter((id) => id !== selectedPageId);
    page.remove();
    selectedPageId = null;
    updateTextSelection(null);
    updatePageNumbers();
    await saveNow();
    notify('Página eliminada de la composición local. Google Sheets no fue modificado.', 'success');
  });
  async function moveSelected(offset) {
    const page = ensureSelectedPage();
    if (!page) return;
    const pages = Array.from(root.querySelectorAll('.report-page'));
    const index = pages.indexOf(page);
    const target = index + offset;
    if (target < 0 || target >= pages.length) return;
    pushHistory();
    if (offset < 0) root.insertBefore(page, pages[target]);
    else root.insertBefore(pages[target], page);
    state.pageOrder = Array.from(root.querySelectorAll('.report-page')).map((item) => item.dataset.pageId);
    updatePageNumbers();
    await saveNow();
  }
  upButton.addEventListener('click', () => moveSelected(-1));
  downButton.addEventListener('click', () => moveSelected(1));

  undoButton.addEventListener('click', () => undo().catch((error) => notify(error.message, 'error')));
  redoButton.addEventListener('click', () => redo().catch((error) => notify(error.message, 'error')));

  deleteTextButton.addEventListener('click', async () => {
    if (!selectedBlockId) return;
    const block = state.customBlocks.find((candidate) => candidate.id === selectedBlockId);
    if (!block) return;
    pushHistory();
    state.customBlocks = state.customBlocks.filter((candidate) => candidate.id !== selectedBlockId);
    const node = root.querySelector('[data-custom-block-id="' + CSS.escape(selectedBlockId) + '"]');
    if (node) node.remove();
    selectedBlockId = null;
    selectedTextKey = null;
    updateHistoryButtons();
    await saveNow();
    scheduleAutoFit();
    notify('Cuadro de texto eliminado. Puedes usar Deshacer para recuperarlo.', 'success');
  });

  applyFontFamilyButton.addEventListener('click', async () => {
    const family = fontFamilySelect.value || 'Comic Sans MS';
    if (family === state.typography.fontFamily) return;
    pushHistory();
    state.typography.fontFamily = family;
    applyGlobalTypography();
    await saveNow();
    // Reconstruir las gráficas para que sus etiquetas también adopten la fuente elegida.
    if (window.JERDashboard && window.JERDashboard.getResponse()) await window.JERDashboard.renderCurrent();
    notify('Tipografía aplicada a todo el informe: ' + family + '.', 'success');
  });

  async function applySelectedFontSize(rawSize) {
    const element = findTextElement(selectedTextKey);
    if (!element) {
      notify('Primero haz clic en un texto del informe para seleccionarlo.', 'error');
      return;
    }
    const size = Math.max(8, Math.min(48, Number(rawSize) || 17));
    pushHistory();
    const key = selectedTextKey;
    state.elementStyles[key] = Object.assign({}, state.elementStyles[key] || {}, { fontSize: size });
    element.style.fontSize = size + 'px';
    const options = Array.from(fontSizeSelect.options).map((option) => Number(option.value));
    const nearest = options.reduce((best, value) => Math.abs(value - size) < Math.abs(best - size) ? value : best, options[0]);
    fontSizeSelect.value = String(nearest);
    updateTextSelection(element);
    await saveNow();
    scheduleAutoFit();
    notify('Tamaño del texto seleccionado actualizado a ' + size + ' px.', 'success');
  }
  applyFontSizeButton.addEventListener('click', () => applySelectedFontSize(fontSizeSelect.value).catch((error) => notify(error.message, 'error')));
  fontSizeDownButton.addEventListener('click', () => {
    const el = findTextElement(selectedTextKey); if (!el) return;
    applySelectedFontSize(Math.max(8, (parseFloat(getComputedStyle(el).fontSize) || 17) - 1));
  });
  fontSizeUpButton.addEventListener('click', () => {
    const el = findTextElement(selectedTextKey); if (!el) return;
    applySelectedFontSize(Math.min(48, (parseFloat(getComputedStyle(el).fontSize) || 17) + 1));
  });

  document.addEventListener('keydown', (event) => {
    const mod = event.ctrlKey || event.metaKey;
    if (!mod || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === 'z' && !event.shiftKey) {
      event.preventDefault(); undo().catch((error) => notify(error.message, 'error'));
    } else if (key === 'y' || (key === 'z' && event.shiftKey)) {
      event.preventDefault(); redo().catch((error) => notify(error.message, 'error'));
    }
  });

  logoButton.addEventListener('click', () => logoInput.click());
  logoInput.addEventListener('change', async () => {
    const file = logoInput.files && logoInput.files[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      notify('El logo debe ser una imagen PNG, JPG o WebP.', 'error'); logoInput.value = ''; return;
    }
    if (file.size > 3 * 1024 * 1024) {
      notify('El logo supera los 3 MB. Elige una imagen más ligera para guardarla localmente.', 'error'); logoInput.value = ''; return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      pushHistory();
      state.logoDataUrl = String(reader.result);
      applyLogo();
      try { await saveNow(); notify('Logo actualizado en este navegador. El PDF usará el logo nuevo.', 'success'); }
      catch (error) { notify(error.message, 'error'); }
    };
    reader.onerror = () => notify('No se pudo leer la imagen seleccionada.', 'error');
    reader.readAsDataURL(file);
    logoInput.value = '';
  });

  exportButton.addEventListener('click', async () => {
    try {
      await saveNow();
      const blob = new Blob([JSON.stringify({ format: 'jer-sarlaft-local-v1', exportedAt: new Date().toISOString(), state }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = 'configuracion-local-sarlaft-jer.json'; link.click();
      URL.revokeObjectURL(url);
      notify('Copia de la edición exportada. Guárdala en una ubicación segura.', 'success');
    } catch (error) { notify(error.message, 'error'); }
  });
  importButton.addEventListener('click', () => settingsInput.click());
  settingsInput.addEventListener('change', async () => {
    const file = settingsInput.files && settingsInput.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed.format !== 'jer-sarlaft-local-v1' || !parsed.state || typeof parsed.state !== 'object') throw new Error('El archivo no parece una copia válida de la edición SARLAFT JER.');
      const confirmed = window.confirm('Importar esta configuración reemplazará los cambios locales actuales. ¿Continuar?');
      if (!confirmed) return;
      pushHistory();
      state = normalizeState(parsed.state);
      selectedPageId = null; selectedTextKey = null; selectedBlockId = null;
      await saveNow();
      if (window.JERDashboard) await window.JERDashboard.renderCurrent();
      notify('Configuración importada correctamente.', 'success');
    } catch (error) { notify('No se pudo importar: ' + error.message, 'error'); }
    finally { settingsInput.value = ''; }
  });

  window.addEventListener('resize', scheduleAutoFit);

  window.JEREditor = {
    ready: () => readyPromise,
    getState: () => state,
    decorateReport,
    saveNow,
    setEditing,
    setEnabled(enabled) {
      toolsEnabled = Boolean(enabled);
      [editToggle, insertButton, addButton, deleteButton, upButton, downButton, logoButton, exportButton, importButton, applyFontFamilyButton, fontFamilySelect, fontSizeSelect].forEach((control) => { control.disabled = !enabled; });
      if (!enabled) setInsertMode(false);
      updateHistoryButtons();
    },
    hasOverflow() {
      autoFitTextPages();
      return Array.from(root.querySelectorAll('.report-page')).some((page) => {
        const body = page.querySelector('.page-body');
        if (!body) return false;
        if (page.querySelector('[data-autofit-overflow="true"]')) return true;
        const fitTargets = Array.from(page.querySelectorAll('.cover-copy, .activity-list, .narrative-box, .custom-page-copy, .close-message'));
        if (fitTargets.some((target) => target.scrollHeight > target.clientHeight + 4)) return true;
        const bodyRect = body.getBoundingClientRect();
        return Array.from(page.querySelectorAll('.editor-text-block, .custom-page-copy')).some((block) => {
          const rect = block.getBoundingClientRect();
          return rect.bottom > bodyRect.bottom + 2 || rect.right > bodyRect.right + 2;
        });
      });
    },
    getTypography() { return Object.assign({}, state.typography || { fontFamily: 'Comic Sans MS', defaultFontSize: 17 }); }
  };
})();
