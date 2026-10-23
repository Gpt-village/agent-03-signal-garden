/**
 * Conservative, read-only Signal Garden release gate.
 *
 * The caller MUST independently read candidateBlobs from the candidate ref
 * and verifiedBlobs from gameTestHead, the exact commit on which the three
 * required GitHub Actions workflows completed successfully. A docs-only
 * commit can safely sit above the verified head, but changing any game or
 * verification-harness blob invalidates the earlier workflow evidence.
 *
 * This function does not fetch GitHub, deploy, publish, or mutate inputs.
 */
import {createHash} from 'node:crypto';

export const REQUIRED_WORKFLOWS=Object.freeze([
  'Verify Signal Garden', 'Browser smoke', 'pages build and deployment'
]);
export const REQUIRED_BLOBS=Object.freeze([
  'index.html', 'tests/smoke.mjs', 'tests/browser-smoke.mjs'
]);
const SHA=/^[a-f0-9]{40}$/;

/** Git's UTF-8 blob SHA-1, used to bind the supplied HTML to its blob map. */
export function gitBlobSha(content){
  if(typeof content!=='string')throw new TypeError('Git blob content must be a string');
  const bytes=Buffer.from(content,'utf8');
  return createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
}

export function evaluateReleaseGate({indexHtml,expectedVersion,expectedSchema,gameTestHead,runs,candidateBlobs,verifiedBlobs}){
  const reasons=[];
  if(typeof indexHtml!=='string')reasons.push('Canonical HTML not supplied');
  const matches=typeof indexHtml==='string'?[...indexHtml.matchAll(/\bvar APP_VERSION="([^"]+)",SAVE_SCHEMA=(\d+);/g)]:[];
  if(matches.length!==1)reasons.push('Version/schema declaration missing or ambiguous');
  const match=matches.length===1?matches[0]:null;
  if(match&&(match[1]!==expectedVersion||Number(match[2])!==expectedSchema))reasons.push('Version/schema mismatch');
  if(typeof gameTestHead!=='string'||!SHA.test(gameTestHead))reasons.push('Expected game/test head must be a full SHA');
  if(!Array.isArray(runs))reasons.push('Workflow evidence missing');

  const evidence={};
  for(const name of REQUIRED_WORKFLOWS){
    const passed=Array.isArray(runs)&&runs.some(run=>run&&run.name===name&&run.head_sha===gameTestHead&&run.status==='completed'&&run.conclusion==='success');
    evidence[name]=Boolean(passed);
    if(!passed)reasons.push('No successful completed '+name+' for exact head');
  }

  for(const path of REQUIRED_BLOBS){
    const candidate=Object.hasOwn(candidateBlobs??{},path)?candidateBlobs[path]:undefined;
    const verified=Object.hasOwn(verifiedBlobs??{},path)?verifiedBlobs[path]:undefined;
    if(typeof candidate!=='string'||!SHA.test(candidate)||typeof verified!=='string'||!SHA.test(verified)){
      reasons.push('Missing or invalid candidate/verified blob SHA for '+path);
    }else if(candidate!==verified){
      reasons.push('Candidate code differs from verified head: '+path);
    }
  }

  const indexBlob=candidateBlobs?.['index.html'];
  if(typeof indexHtml==='string'&&typeof indexBlob==='string'&&SHA.test(indexBlob)&&gitBlobSha(indexHtml)!==indexBlob){
    reasons.push('Supplied HTML differs from candidate index.html blob');
  }

  return {ready:reasons.length===0,reasons,evidence,version:match?.[1]??null,schema:match?Number(match[2]):null};
}
