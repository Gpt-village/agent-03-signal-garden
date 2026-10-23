/**
 * Reconcile archived agent-03 run receipts into a local ledger.
 * Pure merge API + explicit --write CLI; never contacts GitHub or handles credentials.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {isDeepStrictEqual} from 'node:util';

const SOURCES=new Set(['scheduled','shutdown','watchdog-recovery','human-announced-side-quest-bootstrap']);
const RESULTS=new Set(['success','partial','no-op-outside-hours','failure']);
const SECRET_PATTERNS=[/ghp_[A-Za-z0-9]{20,}/,/github_pat_[A-Za-z0-9_]{20,}/,/sk-[A-Za-z0-9_-]{20,}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/];
const fail=(msg)=>{throw new Error(msg);};
const key=(r)=>`${r.started_at}|${r.source}`;

export function validateReceipt(r){
  if(!r||typeof r!=='object'||Array.isArray(r))fail('Receipt must be an object');
  if(typeof r.started_at!=='string'||!/^2026-10-\d\dT\d\d:\d\d:\d\d-04:00$/.test(r.started_at)||!Number.isFinite(Date.parse(r.started_at)))fail('Invalid Eastern receipt timestamp');
  if(!SOURCES.has(r.source)||!RESULTS.has(r.result))fail('Unrecognized source or result');
  if(typeof r.within_operating_hours!=='boolean')fail('Missing hours flag');
  const time=Number(r.started_at.slice(11,13))*60+Number(r.started_at.slice(14,16));
  const date=Number(r.started_at.slice(8,10));
  if(date<19||date>25||r.within_operating_hours!==(time>=720&&time<1200))fail('Incorrect challenge date or operating-hours flag');
  if(r.source==='scheduled'&&!r.within_operating_hours&&r.result!=='no-op-outside-hours')fail('Out-of-hours scheduled receipt must be no-op');
  if(!Array.isArray(r.progress)||!r.progress.every(x=>typeof x==='string')||typeof r.next_action!=='string'||!r.next_action.trim())fail('Missing progress or next action');
  if(r.recovered_world!=null){
    const w=r.recovered_world;
    const unknown=!r.within_operating_hours&&w.version===null&&w.save_schema===null&&w.verified_head===null;
    if(!unknown&&(!/^\d+\.\d+$/.test(w.version)||!Number.isInteger(w.save_schema)||w.save_schema<1||!/^[0-9a-f]{40}$/.test(w.verified_head)))fail('Invalid recovered version/schema/head');
  }
  if(r.recovered_canonical_head!==undefined&&!/^[0-9a-f]{40}$/.test(r.recovered_canonical_head))fail('Invalid recovered canonical head');
  if(SECRET_PATTERNS.some(re=>re.test(JSON.stringify(r))))fail('Potential credential-like content');
  return true;
}

export function reconcileReceipts(ledger,incoming){
  if(!ledger||ledger.format!=='gpt-village-persistence-run-log/v1'||ledger.agent!=='agent-03'||!Array.isArray(ledger.runs))fail('Invalid canonical ledger');
  if(!Array.isArray(incoming))fail('Incoming receipts must be an array');
  const known=new Map();
  for(const r of ledger.runs){
    validateReceipt(r);
    if(known.has(key(r)))fail(`Duplicate canonical receipt: ${key(r)}`);
    known.set(key(r),r);
  }
  let added=0,alreadyRecorded=0;
  for(const r of incoming){
    validateReceipt(r);
    const k=key(r);
    if(known.has(k)){
      if(!isDeepStrictEqual(known.get(k),r))fail(`Conflicting receipt: ${k}`);
      alreadyRecorded++;
    }else{known.set(k,r);added++;}
  }
  const runs=[...known.values()].sort((a,b)=>Date.parse(a.started_at)-Date.parse(b.started_at)||key(a).localeCompare(key(b)));
  return {ledger:{...ledger,runs},added,alreadyRecorded,total:runs.length};
}

function cli(){
  const [ledgerFile,incomingFile,flag]=process.argv.slice(2);
  if(!ledgerFile||!incomingFile||(flag&&flag!=='--write'))fail('Usage: node persistence/reconcile-receipts.mjs ledger.json incoming.json [--write]');
  const before=fs.readFileSync(ledgerFile,'utf8');
  const ledger=JSON.parse(before);
  const parsed=JSON.parse(fs.readFileSync(incomingFile,'utf8'));
  const incoming=Array.isArray(parsed)?parsed:Array.isArray(parsed.runs)?parsed.runs:[parsed];
  const merged=reconcileReceipts(ledger,incoming);
  if(flag==='--write'&&merged.added){
    if(fs.readFileSync(ledgerFile,'utf8')!==before)fail('Ledger changed since read; refusing to overwrite');
    const tmp=path.join(path.dirname(ledgerFile),`.${path.basename(ledgerFile)}.${process.pid}.tmp`);
    try{
      fs.writeFileSync(tmp,JSON.stringify(merged.ledger,null,2)+'\n',{flag:'wx',mode:0o600});
      fs.renameSync(tmp,ledgerFile);
    }finally{try{fs.unlinkSync(tmp);}catch(e){if(e.code!=='ENOENT')throw e;}}
  }
  console.log(JSON.stringify({mode:flag==='--write'?'write':'dry-run',added:merged.added,alreadyRecorded:merged.alreadyRecorded,total:merged.total}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))cli();
