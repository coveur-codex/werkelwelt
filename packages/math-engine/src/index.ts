export type AdditionStep =
  | "ones_sum"
  | "ones_digit"
  | "carry_to_tens"
  | "tens_sum"
  | "tens_digit"
  | "carry_to_hundreds"
  | "hundreds_sum"
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
  carries: { toTens: number; toHundreds: number };
  resultDigits: PlaceDigits;
}

export interface PlaceDigits { hundreds: number; tens: number; ones: number; }

export type AdditionBuildPhase = "ready" | "first_number" | "second_number" | "ones_sum" | "bundle_ones" | "tens_sum" | "bundle_tens" | "hundreds_sum" | "result";
export type AdditionColumn = "hundreds" | "tens" | "ones";

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
  result: Partial<Record<AdditionColumn, string>>;
  carries: Partial<Record<"hundreds" | "tens", string>>;
}

export interface VisiblePlaceValueState {
  showLeft: boolean;
  showRight: boolean;
  highlightBundledOnes: boolean;
  highlightBundledTens: boolean;
  showCarryToTens: boolean;
  showCarryToHundreds: boolean;
}

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
  if (!Number.isInteger(left) || !Number.isInteger(right) || left < 0 || right < 0 || left > 999 || right > 999 || left + right > 999) {
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
  return { operation: "addition", left, right, result, leftDigits, rightDigits, columnSums: { ones, tensIncludingCarry, hundredsIncludingCarry }, carries: { toTens, toHundreds }, resultDigits: toDigits(result) };
}

export function isAdditionTaskInScope(left: number, right: number): boolean {
  return Number.isInteger(left) && Number.isInteger(right) && left >= 0 && right >= 0 && left <= 999 && right <= 999 && left + right <= 999;
}

export function getAdditionBuildSteps(task: AdditionTask): WorkedExampleStep[] {
  const hasHundredsWork = task.leftDigits.hundreds > 0 || task.rightDigits.hundreds > 0 || task.carries.toHundreds > 0 || task.resultDigits.hundreds > 0;
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

export function getVisibleWrittenAdditionState(task: AdditionTask, stepIndex: number): VisibleWrittenAdditionState {
  const phase = phaseAt(task, stepIndex);
  const result: Partial<Record<AdditionColumn, string>> = {};
  const carries: Partial<Record<"hundreds" | "tens", string>> = {};
  if (["bundle_ones", "tens_sum", "bundle_tens", "hundreds_sum", "result"].includes(phase)) result.ones = String(task.resultDigits.ones);
  if (["bundle_ones", "tens_sum", "bundle_tens", "hundreds_sum", "result"].includes(phase) && task.carries.toTens > 0) carries.tens = String(task.carries.toTens);
  if (["bundle_tens", "hundreds_sum", "result"].includes(phase)) result.tens = String(task.resultDigits.tens);
  if (["bundle_tens", "hundreds_sum", "result"].includes(phase) && task.carries.toHundreds > 0) carries.hundreds = String(task.carries.toHundreds);
  if (["hundreds_sum", "result"].includes(phase)) result.hundreds = String(task.resultDigits.hundreds);
  if (phase === "result") { result.ones = String(task.resultDigits.ones); result.tens = String(task.resultDigits.tens); result.hundreds = String(task.resultDigits.hundreds); }
  return { showLeft: phase !== "ready", showRight: !["ready", "first_number"].includes(phase), result, carries };
}

export function getVisiblePlaceValueState(task: AdditionTask, stepIndex: number): VisiblePlaceValueState {
  const phase = phaseAt(task, stepIndex);
  return { showLeft: phase !== "ready", showRight: !["ready", "first_number"].includes(phase), highlightBundledOnes: ["bundle_ones"].includes(phase), highlightBundledTens: ["bundle_tens"].includes(phase), showCarryToTens: ["bundle_ones", "tens_sum", "bundle_tens", "hundreds_sum", "result"].includes(phase) && task.carries.toTens > 0, showCarryToHundreds: ["bundle_tens", "hundreds_sum", "result"].includes(phase) && task.carries.toHundreds > 0 };
}

export function getActiveColumn(task: AdditionTask, stepIndex: number): AdditionColumn | "result" | undefined {
  return getAdditionBuildSteps(task)[stepIndex]?.focus as AdditionColumn | "result" | undefined;
}

function phaseAt(task: AdditionTask, stepIndex: number): AdditionBuildPhase { return getAdditionBuildSteps(task)[Math.max(0, Math.min(stepIndex, getAdditionBuildSteps(task).length - 1))]?.phase ?? "ready"; }

export function expectedValueForStep(task: AdditionTask, step: AdditionStep): number {
  const map: Record<AdditionStep, number> = { ones_sum: task.columnSums.ones, ones_digit: task.resultDigits.ones, carry_to_tens: task.carries.toTens, tens_sum: task.columnSums.tensIncludingCarry, tens_digit: task.resultDigits.tens, carry_to_hundreds: task.carries.toHundreds, hundreds_sum: task.resultDigits.hundreds, final_result: task.result };
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

function toDigits(value: number): PlaceDigits { return { hundreds: Math.floor(value / 100), tens: Math.floor((value % 100) / 10), ones: value % 10 }; }
function parseValue(value: string | number): number | null { const parsed = typeof value === "number" ? value : Number(value.trim()); return Number.isInteger(parsed) ? parsed : null; }
function positiveFeedback(step: AdditionStep): string { return ({ ones_sum: "Du hast die Einer richtig gerechnet.", ones_digit: "Du hast die richtige Einerstelle benutzt.", carry_to_tens: "Du hast den Übertrag entdeckt.", tens_sum: "Du hast die Zehner mit Übertrag gerechnet.", tens_digit: "Du hast die Zehnerstelle richtig gefüllt.", carry_to_hundreds: "Du hast den Hunderter-Übertrag entdeckt.", hundreds_sum: "Du hast die Hunderter richtig gerechnet.", final_result: "Du hast das Ergebnis geschafft." })[step]; }
function gentleFeedback(task: AdditionTask, step: AdditionStep, value: number | null): string { return analyzeAdditionMistake(task, step, value).message; }
