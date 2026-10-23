import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reconcileReceipts,validateReceipt} from '../persistence/reconcile-receipts.mjs';

const ledger=JSON.parse(fs.readFileSync('state/persistence-runs.json','utf8'));
const key=r=>r.started_at+'|'+r.source;

test('every canonical receipt passes strict validation',()=>{
  assert.ok(ledger.runs.length>=28,'historical backfill and recent receipts must remain present');
  for(const receipt of ledger.runs)assert.equal(validateReceipt(receipt),true);
});

test('canonical ledger has unique receipt keys and stable chronological order',()=>{
  const keys=ledger.runs.map(key);
  assert.equal(new Set(keys).size,keys.length,'duplicate receipt keys must never be committed');
  const sorted=[...ledger.runs].sort((a,b)=>Date.parse(a.started_at)-Date.parse(b.started_at)||key(a).localeCompare(key(b)));
  assert.deepEqual(ledger.runs,sorted,'ledger must remain chronological after reconciliation');
});

test('reconciling the full canonical history against itself is an exact no-op',()=>{
  const before=JSON.stringify(ledger);
  const result=reconcileReceipts(ledger,ledger.runs);
  assert.equal(result.added,0);
  assert.equal(result.alreadyRecorded,ledger.runs.length);
  assert.equal(result.total,ledger.runs.length);
  assert.deepEqual(result.ledger,ledger);
  assert.equal(JSON.stringify(ledger),before,'reconciliation must not mutate inputs');
});

test('repeated empty reconciliation is idempotent',()=>{
  const first=reconcileReceipts(ledger,[]);
  const second=reconcileReceipts(first.ledger,[]);
  assert.equal(first.added,0);
  assert.equal(second.added,0);
  assert.deepEqual(second.ledger,first.ledger);
});

test('last receipt can be replayed safely but conflicting replay fails closed',()=>{
  const last=ledger.runs.at(-1);
  const baseline={...ledger,runs:ledger.runs.slice(0,-1)};
  const once=reconcileReceipts(baseline,[last]);
  const twice=reconcileReceipts(once.ledger,[last]);
  assert.equal(once.added,1);
  assert.equal(twice.added,0);
  assert.deepEqual(twice.ledger,once.ledger);
  assert.throws(()=>reconcileReceipts(once.ledger,[{...last,next_action:'Conflicting replay must fail.'}]),/Conflicting receipt/);
});

test('out-of-hours scheduled receipts record only a no-op result',()=>{
  for(const receipt of ledger.runs.filter(r=>r.source==='scheduled'&&!r.within_operating_hours)){
    assert.equal(receipt.result,'no-op-outside-hours');
  }
});
