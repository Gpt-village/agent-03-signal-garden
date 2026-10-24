import test from 'node:test';
import assert from 'node:assert/strict';
import {selectedFlowCompass} from '../selected-flow-compass.mjs';

const rows = [
  {id:2,name:'Moss Relay',incoming:[{from:7,type:'life'},{from:9,type:'memory'}]},
  {id:7,name:'Glass Fen',incoming:[{from:2,type:'strange'}]},
  {id:9,name:'Hush Meridian',incoming:[{from:2,type:'life'}]},
  {id:12,name:'Quiet Shelf',incoming:[]}
];

test('unselected island offers a quiet non-live hint', () => {
  assert.match(selectedFlowCompass(rows,null,4),/Select an island to preview its next-cycle signal flow/);
});
test('missing island is handled without guessing an identity', () => {
  assert.equal(selectedFlowCompass(rows,42,4),'Selected island is no longer available.');
});
test('relay reports exact incoming and outgoing counts and net balance', () => {
  const text=selectedFlowCompass(rows,2,4);
  assert.match(text,/Cycle 4 flow compass for Moss Relay: relay · 2 incoming \/ 2 outgoing \(net 0\)/);
  assert.match(text,/life 1 in \/ 1 out; memory 1 in \/ 0 out; strange 0 in \/ 1 out/);
});
test('receiver reports positive net, including family breakdown', () => {
  const network=[{id:1,name:'Sender',incoming:[]},{id:3,name:'Receiver',incoming:[{from:1,type:'memory'}]}];
  assert.match(selectedFlowCompass(network,3,8),/receiver · 1 incoming \/ 0 outgoing \(net \+1\)/);
  assert.match(selectedFlowCompass(network,3,8),/memory 1 in \/ 0 out/);
});
test('sender reports negative net', () => {
  const network=[{id:1,name:'Sender',incoming:[]},{id:3,name:'Receiver',incoming:[{from:1,type:'strange'}]}];
  assert.match(selectedFlowCompass(network,1,8),/sender · 0 incoming \/ 1 outgoing \(net -1\)/);
});
test('quiet island has no invented traffic', () => {
  assert.match(selectedFlowCompass(rows,12,4),/quiet · 0 incoming \/ 0 outgoing \(net 0\)/);
});
test('non-contiguous IDs use identity rather than array position', () => {
  assert.match(selectedFlowCompass(rows,7,4),/Glass Fen: relay · 1 incoming \/ 1 outgoing/);
});
test('projection is deterministic and does not mutate source rows', () => {
  const before=JSON.stringify(rows);
  assert.equal(selectedFlowCompass(rows,2,4),selectedFlowCompass(rows,2,4));
  assert.equal(JSON.stringify(rows),before);
});
test('untrusted imported names remain plain text in projection', () => {
  const imported=[{id:0,name:'<img src=x onerror=alert(1)>',incoming:[]}];
  assert.match(selectedFlowCompass(imported,0,3),/<img src=x onerror=alert\(1\)>/);
});
