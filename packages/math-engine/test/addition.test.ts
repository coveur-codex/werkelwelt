import assert from "node:assert/strict";
import { additionDifficultyOrder, analyzeAdditionTask, createAdditionTask, generateAdditionSuggestion, getVisibleColumns, getVisibleWrittenAdditionState, getVisibleWrittenAdditionStateForMode, updateAdditionSkillStates, validateAdditionStep, suggestAdditionTaskByDifficultyDirection, suggestNextAdditionTask } from "../src/index.js";

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

const largePractice = createAdditionTask(210164, 773148);
const largeRevealed = getVisibleWrittenAdditionStateForMode(largePractice, "practice_mode", 0, {
  ones_digit: "2",
  carry_to_tens: "1",
  tens_digit: "1",
  carry_to_hundreds: "1",
  hundreds_sum: "3",
  carry_to_thousands: "0",
  thousands_sum: "3",
  carry_to_ten_thousands: "0",
  ten_thousands_sum: "8",
  carry_to_hundred_thousands: "0",
  hundred_thousands_sum: "9",
});
assert.equal(validateAdditionStep(largePractice, "thousands_sum", 3).correct, true);
assert.equal(validateAdditionStep(largePractice, "ten_thousands_sum", 8).correct, true);
assert.equal(validateAdditionStep(largePractice, "hundred_thousands_sum", 9).correct, true);
assert.equal(largeRevealed.result.thousands, "3");
assert.equal(largeRevealed.result.ten_thousands, "8");
assert.equal(largeRevealed.result.hundred_thousands, "9");
assert.equal(largeRevealed.carries.thousands, "0");
assert.equal(largeRevealed.carries.ten_thousands, "0");
assert.equal(largeRevealed.carries.hundred_thousands, "0");


for (let i = 0; i < 30; i++) assert.ok(generateAdditionSuggestion().result <= 1_000_000);
for (let i = 0; i < 10; i++) { const carry = generateAdditionSuggestion({ requireCarry: true }); assert.equal(analyzeAdditionTask(carry.left, carry.right).hasCarry, true); }
const multi = generateAdditionSuggestion({ requireMultipleCarries: true });
assert.ok(analyzeAdditionTask(multi.left, multi.right).carryCount >= 2);
const avoided = generateAdditionSuggestion({ minDigits: 1, maxDigits: 1, allowedDifficultyClasses: ["A1_SINGLE_DIGIT_NO_CARRY"], avoidRecentTasks: [{ left: 3, right: 4 }] });
assert.notEqual(`${avoided.left}+${avoided.right}`, "3+4");
assert.equal(analyzeAdditionTask(avoided.left, avoided.right).difficultyClass, "A1_SINGLE_DIGIT_NO_CARRY");
const inner = generateAdditionSuggestion({ requireInnerZero: true, maxDigits: 3 });
assert.equal(analyzeAdditionTask(inner.left, inner.right).containsInnerZero, true);
for (const difficultyClass of additionDifficultyOrder) {
  const suggestion = generateAdditionSuggestion({ allowedDifficultyClasses: [difficultyClass] });
  assert.equal(analyzeAdditionTask(suggestion.left, suggestion.right).difficultyClass, difficultyClass);
}

const noCarryHundreds = generateAdditionSuggestion({ allowedDifficultyClasses: ["A6_THREE_DIGIT_NO_CARRY"], avoidRecentTasks: [{ left: 123, right: 456 }] });
assert.equal(analyzeAdditionTask(noCarryHundreds.left, noCarryHundreds.right).difficultyClass, "A6_THREE_DIGIT_NO_CARRY");
assert.notEqual(`${noCarryHundreds.left}+${noCarryHundreds.right}`, "123+456");
const hundredThousands = generateAdditionSuggestion({ allowedDifficultyClasses: ["A13_HUNDRED_THOUSANDS"], avoidRecentTasks: [{ left: 210164, right: 773148 }] });
assert.equal(analyzeAdditionTask(hundredThousands.left, hundredThousands.right).difficultyClass, "A13_HUNDRED_THOUSANDS");
assert.notEqual(`${hundredThousands.left}+${hundredThousands.right}`, "210164+773148");
const upToMillion = generateAdditionSuggestion({ allowedDifficultyClasses: ["A14_UP_TO_ONE_MILLION"], avoidRecentTasks: [{ left: 999999, right: 1 }] });
assert.equal(analyzeAdditionTask(upToMillion.left, upToMillion.right).difficultyClass, "A14_UP_TO_ONE_MILLION");
assert.notEqual(`${upToMillion.left}+${upToMillion.right}`, "999999+1");

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


assert.equal(additionDifficultyOrder[0], "A1_SINGLE_DIGIT_NO_CARRY");
assert.equal(additionDifficultyOrder.at(-1), "A14_UP_TO_ONE_MILLION");

const easier = suggestAdditionTaskByDifficultyDirection({ currentDifficultyClass: "A4_TWO_DIGIT_ONE_CARRY", direction: "easier", recentEvents: [], options: { avoidRecentTasks: [{ left: 48, right: 27 }] } });
assert.equal(easier.appliedDifficultyClass, "A3_TWO_DIGIT_NO_CARRY");
assert.ok(easier.task.result <= 1_000_000);
assert.notEqual(`${easier.task.left}+${easier.task.right}`, "48+27");

