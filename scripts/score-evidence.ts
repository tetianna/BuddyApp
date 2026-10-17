import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

type EvidenceItem = {
  artifact: string;
  line: number;
  excerpt: string;
};

type EvidenceFile = {
  runId: string;
  testId: string;
  items: EvidenceItem[];
};

type RuleHit = {
  id: string;
  fired: boolean;
  detail: string;
};

type DecisionSide = 'drift' | 'bug';
type DecisionKind = 'act' | 'escalate' | 'inconclusive';

export type ScoredDecision = {
  decisionId: string;
  decision: DecisionKind;
  side: DecisionSide | null;
  allowedActions: string[];
  rules: RuleHit[];
  summary: string;
};

const FORBIDDEN_ITEM_KEYS = ['score', 'confidence', 'weight'] as const;

const INCONCLUSIVE_PATTERNS: { id: string; re: RegExp }[] = [
  { id: 'retry-inconclusive', re: /\bpass(?:ed)?\s+on\s+retry\b/i },
  { id: 'flake-timing', re: /\bflak(?:e|y)\b.*\btiming\b|\btiming\b.*\bflak/i },
  { id: 'playwright-retry', re: /\bretry\s*#\d+/i },
];

const DRIFT_PATTERNS: { id: string; re: RegExp }[] = [
  { id: 'shared-account', re: /\bDelTest\b|\bshared\s+(?:main[- ]family|test)\s+account\b/i },
  { id: 'strict-assertion', re: /\btoHaveText\b|\bstrict\s+assertion\b/i },
  { id: 'test-data', re: /\btest\s+data\b|\bassertion\s+scope\b/i },
  { id: 'pom-locator', re: /\bpages\/|POM\b|\blocator\b/i },
];

const BUG_PATTERNS: { id: string; re: RegExp }[] = [
  { id: 'ac-contradiction', re: /\bcontradicts?\s+AC\b|\bacceptance\s+criterion\b/i },
  { id: 'product-defect', re: /\bproduct\s+(?:defect|bug)\b|\breal\s+app\s+bug\b/i },
  { id: 'app-vs-spec', re: /\bapp\s+behavior\b.*\b(?:wrong|incorrect)\b/i },
];

function stableDecisionId(evidence: EvidenceFile): string {
  const canonical = JSON.stringify({
    runId: evidence.runId,
    testId: evidence.testId,
    items: evidence.items.map((item) => ({
      artifact: item.artifact,
      line: item.line,
      excerpt: item.excerpt,
    })),
  });
  return crypto.createHash('sha256').update(canonical).digest('hex').slice(0, 16);
}

function loadEvidence(filePath: string): EvidenceFile {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as EvidenceFile;
  if (!raw.runId || !raw.testId || !Array.isArray(raw.items)) {
    throw new Error('Evidence file must include runId, testId, and items[].');
  }
  for (const item of raw.items) {
    if (!item.artifact || typeof item.line !== 'number' || !item.excerpt) {
      throw new Error('Each evidence item needs artifact, line, and excerpt.');
    }
    for (const key of FORBIDDEN_ITEM_KEYS) {
      if (key in (item as Record<string, unknown>)) {
        throw new Error(`Evidence item must not include "${key}".`);
      }
    }
  }
  return raw;
}

function matchCorpus(items: EvidenceItem[]): string {
  return items.map((item) => `${item.artifact}:${item.line} ${item.excerpt}`).join('\n');
}

function evaluateRules(
  patterns: { id: string; re: RegExp }[],
  corpus: string,
): RuleHit[] {
  return patterns.map(({ id, re }) => {
    const fired = re.test(corpus);
    return { id, fired, detail: fired ? `Matched ${id}` : `No match for ${id}` };
  });
}

export function scoreEvidence(evidence: EvidenceFile): ScoredDecision {
  const rules: RuleHit[] = [];
  const corpus = matchCorpus(evidence.items);
  const decisionId = stableDecisionId(evidence);

  if (evidence.items.length === 0) {
    return {
      decisionId,
      decision: 'inconclusive',
      side: null,
      allowedActions: [],
      rules: [{ id: 'missing-items', fired: true, detail: 'No evidence items' }],
      summary: 'Missing evidence items.',
    };
  }

  const inconclusiveRules = evaluateRules(INCONCLUSIVE_PATTERNS, corpus);
  rules.push(...inconclusiveRules);
  if (inconclusiveRules.some((rule) => rule.fired)) {
    return {
      decisionId,
      decision: 'inconclusive',
      side: null,
      allowedActions: [],
      rules,
      summary: 'Inconclusive: retry or timing flake — not drift.',
    };
  }

  const driftRules = evaluateRules(DRIFT_PATTERNS, corpus);
  const bugRules = evaluateRules(BUG_PATTERNS, corpus);
  rules.push(...driftRules, ...bugRules);

  const driftScore = driftRules.filter((rule) => rule.fired).length;
  const bugScore = bugRules.filter((rule) => rule.fired).length;

  if (driftScore > 0 && bugScore > 0) {
    return {
      decisionId,
      decision: 'escalate',
      side: null,
      allowedActions: [],
      rules,
      summary: 'Conflicting drift and product-defect signals.',
    };
  }

  if (driftScore > 0) {
    return {
      decisionId,
      decision: 'act',
      side: 'drift',
      allowedActions: ['self-heal', 'heal-pr'],
      rules,
      summary: 'Act on drift (test/POM/shared data).',
    };
  }

  if (bugScore > 0) {
    return {
      decisionId,
      decision: 'act',
      side: 'bug',
      allowedActions: ['jira-bug-draft'],
      rules,
      summary: 'Act on product defect (bug draft).',
    };
  }

  return {
    decisionId,
    decision: 'escalate',
    side: null,
    allowedActions: [],
    rules,
    summary: 'Insufficient or ambiguous evidence — human approval required.',
  };
}

function main(): void {
  const args = process.argv.slice(2);
  const verifyOnly = args.includes('--verify-only');
  const pathArg = args.find((arg) => !arg.startsWith('--'));
  if (!verifyOnly || !pathArg) {
    console.error('Usage: npx tsx scripts/score-evidence.ts --verify-only <evidence.json>');
    process.exit(1);
  }

  const resolved = path.resolve(pathArg);
  if (!fs.existsSync(resolved)) {
    console.error(`Evidence file not found: ${resolved}`);
    process.exit(1);
  }

  try {
    const evidence = loadEvidence(resolved);
    const scored = scoreEvidence(evidence);
    process.stdout.write(`${JSON.stringify(scored, null, 2)}\n`);
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
