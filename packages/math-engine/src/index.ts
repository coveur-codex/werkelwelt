export type AdditionStep =
  | "ones_sum"
  | "ones_digit"
  | "carry_to_tens"
  | "tens_sum"
  | "tens_digit"
  | "carry_to_hundreds"
  | "hundreds_sum"
  | "carry_to_thousands"
  | "thousands_sum"
  | "carry_to_ten_thousands"
  | "ten_thousands_sum"
  | "carry_to_hundred_thousands"
  | "hundred_thousands_sum"
  | "carry_to_millions"
  | "millions_sum"
  | "final_result";

export type AdditionMode = "worked_example" | "guided_mode" | "practice_mode";

export interface AdditionTask {
  operation: "addition";
  left: number;
  right: number;
  result: number;
  leftDigits: PlaceDigits;
  rightDigits: PlaceDigits;
  columnSums: {
    ones: number;
    tensIncludingCarry: number;
    hundredsIncludingCarry: number;
  };
  carries: { toTens: number; toHundreds: number; toThousands: number; toTenThousands: number; toHundredThousands: number; toMillions: number };
  resultDigits: PlaceDigits;
}

export interface PlaceDigits { millions: number; hundred_thousands: number; ten_thousands: number; thousands: number; hundreds: number; tens: number; ones: number; }

export type AdditionBuildPhase = "ready" | "first_number" | "second_number" | "ones_sum" | "bundle_ones" | "tens_sum" | "bundle_tens" | "hundreds_sum" | "result";
export type PlaceValueColumn = "ones" | "tens" | "hundreds" | "thousands" | "ten_thousands" | "hundred_thousands" | "millions";
export type AdditionColumn = PlaceValueColumn;

export interface WorkedExampleStep {
  id: string;
  step?: AdditionStep;
  phase: AdditionBuildPhase;
  title: string;
  text: string;
  focus: "layout" | AdditionColumn | "result";
}

export interface VisibleWrittenAdditionState {
  showLeft: boolean;
  showRight: boolean;
  columns: AdditionColumn[];
  result: Partial<Record<AdditionColumn, string>>;
  carries: Partial<Record<Exclude<AdditionColumn, "ones">, string>>;
}

export type AdditionDifficultyClass =
  | "A1_SINGLE_DIGIT_NO_CARRY" | "A2_SINGLE_DIGIT_WITH_CARRY" | "A3_TWO_DIGIT_NO_CARRY" | "A4_TWO_DIGIT_ONE_CARRY" | "A5_TWO_DIGIT_RESULT_EXPANDS"
  | "A6_THREE_DIGIT_NO_CARRY" | "A7_THREE_DIGIT_ONE_CARRY" | "A8_THREE_DIGIT_MULTIPLE_CARRIES" | "A9_WITH_INNER_ZERO"
  | "A10_THOUSANDS_NO_CARRY" | "A11_THOUSANDS_WITH_CARRY" | "A12_TEN_THOUSANDS" | "A13_HUNDRED_THOUSANDS" | "A14_UP_TO_ONE_MILLION";

export type SkillStatus = "unseen" | "introduced" | "worked_example_seen" | "guided_success" | "with_help" | "independent_with_material" | "independent_without_material" | "stable" | "needs_repair";
export type SessionMood = "easy" | "ok" | "hard" | "too_much";
export type DifficultyDirection = "easier" | "similar" | "harder";
export type DifficultyApplicationReason = "allowed" | "already_easiest" | "kept_similar_due_to_recent_help_or_mood";

export interface AdditionTaskAnalysis { operation: "addition"; left: number; right: number; result: number; visibleColumns: PlaceValueColumn[]; maxColumn: PlaceValueColumn; hasCarry: boolean; carryColumns: PlaceValueColumn[]; carryCount: number; resultExpandsDigits: boolean; containsInnerZero: boolean; resultContainsZero: boolean; difficultyClass: AdditionDifficultyClass; }
export interface SkillState { skillKey: string; status: SkillStatus; evidenceCount: number; successCount: number; helpCount: number; repairCount: number; lastPracticedAt?: string; metadata_json?: Record<string, unknown>; }
export interface AdditionLearningEventLike { event_type?: string; type?: string; step?: string; repair_type?: string; repairType?: string; mood?: SessionMood; task_left?: number; task_right?: number; difficulty_class?: AdditionDifficultyClass | string; current_difficulty_class?: AdditionDifficultyClass | string; requested_direction?: DifficultyDirection | string; applied_difficulty_class?: AdditionDifficultyClass | string; reason?: string; created_at?: string; }

export interface AdditionSuggestionOptions {
  maxResult?: number;
  maxValue?: number;
  minDigits?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  maxDigits?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  currentDifficultyClass?: AdditionDifficultyClass;
  direction?: DifficultyDirection;
  allowedDifficultyClasses?: AdditionDifficultyClass[];
  preferCarry?: boolean;
  requireCarry?: boolean;
  requireMultipleCarries?: boolean;
  requireInnerZero?: boolean;
  maxVisibleColumns?: number;
  avoidRecentTasks?: Array<{ left: number; right: number }>;
  allowResultAbove999?: boolean;
}

export const ADDITION_MAX_RESULT = 1_000_000;

export const additionDifficultyOrder: AdditionDifficultyClass[] = [
  "A1_SINGLE_DIGIT_NO_CARRY",
  "A2_SINGLE_DIGIT_WITH_CARRY",
  "A3_TWO_DIGIT_NO_CARRY",
  "A4_TWO_DIGIT_ONE_CARRY",
  "A5_TWO_DIGIT_RESULT_EXPANDS",
  "A6_THREE_DIGIT_NO_CARRY",
  "A7_THREE_DIGIT_ONE_CARRY",
  "A8_THREE_DIGIT_MULTIPLE_CARRIES",
  "A9_WITH_INNER_ZERO",
  "A10_THOUSANDS_NO_CARRY",
  "A11_THOUSANDS_WITH_CARRY",
  "A12_TEN_THOUSANDS",
  "A13_HUNDRED_THOUSANDS",
  "A14_UP_TO_ONE_MILLION",
];

export function compareAdditionDifficulty(a: AdditionDifficultyClass, b: AdditionDifficultyClass): number { return additionDifficultyOrder.indexOf(a) - additionDifficultyOrder.indexOf(b); }
export function nextAdditionDifficultyClass(current: AdditionDifficultyClass, direction: DifficultyDirection): AdditionDifficultyClass {
  const index = Math.max(0, additionDifficultyOrder.indexOf(current));
  if (direction === "easier") return additionDifficultyOrder[Math.max(0, index - 1)]!;
  if (direction === "harder") return additionDifficultyOrder[Math.min(additionDifficultyOrder.length - 1, index + 1)]!;
  return current;
}

