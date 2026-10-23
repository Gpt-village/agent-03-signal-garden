/**
 * Agent-03 Signal Garden: destination-first next-cycle radar.
 * Pure read-only projection of cycleForecast().transfers and current islands.
 * This module is also the single source for the classic-script functions
 * injected by apply-radar.mjs; no save-schema or simulation changes.
 */
export function buildIncomingRadar(islands, transfers) {
  const rows = islands.map(island => ({
    id: island.id,
    name: typeof island.name === "string" && island.name.trim() ? island.name : `Island ${island.id}`,
    incoming: [],
    convergence: false,
    mixedFamilies: false
  }));
  const byId = new Map(rows.map(row => [row.id, row]));
  for (const transfer of transfers) {
    const target = byId.get(transfer.to);
    const source = byId.get(transfer.from);
    if (!target || !source || !['life', 'memory', 'strange'].includes(transfer.type)) continue;
    target.incoming.push({ from: source.id, source: source.name, type: transfer.type });
  }
  for (const row of rows) {
    row.convergence = new Set(row.incoming.map(entry => entry.from)).size >= 2;
    row.mixedFamilies = new Set(row.incoming.map(entry => entry.type)).size >= 2;
  }
  return rows;
}

export function summarizeIncomingRadar(rows) {
  const families = {life: 0, memory: 0, strange: 0};
  let active = 0, arrivals = 0, convergences = 0, mixed = 0;
  for (const row of rows) {
    if (row.incoming.length) active++;
    if (row.convergence) convergences++;
    if (row.mixedFamilies) mixed++;
    for (const entry of row.incoming) {
      if (Object.hasOwn(families, entry.type)) {
        families[entry.type]++;
        arrivals++;
      }
    }
  }
  return {islands: rows.length, active, arrivals, families, convergences, mixed};
}

/** Safe HTML view: all user-/save-derived names are escaped before insertion. */
export function renderIncomingRadar(rows) {
  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  }
  const tally = summarizeIncomingRadar(rows);
  const summary = `${tally.active} of ${tally.islands} islands expect ${tally.arrivals} ${tally.arrivals === 1 ? 'arrival' : 'arrivals'} next cycle.`;
  const chorus = `Signal chorus: life ${tally.families.life}, memory ${tally.families.memory}, strange ${tally.families.strange}. ${tally.convergences} convergence destinations; ${tally.mixed} mixed-family destinations.`;
  return '<section class="discovery" aria-label="Incoming signal radar" style="overflow-wrap:anywhere">' +
    '<h3>Incoming signal radar</h3><p class="small">' + summary +
    ' Convergence means signals from multiple source islands; mixed families means different signal types.</p>' +
    '<p class="small">' + chorus + '</p><ul>' +
    rows.map(row => {
      const arrivals = row.incoming.length
        ? row.incoming.map(entry => escapeHtml(entry.source) + ' → ' + escapeHtml(entry.type)).join('; ')
        : 'No incoming signals planned.';
      const badges = (row.convergence ? ' · Convergence' : '') + (row.mixedFamilies ? ' · Mixed families' : '');
      return '<li><strong>' + escapeHtml(row.name) + '</strong>: ' + arrivals +
        (badges ? '<b>' + escapeHtml(badges) + '</b>' : '') + '</li>';
    }).join('') + '</ul></section>';
}
