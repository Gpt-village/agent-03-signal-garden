import test from 'node:test';
import assert from 'node:assert/strict';
import {buildIncomingRadar, summarizeIncomingRadar, renderIncomingRadar} from '../incoming-radar.mjs';

const island = (id, name=`Island ${id}`) => ({id, name});

test('quiet destinations remain visible and projections are read-only', () => {
  const islands=[island(0,'A'),island(1,'B')];
  const before=JSON.stringify(islands);
  const rows=buildIncomingRadar(islands,[]);
  assert.equal(JSON.stringify(islands),before);
  assert.equal(rows.length,2);
  assert.ok(rows.every(row=>row.incoming.length===0));
  assert.match(renderIncomingRadar(rows),/0 of 2 islands expect 0 arrivals/);
});

test('distinct sources and different signal families are separate properties', () => {
  const islands=[island(0,'A'),island(1,'B'),island(2,'C')];
  const transfers=[{from:0,to:2,type:'life'},{from:1,to:2,type:'memory'}];
  const before=JSON.stringify(transfers);
  const rows=buildIncomingRadar(islands,transfers);
  assert.equal(JSON.stringify(transfers),before);
  assert.equal(rows[2].incoming.length,2);
  assert.equal(rows[2].convergence,true);
  assert.equal(rows[2].mixedFamilies,true);
  assert.match(renderIncomingRadar(rows),/Mixed families/);
  const sameFamily=buildIncomingRadar(islands,transfers.map(t=>({...t,type:'life'})));
  assert.equal(sameFamily[2].convergence,true);
  assert.equal(sameFamily[2].mixedFamilies,false);
});

test('unknown endpoints and invalid signal families are ignored', () => {
  const rows=buildIncomingRadar([island(0),island(1)], [
    {from:99,to:1,type:'life'}, {from:0,to:99,type:'life'},
    {from:0,to:1,type:'invalid'}, {from:0,to:1,type:'strange'}
  ]);
  assert.equal(rows[1].incoming.length,1);
  assert.equal(rows[1].incoming[0].type,'strange');
});

test('untrusted imported names are escaped and whitespace names have fallback', () => {
  const rows=buildIncomingRadar([island(0,'<img src=x onerror=alert(1)>'),island(1,'  ')],[{from:0,to:1,type:'life'}]);
  const html=renderIncomingRadar(rows);
  assert.ok(!html.includes('<img src=x'));
  assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html,/Island 1/);
  assert.match(html,/overflow-wrap:anywhere/);
});

test('empty archipelago and singular arrival have accurate summaries', () => {
  assert.match(renderIncomingRadar(buildIncomingRadar([],[])),/0 of 0 islands expect 0 arrivals/);
  const rows=buildIncomingRadar([island(0),island(1)],[{from:0,to:1,type:'life'}]);
  assert.match(renderIncomingRadar(rows),/1 of 2 islands expect 1 arrival next cycle/);
});

test('signal chorus tallies every family and convergent destination without mutating projection', () => {
  const islands=[island(0,'A'),island(1,'B'),island(2,'C'),island(3,'Quiet')];
  const rows=buildIncomingRadar(islands,[
    {from:0,to:2,type:'life'}, {from:1,to:2,type:'memory'},
    {from:2,to:0,type:'strange'}
  ]);
  const before=JSON.stringify(rows);
  const tally=summarizeIncomingRadar(rows);
  assert.deepEqual(tally,{
    islands:4,active:2,arrivals:3,
    families:{life:1,memory:1,strange:1},
    convergences:1,mixed:1
  });
  assert.equal(JSON.stringify(rows),before,'chorus must not mutate projection');
  const html=renderIncomingRadar(rows);
  assert.match(html,/Signal chorus: life 1, memory 1, strange 1/);
  assert.match(html,/1 convergence destinations; 1 mixed-family destinations/);
});

test('quiet and repeated-family signals remain accurately counted', () => {
  const empty=buildIncomingRadar([island(0)],[]);
  assert.deepEqual(summarizeIncomingRadar(empty).families,{life:0,memory:0,strange:0});
  const rows=buildIncomingRadar([island(0),island(1),island(2)],[
    {from:0,to:2,type:'life'}, {from:1,to:2,type:'life'}, {from:99,to:2,type:'memory'}
  ]);
  const tally=summarizeIncomingRadar(rows);
  assert.equal(tally.arrivals,2);
  assert.deepEqual(tally.families,{life:2,memory:0,strange:0});
  assert.equal(tally.convergences,1);
  assert.equal(tally.mixed,0);
});