const similar = suggestAdditionTaskByDifficultyDirection({ currentDifficultyClass: "A4_TWO_DIGIT_ONE_CARRY", direction: "similar", recentEvents: [], options: { avoidRecentTasks: [{ left: 48, right: 27 }] } });
assert.equal(similar.appliedDifficultyClass, "A4_TWO_DIGIT_ONE_CARRY");
assert.notEqual(`${similar.task.left}+${similar.task.right}`, "48+27");

const harder = suggestAdditionTaskByDifficultyDirection({ currentDifficultyClass: "A1_SINGLE_DIGIT_NO_CARRY", direction: "harder", recentEvents: [{ event_type: "session_mood_reported", mood: "easy" }] });
assert.equal(harder.appliedDifficultyClass, "A2_SINGLE_DIGIT_WITH_CARRY");

const hardMood = suggestAdditionTaskByDifficultyDirection({ currentDifficultyClass: "A4_TWO_DIGIT_ONE_CARRY", direction: "harder", recentEvents: [{ event_type: "session_mood_reported", mood: "hard" }] });
assert.equal(hardMood.reason, "kept_similar_due_to_recent_help_or_mood");
assert.equal(hardMood.appliedDifficultyClass, "A4_TWO_DIGIT_ONE_CARRY");

const tooMuchMood = suggestAdditionTaskByDifficultyDirection({ currentDifficultyClass: "A4_TWO_DIGIT_ONE_CARRY", direction: "harder", recentEvents: [{ event_type: "session_mood_reported", mood: "too_much" }] });
assert.equal(tooMuchMood.reason, "kept_similar_due_to_recent_help_or_mood");

const repairBlocked = suggestAdditionTaskByDifficultyDirection({ currentDifficultyClass: "A4_TWO_DIGIT_ONE_CARRY", direction: "harder", childSkillStates: [{ skillKey: "add.ones_to_tens_carry", status: "needs_repair", evidenceCount: 1, successCount: 0, helpCount: 0, repairCount: 0 }], recentEvents: [] });
assert.equal(repairBlocked.reason, "kept_similar_due_to_recent_help_or_mood");

const stableAllowed = suggestAdditionTaskByDifficultyDirection({ currentDifficultyClass: "A4_TWO_DIGIT_ONE_CARRY", direction: "harder", childSkillStates: [{ skillKey: "add.ones_to_tens_carry", status: "stable", evidenceCount: 5, successCount: 5, helpCount: 0, repairCount: 0 }], recentEvents: [] });
assert.equal(stableAllowed.appliedDifficultyClass, "A5_TWO_DIGIT_RESULT_EXPANDS");
assert.ok(stableAllowed.task.result <= 1_000_000);

const cappedHarder = suggestAdditionTaskByDifficultyDirection({ currentDifficultyClass: "A14_UP_TO_ONE_MILLION", direction: "harder", recentEvents: [], options: { avoidRecentTasks: [{ left: 1000000, right: 0 }] } });
assert.equal(cappedHarder.appliedDifficultyClass, "A14_UP_TO_ONE_MILLION");
assert.ok(cappedHarder.task.result <= 1_000_000);
assert.notEqual(`${cappedHarder.task.left}+${cappedHarder.task.right}`, "1000000+0");

import { POINT_RULES, applyLearningEventToSession, calculateRewardEventsForLearningEvent, startWerkelSession, sumRewardPoints } from "../src/index.js";

const childProfileId = "child-test";
const sessionId = "session-test";
assert.equal(calculateRewardEventsForLearningEvent({ id: "le-1", childProfileId, sessionId, event_type: "correct_partial_step" })[0]?.points, POINT_RULES.CORRECT_PARTIAL_STEP);
assert.equal(calculateRewardEventsForLearningEvent({ id: "le-2", childProfileId, sessionId, event_type: "help_requested" })[0]?.points, POINT_RULES.HELP_USED);
assert.equal(calculateRewardEventsForLearningEvent({ id: "le-3", childProfileId, sessionId, event_type: "repair_step_completed" })[0]?.points, POINT_RULES.REPAIR_COMPLETED);
assert.equal(calculateRewardEventsForLearningEvent({ id: "le-4", childProfileId, sessionId, event_type: "task_completed" })[0]?.points, POINT_RULES.TASK_COMPLETED);
assert.equal(calculateRewardEventsForLearningEvent({ id: "le-5", childProfileId, sessionId, event_type: "session_mood_reported" })[0]?.points, POINT_RULES.MOOD_REPORTED);
assert.ok(calculateRewardEventsForLearningEvent({ id: "le-6", childProfileId, sessionId, event_type: "help_requested" }).every((reward) => reward.points >= 0));

let werkelSession = startWerkelSession({ id: sessionId, childProfileId, plannedTaskCount: 2, startedAt: "2026-01-01T00:00:00.000Z" });
assert.equal(werkelSession.status, "active");
werkelSession = applyLearningEventToSession(werkelSession, { childProfileId, sessionId, event_type: "task_completed", created_at: "2026-01-01T00:01:00.000Z" });
assert.equal(werkelSession.completedTaskCount, 1);
assert.equal(werkelSession.status, "active");
werkelSession = applyLearningEventToSession(werkelSession, { childProfileId, sessionId, event_type: "task_completed", created_at: "2026-01-01T00:02:00.000Z" });
assert.equal(werkelSession.status, "completed");
werkelSession = applyLearningEventToSession(startWerkelSession({ id: "mood-session", childProfileId }), { childProfileId, sessionId: "mood-session", event_type: "session_mood_reported", mood: "ok" } as any);
assert.equal(werkelSession.mood, "ok");
assert.equal(sumRewardPoints([{ points: 1 }, { points: 2 }, { points: -5 }]), 3);
