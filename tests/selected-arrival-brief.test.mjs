import test from 'node:test';
import assert from 'node:assert/strict';
import {selectedArrivalBrief} from '../selected-arrival-brief.mjs';

const rows=[
  {id:3,name:'Moss Relay',incoming:[{from:7,source:'Glass Fen',type:'life'},{from:9,source:'Hush Meridian',type:'memory'}],convergence:true,mixedFamilies:true},
  {id:7,name:'Glass Fen',incoming:[],convergence:false,mixedFamilies:false},
  {id:9,name:'Hush Meridian',incoming:[{from:3,source:'Moss Relay',type:'strange'}],convergence:false,mixedFamilies:false}
];

test('unselected island gets a useful empty-state hint',()=>{
  assert.match(selectedArrivalBrief(rows,null,4),/Select an island/);
});
test('quiet selected island reports cycle and no arrivals',()=>{
  assert.equal(selectedArrivalBrief(rows,7,4),'Cycle 4 outlook for Glass Fen: no incoming signals planned.');
});
test('one incoming signal names its source and family',()=>{
  assert.equal(selectedArrivalBrief(rows,9,4),'Cycle 4 outlook for Hush Meridian: 1 planned arrival from Moss Relay → strange.');
});
test('convergent mixed-family island reports both sources and badges',()=>{
  assert.equal(selectedArrivalBrief(rows,3,4),'Cycle 4 outlook for Moss Relay: 2 planned arrivals from Glass Fen → life; Hush Meridian → memory (convergence, mixed families).');
});
test('non-contiguous IDs are matched by ID rather than array position',()=>{
  assert.match(selectedArrivalBrief(rows,9,7),/^Cycle 7 outlook for Hush Meridian:/);
});
test('stale selected IDs do not leak another island outlook',()=>{
  assert.equal(selectedArrivalBrief(rows,99,4),'Selected island is no longer available.');
});
test('imported names are preserved as plain text and input rows are not mutated',()=>{
  const evil=[{id:0,name:'<img src=x onerror=alert(1)>',incoming:[{from:1,source:'<script>bad()</script>',type:'life'}],convergence:false,mixedFamilies:false}];
  const before=JSON.stringify(evil);
  const message=selectedArrivalBrief(evil,0,2);
  assert.match(message,/<img src=x onerror=alert\(1\)>/);
  assert.match(message,/<script>bad\(\)<\/script>/);
  assert.equal(JSON.stringify(evil),before);
});
test('many arrivals remain deterministic and preserve forecast order',()=>{
  const before=JSON.stringify(rows);
  const a=selectedArrivalBrief(rows,3,4),b=selectedArrivalBrief(rows,3,4);
  assert.equal(a,b);
  assert.equal(JSON.stringify(rows),before);
});
