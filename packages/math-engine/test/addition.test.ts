import assert from "node:assert/strict";
import { createAdditionTask, getExpectedCarry, getExpectedResultDigit, validateAdditionStep, shouldTriggerRepair } from "../src/index.js";

const threeDigit = createAdditionTask(248, 176);
assert.equal(threeDigit.columnSums.ones, 14);
assert.equal(getExpectedResultDigit(threeDigit, "ones"), 4);
assert.equal(getExpectedCarry(threeDigit, "tens"), 1);
assert.equal(threeDigit.columnSums.tensIncludingCarry, 12);
assert.equal(getExpectedResultDigit(threeDigit, "tens"), 2);
assert.equal(getExpectedCarry(threeDigit, "hundreds"), 1);
assert.equal(threeDigit.columnSums.hundredsIncludingCarry, 4);
assert.equal(threeDigit.result, 424);

for (const [left, right, result] of [[48, 27, 75], [68, 15, 83], [137, 46, 183], [395, 287, 682]] as const) {
  const task = createAdditionTask(left, right);
  assert.equal(task.result, result);
  assert.equal(validateAdditionStep(task, "ones_digit", task.resultDigits.ones).correct, true);
  assert.equal(validateAdditionStep(task, "carry_to_tens", task.carries.toTens).correct, true);
  assert.equal(validateAdditionStep(task, "tens_digit", task.resultDigits.tens).correct, true);
  assert.equal(validateAdditionStep(task, "carry_to_hundreds", task.carries.toHundreds).correct, true);
  assert.equal(validateAdditionStep(task, "hundreds_sum", task.resultDigits.hundreds).correct, true);
}

const task = createAdditionTask(48, 27);
assert.equal(validateAdditionStep(task, "ones_digit", 15).mistake?.type, "wrote_full_ones_sum_in_ones_place");
assert.equal(validateAdditionStep(task, "carry_to_tens", 0).mistake?.type, "missing_carry");
assert.equal(validateAdditionStep(task, "tens_sum", 6).mistake?.type, "ignored_carry");
assert.equal(validateAdditionStep(task, "ones_digit", 5).correct, true);
assert.equal(validateAdditionStep(task, "carry_to_tens", "").correct, false);
assert.equal(shouldTriggerRepair([{ event_type: "incorrect_partial_step", step: "ones_digit", actual_value: 15 }, { event_type: "help_requested", step: "carry_to_tens", help_level: 2 }], "carry_to_tens"), true);

console.log("addition math-engine tests passed");
