import http from "node:http";
import fs from "node:fs";
import {spawn} from "node:child_process";
/* Agent-03 event-loop worker: no scheduled ChatGPT tasks or cron. */
const fmt=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"});
const state={agent:"agent-03",method:"hosted-process-without-scheduled-tasks",booted:new Date().toISOString(),runs:0,last:null,worker:"starting"};
let stopping=false;
export function easternParts(now=new Date()){
 const p=Object.fromEntries(fmt.formatToParts(now).filter(x=>x.type!=="literal").map(x=>[x.type,x.value]));
 return {date:p.year+"-"+p.month+"-"+p.day,hour:+p.hour,minute:+p.minute,second:+p.second};
}
export function windowGate(now=new Date()){
 const p=easternParts(now),s=p.hour*3600+p.minute*60+p.second;
 const active=p.date>="2026-10-19"&&p.date<="2026-10-25"&&s>=43200&&s<72000;
 const remainingMs=Math.max(0,(72000-s)*1000);
 return {allowed:active,safeToStart:active&&remainingMs>=90000,remainingMs,date:p.date,localTime:[p.hour,p.minute,p.second].map(n=>String(n).padStart(2,"0")).join(":")};
}
function runCheck(file,ms){
 return new Promise(resolve=>{
  const p=spawn(process.execPath,[file],{stdio:["ignore","pipe","pipe"]});
  let output="",done=false;
  const timeout=setTimeout(()=>{p.kill("SIGKILL");},ms);
  for(const stream of [p.stdout,p.stderr])stream.on("data",b=>{output=(output+b.toString()).slice(-1200);});
  p.once("close",code=>{if(done)return;done=true;clearTimeout(timeout);resolve({pass:code===0,code,output:output.trim()});});
  p.once("error",e=>{if(done)return;done=true;clearTimeout(timeout);resolve({pass:false,error:String(e)});});
 });
}
export async function auditOnce(now=new Date()){
 const gate=windowGate(now);
 if(!gate.safeToStart)return {skipped:true,gate};
 const outcome={started_at:new Date().toISOString(),checks:{},passed:false};
 try{
  const source=fs.readFileSync("index.html","utf8");
  const checkpoint=JSON.parse(fs.readFileSync("state/agent-03-checkpoint.json","utf8"));
  const version=(source.match(/APP_VERSION="([^"]+)"/)||[])[1];
  const schema=Number((source.match(/SAVE_SCHEMA=(\d+)/)||[])[1]);
  if(checkpoint.world.app_version!==version||checkpoint.world.save_schema!==schema)throw Error("Version/schema checkpoint drift");
  outcome.world={version,schema};
  for(const file of ["tests/smoke.mjs","tests/persistence-smoke.mjs"]){
   if(stopping||!windowGate().safeToStart){outcome.checks[file]={skipped:true};break;}
   outcome.checks[file]=await runCheck(file,Math.min(60000,windowGate().remainingMs-60000));
   if(!outcome.checks[file].pass)break;
  }
  outcome.passed=Object.values(outcome.checks).length===2&&Object.values(outcome.checks).every(x=>x.pass);
 }catch(e){outcome.error=String(e);}
 outcome.finished_at=new Date().toISOString();
 state.last=outcome;state.runs++;
 console.log(JSON.stringify({event:"audit",...outcome}));
 return outcome;
}
async function workLoop(){
 while(!stopping){
  if(windowGate().safeToStart){state.worker="auditing";await auditOnce();}
  else state.worker=windowGate().date>"2026-10-25"?"expired":"inactive";
  if(stopping)break;
  await new Promise(r=>setTimeout(r,windowGate().allowed?300000:60000));
 }
}
if(import.meta.url===new URL("file://"+process.argv[1]).href){
 const server=http.createServer((req,res)=>{
  const url=(req.url||"/").split("?")[0];
  if(!["/","/status","/healthz"].includes(url)){res.writeHead(404);res.end();return;}
  res.writeHead(200,{"content-type":"application/json; charset=utf-8","cache-control":"no-store"});
  res.end(JSON.stringify(url==="/healthz"?{ok:true,gate:windowGate()}:{state,gate:windowGate(),limitation:"Free Render services can spin down after 15 minutes of no incoming traffic."},null,2));
 });
 const stop=()=>{stopping=true;state.worker="shutting-down";server.close();};
 process.on("SIGTERM",stop);process.on("SIGINT",stop);
 server.listen(Number(process.env.PORT||10000),"0.0.0.0",()=>{console.log("agent-03 worker listening");void workLoop();});
}