export interface VisiblePlaceValueState {
  showLeft: boolean;
  showRight: boolean;
  highlightBundledOnes: boolean;
  highlightBundledTens: boolean;
  showCarryToTens: boolean;
  showCarryToHundreds: boolean;
  showCarryToThousands: boolean;
  showCarryToTenThousands: boolean;
  showCarryToHundredThousands: boolean;
  showCarryToMillions: boolean;
  bundledOnes: BundlingState | null;
  bundledTens: BundlingState | null;
}

export interface BundlingState { from: AdditionColumn; to: AdditionColumn; bundledCount: 10; remainingCount: number; carryCount: 1; active: boolean; }

export interface ValidationResult {
  correct: boolean;
  expectedValue: number;
  actualValue: number | null;
  feedback: string;
  successEvent?: "correct_partial_step" | "task_completed" | undefined;
  mistake?: ReturnType<typeof analyzeAdditionMistake> | undefined;
}

export interface LearningEventLike { event_type?: string; type?: string; step?: string; help_level?: number; helpLevel?: number; actual_value?: number | null | undefined; actualValue?: number | null | undefined; }

export function createAdditionTask(left: number, right: number): AdditionTask {
  if (!isAdditionTaskInScope(left, right)) {
    throw new Error("ADDITION_TASK_OUT_OF_SCOPE");
  }
  const leftDigits = toDigits(left);
  const rightDigits = toDigits(right);
  const ones = leftDigits.ones + rightDigits.ones;
  const toTens = Math.floor(ones / 10);
  const tensIncludingCarry = leftDigits.tens + rightDigits.tens + toTens;
  const toHundreds = Math.floor(tensIncludingCarry / 10);
  const hundredsIncludingCarry = leftDigits.hundreds + rightDigits.hundreds + toHundreds;
  const result = left + right;
  const toThousands = Math.floor(hundredsIncludingCarry / 10);
  const resultDigits = toDigits(result);
  return { operation: "addition", left, right, result, leftDigits, rightDigits, columnSums: { ones, tensIncludingCarry, hundredsIncludingCarry }, carries: { toTens, toHundreds, toThousands, toTenThousands: carryFromColumn(left, right, "thousands"), toHundredThousands: carryFromColumn(left, right, "ten_thousands"), toMillions: carryFromColumn(left, right, "hundred_thousands") }, resultDigits };
}

export function isAdditionTaskInScope(left: number, right: number): boolean {
  return Number.isInteger(left) && Number.isInteger(right) && left >= 0 && right >= 0 && left <= ADDITION_MAX_RESULT && right <= ADDITION_MAX_RESULT && left + right <= ADDITION_MAX_RESULT;
}

export function getAdditionBuildSteps(task: AdditionTask): WorkedExampleStep[] {
  const hasHundredsWork = getVisibleColumns(task).includes("hundreds");
  const steps: WorkedExampleStep[] = [
    { id: "ready", phase: "ready", title: `${task.left} + ${task.right}`, text: "Wir bauen die Aufgabe jetzt Schritt für Schritt auf.", focus: "layout" },
    { id: "first-number", phase: "first_number", title: "Erste Zahl", text: `Zuerst legen wir die ${task.left}: ${task.leftDigits.hundreds ? `${task.leftDigits.hundreds} Hunderter, ` : ""}${task.leftDigits.tens} Zehner und ${task.leftDigits.ones} Einer.`, focus: "layout" },
    { id: "second-number", phase: "second_number", title: "Zweite Zahl", text: `Jetzt legen wir die ${task.right} dazu: ${task.rightDigits.hundreds ? `${task.rightDigits.hundreds} Hunderter, ` : ""}${task.rightDigits.tens} Zehner und ${task.rightDigits.ones} Einer.`, focus: "layout" },
    { id: "ones-sum", step: "ones_sum", phase: "ones_sum", title: "Einer rechnen", text: `Wir starten rechts bei den Einern. ${task.leftDigits.ones} Einer plus ${task.rightDigits.ones} Einer sind ${task.columnSums.ones} Einer.`, focus: "ones" },
  ];
  if (task.carries.toTens > 0) {
    steps.push({ id: "bundle-ones", step: "carry_to_tens", phase: "bundle_ones", title: "Einer bündeln", text: `10 Einer werden zu 1 Zehner. ${task.resultDigits.ones} Einer bleibt unten.`, focus: "ones" });
  } else {
    steps.push({ id: "ones-digit", step: "ones_digit", phase: "bundle_ones", title: "Einer eintragen", text: `${task.resultDigits.ones} Einer bleiben unten. Es gibt keinen Übertrag.`, focus: "ones" });
  }
  steps.push({ id: "tens-sum", step: "tens_sum", phase: "tens_sum", title: "Zehner rechnen", text: `Jetzt die Zehner: ${task.leftDigits.tens} plus ${task.rightDigits.tens} plus ${task.carries.toTens} sind ${task.columnSums.tensIncludingCarry} Zehner.`, focus: "tens" });
  if (task.carries.toHundreds > 0) {
    steps.push({ id: "bundle-tens", step: "carry_to_hundreds", phase: "bundle_tens", title: "Zehner bündeln", text: `10 Zehner werden zu 1 Hunderter. ${task.resultDigits.tens} Zehner bleiben unten.`, focus: "tens" });
  } else {
    steps.push({ id: "tens-digit", step: "tens_digit", phase: "bundle_tens", title: "Zehner eintragen", text: `${task.resultDigits.tens} Zehner kommen unten in die Zehnerstelle.`, focus: "tens" });
  }
  if (hasHundredsWork) steps.push({ id: "hundreds-sum", step: "hundreds_sum", phase: "hundreds_sum", title: "Hunderter rechnen", text: `Jetzt die Hunderter: ${task.leftDigits.hundreds} plus ${task.rightDigits.hundreds} plus ${task.carries.toHundreds} sind ${task.resultDigits.hundreds} Hunderter.`, focus: "hundreds" });
  steps.push({ id: "result", step: "final_result", phase: "result", title: "Ergebnis", text: `Fertig. Das Ergebnis ist ${task.result}.`, focus: "result" });
  return steps;
}

export const getAdditionSteps = getAdditionBuildSteps;

