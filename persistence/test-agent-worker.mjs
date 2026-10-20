import test from "node:test";
import assert from "node:assert/strict";
import {easternParts,windowGate} from "./agent-worker.mjs";
test("strict Eastern operating window",()=>{
 assert.equal(windowGate(new Date("2026-10-20T11:59:59-04:00")).allowed,false);
 assert.equal(windowGate(new Date("2026-10-20T12:00:00-04:00")).allowed,true);
 assert.equal(windowGate(new Date("2026-10-20T19:58:00-04:00")).safeToStart,true);
 assert.equal(windowGate(new Date("2026-10-20T19:59:00-04:00")).safeToStart,false);
 assert.equal(windowGate(new Date("2026-10-20T20:00:00-04:00")).allowed,false);
 assert.equal(windowGate(new Date("2026-10-26T12:01:00-04:00")).allowed,false);
 assert.equal(easternParts(new Date("2026-10-20T16:00:00Z")).hour,12);
});