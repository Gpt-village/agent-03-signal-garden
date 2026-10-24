import assert from "node:assert/strict";
import test from "node:test";
import { selectedRouteReciprocityLens as lens } from "../selected-route-reciprocity-lens.mjs";

const row = (id, name, incoming=[]) => ({id,name,incoming});
const entry = (from, source, type) => ({from,source,type});

test("unselected and missing island states are clear", () => {
  const rows=[row(0,"A")];
  assert.match(lens(rows,null,3),/Select an island/);
  assert.match(lens(rows,9,3),/no longer available/);
});
test("no traffic is explicitly quiet", () => {
  assert.equal(lens([row(0,"A"),row(1,"B")],0,3),
    "Cycle 3 route reciprocity for A: no planned traffic involving this island.");
});
test("a mutual pair requires both directed next-cycle transfers", () => {
  const rows=[row(0,"A",[entry(1,"B","memory")]),row(1,"B",[entry(0,"A","life")])];
  const text=lens(rows,0,3);
  assert.match(text,/1 mutual pair, 0 outbound-only pairs, 0 inbound-only pairs/);
  assert.match(text,/B: two-way \(send life; receive memory\)/);
  assert.match(lens(rows,1,3),/A: two-way \(send memory; receive life\)/);
});
test("outbound-only and inbound-only pairs are not mislabeled as reciprocal", () => {
  const rows=[row(0,"A",[entry(2,"C","strange")]),row(1,"B",[entry(0,"A","life")]),row(2,"C")];
  const text=lens(rows,0,4);
  assert.match(text,/0 mutual pairs, 1 outbound-only pair, 1 inbound-only pair/);
  assert.match(text,/B: one-way out \(send life\)/);
  assert.match(text,/C: one-way in \(receive strange\)/);
});
test("mixed traffic is grouped by partner and ordered by stable island id", () => {
  const rows=[
    row(3,"D",[entry(0,"A","strange")]),
    row(2,"C"),
    row(0,"A",[entry(2,"C","life"),entry(1,"B","memory")]),
    row(1,"B",[entry(0,"A","life")])
  ];
  const text=lens(rows,0,5);
  assert.match(text,/1 mutual pair, 1 outbound-only pair, 1 inbound-only pair/);
  assert.ok(text.indexOf("B: two-way")<text.indexOf("C: one-way in"));
  assert.ok(text.indexOf("C: one-way in")<text.indexOf("D: one-way out"));
});
test("rendered content is plain text, including imported names", () => {
  const name='<img src=x onerror=alert(1)>';
  const rows=[row(0,name,[entry(1,"B","life")]),row(1,"B",[entry(0,name,"memory")])];
  const text=lens(rows,0,6);
  assert.ok(text.includes(name));
  assert.match(text,/B: two-way/);
});
test("projection never mutates radar rows or their nested entries", () => {
  const rows=[row(0,"A",[entry(1,"B","memory")]),row(1,"B",[entry(0,"A","life")])];
  const before=JSON.stringify(rows);
  lens(rows,0,7);
  assert.equal(JSON.stringify(rows),before);
});
test("self-transfers do not create spurious partner relationships", () => {
  const rows=[row(0,"A",[entry(0,"A","life")]),row(1,"B")];
  assert.match(lens(rows,0,8),/no planned traffic involving this island/);
});
