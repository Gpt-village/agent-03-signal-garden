import assert from 'node:assert/strict';
import test from 'node:test';
import {pairReciprocityInspector as inspect} from '../pair-reciprocity-inspector.mjs';

const row=(id,name,incoming=[])=>({id,name,incoming});
const entry=(from,type)=>({from,type});
const transfer=(from,to,type)=>({from,to,type});
test('no island and invalid partner are explained',()=>{
  const rows=[row(0,'A'),row(1,'B')];
  assert.match(inspect(rows,null,null,1,2),/Select an island/);
  assert.match(inspect(rows,null,0,null,2),/Choose another island/);
  assert.match(inspect(rows,null,0,0,2),/two different existing islands/);
  assert.match(inspect(rows,null,0,99,2),/Pair unavailable/);
});
test('fresh garden distinguishes unavailable history from quiet forecast',()=>{
  assert.match(inspect([row(0,'A'),row(1,'B')],null,0,1,2),/Last pulse: unavailable until a cycle completes.*Next forecast: quiet/);
});
test('quiet pair after a completed cycle is steady',()=>{
  assert.match(inspect([row(0,'A'),row(1,'B')],[],0,1,3),/Change: steady/);
});
test('two-way exchange includes both families',()=>{
  const rows=[row(0,'A',[entry(1,'memory')]),row(1,'B',[entry(0,'life')])];
  const text=inspect(rows,[transfer(0,1,'life')],0,1,4);
  assert.match(text,/Next forecast: A → B: life \/ B → A: memory \(mutual\)/);
  assert.match(text,/Change: became mutual/);
});
test('mutual to one-way and direction reversal are distinct',()=>{
  const rows=[row(0,'A'),row(1,'B',[entry(0,'strange')])];
  assert.match(inspect(rows,[transfer(0,1,'life'),transfer(1,0,'memory')],0,1,5),/Change: became one-way/);
  assert.match(inspect(rows,[transfer(1,0,'memory')],0,1,5),/Change: reversed/);
});
test('new, ended, retuned, and steady relationships',()=>{
  const rows=[row(0,'A'),row(1,'B',[entry(0,'memory')])];
  assert.match(inspect(rows,[],0,1,3),/Change: new/);
  assert.match(inspect([row(0,'A'),row(1,'B')],[transfer(0,1,'life')],0,1,3),/Change: ended/);
  assert.match(inspect(rows,[transfer(0,1,'life')],0,1,3),/Change: retuned/);
  assert.match(inspect(rows,[transfer(0,1,'memory')],0,1,3),/Change: steady/);
});
test('only the selected pair is considered; invalid families ignored',()=>{
  const rows=[row(0,'A'),row(1,'B',[entry(2,'life'),entry(0,'invalid')]),row(2,'C')];
  const text=inspect(rows,[transfer(2,1,'memory'),transfer(0,1,'other')],0,1,3);
  assert.match(text,/Next forecast: quiet/);
  assert.match(text,/Change: steady/);
});
test('swapping pair order correctly reverses directions',()=>{
  const rows=[row(0,'A'),row(1,'B',[entry(0,'life')])];
  assert.match(inspect(rows,[],1,0,3),/Next forecast: A → B: life \(reverse\)/);
});
test('names are plain text and neither input is mutated',()=>{
  const unsafe='<img src=x onerror=alert(1)>';
  const rows=[row(0,unsafe),row(1,'B',[entry(0,'life')])];
  const previous=[transfer(1,0,'memory')];
  const before=JSON.stringify({rows,previous});
  assert.ok(inspect(rows,previous,0,1,3).includes(unsafe));
  assert.equal(JSON.stringify({rows,previous}),before);
});
test('multiple families in one direction are preserved in order',()=>{
  const rows=[row(0,'A'),row(1,'B',[entry(0,'life'),entry(0,'strange')])];
  assert.match(inspect(rows,[],0,1,3),/A → B: life, strange/);
});
