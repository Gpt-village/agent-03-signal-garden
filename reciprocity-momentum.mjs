/**
 * Signal Garden v0.60: compare the last completed pulse with the next-cycle forecast.
 * Both inputs are read-only; no save, route, or simulation changes are made.
 * Names are returned as plain text for textContent (never interpreted as HTML).
 */
export function reciprocityMomentum(rows, previousTransfers, cycle) {
  if (!Array.isArray(previousTransfers)) {
    return 'Cycle ' + cycle + ' reciprocity momentum: advance one cycle to compare the last completed pulse with the next forecast.';
  }
  const byId = new Map(rows.map(row => [row.id, row]));
  function collect(transfers) {
    const pairs = new Map();
    for (const transfer of transfers) {
      if (!transfer || !byId.has(transfer.from) || !byId.has(transfer.to) ||
          transfer.from === transfer.to || !['life', 'memory', 'strange'].includes(transfer.type)) continue;
      const a = Math.min(transfer.from, transfer.to);
      const b = Math.max(transfer.from, transfer.to);
      const key = a + ':' + b;
      if (!pairs.has(key)) pairs.set(key, {a, b, forward: [], reverse: []});
      (transfer.from === a ? pairs.get(key).forward : pairs.get(key).reverse).push(transfer.type);
    }
    return pairs;
  }
  const before = collect(previousTransfers);
  const afterTransfers = [];
  for (const destination of rows) {
    for (const entry of destination.incoming) {
      afterTransfers.push({from: entry.from, to: destination.id, type: entry.type});
    }
  }
  const after = collect(afterTransfers);
  const keys = new Set([...before.keys(), ...after.keys()]);
  const ordered = [...keys].map(key => {
    const pair = before.get(key) || after.get(key);
    return {key, a: pair.a, b: pair.b};
  }).sort((x, y) => x.a - y.a || x.b - y.b);
  function kind(pair) {
    return !pair ? 'none' : pair.forward.length && pair.reverse.length ? 'mutual' :
      pair.forward.length ? 'forward' : 'reverse';
  }
  function signature(pair) {
    return pair ? pair.forward.join(',') + '|' + pair.reverse.join(',') : '';
  }
  function traffic(pair) {
    if (!pair) return 'none';
    const a = byId.get(pair.a).name, b = byId.get(pair.b).name;
    return [pair.forward.length ? a + ' → ' + b + ': ' + pair.forward.join(', ') : '',
      pair.reverse.length ? b + ' → ' + a + ': ' + pair.reverse.join(', ') : ''].filter(Boolean).join(' / ');
  }
  const tally = {new: 0, ended: 0, changed: 0, steady: 0};
  const details = ordered.map(({key, a, b}) => {
    const old = before.get(key), next = after.get(key);
    const from = kind(old), to = kind(next);
    let status;
    if (from === 'none') { status = 'new'; tally.new++; }
    else if (to === 'none') { status = 'ended'; tally.ended++; }
    else if (from === to && signature(old) === signature(next)) { status = 'steady'; tally.steady++; }
    else {
      tally.changed++;
      if (from !== 'mutual' && to === 'mutual') status = 'became mutual';
      else if (from === 'mutual' && to !== 'mutual') status = 'became one-way';
      else if (from !== to) status = 'reversed';
      else status = 'retuned';
    }
    const names = byId.get(a).name + ' ↔ ' + byId.get(b).name;
    return names + ': ' + status + ' (last: ' + traffic(old) + '; next: ' + traffic(next) + ')';
  });
  const prefix = 'Cycle ' + cycle + ' reciprocity momentum (last pulse → next forecast): ';
  if (!ordered.length) return prefix + 'no signal pairs in either pulse.';
  return prefix + tally.new + ' new, ' + tally.ended + ' ended, ' + tally.changed +
    ' changed, ' + tally.steady + ' steady. ' + details.join('; ') + '.';
}