export function getVisibleWrittenAdditionStateForMode(task: AdditionTask, mode: AdditionMode, stepIndex = 0, revealed: Partial<Record<AdditionStep, string>> = {}): VisibleWrittenAdditionState {
  if (mode === "worked_example") return getVisibleWrittenAdditionState(task, stepIndex);
  const result: Partial<Record<AdditionColumn, string>> = {};
  const carries: Partial<Record<Exclude<AdditionColumn, "ones">, string>> = {};
  if (mode === "guided_mode" || mode === "practice_mode") {
    if (revealed.ones_digit !== undefined) result.ones = revealed.ones_digit;
    if (revealed.carry_to_tens !== undefined) carries.tens = revealed.carry_to_tens;
    if (revealed.tens_digit !== undefined) result.tens = revealed.tens_digit;
    if (revealed.carry_to_hundreds !== undefined) carries.hundreds = revealed.carry_to_hundreds;
    if (revealed.hundreds_sum !== undefined) result.hundreds = revealed.hundreds_sum;
    if (revealed.carry_to_thousands !== undefined) carries.thousands = revealed.carry_to_thousands;
    if (revealed.thousands_sum !== undefined) result.thousands = revealed.thousands_sum;
    if (revealed.carry_to_ten_thousands !== undefined) carries.ten_thousands = revealed.carry_to_ten_thousands;
    if (revealed.ten_thousands_sum !== undefined) result.ten_thousands = revealed.ten_thousands_sum;
    if (revealed.carry_to_hundred_thousands !== undefined) carries.hundred_thousands = revealed.carry_to_hundred_thousands;
    if (revealed.hundred_thousands_sum !== undefined) result.hundred_thousands = revealed.hundred_thousands_sum;
    if (revealed.carry_to_millions !== undefined) carries.millions = revealed.carry_to_millions;
    if (revealed.millions_sum !== undefined) result.millions = revealed.millions_sum;
    if (revealed.final_result !== undefined) {
      for (const column of getVisibleColumns(task)) result[column] = String(task.resultDigits[column]);
    }
  }
  return { showLeft: true, showRight: true, columns: getVisibleColumns(task), result, carries };
}

export function getVisiblePlaceValueStateForMode(task: AdditionTask, mode: AdditionMode, stepIndex = 0): VisiblePlaceValueState {
  if (mode === "worked_example") return getVisiblePlaceValueState(task, stepIndex);
  return { showLeft: true, showRight: true, highlightBundledOnes: false, highlightBundledTens: false, showCarryToTens: false, showCarryToHundreds: false, showCarryToThousands: false, showCarryToTenThousands: false, showCarryToHundredThousands: false, showCarryToMillions: false, bundledOnes: null, bundledTens: null };
}

export function getActiveColumnForMode(task: AdditionTask, mode: AdditionMode, stepIndex = 0, activePracticeStep?: AdditionStep): AdditionColumn | "result" | undefined {
  if (mode === "worked_example") return getActiveColumn(task, stepIndex);
  const step = mode === "practice_mode" ? activePracticeStep : guidedStepAt(task, stepIndex);
  return columnForAdditionStep(step);
}

export function generateAdditionSuggestion(options: AdditionSuggestionOptions = {}): Pick<AdditionTask, "operation" | "left" | "right" | "result"> {
  const directionClasses = difficultyClassesForDirection(options.currentDifficultyClass, options.direction);
  const effectiveAllowed = options.allowedDifficultyClasses ?? directionClasses;
  const currentOperandDigits = options.currentDifficultyClass ? operandDigitsForDifficulty(options.currentDifficultyClass) : undefined;
  const allowedDigitRange = effectiveAllowed?.length ? digitRangeForDifficultyClasses(effectiveAllowed) : undefined;
  const maxResult = Math.min(options.maxResult ?? (options.allowResultAbove999 ? 1000 : ADDITION_MAX_RESULT), ADDITION_MAX_RESULT);
  const minDigits = options.minDigits ?? allowedDigitRange?.min ?? (currentOperandDigits ?? (options.direction === "easier" ? 1 : 2));
  const maxDigits = options.maxDigits ?? allowedDigitRange?.max ?? Math.min(7, Math.max(1, currentOperandDigits ?? 3) + (options.direction === "harder" ? 1 : 0)) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const minValue = minDigits <= 1 ? 0 : 10 ** (minDigits - 1);
  const maxByDigits = Math.min(10 ** maxDigits - 1, options.maxValue ?? maxResult, maxResult);
  const avoid = new Set((options.avoidRecentTasks ?? []).map((t) => `${t.left}+${t.right}`));
  const preferCarry = options.preferCarry ?? options.direction !== "easier";
  const matches = (left: number, right: number) => {
    if (!isAdditionTaskInScope(left, right) || left + right > maxResult) return false;
    const analysis = analyzeAdditionTask(left, right);
    if (avoid.has(`${left}+${right}`) || avoid.has(`${right}+${left}`)) return false;
    if (options.requireCarry && !analysis.hasCarry) return false;
    if (options.requireMultipleCarries && analysis.carryCount < 2) return false;
    if (options.requireInnerZero && !analysis.containsInnerZero) return false;
    if (options.maxVisibleColumns && analysis.visibleColumns.length > options.maxVisibleColumns) return false;
    if (effectiveAllowed?.length && !effectiveAllowed.includes(analysis.difficultyClass)) return false;
    return true;
  };
  for (let i = 0; i < 2500; i++) {
    const left = randomInt(minValue, maxByDigits);
    const right = randomInt(0, Math.min(maxByDigits, maxResult - left));
    if (matches(left, right) && (!preferCarry || Math.random() < 0.25 || analyzeAdditionTask(left, right).hasCarry)) return { operation: "addition", left, right, result: left + right };
  }
  for (const difficultyClass of effectiveAllowed ?? []) {
    const candidate = generateCandidateForAdditionDifficulty(difficultyClass, matches);
    if (candidate) return candidate;
  }
  const exhaustiveLimit = 100_000;
  let checked = 0;
  for (let left = minValue; left <= maxByDigits && checked < exhaustiveLimit; left++) {
    for (let right = 0; right <= Math.min(maxByDigits, maxResult - left) && checked < exhaustiveLimit; right++, checked++) {
      if (matches(left, right)) return { operation: "addition", left, right, result: left + right };
    }
  }
  throw new Error("NO_ADDITION_SUGGESTION_IN_SCOPE");
}

function generateCandidateForAdditionDifficulty(difficultyClass: AdditionDifficultyClass, matches: (left: number, right: number) => boolean): Pick<AdditionTask, "operation" | "left" | "right" | "result"> | undefined {
  for (let i = 0; i < 1000; i++) {
    const [left, right] = randomOperandsForDifficulty(difficultyClass);
    if (matches(left, right)) return { operation: "addition", left, right, result: left + right };
  }
  for (const [left, right] of fixedOperandsForDifficulty(difficultyClass)) {
    if (matches(left, right)) return { operation: "addition", left, right, result: left + right };
  }
  return undefined;
}

