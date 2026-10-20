import assert from "node:assert/strict";
import fs from "node:fs";

const checkpointPath="state/agent-03-checkpoint.json";
const ledgerPath="state/persistence-runs.json";
const indexPath="index.html";
const changelogPath="CHANGELOG.md";
const dashboardPath="persistence/index.html";

const checkpoint=JSON.parse(fs.readFileSync(checkpointPath,"utf8"));
const ledger=JSON.parse(fs.readFileSync(ledgerPath,"utf8"));
const index=fs.readFileSync(indexPath,"utf8");
const changelog=fs.readFileSync(changelogPath,"utf8");
const dashboard=fs.readFileSync(dashboardPath,"utf8");

assert.equal(checkpoint.format,"gpt-village-agent-checkpoint/v1");
assert.equal(checkpoint.agent,"agent-03");
assert.equal(ledger.format,"gpt-village-persistence-run-log/v1");
assert.equal(ledger.agent,"agent-03");

const version=(index.match(/APP_VERSION="([^"]+)"/)||[])[1];
const schema=Number((index.match(/SAVE_SCHEMA=(\d+)/)||[])[1]);
assert.ok(version,"index should expose APP_VERSION");
assert.ok(Number.isInteger(schema)&&schema>0,"index should expose SAVE_SCHEMA");
assert.equal(checkpoint.world.app_version,version,"checkpoint world version should match canonical app");
assert.equal(checkpoint.world.save_schema,schema,"checkpoint save schema should match canonical app");

assert.equal(checkpoint.operating_window.timezone,"America/New_York");
assert.equal(checkpoint.operating_window.start,"12:00");
assert.equal(checkpoint.operating_window.stop,"20:00");
assert.equal(checkpoint.operating_window.challenge_end,"2026-10-25");
assert.equal(checkpoint.persistence_side_quest.scheduled_restarts,true);
assert.match(checkpoint.persistence_side_quest.cadence,/12:00.*19:00/);

assert.equal(checkpoint.release_metadata.needs_update,false,"checkpoint should not claim stale release metadata after release");
assert.ok(changelog.includes("## v"+version+" "), "CHANGELOG should contain current canonical version");

assert.ok(Array.isArray(ledger.runs)&&ledger.runs.length>=1,"persistence ledger should contain at least one run receipt");
for(const run of ledger.runs){
  assert.equal(typeof run.started_at,"string");
  assert.ok(["scheduled","human-announced-side-quest-bootstrap"].includes(run.source),"run source should be bounded");
  assert.equal(typeof run.within_operating_hours,"boolean");
  assert.ok(["success","partial","no-op-outside-hours","failure"].includes(run.result),"run result should be bounded");
  assert.ok(Array.isArray(run.progress),"run progress should be an array");
  if(run.within_operating_hours){
    const m=run.started_at.match(/T(\d{2}):(\d{2}):\d{2}-04:00$/);
    assert.ok(m,"in-hours receipts should use explicit Eastern offset during challenge week");
    const minutes=Number(m[1])*60+Number(m[2]);
    assert.ok(minutes>=12*60&&minutes<20*60,"in-hours receipt must start between 12:00 and before 20:00 Eastern");
  }
}

assert.ok(dashboard.includes("../state/agent-03-checkpoint.json"));
assert.ok(dashboard.includes("../state/persistence-runs.json"));
assert.ok(dashboard.includes("does not expose secrets"));

const combined=[
  fs.readFileSync(checkpointPath,"utf8"),
  fs.readFileSync(ledgerPath,"utf8"),
  fs.readFileSync("docs/PERSISTENCE.md","utf8"),
  dashboard
].join("\n");

const forbidden=[
  /ghp_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /sk-[A-Za-z0-9_-]{20,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/
];
for(const pattern of forbidden)assert.equal(pattern.test(combined),false,"persistence artifacts must not contain credential-like material");

console.log("agent-03 persistence side-quest checks passed.");
