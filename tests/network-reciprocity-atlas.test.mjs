import assert from 'node:assert/strict';
import test from 'node:test';
import {networkReciprocityAtlas as atlas} from '../network-reciprocity-atlas.mjs';

const row = (id, name, incoming=[]) => ({id,name,incoming});
const entry = (from, source, type) => ({from,source,type});

test('empty archipelago and all-quiet islands', () => {
  assert.equal(atlas([],2),'Cycle 2 network reciprocity: 0 active pairs; all 0 islands quiet.');
  assert.equal(atlas([row(0,'A'),row(1,'B')],2),
    'Cycle 2 network reciprocity: 0 active pairs; all 2 islands quiet.');
});
test('mutual pair requires two forecast directions, not a saved link', () => {
  const rows=[row(0,'A',[entry(1,'B','memory')]),row(1,'B',[entry(0,'A','life')])];
  assert.match(atlas(rows,3),/1 active pair, 1 mutual, 0 one-way; 0 quiet islands/);
  assert.match(atlas(rows,3),/A ↔ B \(two-way: life →; memory ←\)/);
});
test('one-way direction and quiet islands are reported correctly', () => {
  const rows=[row(0,'A'),row(1,'B',[entry(0,'A','strange')]),row(2,'Quiet')];
  assert.match(atlas(rows,4),/1 active pair, 0 mutual, 1 one-way; 1 quiet island/);
  assert.match(atlas(rows,4),/A → B \(one-way: strange\)/);
  assert.match(atlas(rows,4),/Quiet islands: Quiet/);
});
test('reverse-only pairs retain their actual direction', () => {
  assert.match(atlas([row(0,'A',[entry(1,'B','life')]),row(1,'B')],5),
    /B → A \(one-way: life\)/);
});
test('multiple pairs use stable numeric id order and preserve families', () => {
  const rows=[row(3,'D',[entry(0,'A','strange')]),row(2,'C',[entry(1,'B','life')]),
    row(0,'A',[entry(3,'D','memory')]),row(1,'B')];
  const text=atlas(rows,6);
  assert.match(text,/2 active pairs, 1 mutual, 1 one-way/);
  assert.ok(text.indexOf('A ↔ D')<text.indexOf('B → C'));
  assert.match(text,/A ↔ D \(two-way: strange →; memory ←\)/);
});
test('self-transfers, invalid types and unknown sources cannot create phantom pairs', () => {
  const rows=[row(0,'A',[entry(0,'A','life'),entry(99,'Ghost','memory')]),
    row(1,'B',[entry(0,'A','unknown')])];
  assert.match(atlas(rows,7),/0 active pairs; all 2 islands quiet/);
});
test('projection is read-only and never interprets imported names as markup', () => {
  const unsafe='<img src=x onerror=alert(1)>';
  const rows=[row(0,unsafe),row(1,'B',[entry(0,unsafe,'life')])];
  const before=JSON.stringify(rows);
  const text=atlas(rows,8);
  assert.equal(JSON.stringify(rows),before);
  assert.ok(text.includes(unsafe));
  assert.match(text,/1 active pair/);
});
test('duplicate same-direction transfers count one pair and retain each family', () => {
  const rows=[row(0,'A'),row(1,'B',[entry(0,'A','life'),entry(0,'A','memory')])];
  assert.match(atlas(rows,9),/1 active pair, 0 mutual, 1 one-way/);
  assert.match(atlas(rows,9),/A → B \(one-way: life, memory\)/);
});