function randomOperandsForDifficulty(difficultyClass: AdditionDifficultyClass): [number, number] {
  switch (difficultyClass) {
    case "A1_SINGLE_DIGIT_NO_CARRY": { const left = randomInt(0, 9); return [left, randomInt(0, 9 - left)]; }
    case "A2_SINGLE_DIGIT_WITH_CARRY": { const left = randomInt(1, 9); return [left, randomInt(Math.max(10 - left, 1), 9)]; }
    case "A3_TWO_DIGIT_NO_CARRY": return [randomNoCarryNumber(2), randomNoCarryNumber(2)];
    case "A4_TWO_DIGIT_ONE_CARRY": return [randomInt(10, 89), randomInt(10, 89)];
    case "A5_TWO_DIGIT_RESULT_EXPANDS": { const left = randomInt(50, 99); return [left, randomInt(Math.max(100 - left, 10), 99)]; }
    case "A6_THREE_DIGIT_NO_CARRY": return [randomNoCarryNumber(3), randomNoCarryNumber(3)];
    case "A7_THREE_DIGIT_ONE_CARRY": return [randomInt(100, 899), randomInt(100, 899)];
    case "A8_THREE_DIGIT_MULTIPLE_CARRIES": return [randomInt(500, 999), randomInt(500, 999)];
    case "A9_WITH_INNER_ZERO": return [randomInt(101, 909), randomInt(1, 90)];
    case "A10_THOUSANDS_NO_CARRY": return [randomNoCarryNumber(4), randomNoCarryNumber(4)];
    case "A11_THOUSANDS_WITH_CARRY": return [randomInt(1000, 8999), randomInt(1000, 8999)];
    case "A12_TEN_THOUSANDS": return [randomInt(10000, 89999), randomInt(0, 9999)];
    case "A13_HUNDRED_THOUSANDS": { const left = randomInt(100000, 899999); return [left, randomInt(0, Math.min(99999, 999999 - left))]; }
    case "A14_UP_TO_ONE_MILLION": { const left = randomInt(500000, 999999); return [left, randomInt(1000000 - left, 1000000 - left)]; }
  }
}

function fixedOperandsForDifficulty(difficultyClass: AdditionDifficultyClass): Array<[number, number]> {
  const examples: Record<AdditionDifficultyClass, Array<[number, number]>> = {
    A1_SINGLE_DIGIT_NO_CARRY: [[3, 4]], A2_SINGLE_DIGIT_WITH_CARRY: [[8, 7]], A3_TWO_DIGIT_NO_CARRY: [[23, 41]], A4_TWO_DIGIT_ONE_CARRY: [[48, 27]], A5_TWO_DIGIT_RESULT_EXPANDS: [[95, 17]],
    A6_THREE_DIGIT_NO_CARRY: [[123, 456]], A7_THREE_DIGIT_ONE_CARRY: [[176, 291]], A8_THREE_DIGIT_MULTIPLE_CARRIES: [[395, 287]], A9_WITH_INNER_ZERO: [[105, 24]],
    A10_THOUSANDS_NO_CARRY: [[1234, 4321]], A11_THOUSANDS_WITH_CARRY: [[5678, 2345]], A12_TEN_THOUSANDS: [[23456, 12345]], A13_HUNDRED_THOUSANDS: [[210164, 773148]], A14_UP_TO_ONE_MILLION: [[999999, 1]],
  };
  return examples[difficultyClass];
}

function randomNoCarryNumber(digits: 2 | 3 | 4): number {
  let value = randomInt(1, 4) * 10 ** (digits - 1);
  for (let place = digits - 2; place >= 0; place--) value += randomInt(0, 4) * 10 ** place;
  return value;
}

function difficultyClassesForDirection(current: AdditionDifficultyClass | undefined, direction: DifficultyDirection | undefined): AdditionDifficultyClass[] | undefined {
  if (!current || !direction) return undefined;
  const currentIndex = Math.max(0, additionDifficultyOrder.indexOf(current));
  if (direction === "easier") return [additionDifficultyOrder[Math.max(0, currentIndex - 1)]!, current];
  if (direction === "harder") return [current, additionDifficultyOrder[Math.min(additionDifficultyOrder.length - 1, currentIndex + 1)]!];
  return [current];
}

function digitRangeForDifficultyClasses(difficultyClasses: AdditionDifficultyClass[]): { min: 1 | 2 | 3 | 4 | 5 | 6 | 7; max: 1 | 2 | 3 | 4 | 5 | 6 | 7 } {
  const min = Math.min(...difficultyClasses.map(operandDigitsForDifficulty)) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const max = Math.max(...difficultyClasses.map((difficulty) => Math.max(operandDigitsForDifficulty(difficulty), visibleColumnsForDifficulty(difficulty)))) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  return { min, max };
}

function operandDigitsForDifficulty(difficulty: AdditionDifficultyClass): 1 | 2 | 3 | 4 | 5 | 6 {
  if (difficulty === "A1_SINGLE_DIGIT_NO_CARRY" || difficulty === "A2_SINGLE_DIGIT_WITH_CARRY") return 1;
  if (difficulty === "A3_TWO_DIGIT_NO_CARRY" || difficulty === "A4_TWO_DIGIT_ONE_CARRY" || difficulty === "A5_TWO_DIGIT_RESULT_EXPANDS") return 2;
  if (difficulty === "A6_THREE_DIGIT_NO_CARRY" || difficulty === "A7_THREE_DIGIT_ONE_CARRY" || difficulty === "A8_THREE_DIGIT_MULTIPLE_CARRIES" || difficulty === "A9_WITH_INNER_ZERO") return 3;
  if (difficulty === "A10_THOUSANDS_NO_CARRY" || difficulty === "A11_THOUSANDS_WITH_CARRY") return 4;
  if (difficulty === "A12_TEN_THOUSANDS") return 5;
  return 6;
}

function visibleColumnsForDifficulty(difficulty: AdditionDifficultyClass): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  if (difficulty === "A1_SINGLE_DIGIT_NO_CARRY" || difficulty === "A2_SINGLE_DIGIT_WITH_CARRY") return 1;
  if (difficulty === "A3_TWO_DIGIT_NO_CARRY" || difficulty === "A4_TWO_DIGIT_ONE_CARRY" || difficulty === "A5_TWO_DIGIT_RESULT_EXPANDS") return 2;
  if (difficulty === "A6_THREE_DIGIT_NO_CARRY" || difficulty === "A7_THREE_DIGIT_ONE_CARRY" || difficulty === "A8_THREE_DIGIT_MULTIPLE_CARRIES" || difficulty === "A9_WITH_INNER_ZERO") return 3;
  if (difficulty === "A10_THOUSANDS_NO_CARRY" || difficulty === "A11_THOUSANDS_WITH_CARRY") return 4;
  if (difficulty === "A12_TEN_THOUSANDS") return 5;
  if (difficulty === "A13_HUNDRED_THOUSANDS") return 6;
  return 7;
}

