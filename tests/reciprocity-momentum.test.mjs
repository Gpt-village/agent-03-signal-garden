import assert from 'node:assert/strict';
import test from 'node:test';
import {reciprocityMomentum as momentum} from '../reciprocity-momentum.mjs';

const row=(id,name,incoming=[])=>({id,name,incoming});
const entry=(from,type)=>({from,source:'source '+from,type});
const transfer=(from,to,type)=>({from,to,type});

test('no prior completed cycle offers an honest invitation',()=>{
  assert.match(momentum([row(0,'A')],null,2),/advance one cycle to compare/);
});
test('no traffic in either pulse is explicitly quiet',()=>{
  assert.equal(momentum([row(0,'A'),row(1,'B')],[],3),
    'Cycle 3 reciprocity momentum (last pulse → next forecast): no signal pairs in either pulse.');
});
test('unchanged mutual exchanges count as steady',()=>{
  const rows=[row(0,'A',[entry(1,'memory')]),row(1,'B',[entry(0,'life')])];
  const text=momentum(rows,[transfer(0,1,'life'),transfer(1,0,'memory')],3);
  assert.match(text,/0 new, 0 ended, 0 changed, 1 steady/);
  assert.match(text,/A ↔ B: steady/);
});
test('one-way to mutual becomes mutual',()=>{
  const rows=[row(0,'A',[entry(1,'memory')]),row(1,'B',[entry(0,'life')])];
  assert.match(momentum(rows,[transfer(0,1,'life')],4),/A ↔ B: became mutual/);
});
test('mutual to one-way is not mistaken for a new pair',()=>{
  const rows=[row(0,'A'),row(1,'B',[entry(0,'life')])];
  assert.match(momentum(rows,[transfer(0,1,'life'),transfer(1,0,'memory')],4),
    /0 new, 0 ended, 1 changed, 0 steady.*became one-way/);
});
test('a direction flip is recognized',()=>{
  const rows=[row(0,'A',[entry(1,'memory')]),row(1,'B')];
  assert.match(momentum(rows,[transfer(0,1,'life')],4),/A ↔ B: reversed/);
});
test('same direction with changed family is retuned',()=>{
  const rows=[row(0,'A'),row(1,'B',[entry(0,'strange')])];
  assert.match(momentum(rows,[transfer(0,1,'life')],4),/A ↔ B: retuned/);
});
test('new and ended pairs are counted separately with stable ordering',()=>{
  const rows=[row(2,'C',[entry(1,'memory')]),row(1,'B'),row(0,'A')];
  const text=momentum(rows,[transfer(0,1,'life')],5);
  assert.match(text,/1 new, 1 ended, 0 changed, 0 steady/);
  assert.ok(text.indexOf('A ↔ B: ended')<text.indexOf('B ↔ C: new'));
});
test('invalid endpoints, self transfers, and invalid families do not invent pairs',()=>{
  const rows=[row(0,'A',[entry(0,'life'),entry(99,'memory')]),row(1,'B',[entry(0,'invalid')])];
  assert.match(momentum(rows,[transfer(0,0,'life'),transfer(9,0,'memory'),transfer(0,1,'other')],6),
    /no signal pairs in either pulse/);
});
test('imported names remain plain text and inputs remain untouched',()=>{
  const unsafe='<img src=x onerror=alert(1)>';
  const rows=[row(0,unsafe),row(1,'B',[entry(0,'life')])];
  const old=[transfer(1,0,'memory')];
  const before=JSON.stringify({rows,old});
  const text=momentum(rows,old,7);
  assert.ok(text.includes(unsafe));
  assert.equal(JSON.stringify({rows,old}),before);
});
test('duplicate directed traffic remains one pair with multiple families',()=>{
  const rows=[row(0,'A'),row(1,'B',[entry(0,'life'),entry(0,'memory')])];
  const text=momentum(rows,[transfer(0,1,'life')],8);
  assert.match(text,/0 new, 0 ended, 1 changed, 0 steady/);
  assert.match(text,/A → B: life, memory/);
});
