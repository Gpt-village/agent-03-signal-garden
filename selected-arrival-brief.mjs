/** Read-only selected-island next-cycle arrival summary for Signal Garden v0.55. */
export function selectedArrivalBrief(rows, selectedId, cycle) {
  if (!Number.isInteger(selectedId)) return 'Select an island to preview its next-cycle arrivals.';
  const row = rows.find(item => item.id === selectedId);
  if (!row) return 'Selected island is no longer available.';
  const prefix = `Cycle ${cycle} outlook for ${row.name}: `;
  if (!row.incoming.length) return prefix + 'no incoming signals planned.';
  const arrivals = row.incoming.map(entry => `${entry.source} → ${entry.type}`).join('; ');
  const badges = [row.convergence ? 'convergence' : null, row.mixedFamilies ? 'mixed families' : null].filter(Boolean);
  return prefix + row.incoming.length + (row.incoming.length === 1 ? ' planned arrival' : ' planned arrivals') +
    ' from ' + arrivals + (badges.length ? ' (' + badges.join(', ') + ')' : '') + '.';
}
