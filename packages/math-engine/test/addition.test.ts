import assert from "node:assert/strict";
import { createAdditionTask, getAdditionBuildSteps, getBundlingState, getCurrentStepState, getExpectedCarry, getExpectedResultDigit, getVisibleColumns, getVisibleWrittenAdditionState, validateAdditionStep, shouldTriggerRepair } from "../src/index.js";

const threeDigit = createAdditionTask(248, 176);
assert.equal(threeDigit.columnSums.ones, 14);
assert.equal(threeDigit.columnSums.tensIncludingCarry, 12);
assert.equal(getExpectedCarry(threeDigit, "tens"), 1);
assert.equal(getExpectedCarry(threeDigit, "hundreds"), 1);
assert.equal(getExpectedResultDigit(threeDigit, "ones"), 4);
assert.equal(getExpectedResultDigit(threeDigit, "tens"), 2);
assert.equal(getExpectedResultDigit(threeDigit, "hundreds"), 4);

for (const [left, right, result] of [[16,25,41],[48,27,75],[248,176,424],[395,287,682]] as const) {
  const task = createAdditionTask(left, right);
  assert.equal(task.result, result);
  assert.equal(validateAdditionStep(task, "ones_digit", task.resultDigits.ones).correct, true);
  assert.equal(validateAdditionStep(task, "carry_to_tens", task.carries.toTens).correct, true);
  assert.equal(validateAdditionStep(task, "tens_digit", task.resultDigits.tens).correct, true);
  assert.equal(validateAdditionStep(task, "carry_to_hundreds", task.carries.toHundreds).correct, true);
  assert.equal(validateAdditionStep(task, "hundreds_sum", task.resultDigits.hundreds).correct, true);
}

const twoDigit = createAdditionTask(16, 25);
const twoDigitSteps = getAdditionBuildSteps(twoDigit);
assert.deepEqual(twoDigitSteps.map((step) => step.phase), ["ready", "first_number", "second_number", "ones_sum", "bundle_ones", "tens_sum", "bundle_tens", "result"]);
assert.equal(getVisibleWrittenAdditionState(twoDigit, 0).showLeft, false);
assert.equal(getVisibleWrittenAdditionState(twoDigit, 0).result.ones, undefined);
assert.equal(getVisibleWrittenAdditionState(twoDigit, 1).showLeft, true);
assert.equal(getVisibleWrittenAdditionState(twoDigit, 1).showRight, false);
assert.equal(getVisibleWrittenAdditionState(twoDigit, 2).showRight, true);
assert.equal(getVisibleWrittenAdditionState(twoDigit, 3).carries.tens, undefined);
assert.equal(getVisibleWrittenAdditionState(twoDigit, 4).result.ones, "1");
assert.equal(getVisibleWrittenAdditionState(twoDigit, 4).carries.tens, "1");
assert.equal(getVisibleWrittenAdditionState(twoDigit, 5).result.tens, undefined);
assert.equal(getVisibleWrittenAdditionState(twoDigit, 6).result.tens, "4");
assert.equal(getVisibleWrittenAdditionState(twoDigit, 7).result.hundreds, undefined);
assert.deepEqual(getVisibleColumns(createAdditionTask(12, 7)), ["tens", "ones"]);
assert.deepEqual(getVisibleColumns(createAdditionTask(3, 4)), ["ones"]);
assert.equal(getVisibleWrittenAdditionState(createAdditionTask(12, 7), 99).result.hundreds, undefined);
assert.equal(getVisibleColumns(createAdditionTask(12, 7)).map((c)=>getVisibleWrittenAdditionState(createAdditionTask(12, 7), 99).result[c]).join(""), "19");
assert.equal(getVisibleColumns(createAdditionTask(12, 8)).map((c)=>getVisibleWrittenAdditionState(createAdditionTask(12, 8), 99).result[c]).join(""), "20");
assert.deepEqual(getVisibleColumns(createAdditionTask(105, 24)), ["hundreds", "tens", "ones"]);
assert.deepEqual(getVisibleColumns(createAdditionTask(999, 1)), ["thousands", "hundreds", "tens", "ones"]);
assert.equal(getVisibleColumns(createAdditionTask(999, 1)).map((c)=>getVisibleWrittenAdditionState(createAdditionTask(999, 1), 99).result[c]).join(""), "1000");
assert.equal(getCurrentStepState(twoDigit, 4).revealed.ones_digit, "1");
assert.equal(getCurrentStepState(twoDigit, 4).revealed.carry_to_tens, "1");

const written248 = getVisibleWrittenAdditionState(threeDigit, 6);
assert.equal(written248.result.ones, "4");
assert.equal(written248.carries.tens, "1");
assert.equal(written248.result.tens, "2");
assert.equal(written248.carries.hundreds, "1");
assert.equal(getVisibleWrittenAdditionState(threeDigit, 7).result.hundreds, "4");

const task = createAdditionTask(48, 27);
assert.equal(validateAdditionStep(task, "ones_digit", 15).mistake?.type, "wrote_full_ones_sum_in_ones_place");
assert.equal(validateAdditionStep(task, "carry_to_tens", 0).mistake?.type, "missing_carry");
assert.equal(validateAdditionStep(task, "tens_sum", 6).mistake?.type, "ignored_carry");
assert.equal(validateAdditionStep(task, "ones_digit", 5).correct, true);
assert.equal(validateAdditionStep(task, "carry_to_tens", "").correct, false);
assert.equal(shouldTriggerRepair([{event_type:"incorrect_partial_step", step:"ones_digit"},{event_type:"help_requested", step:"carry_to_tens"}], "carry_to_tens"), true);
console.log("addition math-engine tests passed");

const bundle48 = getBundlingState(createAdditionTask(48, 27), 4, "ones");
assert.equal(bundle48?.bundledCount, 10);
assert.equal(bundle48?.remainingCount, 5);
assert.equal(bundle48?.to, "tens");
const bundle248ones = getBundlingState(threeDigit, 4, "ones");
assert.equal(bundle248ones?.remainingCount, 4);
const bundle248tens = getBundlingState(threeDigit, 6, "tens");
assert.equal(bundle248tens?.remainingCount, 2);
