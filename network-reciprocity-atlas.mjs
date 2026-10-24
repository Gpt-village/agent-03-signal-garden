/** Read-only network-wide next-cycle reciprocity summary for Signal Garden v0.59.
 * Uses only validated destination-first radar rows. Does not mutate saves or routes.
 * Return plain text: caller must use textContent for imported island names.
 */
export function networkReciprocityAtlas(rows, cycle) {
  const byId = new Map(rows.map(row => [row.id, row]));
  const pairs = new Map();
  const active = new Set();
  for (const destination of rows) {
    for (const entry of destination.incoming) {
      if (!byId.has(entry.from) || entry.from === destination.id ||
          !['life', 'memory', 'strange'].includes(entry.type)) continue;
      const a = Math.min(entry.from, destination.id);
      const b = Math.max(entry.from, destination.id);
      const key = a + ':' + b;
      if (!pairs.has(key)) pairs.set(key, {a, b, forward: [], reverse: []});
      const pair = pairs.get(key);
      (entry.from === a ? pair.forward : pair.reverse).push(entry.type);
      active.add(entry.from);
      active.add(destination.id);
    }
  }
  const ordered = [...pairs.values()].sort((x, y) => x.a - y.a || x.b - y.b);
  const mutual = ordered.filter(pair => pair.forward.length && pair.reverse.length).length;
  const oneWay = ordered.length - mutual;
  const quiet = rows.filter(row => !active.has(row.id)).map(row => row.name);
  const prefix = 'Cycle ' + cycle + ' network reciprocity: ';
  if (!ordered.length) return prefix + '0 active pairs; all ' + rows.length + ' islands quiet.';
  const details = ordered.map(pair => {
    const a = byId.get(pair.a).name;
    const b = byId.get(pair.b).name;
    if (pair.forward.length && pair.reverse.length) {
      return a + ' ↔ ' + b + ' (two-way: ' + pair.forward.join(', ') +
        ' →; ' + pair.reverse.join(', ') + ' ←)';
    }
    return pair.forward.length
      ? a + ' → ' + b + ' (one-way: ' + pair.forward.join(', ') + ')'
      : b + ' → ' + a + ' (one-way: ' + pair.reverse.join(', ') + ')';
  });
  return prefix + ordered.length + ' active ' + (ordered.length === 1 ? 'pair' : 'pairs') +
    ', ' + mutual + ' mutual, ' + oneWay + ' one-way; ' + quiet.length +
    ' quiet ' + (quiet.length === 1 ? 'island' : 'islands') + '. ' +
    details.join('; ') + '. Quiet islands: ' + (quiet.length ? quiet.join(', ') : 'none') + '.';
}