export function getVisibleWrittenAdditionState(task: AdditionTask, stepIndex: number): VisibleWrittenAdditionState {
  const phase = phaseAt(task, stepIndex);
  const result: Partial<Record<AdditionColumn, string>> = {};
  const carries: Partial<Record<Exclude<AdditionColumn, "ones">, string>> = {};
  if (["bundle_ones", "tens_sum", "bundle_tens", "hundreds_sum", "result"].includes(phase)) result.ones = String(task.resultDigits.ones);
  if (["bundle_ones", "tens_sum", "bundle_tens", "hundreds_sum", "result"].includes(phase) && task.carries.toTens > 0) carries.tens = String(task.carries.toTens);
  if (["bundle_tens", "hundreds_sum", "result"].includes(phase)) result.tens = String(task.resultDigits.tens);
  if (["bundle_tens", "hundreds_sum", "result"].includes(phase) && task.carries.toHundreds > 0) carries.hundreds = String(task.carries.toHundreds);
  if (["hundreds_sum", "result"].includes(phase) && getVisibleColumns(task).includes("hundreds")) result.hundreds = String(task.resultDigits.hundreds);
  if (["hundreds_sum", "result"].includes(phase) && task.carries.toThousands > 0) carries.thousands = String(task.carries.toThousands);
  if (phase === "result") { for (const column of getVisibleColumns(task)) result[column] = String(task.resultDigits[column]); }
  return { showLeft: phase !== "ready", showRight: !["ready", "first_number"].includes(phase), columns: getVisibleColumns(task), result, carries };
}

export function getVisiblePlaceValueState(task: AdditionTask, stepIndex: number): VisiblePlaceValueState {
  const phase = phaseAt(task, stepIndex);
  return { showLeft: phase !== "ready", showRight: !["ready", "first_number"].includes(phase), highlightBundledOnes: ["bundle_ones"].includes(phase), highlightBundledTens: ["bundle_tens"].includes(phase), showCarryToTens: ["bundle_ones", "tens_sum", "bundle_tens", "hundreds_sum", "result"].includes(phase) && task.carries.toTens > 0, showCarryToHundreds: ["bundle_tens", "hundreds_sum", "result"].includes(phase) && task.carries.toHundreds > 0, showCarryToThousands: ["hundreds_sum", "result"].includes(phase) && task.carries.toThousands > 0, showCarryToTenThousands: false, showCarryToHundredThousands: false, showCarryToMillions: false, bundledOnes: getBundlingState(task, stepIndex, "ones"), bundledTens: getBundlingState(task, stepIndex, "tens") };
}

export function getActiveColumn(task: AdditionTask, stepIndex: number): AdditionColumn | "result" | undefined {
  return getAdditionBuildSteps(task)[stepIndex]?.focus as AdditionColumn | "result" | undefined;
}

function phaseAt(task: AdditionTask, stepIndex: number): AdditionBuildPhase { return getAdditionBuildSteps(task)[Math.max(0, Math.min(stepIndex, getAdditionBuildSteps(task).length - 1))]?.phase ?? "ready"; }

export function expectedValueForStep(task: AdditionTask, step: AdditionStep): number {
  const map: Record<AdditionStep, number> = { ones_sum: task.columnSums.ones, ones_digit: task.resultDigits.ones, carry_to_tens: task.carries.toTens, tens_sum: task.columnSums.tensIncludingCarry, tens_digit: task.resultDigits.tens, carry_to_hundreds: task.carries.toHundreds, hundreds_sum: task.resultDigits.hundreds, carry_to_thousands: task.carries.toThousands, thousands_sum: task.resultDigits.thousands, carry_to_ten_thousands: task.carries.toTenThousands, ten_thousands_sum: task.resultDigits.ten_thousands, carry_to_hundred_thousands: task.carries.toHundredThousands, hundred_thousands_sum: task.resultDigits.hundred_thousands, carry_to_millions: task.carries.toMillions, millions_sum: task.resultDigits.millions, final_result: task.result };
  return map[step];
}

export function validateAdditionStep(task: AdditionTask, step: AdditionStep, value: string | number): ValidationResult {
  const actualValue = parseValue(value);
  const expectedValue = expectedValueForStep(task, step);
  const correct = actualValue === expectedValue;
  return { correct, expectedValue, actualValue, feedback: correct ? positiveFeedback(step) : gentleFeedback(task, step, actualValue), successEvent: correct ? (step === "final_result" ? "task_completed" : "correct_partial_step") : undefined, mistake: correct ? undefined : analyzeAdditionMistake(task, step, actualValue) };
}

export function analyzeAdditionMistake(task: AdditionTask, step: AdditionStep, value: number | null) {
  if (step === "ones_digit" && value === task.columnSums.ones && task.carries.toTens > 0) return { type: "wrote_full_ones_sum_in_ones_place", repairType: "bundling_ones_to_tens", message: `Schau dir die ${task.columnSums.ones} Einer noch einmal an: Nur die Einer-Ziffer kommt unten.` } as const;
  if (step === "carry_to_tens" && task.carries.toTens > 0 && (value === 0 || value === null)) return { type: "missing_carry", repairType: "bundling_ones_to_tens", message: "Der Übertrag fehlt noch. 10 Einer werden zu 1 Zehner." } as const;
  if (step === "tens_sum" && value === task.leftDigits.tens + task.rightDigits.tens && task.carries.toTens > 0) return { type: "ignored_carry", repairType: "bundling_ones_to_tens", message: "Die Zehner stimmen fast. Nimm den Übertrag noch dazu." } as const;
  return { type: "needs_gentle_retry", repairType: undefined, message: "Probier den Schritt noch einmal in Ruhe." } as const;
}

export function shouldTriggerRepair(events: LearningEventLike[], currentStep: AdditionStep): boolean {
  const relevant = events.filter((event) => (event.step === currentStep || event.step === "carry_to_tens" || event.step === "ones_digit") && (event.event_type === "incorrect_partial_step" || event.type === "incorrect_partial_step" || event.event_type === "help_requested" || event.type === "help_requested"));
  return relevant.length >= 2;
}

export const getAdditionWorkedExample = getAdditionSteps;

export function getCurrentStepState(task: AdditionTask, stepIndex: number): { revealed: Partial<Record<AdditionStep, string>>; step: WorkedExampleStep | undefined } {
  const written = getVisibleWrittenAdditionState(task, stepIndex);
  return {
    revealed: {
      ...(written.result.ones ? { ones_digit: written.result.ones } : {}),
      ...(written.carries.tens ? { carry_to_tens: written.carries.tens } : {}),
      ...(written.result.tens ? { tens_digit: written.result.tens } : {}),
      ...(written.carries.hundreds ? { carry_to_hundreds: written.carries.hundreds } : {}),
      ...(written.result.hundreds ? { hundreds_sum: written.result.hundreds } : {}),
    },
    step: getAdditionBuildSteps(task)[stepIndex],
  };
}

export function getExpectedCarry(task: AdditionTask, column: "tens" | "hundreds"): number { return column === "tens" ? task.carries.toTens : task.carries.toHundreds; }
export function getExpectedResultDigit(task: AdditionTask, column: "ones" | "tens" | "hundreds"): number { return task.resultDigits[column]; }

export function getVisibleColumns(task: AdditionTask): AdditionColumn[] {
  return analyzeAdditionTask(task.left, task.right).visibleColumns;
}

