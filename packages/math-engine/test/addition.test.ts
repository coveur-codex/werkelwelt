import assert from "node:assert/strict";
import { analyzeAdditionTask, createAdditionTask, generateAdditionSuggestion, getVisibleColumns, getVisibleWrittenAdditionState, getVisibleWrittenAdditionStateForMode, updateAdditionSkillStates, suggestNextAdditionTask } from "../src/index.js";

const cases = [
  [3,4,7,["ones"],false,0,false],
  [12,7,19,["tens","ones"],false,0,false],
  [12,8,20,["tens","ones"],true,1,false],
  [48,27,75,["tens","ones"],true,1,false],
  [95,17,112,["hundreds","tens","ones"],true,2,false],
  [105,24,129,["hundreds","tens","ones"],false,0,true],
  [395,287,682,["hundreds","tens","ones"],true,2,false],
  [999,1,1000,["thousands","hundreds","tens","ones"],true,3,false],
  [999999,1,1000000,["millions","hundred_thousands","ten_thousands","thousands","hundreds","tens","ones"],true,6,false],
] as const;

for (const [left,right,result,columns,hasCarry,carryCount,innerZero] of cases) {
  const task = createAdditionTask(left, right);
  const analysis = analyzeAdditionTask(left, right);
  assert.equal(task.result, result);
  assert.deepEqual(getVisibleColumns(task), columns);
  assert.deepEqual(analysis.visibleColumns, columns);
  assert.equal(analysis.hasCarry, hasCarry);
  assert.equal(analysis.carryCount, carryCount);
  assert.equal(analysis.containsInnerZero, innerZero);
  assert.ok(analysis.difficultyClass.startsWith("A"));
  assert.equal(columns.map((c)=>getVisibleWrittenAdditionState(task, 99).result[c]).join(""), String(result));
}

assert.equal(getVisibleWrittenAdditionState(createAdditionTask(12, 7), 99).result.hundreds, undefined);
assert.equal(getVisibleColumns(createAdditionTask(12, 8)).map((c)=>getVisibleWrittenAdditionState(createAdditionTask(12, 8), 99).result[c]).join(""), "20");
assert.equal(analyzeAdditionTask(999, 1).resultExpandsDigits, true);
assert.deepEqual(analyzeAdditionTask(999, 1).carryColumns, ["ones", "tens", "hundreds"]);

const zeroCarryPractice = createAdditionTask(176, 291);
const zeroCarryState = getVisibleWrittenAdditionStateForMode(zeroCarryPractice, "practice_mode", 0, { ones_digit: "7", carry_to_tens: "0", tens_digit: "6", carry_to_hundreds: "1", hundreds_sum: "4" });
assert.equal(zeroCarryState.result.ones, "7");
assert.equal(zeroCarryState.carries.tens, "0");
assert.equal(zeroCarryState.result.tens, "6");
assert.equal(zeroCarryState.carries.hundreds, "1");
assert.equal(zeroCarryState.result.hundreds, "4");

for (let i = 0; i < 30; i++) assert.ok(generateAdditionSuggestion().result <= 1_000_000);
for (let i = 0; i < 10; i++) { const carry = generateAdditionSuggestion({ requireCarry: true }); assert.equal(analyzeAdditionTask(carry.left, carry.right).hasCarry, true); }
const multi = generateAdditionSuggestion({ requireMultipleCarries: true });
assert.ok(analyzeAdditionTask(multi.left, multi.right).carryCount >= 2);
const avoided = generateAdditionSuggestion({ minDigits: 1, maxDigits: 1, allowedDifficultyClasses: ["A1_SINGLE_DIGIT_NO_CARRY"], avoidRecentTasks: [{ left: 3, right: 4 }] });
assert.notEqual(`${avoided.left}+${avoided.right}`, "3+4");
assert.equal(analyzeAdditionTask(avoided.left, avoided.right).difficultyClass, "A1_SINGLE_DIGIT_NO_CARRY");
const inner = generateAdditionSuggestion({ requireInnerZero: true, maxDigits: 3 });
assert.equal(analyzeAdditionTask(inner.left, inner.right).containsInnerZero, true);

let states = updateAdditionSkillStates([], [{ event_type: "correct_partial_step", step: "ones_sum" }]);
assert.equal(states.find(s=>s.skillKey==="add.ones_sum")?.status, "guided_success");
states = updateAdditionSkillStates(states, [{ event_type: "help_requested", step: "carry_to_tens" }]);
assert.equal(states.find(s=>s.skillKey==="add.ones_to_tens_carry")?.status, "with_help");
states = updateAdditionSkillStates(states, [{ event_type: "incorrect_partial_step", step: "carry_to_tens" }]);
assert.ok(["with_help", "needs_repair"].includes(states.find(s=>s.skillKey==="add.ones_to_tens_carry")!.status));
states = updateAdditionSkillStates(states, [{ event_type: "repair_step_completed", repair_type: "bundling_ones_to_tens" }, { event_type: "session_mood_reported", mood: "hard" }]);
assert.equal(states.find(s=>s.skillKey==="add.independent_practice")?.metadata_json?.lastMood, "hard");

const conservative = suggestNextAdditionTask([], [{ event_type: "help_requested" }, { event_type: "repair_step_completed" }, { event_type: "session_mood_reported", mood: "too_much" }]);
assert.ok(analyzeAdditionTask(conservative.left, conservative.right).visibleColumns.length <= 2);
const progress = suggestNextAdditionTask([], [{ event_type: "correct_partial_step" }, { event_type: "correct_partial_step" }, { event_type: "correct_partial_step" }, { event_type: "correct_partial_step" }]);
assert.ok(progress.result <= 1_000_000);
console.log("addition math-engine tests passed");
