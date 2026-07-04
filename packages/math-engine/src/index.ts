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

export interface WorkedExampleStep {
  id: string;
  step?: AdditionStep;
  title: string;
  text: string;
  focus: "layout" | "ones" | "tens" | "hundreds" | "result";
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

export function getAdditionWorkedExample(task: AdditionTask): WorkedExampleStep[] {
  const steps: WorkedExampleStep[] = [
    { id: "layout", title: "Aufgabe untereinander schreiben", text: `Wir schreiben ${task.left} und ${task.right} untereinander. Die Einer stehen rechts.`, focus: "layout" },
    { id: "ones-start", step: "ones_sum", title: "Bei den Einern starten", text: `Wir starten rechts bei den Einern: ${task.leftDigits.ones} + ${task.rightDigits.ones} = ${task.columnSums.ones}.`, focus: "ones" },
  ];
  if (task.carries.toTens > 0) {
    steps.push(
      { id: "bundle-ones", step: "carry_to_tens", title: "Einer bündeln", text: `10 Einer werden zu 1 Zehner gebündelt. ${task.resultDigits.ones} Einer bleiben unten.`, focus: "ones" },
      { id: "carry-tens", step: "carry_to_tens", title: "Übertrag notieren", text: `${task.carries.toTens} Zehner wandert als Übertrag zu den Zehnern.`, focus: "tens" },
    );
  } else {
    steps.push({ id: "ones-digit", step: "ones_digit", title: "Einer eintragen", text: `${task.resultDigits.ones} Einer kommen unten in die Einerstelle.`, focus: "ones" });
  }
  steps.push({ id: "tens", step: "tens_sum", title: "Zehner addieren", text: `Jetzt die Zehner: ${task.leftDigits.tens} + ${task.rightDigits.tens} + ${task.carries.toTens} = ${task.columnSums.tensIncludingCarry}.`, focus: "tens" });
  if (task.carries.toHundreds > 0) steps.push({ id: "bundle-tens", step: "carry_to_hundreds", title: "Zehner bündeln", text: `10 Zehner werden zu 1 Hunderter. ${task.resultDigits.tens} Zehner bleiben unten.`, focus: "hundreds" });
  steps.push({ id: "hundreds", step: "hundreds_sum", title: "Hunderter addieren", text: `Die Hunderter ergeben ${task.resultDigits.hundreds}.`, focus: "hundreds" });
  steps.push({ id: "result", step: "final_result", title: "Ergebnis lesen", text: `Fertig. Das Ergebnis ist ${task.result}.`, focus: "result" });
  return steps;
}

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

function toDigits(value: number): PlaceDigits { return { hundreds: Math.floor(value / 100), tens: Math.floor((value % 100) / 10), ones: value % 10 }; }
function parseValue(value: string | number): number | null { const parsed = typeof value === "number" ? value : Number(value.trim()); return Number.isInteger(parsed) ? parsed : null; }
function positiveFeedback(step: AdditionStep): string { return ({ ones_sum: "Du hast die Einer richtig gerechnet.", ones_digit: "Du hast die richtige Einerstelle benutzt.", carry_to_tens: "Du hast den Übertrag entdeckt.", tens_sum: "Du hast die Zehner mit Übertrag gerechnet.", tens_digit: "Du hast die Zehnerstelle richtig gefüllt.", carry_to_hundreds: "Du hast den Hunderter-Übertrag entdeckt.", hundreds_sum: "Du hast die Hunderter richtig gerechnet.", final_result: "Du hast das Ergebnis geschafft." })[step]; }
function gentleFeedback(task: AdditionTask, step: AdditionStep, value: number | null): string { return analyzeAdditionMistake(task, step, value).message; }
