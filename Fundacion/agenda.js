/**
 * Gendanken Palast - Agenda
 * Calendario con dos fuentes de eventos:
 *   - PUBLISHED_EVENTS (eventos.js): publicados por el autor, los ve todo visitante, solo lectura.
 *   - Los del navegador (localStorage): cada visitante apunta los suyos tras introducir la contraseña.
 * La web es estática (GitHub Pages): la contraseña se comprueba en el navegador contra su hash.
 * main.js llama a Agenda.init() con los temas del atlas y escucha Agenda.onChange() para los brillos.
 */

const Agenda = (() => {
    const STORAGE_KEY = 'gedankenpalast.events.v1';
    const UNLOCK_KEY = 'gedankenpalast.agenda.unlocked';
    const PASSWORD_SHA256 = '8399972340bc1fd817751881cc1ffade96086526fdeb3a2579bf09dcc46ff118';
    const UPCOMING_DAYS = 30;
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const SHORT_MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

    let topicById = {};
    let topicGroups = [];      // [{ label, topics: [{ id, name }] }] para el desplegable
    let hueOf = () => '#ffffff';
    let onTopic = () => {};
    const listeners = [];

    const ui = {
        open: false,
        view: 'month',         // 'month' | 'months' | 'years'
        year: 0,
        month: 0,
        yearPage: 0,           // primer año de la tabla de años
        selected: null,        // 'AAAA-MM-DD'
        mode: 'list',          // 'list' | 'password' | 'form'
        editing: null,         // id del evento local en edición
        pending: null,         // acción a ejecutar tras desbloquear
        error: ''
    };

    // --- Fechas en hora local (nunca UTC) ---
    const pad = (n) => String(n).padStart(2, '0');
    const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
    const today = () => iso(new Date());
    const daysUntil = (date) => Math.round((parse(date) - parse(today())) / 86400000);

    function relative(date) {
        const n = daysUntil(date);
        if (n === 0) return 'hoy';
        if (n === 1) return 'mañana';
        if (n > 1 && n < 7) return `en ${n} días`;
        const d = parse(date);
        return `${d.getDate()} ${SHORT_MONTHS_ES[d.getMonth()]}`;
    }

    const esc = (s) => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

    // --- Datos ---
    function localEvents() {
        try {
            const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(list) ? list.filter(isValid) : [];
        } catch {
            return [];
        }
    }

    function saveLocal(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch {
            ui.error = 'Este navegador no permite guardar datos (¿ventana privada?).';
        }
        listeners.forEach(fn => fn());
    }

    function isValid(e) {
        return e && typeof e.title === 'string' && e.title.trim() && /^\d{4}-\d{2}-\d{2}$/.test(e.date || '');
    }

    function events() {
        const published = (typeof PUBLISHED_EVENTS !== 'undefined' ? PUBLISHED_EVENTS : [])
            .filter(isValid).map(e => ({ ...e, source: 'published' }));
        const local = localEvents().map(e => ({ ...e, source: 'local' }));
        return published.concat(local).sort((a, b) => (a.date + (a.start || '')).localeCompare(b.date + (b.start || '')));
    }

    // Eventos del tema entre hoy y dentro de 30 días, el más próximo primero
    function upcomingFor(topicId) {
        return events().filter(e => e.topic === topicId && daysUntil(e.date) >= 0 && daysUntil(e.date) <= UPCOMING_DAYS);
    }

    const eventsOn = (date) => events().filter(e => e.date === date);

    // --- Contraseña ---
    const isUnlocked = () => {
        try { return sessionStorage.getItem(UNLOCK_KEY) === '1'; } catch { return false; }
    };

    async function checkPassword(text) {
        if (!window.crypto || !crypto.subtle) return false;
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        const hex = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
        return hex === PASSWORD_SHA256;
    }

    function requireUnlock(action) {
        if (isUnlocked()) return action();
        ui.pending = action;
        ui.mode = 'password';
        ui.error = '';
        render();
    }

    // --- Interfaz ---
    let root, panel, tab;

    const chevron = (dir) => `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${dir === 'up' ? 'M4 10l4-4 4 4' : 'M4 6l4 4 4-4'}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    function renderHead() {
        return `
            <div class="ag-head">
                <div class="ag-step ag-step-year">
                    <button type="button" class="ag-arrow" data-action="year-prev" aria-label="Año anterior">${chevron('up')}</button>
                    <button type="button" class="ag-label ag-label-year num" data-action="pick-year" aria-expanded="${ui.view === 'years'}">${ui.year}</button>
                    <button type="button" class="ag-arrow" data-action="year-next" aria-label="Año siguiente">${chevron('down')}</button>
                </div>
                <div class="ag-step ag-step-month">
                    <button type="button" class="ag-arrow" data-action="month-prev" aria-label="Mes anterior">${chevron('up')}</button>
                    <button type="button" class="ag-label ag-label-month" data-action="pick-month" aria-expanded="${ui.view === 'months'}">${MONTHS[ui.month]}</button>
                    <button type="button" class="ag-arrow" data-action="month-next" aria-label="Mes siguiente">${chevron('down')}</button>
                </div>
            </div>`;
    }

    function renderMonthGrid() {
        const first = new Date(ui.year, ui.month, 1);
        const offset = (first.getDay() + 6) % 7; // lunes primero
        const start = new Date(ui.year, ui.month, 1 - offset);
        const now = today();
        const byDate = {};
        events().forEach(e => { (byDate[e.date] = byDate[e.date] || []).push(e); });

        let cells = '';
        for (let i = 0; i < 42; i++) {
            const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
            const key = iso(d);
            const dayEvents = byDate[key] || [];
            const cls = ['ag-day'];
            if (d.getMonth() !== ui.month) cls.push('is-out');
            if (key === now) cls.push('is-today');
            if (key === ui.selected) cls.push('is-selected');
            const dots = dayEvents.slice(0, 3).map(e => `<i style="background:${e.topic ? hueOf(e.topic) : 'currentColor'}"></i>`).join('');
            const label = `${d.getDate()} ${MONTHS[d.getMonth()]}${dayEvents.length ? `, ${dayEvents.length} evento${dayEvents.length > 1 ? 's' : ''}` : ''}`;
            cells += `<button type="button" class="${cls.join(' ')}" data-action="select-day" data-date="${key}" aria-label="${label}">
                <span class="num">${d.getDate()}</span><span class="ag-dots">${dots}</span></button>`;
        }
        return `<div class="ag-weekdays">${WEEKDAYS.map(w => `<span>${w}</span>`).join('')}</div><div class="ag-grid">${cells}</div>`;
    }

    function renderMonthPicker() {
        return `<div class="ag-picker ag-picker-months">${MONTHS.map((m, i) => `
            <button type="button" class="ag-pick${i === ui.month ? ' is-on' : ''}" data-action="set-month" data-month="${i}">${m}</button>`).join('')}</div>`;
    }

    function renderYearPicker() {
        const years = Array.from({ length: 12 }, (_, i) => ui.yearPage + i);
        return `
            <div class="ag-picker-nav">
                <button type="button" class="ag-arrow" data-action="years-prev" aria-label="Años anteriores">${chevron('up')}</button>
                <span class="num">${years[0]} – ${years[11]}</span>
                <button type="button" class="ag-arrow" data-action="years-next" aria-label="Años siguientes">${chevron('down')}</button>
            </div>
            <div class="ag-picker ag-picker-years">${years.map(y => `
                <button type="button" class="ag-pick num${y === ui.year ? ' is-on' : ''}" data-action="set-year" data-year="${y}">${y}</button>`).join('')}</div>`;
    }

    function topicChip(id) {
        const t = topicById[id];
        if (!t) return '';
        return `<button type="button" class="ag-topic" data-action="open-topic" data-topic="${id}"><i style="background:${hueOf(id)}"></i>${esc(t.name)}</button>`;
    }

    const timeRange = (e) => e.start ? `${e.start}${e.end ? `–${e.end}` : ''}` : 'Todo el día';

    function renderDay() {
        if (!ui.selected) return '';
        const d = parse(ui.selected);
        const heading = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

        if (ui.mode === 'password') {
            return `<section class="ag-day-panel">
                <h3 class="ag-h">Contraseña</h3>
                <form class="ag-form" data-form="password">
                    <label class="ag-field"><span>Para guardar eventos en este navegador</span>
                        <input type="password" name="password" autocomplete="current-password" required autofocus></label>
                    ${ui.error ? `<p class="ag-error" role="alert">${esc(ui.error)}</p>` : ''}
                    <div class="ag-actions">
                        <button type="button" class="ag-btn" data-action="cancel">Cancelar</button>
                        <button type="submit" class="ag-btn ag-btn-primary">Desbloquear</button>
                    </div>
                </form>
            </section>`;
        }

        if (ui.mode === 'form') {
            const e = ui.editing ? localEvents().find(x => x.id === ui.editing) || {} : {};
            const options = topicGroups.map(g => `<optgroup label="${esc(g.label)}">${g.topics.map(t =>
                `<option value="${t.id}"${e.topic === t.id ? ' selected' : ''}>${esc(t.name)}</option>`).join('')}</optgroup>`).join('');
            return `<section class="ag-day-panel">
                <h3 class="ag-h">${ui.editing ? 'Editar evento' : 'Nuevo evento'} · ${heading}</h3>
                <form class="ag-form" data-form="event">
                    <label class="ag-field"><span>Título</span>
                        <input type="text" name="title" required maxlength="120" value="${esc(e.title || '')}" autofocus></label>
                    <div class="ag-field-row">
                        <label class="ag-field"><span>Desde</span><input type="time" name="start" value="${e.start || ''}"></label>
                        <label class="ag-field"><span>Hasta</span><input type="time" name="end" value="${e.end || ''}"></label>
                    </div>
                    <label class="ag-field"><span>Tema relacionado</span>
                        <select name="topic"><option value="">Ninguno</option>${options}</select></label>
                    <label class="ag-field"><span>Notas</span>
                        <textarea name="notes" rows="2" maxlength="500">${esc(e.notes || '')}</textarea></label>
                    ${ui.error ? `<p class="ag-error" role="alert">${esc(ui.error)}</p>` : ''}
                    <div class="ag-actions">
                        <button type="button" class="ag-btn" data-action="cancel">Cancelar</button>
                        <button type="submit" class="ag-btn ag-btn-primary">Guardar</button>
                    </div>
                </form>
            </section>`;
        }

        const list = eventsOn(ui.selected);
        const rows = list.length ? list.map(e => `
            <li class="ag-event">
                <span class="ag-event-time num">${timeRange(e)}</span>
                <span class="ag-event-title">${esc(e.title)}</span>
                ${e.topic ? topicChip(e.topic) : ''}
                ${e.notes ? `<span class="ag-event-notes">${esc(e.notes)}</span>` : ''}
                ${e.source === 'local'
                    ? `<span class="ag-event-tools">
                        <button type="button" class="ag-link" data-action="edit" data-id="${e.id}">Editar</button>
                        <button type="button" class="ag-link ag-link-danger" data-action="delete" data-id="${e.id}">Borrar</button></span>`
                    : '<span class="ag-event-source">Publicado</span>'}
            </li>`).join('') : '<li class="ag-empty">Sin eventos este día.</li>';
        return `<section class="ag-day-panel">
            <div class="ag-day-head">
                <h3 class="ag-h">${heading}</h3>
                <button type="button" class="ag-btn ag-btn-primary" data-action="new-event">Evento</button>
            </div>
            <ul class="ag-events">${rows}</ul>
        </section>`;
    }

    function renderUpcoming() {
        const next = events().filter(e => daysUntil(e.date) >= 0).slice(0, 5);
        const rows = next.length ? next.map(e => `
            <li><button type="button" class="ag-upcoming-row" data-action="goto" data-date="${e.date}">
                <span class="ag-upcoming-when">${relative(e.date)}</span>
                <span class="ag-upcoming-title">${esc(e.title)}</span>
                ${e.topic ? `<i style="background:${hueOf(e.topic)}"></i>` : ''}
            </button></li>`).join('') : '<li class="ag-empty">No hay eventos próximos.</li>';
        return `<section class="ag-upcoming"><h3 class="ag-h">Próximos</h3><ul>${rows}</ul></section>`;
    }

    function render() {
        if (!panel) return;
        const body = ui.view === 'months' ? renderMonthPicker() : ui.view === 'years' ? renderYearPicker() : renderMonthGrid();
        panel.innerHTML = `
            ${renderHead()}
            <div class="ag-body">${body}</div>
            ${ui.view === 'month' ? renderDay() : ''}
            ${ui.view === 'month' && ui.mode === 'list' ? renderUpcoming() : ''}
            <footer class="ag-foot">
                <button type="button" class="ag-link" data-action="export">Exportar</button>
                <button type="button" class="ag-link" data-action="import">Importar</button>
                <input type="file" accept="application/json,.json" hidden data-role="import-file">
            </footer>`;
        const focus = panel.querySelector('[autofocus]');
        if (focus) focus.focus();
    }

    function setOpen(open) {
        ui.open = open;
        root.classList.toggle('is-open', open);
        panel.hidden = !open;
        tab.setAttribute('aria-expanded', String(open));
        if (open) render();
    }

    function shiftMonth(step) {
        const d = new Date(ui.year, ui.month + step, 1);
        ui.year = d.getFullYear();
        ui.month = d.getMonth();
    }

    function selectDate(date) {
        const d = parse(date);
        ui.selected = date;
        ui.year = d.getFullYear();
        ui.month = d.getMonth();
        ui.view = 'month';
        ui.mode = 'list';
        ui.error = '';
    }

    function exportEvents() {
        const blob = new Blob([JSON.stringify(localEvents(), null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `gedankenpalast-eventos-${today()}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }

    function importEvents(file) {
        file.text().then(text => {
            const incoming = JSON.parse(text);
            if (!Array.isArray(incoming)) throw new Error('formato');
            const merged = Object.fromEntries(localEvents().map(e => [e.id, e]));
            incoming.filter(isValid).forEach(e => {
                const id = e.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
                merged[id] = { ...e, id };
            });
            saveLocal(Object.values(merged));
            render();
        }).catch(() => {
            ui.error = 'El archivo no es una copia de eventos válida.';
            render();
        });
    }

    function onClick(e) {
        const el = e.target.closest('[data-action]');
        if (!el || !panel.contains(el)) return;
        const action = el.dataset.action;
        switch (action) {
            case 'year-prev': ui.year--; break;
            case 'year-next': ui.year++; break;
            case 'month-prev': shiftMonth(-1); break;
            case 'month-next': shiftMonth(1); break;
            case 'pick-month': ui.view = ui.view === 'months' ? 'month' : 'months'; break;
            case 'pick-year': ui.view = ui.view === 'years' ? 'month' : 'years'; ui.yearPage = ui.year - 5; break;
            case 'set-month': ui.month = Number(el.dataset.month); ui.view = 'month'; break;
            case 'set-year': ui.year = Number(el.dataset.year); ui.view = 'month'; break;
            case 'years-prev': ui.yearPage -= 12; break;
            case 'years-next': ui.yearPage += 12; break;
            case 'select-day': selectDate(el.dataset.date); break;
            case 'goto': selectDate(el.dataset.date); break;
            case 'new-event':
                return requireUnlock(() => { ui.mode = 'form'; ui.editing = null; ui.error = ''; render(); });
            case 'edit':
                return requireUnlock(() => { ui.mode = 'form'; ui.editing = el.dataset.id; ui.error = ''; render(); });
            case 'delete':
                return requireUnlock(() => {
                    const ev = localEvents().find(x => x.id === el.dataset.id);
                    if (ev && confirm(`¿Borrar «${ev.title}»?`)) saveLocal(localEvents().filter(x => x.id !== ev.id));
                    ui.mode = 'list';
                    render();
                });
            case 'cancel': ui.mode = 'list'; ui.pending = null; ui.editing = null; ui.error = ''; break;
            case 'export': return exportEvents();
            case 'import':
                return requireUnlock(() => { ui.mode = 'list'; render(); panel.querySelector('[data-role="import-file"]').click(); });
            case 'open-topic': return onTopic(el.dataset.topic);
            default: return;
        }
        render();
    }

    async function onSubmit(e) {
        const form = e.target.closest('form[data-form]');
        if (!form) return;
        e.preventDefault();
        const data = new FormData(form);

        if (form.dataset.form === 'password') {
            if (await checkPassword(String(data.get('password')))) {
                try { sessionStorage.setItem(UNLOCK_KEY, '1'); } catch { /* sin sessionStorage: desbloqueo solo para esta acción */ }
                const action = ui.pending;
                ui.pending = null;
                ui.mode = 'list';
                ui.error = '';
                if (action) action(); else render();
            } else {
                ui.error = window.crypto && crypto.subtle ? 'Contraseña incorrecta.' : 'Este navegador no puede comprobar la contraseña en una conexión no segura.';
                render();
            }
            return;
        }

        const title = String(data.get('title')).trim();
        const start = String(data.get('start') || '');
        const end = String(data.get('end') || '');
        if (!title) { ui.error = 'Escribe un título.'; return render(); }
        if (start && end && end < start) { ui.error = 'La hora final es anterior a la inicial.'; return render(); }
        const event = {
            id: ui.editing || `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title,
            date: ui.selected,
            ...(start && { start }),
            ...(end && { end }),
            ...(data.get('topic') && { topic: String(data.get('topic')) }),
            ...(String(data.get('notes')).trim() && { notes: String(data.get('notes')).trim() })
        };
        saveLocal(localEvents().filter(x => x.id !== event.id).concat(event));
        ui.mode = 'list';
        ui.editing = null;
        ui.error = '';
        render();
    }

    function init(options) {
        topicById = Object.fromEntries(options.topics.map(t => [t.id, t]));
        topicGroups = options.groups;
        hueOf = options.hueOf;
        onTopic = options.onTopic;

        root = document.getElementById('agenda');
        panel = document.getElementById('agenda-panel');
        tab = document.getElementById('agenda-tab');
        const now = new Date();
        ui.year = now.getFullYear();
        ui.month = now.getMonth();

        tab.addEventListener('click', () => setOpen(!ui.open));
        panel.addEventListener('click', onClick);
        panel.addEventListener('submit', onSubmit);
        panel.addEventListener('change', (e) => {
            if (e.target.matches('[data-role="import-file"]') && e.target.files[0]) importEvents(e.target.files[0]);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && ui.open) {
                e.stopPropagation();
                if (ui.mode !== 'list') { ui.mode = 'list'; ui.pending = null; render(); } else { setOpen(false); tab.focus(); }
            }
        });
    }

    return {
        init,
        events,
        upcomingFor,
        relative,
        today,
        refresh: render,
        onChange: (fn) => listeners.push(fn)
    };
})();
