import assert from "node:assert/strict";
const f=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
export function allowRelay({now=new Date(),hop=0}={}){
 const p=Object.fromEntries(f.formatToParts(now).filter(x=>x.type!=="literal").map(x=>[x.type,x.value]));
 const date=p.year+"-"+p.month+"-"+p.day,minutes=+p.hour*60+ +p.minute;
 return {allowed:date>="2026-10-19"&&date<="2026-10-25"&&minutes>=720&&minutes<1198&&Number.isInteger(hop)&&hop>=0&&hop<=2,date,minutes,hop};
}
if(process.argv[2]==="test"){
 for(const [time,expected] of [["2026-10-20T12:00:00-04:00",true],["2026-10-20T11:59:00-04:00",false],["2026-10-20T20:00:00-04:00",false],["2026-10-26T12:30:00-04:00",false]]){
  assert.equal(allowRelay({now:new Date(time)}).allowed,expected);
 }
 assert.equal(allowRelay({now:new Date("2026-10-20T12:30:00-04:00"),hop:3}).allowed,false);
 console.log("agent-03 relay guard tests passed");
}else if(process.argv[2]==="gate"){
 const result=allowRelay({hop:Number(process.argv[3])});console.log(JSON.stringify(result));
 if(!result.allowed)process.exitCode=3;
}