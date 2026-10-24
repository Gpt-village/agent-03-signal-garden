/** Read-only selected-island next-cycle flow compass for Signal Garden v0.57. */
export function selectedFlowCompass(rows, selectedId, cycle) {
  if (!Number.isInteger(selectedId)) return 'Select an island to preview its next-cycle signal flow.';
  const selected = rows.find(row => row.id === selectedId);
  if (!selected) return 'Selected island is no longer available.';
  const arrivals = selected.incoming.length;
  let departures = 0;
  const incoming = {life: 0, memory: 0, strange: 0};
  const outgoing = {life: 0, memory: 0, strange: 0};
  for (const entry of selected.incoming) incoming[entry.type] += 1;
  for (const destination of rows) {
    for (const entry of destination.incoming) {
      if (entry.from === selectedId) {
        departures += 1;
        outgoing[entry.type] += 1;
      }
    }
  }
  const role = arrivals && departures ? 'relay' : arrivals ? 'receiver' : departures ? 'sender' : 'quiet';
  const net = arrivals - departures;
  const signedNet = net > 0 ? '+' + net : String(net);
  const families = ['life', 'memory', 'strange'].map(type =>
    type + ' ' + incoming[type] + ' in / ' + outgoing[type] + ' out').join('; ');
  return 'Cycle ' + cycle + ' flow compass for ' + selected.name + ': ' + role +
    ' · ' + arrivals + ' incoming / ' + departures + ' outgoing (net ' + signedNet +
    '). By family: ' + families + '.';
}
