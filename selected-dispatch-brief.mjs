/** Read-only selected-island next-cycle outgoing dispatch for Signal Garden v0.56. */
export function selectedDispatchBrief(rows, selectedId, cycle) {
  if (!Number.isInteger(selectedId)) return 'Select an island to preview its next-cycle departures.';
  const source = rows.find(row => row.id === selectedId);
  if (!source) return 'Selected island is no longer available.';
  const departures = [];
  for (const destination of rows) {
    for (const entry of destination.incoming) {
      if (entry.from === selectedId) departures.push(`${destination.name} → ${entry.type}`);
    }
  }
  const prefix = `Cycle ${cycle} dispatch from ${source.name}: `;
  if (!departures.length) return prefix + 'no outgoing signals planned.';
  return prefix + departures.length + (departures.length === 1 ? ' planned export' : ' planned exports') +
    ' to ' + departures.join('; ') + '.';
}