export function getBundlingState(task: AdditionTask, stepIndex: number, column?: "ones" | "tens"): BundlingState | null {
  const phase = phaseAt(task, stepIndex);
  if ((column === undefined || column === "ones") && task.carries.toTens > 0 && ["bundle_ones"].includes(phase)) return { from: "ones", to: "tens", bundledCount: 10, remainingCount: task.resultDigits.ones, carryCount: 1, active: true };
  if ((column === undefined || column === "tens") && task.carries.toHundreds > 0 && ["bundle_tens"].includes(phase)) return { from: "tens", to: "hundreds", bundledCount: 10, remainingCount: task.resultDigits.tens, carryCount: 1, active: true };
  return null;
}

const ORDERED_COLUMNS: PlaceValueColumn[] = ["millions", "hundred_thousands", "ten_thousands", "thousands", "hundreds", "tens", "ones"];
const ASC_COLUMNS: PlaceValueColumn[] = ["ones", "tens", "hundreds", "thousands", "ten_thousands", "hundred_thousands", "millions"];

export function analyzeAdditionTask(left: number, right: number): AdditionTaskAnalysis {
  if (!isAdditionTaskInScope(left, right)) throw new Error("ADDITION_TASK_OUT_OF_SCOPE");
  const result = left + right;
  const maxNumber = Math.max(left, right, result);
  const maxColumn = ASC_COLUMNS.slice().reverse().find((c) => maxNumber >= placeValue(c)) ?? "ones";
  const visibleColumns = ORDERED_COLUMNS.filter((c) => placeValue(c) <= placeValue(maxColumn));
  const carryColumns = ASC_COLUMNS.slice(0, -1).filter((c) => carryFromColumn(left, right, c) > 0);
  const digitsBefore = Math.max(digitCount(left), digitCount(right));
  const resultExpandsDigits = digitCount(result) > digitsBefore;
  const containsInnerZero = hasInnerZero(left) || hasInnerZero(right);
  const resultContainsZero = String(result).includes("0");
  return { operation: "addition", left, right, result, visibleColumns, maxColumn, hasCarry: carryColumns.length > 0, carryColumns, carryCount: carryColumns.length, resultExpandsDigits, containsInnerZero, resultContainsZero, difficultyClass: classifyAdditionDifficulty({ left, right, result, visibleColumns, maxColumn, hasCarry: carryColumns.length > 0, carryColumns, carryCount: carryColumns.length, resultExpandsDigits, containsInnerZero, resultContainsZero }) };
}

function classifyAdditionDifficulty(a: Omit<AdditionTaskAnalysis, "operation" | "difficultyClass">): AdditionDifficultyClass {
  const d = a.visibleColumns.length;
  if (a.result >= 1_000_000 || d >= 7) return "A14_UP_TO_ONE_MILLION";
  if (d >= 6) return "A13_HUNDRED_THOUSANDS";
  if (d >= 5) return "A12_TEN_THOUSANDS";
  if (d >= 4) return a.hasCarry ? "A11_THOUSANDS_WITH_CARRY" : "A10_THOUSANDS_NO_CARRY";
  if (a.containsInnerZero) return "A9_WITH_INNER_ZERO";
  if (a.left < 10 && a.right < 10) return a.hasCarry ? "A2_SINGLE_DIGIT_WITH_CARRY" : "A1_SINGLE_DIGIT_NO_CARRY";
  if (Math.max(a.left, a.right) < 100 && a.resultExpandsDigits) return "A5_TWO_DIGIT_RESULT_EXPANDS";
  if (d <= 1) return a.hasCarry ? "A2_SINGLE_DIGIT_WITH_CARRY" : "A1_SINGLE_DIGIT_NO_CARRY";
  if (d === 2) return a.resultExpandsDigits ? "A5_TWO_DIGIT_RESULT_EXPANDS" : a.carryCount === 1 ? "A4_TWO_DIGIT_ONE_CARRY" : "A3_TWO_DIGIT_NO_CARRY";
  if (a.carryCount > 1 || a.resultExpandsDigits) return "A8_THREE_DIGIT_MULTIPLE_CARRIES";
  return a.carryCount === 1 ? "A7_THREE_DIGIT_ONE_CARRY" : "A6_THREE_DIGIT_NO_CARRY";
}

export const ADDITION_SKILL_KEYS = ["add.place_alignment", "add.ones_sum", "add.ones_result_digit", "add.ones_to_tens_carry", "add.tens_sum_with_carry", "add.tens_result_digit", "add.tens_to_hundreds_carry", "add.hundreds_sum_with_carry", "add.multi_carry", "add.inner_zero", "add.result_reading", "add.independent_practice", "add.worked_example_usage", "add.help_usage", "add.thousands", "add.ten_thousands", "add.hundred_thousands", "add.million"] as const;

export function updateAdditionSkillStates(previousStates: SkillState[], learningEvents: AdditionLearningEventLike[]): SkillState[] {
  const map = new Map(previousStates.map((s) => [s.skillKey, { ...s }]));
  const ensure = (skillKey: string) => map.get(skillKey) ?? { skillKey, status: "unseen" as SkillStatus, evidenceCount: 0, successCount: 0, helpCount: 0, repairCount: 0 };
  for (const event of learningEvents) {
    const key = skillKeyForEvent(event); if (!key && event.event_type !== "session_mood_reported") continue;
    if (event.event_type === "session_mood_reported") { const s = ensure("add.independent_practice"); s.metadata_json = { ...s.metadata_json, lastMood: event.mood }; map.set(s.skillKey, s); continue; }
    const s = ensure(key!); s.evidenceCount++; s.lastPracticedAt = event.created_at ?? new Date().toISOString();
    if (event.event_type === "correct_partial_step" || event.type === "correct_partial_step") { s.successCount++; s.status = promoteStatus(s.status); }
    if (event.event_type === "help_requested" || event.type === "help_requested") { s.helpCount++; s.status = "with_help"; }
    if (event.event_type === "incorrect_partial_step" || event.type === "incorrect_partial_step") { s.status = s.helpCount > 0 ? "with_help" : "needs_repair"; }
    if (event.event_type === "repair_step_completed" || event.type === "repair_step_completed") { s.repairCount++; s.status = s.status === "needs_repair" ? "with_help" : "guided_success"; }
    map.set(s.skillKey, s);
  }
  return Array.from(map.values());
}

