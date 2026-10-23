import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateReleaseGate, REQUIRED_WORKFLOWS} from '../release-gate.mjs';

const HEAD='542d170e23edf879d6cb594628c5ac26238c29bf';
const OTHER='83bdbf2d46574707507a4cf66250801d83d40fef';
const html='<!doctype html><script>var APP_VERSION="0.51",SAVE_SCHEMA=7;</script>';
const green=REQUIRED_WORKFLOWS.map(name=>({name,head_sha:HEAD,status:'completed',conclusion:'success'}));
const check=(overrides={})=>evaluateReleaseGate({indexHtml:html,expectedVersion:'0.51',expectedSchema:7,gameTestHead:HEAD,runs:green,...overrides});

test('accepts complete green evidence for exact verified head',()=>{assert.equal(check().ready,true)});
test('rejects stale green evidence for a different head',()=>{
  const result=check({gameTestHead:OTHER});
  assert.equal(result.ready,false);
  assert.equal(result.reasons.filter(x=>x.includes('exact head')).length,3);
});
test('rejects missing browser smoke',()=>{
  const result=check({runs:green.filter(x=>x.name!=='Browser smoke')});
  assert.equal(result.ready,false);
  assert.match(result.reasons.join(' '),/Browser smoke/);
});
test('rejects queued or cancelled Pages even if the commit matches',()=>{
  for(const conclusion of [null,'cancelled','failure']){
    const runs=green.map(x=>x.name==='pages build and deployment'?{...x,status:'completed',conclusion}:x);
    assert.equal(check({runs}).ready,false);
  }
});
test('rejects in-progress runs',()=>{assert.equal(check({runs:green.map(x=>({...x,status:'in_progress'}))}).ready,false)});
test('rejects version/schema drift',()=>{
  assert.equal(check({expectedVersion:'0.52'}).ready,false);
  assert.equal(check({expectedSchema:8}).ready,false);
});
test('rejects malformed commit and absent evidence',()=>{
  assert.equal(check({gameTestHead:'542d170e'}).ready,false);
  assert.equal(check({runs:undefined}).ready,false);
});
test('never mutates the provided workflow evidence',()=>{
  const original=JSON.stringify(green);
  check();
  assert.equal(JSON.stringify(green),original);
});
test('rejects duplicate ambiguous version declarations',()=>{
  assert.equal(check({indexHtml:html+html}).ready,false);
});
