import fs from 'fs';
import path from 'path';

const CLASSES = ['drift', 'bug', 'ambiguous'] as const;
type Classification = (typeof CLASSES)[number];

type AnswerKeyCase = {
  id: string;
  input: string;
  expected: Classification;
};

type Prediction = {
  id: string;
  predicted: Classification;
  evidence: string;
};

type RunFile = {
  model: string;
  startedAt: string;
  finishedAt: string;
  predictions: Prediction[];
};

function isClassification(value: string): value is Classification {
  return (CLASSES as readonly string[]).includes(value);
}

function loadAnswerKey(agentDir: string): Map<string, AnswerKeyCase> {
  const keyPath = path.join(agentDir, 'answer-key.json');
  if (!fs.existsSync(keyPath)) {
    console.error(`Missing answer key: ${keyPath}`);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(keyPath, 'utf8')) as AnswerKeyCase[];
  if (!Array.isArray(raw)) {
    console.error('answer-key.json must be a JSON array.');
    process.exit(1);
  }
  const map = new Map<string, AnswerKeyCase>();
  for (const caseRow of raw) {
    if (!caseRow.id || !isClassification(caseRow.expected)) {
      console.error(`Invalid answer-key row for id "${caseRow.id ?? ''}".`);
      process.exit(1);
    }
    map.set(caseRow.id, caseRow);
  }
  return map;
}

function loadRuns(runsDir: string): RunFile[] {
  if (!fs.existsSync(runsDir)) {
    return [];
  }
  const files = fs
    .readdirSync(runsDir)
    .filter((name) => name.endsWith('.json'))
    .sort();
  return files.map((name) => {
    const filePath = path.join(runsDir, name);
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as RunFile;
    if (!parsed.predictions || !Array.isArray(parsed.predictions)) {
      console.error(`Invalid run file (predictions array required): ${filePath}`);
      process.exit(1);
    }
    return parsed;
  });
}

function validateRunIds(runs: RunFile[], key: Map<string, AnswerKeyCase>): void {
  let invalid = false;
  for (const run of runs) {
    for (const prediction of run.predictions) {
      if (!isClassification(prediction.predicted)) {
        console.error(`Invalid predicted class for id "${prediction.id}".`);
        invalid = true;
      }
      if (!key.has(prediction.id)) {
        console.error(`Unknown case id "${prediction.id}" (not in answer key).`);
        invalid = true;
      }
    }
  }
  if (invalid) {
    process.exit(1);
  }
}

type ClassCounts = {
  tp: number;
  fp: number;
  fn: number;
};

function emptyCounts(): Record<Classification, ClassCounts> {
  return {
    drift: { tp: 0, fp: 0, fn: 0 },
    bug: { tp: 0, fp: 0, fn: 0 },
    ambiguous: { tp: 0, fp: 0, fn: 0 },
  };
}

function poolPredictions(
  runs: RunFile[],
  key: Map<string, AnswerKeyCase>,
): { counts: Record<Classification, ClassCounts>; total: number; correct: number } {
  const counts = emptyCounts();
  let total = 0;
  let correct = 0;

  for (const run of runs) {
    for (const prediction of run.predictions) {
      const expected = key.get(prediction.id)?.expected;
      if (!expected) {
        continue;
      }
      total += 1;
      if (prediction.predicted === expected) {
        correct += 1;
        counts[expected].tp += 1;
      } else {
        counts[prediction.predicted].fp += 1;
        counts[expected].fn += 1;
      }
    }
  }

  return { counts, total, correct };
}

function formatRate(numerator: number, denominator: number): string {
  if (denominator === 0) {
    return 'n/a';
  }
  return `${((numerator / denominator) * 100).toFixed(1)}% (${numerator}/${denominator})`;
}

function crossRunAgreement(runs: RunFile[], key: Map<string, AnswerKeyCase>): string {
  if (runs.length === 0) {
    return 'n/a (no runs)';
  }
  let eligible = 0;
  let agreed = 0;
  for (const id of key.keys()) {
    const preds: Classification[] = [];
    for (const run of runs) {
      const row = run.predictions.find((p) => p.id === id);
      if (!row) {
        break;
      }
      preds.push(row.predicted);
    }
    if (preds.length !== runs.length) {
      continue;
    }
    eligible += 1;
    if (preds.every((p) => p === preds[0])) {
      agreed += 1;
    }
  }
  if (eligible === 0) {
    return 'n/a (no case covered in every run)';
  }
  return formatRate(agreed, eligible);
}

function main(): void {
  const agent = process.argv[2];
  if (!agent) {
    console.error('Usage: npx tsx evals/score.ts <agent>');
    process.exit(1);
  }

  const agentDir = path.join('evals', agent);
  const key = loadAnswerKey(agentDir);
  const runs = loadRuns(path.join(agentDir, 'runs'));

  if (key.size === 0) {
    console.log(`Agent "${agent}": answer key is empty — add cases to evals/${agent}/answer-key.json`);
    process.exit(0);
  }

  validateRunIds(runs, key);

  if (runs.length === 0) {
    console.log(`Agent "${agent}": no run files in evals/${agent}/runs/`);
    process.exit(0);
  }

  const { counts, total, correct } = poolPredictions(runs, key);

  console.log(`\nAgent: ${agent}`);
  console.log(`Answer-key cases: ${key.size}`);
  console.log(`Run files: ${runs.length}`);
  console.log(`Pooled predictions: ${total}`);
  console.log(`Overall accuracy: ${formatRate(correct, total)}`);
  console.log(`Cross-run agreement: ${crossRunAgreement(runs, key)}`);

  console.log('\nPer-class metrics (pooled across all runs):');
  for (const cls of CLASSES) {
    const { tp, fp, fn } = counts[cls];
    console.log(`  ${cls}:`);
    console.log(`    precision: ${formatRate(tp, tp + fp)}`);
    console.log(`    recall:    ${formatRate(tp, tp + fn)}`);
    console.log(`    false positives (predicted ${cls}, expected other): ${fp}`);
  }
}

main();
