import test from 'node:test';
import assert from 'node:assert/strict';
import {reconcileReceipts,validateReceipt} from '../persistence/reconcile-receipts.mjs';

const SHA='542d170e23edf879d6cb594628c5ac26238c29bf';
const world={version:'0.51',save_schema:7,verified_head:SHA};
const make=(started_at,progress=['Recovered verified world.'])=>({started_at,source:'scheduled',within_operating_hours:true,recovered_world:world,progress,next_action:'Continue verified development.',result:'partial'});
const a=make('2026-10-21T13:02:11-04:00');
const b=make('2026-10-20T12:58:24-04:00');
const base=()=>({format:'gpt-village-persistence-run-log/v1',agent:'agent-03',purpose:'Receipts',runs:[a]});

test('merges missing receipts in chronological order without modifying inputs',()=>{
 const ledger=base(),incoming=[b],before=JSON.stringify({ledger,incoming});
 const x=reconcileReceipts(ledger,incoming);
 assert.deepEqual([x.added,x.total],[1,2]);
 assert.deepEqual(x.ledger.runs.map(r=>r.started_at),[b.started_at,a.started_at]);
 assert.equal(JSON.stringify({ledger,incoming}),before);
});
test('second reconciliation is idempotent',()=>{
 const x=reconcileReceipts(base(),[b]);
 const y=reconcileReceipts(x.ledger,[b]);
 assert.deepEqual([y.added,y.alreadyRecorded,y.total],[0,1,2]);
 assert.deepEqual(y.ledger,x.ledger);
});
test('semantically identical receipts with reordered properties are duplicates',()=>{
 const reverse=Object.fromEntries(Object.entries(a).reverse());
 assert.deepEqual([reconcileReceipts(base(),[reverse]).added,reconcileReceipts(base(),[reverse]).alreadyRecorded],[0,1]);
});
test('conflicting same-key receipt is rejected',()=>assert.throws(()=>reconcileReceipts(base(),[{...a,result:'success'}]),/Conflicting receipt/));
test('conflicting duplicate pending receipt is rejected',()=>assert.throws(()=>reconcileReceipts(base(),[b,{...b,next_action:'Different'}]),/Conflicting receipt/));
test('duplicate canonical receipt is rejected',()=>assert.throws(()=>reconcileReceipts({...base(),runs:[a,a]},[]),/Duplicate canonical/));
test('rejects invalid hours, date, result and secret-like text',()=>{
 for(const bad of [{...b,within_operating_hours:false},{...b,started_at:'2026-10-26T13:02:11-04:00'},{...b,result:'unknown'},{...b,progress:['github_pat_'+'x'.repeat(24)]}])assert.throws(()=>validateReceipt(bad));
});
test('accepts historical no-op receipt with bounded progress description',()=>{
 const r={started_at:'2026-10-23T11:58:00-04:00',source:'scheduled',within_operating_hours:false,progress:['Skipped project work.'],next_action:'Resume at noon.',result:'no-op-outside-hours',recovered_world:{version:null,save_schema:null,verified_head:null}};
 assert.equal(validateReceipt(r),true);
});
test('rejects outside-hours scheduled work and mismatched verified head',()=>{
 assert.throws(()=>validateReceipt({...b,started_at:'2026-10-23T11:58:00-04:00',within_operating_hours:false,result:'success'}));
 assert.throws(()=>validateReceipt({...b,recovered_world:{...world,verified_head:'short'}}));
});
test('rejects invalid ledger shape and incoming type',()=>{
 assert.throws(()=>reconcileReceipts({format:'unknown',runs:[]},[]));
 assert.throws(()=>reconcileReceipts(base(),{}));
});
