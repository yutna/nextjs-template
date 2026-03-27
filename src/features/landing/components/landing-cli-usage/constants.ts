export const AI_ROLES = [
  { emoji: "🎯", i18nKey: "rolePm", tool: "Orchestrator" },
  { emoji: "🔍", i18nKey: "roleResearcher", tool: "explore" },
  { emoji: "💻", i18nKey: "roleDev", tool: "general-purpose" },
  { emoji: "🛡️", i18nKey: "roleQa", tool: "code-review" },
  { emoji: "⚙️", i18nKey: "roleDevops", tool: "task + bash" },
  { emoji: "📊", i18nKey: "roleStateTracker", tool: "SQL" },
] as const;

export const DONE_CRITERIA = [
  "doneFeatureWorks",
  "doneZeroErrors",
  "doneTestsPass",
  "doneCodeReview",
  "doneProductionReady",
] as const;

export const PIPELINE_STEPS = [
  { emoji: "📋", i18nKey: "pipelineInit" },
  { emoji: "🔍", i18nKey: "pipelineResearch" },
  { emoji: "🔨", i18nKey: "pipelineImplement" },
  { emoji: "✅", i18nKey: "pipelineQuality" },
  { emoji: "🔄", i18nKey: "pipelineSelfHeal" },
  { emoji: "👀", i18nKey: "pipelineReview" },
  { emoji: "🚀", i18nKey: "pipelineDeliver" },
] as const;

export const TOUCHPOINTS = [
  { accent: "blue", emoji: "👤", i18nKey: "touchpoint1" },
  { accent: "green", emoji: "🤖", i18nKey: "autonomous" },
  { accent: "blue", emoji: "👤", i18nKey: "touchpoint2" },
] as const;

export const WORKFLOW_STEPS = [
  {
    code: "/agent Feature Builder",
    key: "select",
    step: "01",
  },
  {
    code: "Shift+Tab → Autopilot",
    key: "autopilot",
    step: "02",
  },
  {
    code: "I need a user profile page with avatar upload,\nform validation, and server-side persistence\n\n✓ Research    Found 4 patterns, 6 reusable components\n✓ Plan        8 todos with dependencies\n✓ Implement   page → screen → container → components\n✓ Quality     0 errors · 0 warnings · 14 tests passed\n✓ Review      Architecture compliant\n✓ Deliver     Production-ready",
    key: "build",
    step: "03",
  },
] as const;