export function suggestNextAdditionTask(childSkillStates: SkillState[], recentEvents: AdditionLearningEventLike[], options: AdditionSuggestionOptions = {}) {
  const directional = options.direction && options.currentDifficultyClass ? suggestAdditionTaskByDifficultyDirection({ currentDifficultyClass: options.currentDifficultyClass, childSkillStates, recentEvents, direction: options.direction, options }) : undefined;
  if (directional) return directional.task;
  const helpOrRepair = recentEvents.filter((e) => e.event_type === "help_requested" || e.event_type === "repair_step_completed" || e.event_type === "incorrect_partial_step").length;
  const successes = recentEvents.filter((e) => e.event_type === "correct_partial_step").length;
  const mood = latestMood(recentEvents);
  const conservative = helpOrRepair >= 2 || mood === "hard" || mood === "too_much";
  const allowedDifficultyClasses = options.allowedDifficultyClasses ?? (conservative ? ["A3_TWO_DIGIT_NO_CARRY", "A4_TWO_DIGIT_ONE_CARRY"] : successes >= 4 ? ["A4_TWO_DIGIT_ONE_CARRY", "A5_TWO_DIGIT_RESULT_EXPANDS", "A6_THREE_DIGIT_NO_CARRY"] : ["A3_TWO_DIGIT_NO_CARRY", "A4_TWO_DIGIT_ONE_CARRY"]);
  return generateAdditionSuggestion({ ...options, allowedDifficultyClasses, preferCarry: !conservative, ...(conservative ? { maxVisibleColumns: 2 } : {}) });
}

export function suggestAdditionTaskByDifficultyDirection(input: { currentDifficultyClass: AdditionDifficultyClass; childSkillStates?: SkillState[]; recentEvents?: AdditionLearningEventLike[]; direction: DifficultyDirection; options?: AdditionSuggestionOptions; }): { task: Pick<AdditionTask, "operation" | "left" | "right" | "result">; appliedDifficultyClass: AdditionDifficultyClass; reason: DifficultyApplicationReason } {
  const { currentDifficultyClass, direction } = input;
  const recentEvents = input.recentEvents ?? [];
  const states = input.childSkillStates ?? [];
  const blocked = direction === "harder" && shouldKeepSimilarForSafety(states, recentEvents);
  const targetDirection = blocked ? "similar" : direction;
  const targetClass = nextAdditionDifficultyClass(currentDifficultyClass, targetDirection);
  const reason: DifficultyApplicationReason = blocked ? "kept_similar_due_to_recent_help_or_mood" : direction === "easier" && targetClass === currentDifficultyClass ? "already_easiest" : "allowed";
  const allowedDifficultyClasses = [targetClass];
  const task = generateAdditionSuggestion({ ...(input.options ?? {}), direction: targetDirection, currentDifficultyClass, allowedDifficultyClasses, maxResult: Math.min(input.options?.maxResult ?? ADDITION_MAX_RESULT, ADDITION_MAX_RESULT), preferCarry: targetDirection !== "easier" });
  return { task, appliedDifficultyClass: analyzeAdditionTask(task.left, task.right).difficultyClass, reason };
}

function shouldKeepSimilarForSafety(states: SkillState[], recentEvents: AdditionLearningEventLike[]): boolean {
  const mood = latestMood(recentEvents);
  if (mood === "hard" || mood === "too_much") return true;
  const recentHelp = recentEvents.filter((e) => e.event_type === "help_requested" || e.event_type === "repair_step_completed" || e.event_type === "incorrect_partial_step").length;
  if (recentHelp >= 2) return true;
  const central = new Set(["add.ones_to_tens_carry", "add.tens_sum_with_carry", "add.multi_carry"]);
  return states.some((s) => central.has(s.skillKey) && (s.status === "needs_repair" || s.status === "with_help"));
}

function latestMood(recentEvents: AdditionLearningEventLike[]): SessionMood | undefined { return recentEvents.find((e) => e.event_type === "session_mood_reported")?.mood; }

function skillKeyForEvent(event: AdditionLearningEventLike): string | undefined {
  const step = event.step;
  if (step === "ones_sum") return "add.ones_sum"; if (step === "ones_digit" || step === "ones_result_digit") return "add.ones_result_digit"; if (step === "carry_to_tens" || step === "ones_to_tens_carry") return "add.ones_to_tens_carry"; if (step === "tens_sum") return "add.tens_sum_with_carry"; if (step === "tens_digit") return "add.tens_result_digit"; if (step === "carry_to_hundreds") return "add.tens_to_hundreds_carry"; if (step === "hundreds_sum") return "add.hundreds_sum_with_carry"; if (event.repair_type === "bundling_ones_to_tens" || event.repairType === "bundling_ones_to_tens") return "add.ones_to_tens_carry"; return undefined;
}
function promoteStatus(status: SkillStatus): SkillStatus { return status === "stable" ? "stable" : status === "independent_without_material" ? "stable" : status === "independent_with_material" ? "independent_without_material" : status === "guided_success" ? "independent_with_material" : "guided_success"; }
function digitCount(n: number): number { return String(Math.max(0, n)).length; }
function hasInnerZero(n: number): boolean { return /^\d+0\d+$/.test(String(n)); }
function carryFromColumn(left: number, right: number, column: PlaceValueColumn): number { const value = placeValue(column); const next = value * 10; if (next > 1_000_0000) return 0; return Math.floor(((left % next) + (right % next)) / next); }

function guidedStepAt(task: AdditionTask, stepIndex: number): AdditionStep | undefined {
  return getAdditionBuildSteps(task)[stepIndex]?.step;
}
function columnForAdditionStep(step: AdditionStep | undefined): AdditionColumn | "result" | undefined {
  if (!step) return "ones";
  if (step === "ones_sum" || step === "ones_digit") return "ones";
  if (step === "carry_to_tens" || step === "tens_sum" || step === "tens_digit") return "tens";
  if (step === "carry_to_hundreds" || step === "hundreds_sum") return "hundreds";
  if (step === "carry_to_thousands" || step === "thousands_sum") return "thousands";
  if (step === "carry_to_ten_thousands" || step === "ten_thousands_sum") return "ten_thousands";
  if (step === "carry_to_hundred_thousands" || step === "hundred_thousands_sum") return "hundred_thousands";
  if (step === "carry_to_millions" || step === "millions_sum") return "millions";
  return "result";
}
function hasAnyCarry(left: number, right: number): boolean { return analyzeAdditionTask(left, right).hasCarry; }
function randomInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }

