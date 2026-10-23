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

/** Safe HTML view: all user-/save-derived names are escaped before insertion. */
export function renderIncomingRadar(rows) {
  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  }
  const active = rows.filter(row => row.incoming.length > 0).length;
  const arrivals = rows.reduce((total, row) => total + row.incoming.length, 0);
  const summary = `${active} of ${rows.length} islands expect ${arrivals} ${arrivals === 1 ? 'arrival' : 'arrivals'} next cycle.`;
  return '<section class="discovery" aria-label="Incoming signal radar" style="overflow-wrap:anywhere">' +
    '<h3>Incoming signal radar</h3><p class="small">' + summary +
    ' Convergence means signals from multiple source islands; mixed families means different signal types.</p><ul>' +
    rows.map(row => {
      const arrivals = row.incoming.length
        ? row.incoming.map(entry => escapeHtml(entry.source) + ' → ' + escapeHtml(entry.type)).join('; ')
        : 'No incoming signals planned.';
      const badges = (row.convergence ? ' · Convergence' : '') + (row.mixedFamilies ? ' · Mixed families' : '');
      return '<li><strong>' + escapeHtml(row.name) + '</strong>: ' + arrivals +
        (badges ? '<b>' + escapeHtml(badges) + '</b>' : '') + '</li>';
    }).join('') + '</ul></section>';
}
