export interface ParityRule {
  description: string;
  name: string;
  patterns: RegExp[];
}

export interface ParityPair {
  commandFile: string;
  promptFile: string;
  rules: ParityRule[];
}

export interface ParityResult {
  commandHas: boolean;
  description: string;
  promptHas: boolean;
  rule: string;
}

export interface PairComparisonResult {
  issues: ParityResult[];
  message: string;
  ok: boolean;
}

export interface ModDrift {
  commandModified: boolean;
  pair: [string, string];
  promptModified: boolean;
}
