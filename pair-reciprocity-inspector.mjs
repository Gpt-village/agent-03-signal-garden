/**
 * Signal Garden v0.61: inspect one island pair's last completed migration and
 * next-cycle forecast without changing the world or persisting UI preferences.
 * Names are plain text; the caller must render with textContent.
 */
export function pairReciprocityInspector(rows, previousTransfers, firstId, secondId, cycle) {
  if (!Number.isInteger(firstId)) return 'Select an island to inspect a pair.';
  if (!Number.isInteger(secondId)) return 'Choose another island to inspect a pair.';
  const byId = new Map(rows.map(row => [row.id, row]));
  const first = byId.get(firstId), second = byId.get(secondId);
  if (!first || !second || firstId === secondId) return 'Pair unavailable; select two different existing islands.';
  const families = ['life', 'memory', 'strange'];
  function empty() { return {forward: [], reverse: []}; }
  const next = empty(), last = empty();
  for (const destination of rows) {
    if (!Array.isArray(destination.incoming)) continue;
    for (const entry of destination.incoming) {
      if (!entry || !families.includes(entry.type)) continue;
      if (entry.from === firstId && destination.id === secondId) next.forward.push(entry.type);
      if (entry.from === secondId && destination.id === firstId) next.reverse.push(entry.type);
    }
  }
  if (Array.isArray(previousTransfers)) {
    for (const entry of previousTransfers) {
      if (!entry || !families.includes(entry.type)) continue;
      if (entry.from === firstId && entry.to === secondId) last.forward.push(entry.type);
      if (entry.from === secondId && entry.to === firstId) last.reverse.push(entry.type);
    }
  }
  function kind(traffic) {
    return traffic.forward.length && traffic.reverse.length ? 'mutual' :
      traffic.forward.length ? 'forward' : traffic.reverse.length ? 'reverse' : 'quiet';
  }
  function describe(traffic) {
    const lines = [];
    if (traffic.forward.length) lines.push(first.name + ' → ' + second.name + ': ' + traffic.forward.join(', '));
    if (traffic.reverse.length) lines.push(second.name + ' → ' + first.name + ': ' + traffic.reverse.join(', '));
    return lines.length ? lines.join(' / ') : 'quiet';
  }
  const upcoming = kind(next), preceding = kind(last);
  const prefix = 'Cycle ' + cycle + ' pair inspector for ' + first.name + ' ↔ ' + second.name + '. ';
  const nextText = 'Next forecast: ' + describe(next) + ' (' + upcoming + ').';
  if (!Array.isArray(previousTransfers)) {
    return prefix + 'Last pulse: unavailable until a cycle completes. ' + nextText;
  }
  let change;
  if (preceding === 'quiet' && upcoming !== 'quiet') change = 'new';
  else if (preceding !== 'quiet' && upcoming === 'quiet') change = 'ended';
  else if (preceding === upcoming &&
      last.forward.join(',') === next.forward.join(',') &&
      last.reverse.join(',') === next.reverse.join(',')) change = 'steady';
  else if (preceding !== 'mutual' && upcoming === 'mutual') change = 'became mutual';
  else if (preceding === 'mutual' && upcoming !== 'mutual') change = 'became one-way';
  else if ((preceding === 'forward' && upcoming === 'reverse') ||
           (preceding === 'reverse' && upcoming === 'forward')) change = 'reversed';
  else change = 'retuned';
  return prefix + 'Last pulse: ' + describe(last) + ' (' + preceding + '). ' +
    nextText + ' Change: ' + change + '.';
}
