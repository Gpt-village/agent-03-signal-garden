import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateReleaseGate,REQUIRED_WORKFLOWS,REQUIRED_BLOBS,gitBlobSha} from '../release-gate.mjs';

const HEAD='5c687b454936175d5d83c83a1cd79d5fb9520853';
const OTHER='037f8e87605ef914ec3d2b608d50bdaaf0e44007';
const html='<!doctype html><script>var APP_VERSION="0.52",SAVE_SCHEMA=7;</script>';
const blobs={
  'index.html':gitBlobSha(html),
  'tests/smoke.mjs':'3631b67d3c1ee77316818ae2c6bf997755d79ccd',
  'tests/browser-smoke.mjs':'e76c26f7329feb739ff314a15e2d4a51e3353dc6'
};
const green=REQUIRED_WORKFLOWS.map(name=>({name,head_sha:HEAD,status:'completed',conclusion:'success'}));
const check=(overrides={})=>evaluateReleaseGate({indexHtml:html,expectedVersion:'0.52',expectedSchema:7,gameTestHead:HEAD,runs:green,candidateBlobs:blobs,verifiedBlobs:blobs,...overrides});

test('accepts all three green exact-head workflows with identical game and harness blobs',()=>assert.equal(check().ready,true));
test('allows docs-only changes above a verified game/test head',()=>assert.equal(check().ready,true));
test('rejects stale green evidence for a different game/test head',()=>{
  const result=check({gameTestHead:OTHER});
  assert.equal(result.ready,false);
  assert.equal(result.reasons.filter(x=>x.includes('exact head')).length,3);
});
test('rejects missing workflow success even when blobs match',()=>{
  for(const name of REQUIRED_WORKFLOWS){
    const result=check({runs:green.filter(x=>x.name!==name)});
    assert.equal(result.ready,false);
    assert.match(result.reasons.join(' '),new RegExp(name));
  }
});
test('rejects cancelled, failed, queued and in-progress workflows',()=>{
  for(const conclusion of ['failure','cancelled',null]){
    const runs=green.map(x=>x.name==='pages build and deployment'?{...x,conclusion}:x);
    assert.equal(check({runs}).ready,false);
  }
  assert.equal(check({runs:green.map(x=>({...x,status:'in_progress'}))}).ready,false);
});
test('rejects changed index.html even without a version bump',()=>{
  const candidateBlobs={...blobs,'index.html':'a'.repeat(40)};
  const result=check({candidateBlobs});
  assert.equal(result.ready,false);
  assert.match(result.reasons.join(' '),/Candidate code differs from verified head: index\.html/);
});
test('rejects changed simulation and browser test harnesses',()=>{
  for(const path of REQUIRED_BLOBS.slice(1)){
    const result=check({candidateBlobs:{...blobs,[path]:'b'.repeat(40)}});
    assert.equal(result.ready,false);
    assert.ok(result.reasons.some(x=>x.includes(path)));
  }
});
test('rejects missing or invalid candidate/verified blob evidence',()=>{
  for(const override of [
    {candidateBlobs:undefined},{verifiedBlobs:undefined},
    {candidateBlobs:{...blobs,'index.html':'short'}},
    {verifiedBlobs:{...blobs,'tests/smoke.mjs':null}}
  ])assert.equal(check(override).ready,false);
});
test('rejects HTML content inconsistent with its asserted candidate Git blob',()=>{
  const result=check({indexHtml:html+'<!-- modified -->'});
  assert.equal(result.ready,false);
  assert.match(result.reasons.join(' '),/Supplied HTML differs/);
});
test('rejects version/schema drift and ambiguous declarations',()=>{
  assert.equal(check({expectedVersion:'0.53'}).ready,false);
  assert.equal(check({expectedSchema:8}).ready,false);
  assert.equal(check({indexHtml:html+html}).ready,false);
});
test('rejects malformed head and missing run evidence',()=>{
  assert.equal(check({gameTestHead:'5c687b45'}).ready,false);
  assert.equal(check({runs:undefined}).ready,false);
});
test('does not mutate any supplied evidence',()=>{
  const before=JSON.stringify({blobs,green});
  check();
  assert.equal(JSON.stringify({blobs,green}),before);
});
test('Git blob hashing matches known repository fixture',()=>{
  assert.equal(gitBlobSha('hello\n'),'ce013625030ba8dba906f756967f9e9ca394464a');
});
