import test from 'node:test';
import assert from 'node:assert/strict';
import {selectedDispatchBrief} from '../selected-dispatch-brief.mjs';

const rows = [
  {id:3,name:'Moss Relay',incoming:[{from:7,source:'Glass Fen',type:'life'},{from:9,source:'Hush Meridian',type:'memory'}],convergence:true,mixedFamilies:true},
  {id:7,name:'Glass Fen',incoming:[],convergence:false,mixedFamilies:false},
  {id:9,name:'Hush Meridian',incoming:[{from:3,source:'Moss Relay',type:'strange'}],convergence:false,mixedFamilies:false}
];

test('unselected dispatch provides a useful hint', () => {
  assert.match(selectedDispatchBrief(rows,null,4),/Select an island to preview its next-cycle departures/);
});
test('quiet selected island reports cycle and no outgoing signals', () => {
  const quiet=[{id:7,name:'Glass Fen',incoming:[]}];
  assert.equal(selectedDispatchBrief(quiet,7,4),'Cycle 4 dispatch from Glass Fen: no outgoing signals planned.');
});
test('one outgoing signal names its destination and type', () => {
  assert.equal(selectedDispatchBrief(rows,3,4),'Cycle 4 dispatch from Moss Relay: 1 planned export to Hush Meridian → strange.');
});
test('multiple destinations are reported in radar row order', () => {
  const network=[
    {id:4,name:'Origin',incoming:[]},
    {id:12,name:'Delta',incoming:[{from:4,source:'Origin',type:'life'}]},
    {id:2,name:'Delta Two',incoming:[{from:4,source:'Origin',type:'memory'}]}
  ];
  assert.equal(selectedDispatchBrief(network,4,8),'Cycle 8 dispatch from Origin: 2 planned exports to Delta → life; Delta Two → memory.');
});
test('non-contiguous IDs are matched by identity, not position', () => {
  assert.equal(selectedDispatchBrief(rows,7,4),'Cycle 4 dispatch from Glass Fen: 1 planned export to Moss Relay → life.');
});
test('missing selected island is handled safely', () => {
  assert.equal(selectedDispatchBrief(rows,99,4),'Selected island is no longer available.');
});
test('imported names remain plain text, with no HTML interpretation in projection', () => {
  const evil=[
    {id:0,name:'<img src=x onerror=alert(1)>',incoming:[]},
    {id:1,name:'<script>bad()</script>',incoming:[{from:0,source:'<img src=x onerror=alert(1)>',type:'life'}]}
  ];
  const before=JSON.stringify(evil);
  const result=selectedDispatchBrief(evil,0,2);
  assert.match(result,/<script>bad\(\)<\/script>/);
  assert.equal(JSON.stringify(evil),before);
});
test('projection is deterministic and leaves radar rows unchanged', () => {
  const before=JSON.stringify(rows);
  assert.equal(selectedDispatchBrief(rows,9,4),selectedDispatchBrief(rows,9,4));
  assert.equal(JSON.stringify(rows),before);
});
