/** Pure, conservative exact-head release gate. Does not deploy or publish. */
export const REQUIRED_WORKFLOWS = Object.freeze(['Verify Signal Garden','Browser smoke','pages build and deployment']);
export function evaluateReleaseGate({indexHtml,expectedVersion,expectedSchema,gameTestHead,runs}) {
  const reasons=[];
  if(typeof indexHtml!=='string')reasons.push('Canonical HTML not supplied');
  const matches=typeof indexHtml==='string'?[...indexHtml.matchAll(/\bvar APP_VERSION="([^"]+)",SAVE_SCHEMA=(\d+);/g)]:[];
  if(matches.length!==1)reasons.push('Version/schema declaration missing or ambiguous');
  const match=matches.length===1?matches[0]:null;
  if(match&&(match[1]!==expectedVersion||Number(match[2])!==expectedSchema))reasons.push('Version/schema mismatch');
  if(typeof gameTestHead!=='string'||!/^[a-f0-9]{40}$/.test(gameTestHead))reasons.push('Expected game/test head must be a full SHA');
  if(!Array.isArray(runs))reasons.push('Workflow evidence missing');
  const evidence={};
  for(const name of REQUIRED_WORKFLOWS){
    const passed=Array.isArray(runs)&&runs.some(run=>run&&run.name===name&&run.head_sha===gameTestHead&&run.status==='completed'&&run.conclusion==='success');
    evidence[name]=Boolean(passed);
    if(!passed)reasons.push('No successful completed '+name+' for exact head');
  }
  return {ready:reasons.length===0,reasons,evidence,version:match?.[1]??null,schema:match?Number(match[2]):null};
}
