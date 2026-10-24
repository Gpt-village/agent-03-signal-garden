/**
 * Signal Garden v0.58: read-only next-cycle Route Reciprocity Lens.
 * Consumes the canonical destination-first radar, not live/saved route history.
 * A pair is mutual only when this forecast contains both directed transfers.
 * Imported names are returned as text for textContent, never as HTML.
 */
export function selectedRouteReciprocityLens(rows, selectedId, cycle) {
  if (!Number.isInteger(selectedId)) return 'Select an island to preview next-cycle route reciprocity.';
  const selected = rows.find(row => row.id === selectedId);
  if (!selected) return 'Selected island is no longer available.';
  const partners = new Map();
  function partner(id) {
    if (id === selectedId) return null;
    const row = rows.find(item => item.id === id);
    if (!row) return null;
    if (!partners.has(id)) partners.set(id, {id, name: row.name, incoming: [], outgoing: []});
    return partners.get(id);
  }
  for (const destination of rows) {
    for (const entry of destination.incoming) {
      if (destination.id === selectedId) {
        const p = partner(entry.from);
        if (p) p.incoming.push(entry.type);
      } else if (entry.from === selectedId) {
        const p = partner(destination.id);
        if (p) p.outgoing.push(entry.type);
      }
    }
  }
  const ordered = [...partners.values()].sort((a, b) => a.id - b.id);
  const mutual = ordered.filter(p => p.incoming.length && p.outgoing.length).length;
  const outbound = ordered.filter(p => p.outgoing.length && !p.incoming.length).length;
  const inbound = ordered.filter(p => p.incoming.length && !p.outgoing.length).length;
  const prefix = 'Cycle ' + cycle + ' route reciprocity for ' + selected.name + ': ';
  if (!ordered.length) return prefix + 'no planned traffic involving this island.';
  const label = (n, singular) => n + ' ' + singular + (n === 1 ? '' : 's');
  const details = ordered.map(p => {
    if (p.incoming.length && p.outgoing.length) {
      return p.name + ': two-way (send ' + p.outgoing.join(', ') + '; receive ' + p.incoming.join(', ') + ')';
    }
    if (p.outgoing.length) return p.name + ': one-way out (send ' + p.outgoing.join(', ') + ')';
    return p.name + ': one-way in (receive ' + p.incoming.join(', ') + ')';
  });
  return prefix + label(mutual, 'mutual pair') + ', ' + label(outbound, 'outbound-only pair') +
    ', ' + label(inbound, 'inbound-only pair') + '. ' + details.join('; ') + '.';
}
