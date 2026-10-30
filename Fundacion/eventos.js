/**
 * Gendanken Palast - Eventos publicados
 * Los añade el autor y los ve cualquier visitante de la web; en la agenda son de solo lectura.
 * Si `topic` (un id de atlas.js o knowledgeData.js) tiene un evento en los próximos 30 días, ese tema late en el cosmos.
 *
 * Formato: { id, title, date: 'AAAA-MM-DD', start?: 'HH:MM', end?: 'HH:MM', topic?, notes? }
 */

const PUBLISHED_EVENTS = [
    { id: 'psc-examen-2026-10-28', title: 'Examen de Previsión social complementaria', date: '2026-10-28', topic: 'act_pensiones' },
    { id: 'simulacion-examen-2026-11-11', title: 'Examen de Simulación y modelos actuariales', date: '2026-11-11', topic: 'ds_simulacion' },
    { id: 'zurich-reserving-2026-10-29', title: 'Reserving · Zurich Interview', date: '2026-10-29', topic: 'act_reserving' }
];