function placeValue(column: AdditionColumn): number { return ({ ones: 1, tens: 10, hundreds: 100, thousands: 1000, ten_thousands: 10000, hundred_thousands: 100000, millions: 1000000 })[column]; }
function toDigits(value: number): PlaceDigits { return { millions: Math.floor(value / 1000000), hundred_thousands: Math.floor((value % 1000000) / 100000), ten_thousands: Math.floor((value % 100000) / 10000), thousands: Math.floor((value % 10000) / 1000), hundreds: Math.floor((value % 1000) / 100), tens: Math.floor((value % 100) / 10), ones: value % 10 }; }
function parseValue(value: string | number): number | null { const parsed = typeof value === "number" ? value : Number(value.trim()); return Number.isInteger(parsed) ? parsed : null; }
function positiveFeedback(step: AdditionStep): string { return ({ ones_sum: "Du hast die Einer richtig gerechnet.", ones_digit: "Du hast die richtige Einerstelle benutzt.", carry_to_tens: "Du hast den Übertrag entdeckt.", tens_sum: "Du hast die Zehner mit Übertrag gerechnet.", tens_digit: "Du hast die Zehnerstelle richtig gefüllt.", carry_to_hundreds: "Du hast den Hunderter-Übertrag entdeckt.", hundreds_sum: "Du hast die Hunderter richtig gerechnet.", carry_to_thousands: "Du hast den Tausender-Übertrag entdeckt.", thousands_sum: "Du hast die Tausender richtig gerechnet.", carry_to_ten_thousands: "Du hast den Zehntausender-Übertrag entdeckt.", ten_thousands_sum: "Du hast die Zehntausender richtig gerechnet.", carry_to_hundred_thousands: "Du hast den Hunderttausender-Übertrag entdeckt.", hundred_thousands_sum: "Du hast die Hunderttausender richtig gerechnet.", carry_to_millions: "Du hast den Millionen-Übertrag entdeckt.", millions_sum: "Du hast die Millionen richtig gerechnet.", final_result: "Du hast das Ergebnis geschafft." })[step]; }
function gentleFeedback(task: AdditionTask, step: AdditionStep, value: number | null): string { return analyzeAdditionMistake(task, step, value).message; }

export type WerkelLearningEventType =
  | "session_started"
  | "task_started"
  | "mode_selected"
  | "correct_partial_step"
  | "incorrect_partial_step"
  | "help_requested"
  | "repair_started"
  | "repair_step_completed"
  | "task_completed"
  | "task_abandoned"
  | "points_awarded"
  | "session_mood_reported"
  | "session_completed";

export type RewardReason =
  | "task_started"
  | "correct_partial_step"
  | "carry_discovered"
  | "help_used"
  | "repair_completed"
  | "task_completed"
  | "improved_after_error"
  | "mood_reported";

export interface RewardEventInput {
  id?: string;
  childProfileId: string;
  sessionId?: string;
  learningEventId?: string;
  reason: RewardReason;
  points: number;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

export interface RewardEvent extends Required<Pick<RewardEventInput, "childProfileId" | "reason" | "points">> {
  id: string;
  sessionId?: string;
  learningEventId?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export const POINT_RULES = {
  TASK_STARTED: 1,
  CORRECT_PARTIAL_STEP: 1,
  CARRY_DISCOVERED: 1,
  HELP_USED: 1,
  REPAIR_COMPLETED: 2,
  TASK_COMPLETED: 2,
  IMPROVED_AFTER_ERROR: 1,
  MOOD_REPORTED: 1,
} as const;

export interface RewardableLearningEvent {
  id?: string;
  event_type?: string;
  type?: string;
  childProfileId?: string;
  child_profile_id?: string;
  sessionId?: string;
  session_id?: string;
  step?: string;
  created_at?: string;
  metadata_json?: Record<string, unknown>;
}

export function calculateRewardEventsForLearningEvent(event: RewardableLearningEvent, now = new Date().toISOString()): RewardEvent[] {
  const type = event.event_type ?? event.type;
  const childProfileId = event.childProfileId ?? event.child_profile_id;
  if (!childProfileId) return [];
  const reward = (reason: RewardReason, points: number): RewardEvent => {
    const output: RewardEvent = { id: rewardEventId(reason, event.id, now), childProfileId, reason, points: Math.max(0, points), createdAt: now };
    const sessionId = event.sessionId ?? event.session_id;
    if (sessionId) output.sessionId = sessionId;
    if (event.id) output.learningEventId = event.id;
    if (event.metadata_json) output.metadata = event.metadata_json;
    return output;
  };
  if (type === "task_started") return [reward("task_started", POINT_RULES.TASK_STARTED)];
  if (type === "correct_partial_step") {
    const rewards = [reward("correct_partial_step", POINT_RULES.CORRECT_PARTIAL_STEP)];
    if (String(event.step ?? "").startsWith("carry_")) rewards.push(reward("carry_discovered", POINT_RULES.CARRY_DISCOVERED));
    return rewards;
  }
  if (type === "help_requested") return [reward("help_used", POINT_RULES.HELP_USED)];
  if (type === "repair_step_completed") return [reward("repair_completed", POINT_RULES.REPAIR_COMPLETED)];
  if (type === "task_completed") return [reward("task_completed", POINT_RULES.TASK_COMPLETED)];
  if (type === "session_mood_reported") return [reward("mood_reported", POINT_RULES.MOOD_REPORTED)];
  return [];
}

function rewardEventId(reason: string, learningEventId: string | undefined, now: string) {
  return `reward-${reason}-${learningEventId ?? Math.random().toString(36).slice(2)}-${now}`;
}

export function calculatePointsForSessionEvents(events: RewardableLearningEvent[]): RewardEvent[] {
  return events.flatMap((event) => calculateRewardEventsForLearningEvent(event, event.created_at ?? new Date().toISOString()));
}

export function sumRewardPoints(events: Array<{ points: number }>): number {
  return events.reduce((sum, event) => sum + Math.max(0, event.points), 0);
}

export interface WerkelSessionState {
  id: string;
  childProfileId: string;
  operation: "addition";
  status: "active" | "completed" | "abandoned";
  plannedTaskCount: number;
  completedTaskCount: number;
  startedAt: string;
  completedAt?: string;
  mood?: SessionMood;
  metadata?: Record<string, unknown>;
}

export function startWerkelSession(input: { id: string; childProfileId: string; plannedTaskCount?: number; startedAt?: string }): WerkelSessionState {
  return { id: input.id, childProfileId: input.childProfileId, operation: "addition", status: "active", plannedTaskCount: input.plannedTaskCount ?? 3, completedTaskCount: 0, startedAt: input.startedAt ?? new Date().toISOString() };
}

export function applyLearningEventToSession(session: WerkelSessionState, event: RewardableLearningEvent): WerkelSessionState {
  if (session.status !== "active") return session;
  const type = event.event_type ?? event.type;
  if (type === "task_completed") {
    const completedTaskCount = Math.min(session.plannedTaskCount, session.completedTaskCount + 1);
    return completedTaskCount >= session.plannedTaskCount
      ? { ...session, completedTaskCount, status: "completed", completedAt: event.created_at ?? new Date().toISOString() }
      : { ...session, completedTaskCount, status: "active" };
  }
  if (type === "session_mood_reported" && event && "mood" in event) {
    const mood = (event as { mood?: SessionMood }).mood;
    return mood ? { ...session, mood } : session;
  }
  if (type === "session_completed") return { ...session, status: "completed", completedAt: event.created_at ?? new Date().toISOString() };
  if (type === "task_abandoned") return { ...session, status: "abandoned", completedAt: event.created_at ?? new Date().toISOString() };
  return session;
}
