/** Escada de níveis e regras do plano de estudo (client-safe). */

export const LEVELS = ["beginner", "elementary", "intermediate", "advanced", "higher", "proficient"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: "Beginner (A1)",
  elementary: "Elementary (A2)",
  intermediate: "Intermediate (B1)",
  advanced: "Advanced (B2)",
  higher: "Avançado (C1)",
  proficient: "Proficiente (C2)",
};

export const LEVEL_ENGLISH_LABEL: Record<Level, string> = {
  beginner: "Beginner (A1)",
  elementary: "Elementary (A2)",
  intermediate: "Intermediate (B1)",
  advanced: "Upper Intermediate (B2)",
  higher: "Advanced (C1)",
  proficient: "Proficient (C2)",
};

export function canTakeFinalExam(level: string, placementDone: boolean) {
  return level === "proficient" && placementDone;
}

export function isC2FinalExam(test: { kind: string; from_level: string | null; to_level: string | null }) {
  return test.kind === "final" && test.from_level === "proficient" && test.to_level === "proficient";
}

export const DAILY_GOALS = [10, 15, 30, 60] as const;
export type DailyGoal = (typeof DAILY_GOALS)[number];

export const GOAL_LABEL: Record<number, string> = {
  10: "10 min/dia — leve",
  15: "15 min/dia — regular",
  30: "30 min/dia — sério",
  60: "60 min/dia — intenso",
};

/** Dias mínimos por nível; a duração total acompanha o número de níveis do percurso. */
export function daysPerLevel(goalMinutes: number): number {
  if (goalMinutes >= 60) return 11;
  if (goalMinutes >= 30) return 15;
  if (goalMinutes >= 15) return 23;
  return 30;
}

/** XP-alvo de um dia em que o aluno cumpre a meta. */
export function dailyGoalXp(goalMinutes: number): number {
  return goalMinutes * 4;
}

/** XP necessário dentro do nível atual para liberar o teste de passagem. */
export function levelXpRequired(goalMinutes: number): number {
  return dailyGoalXp(goalMinutes) * daysPerLevel(goalMinutes);
}

/** Ofensiva mínima (dias seguidos) para liberar o teste. */
export const STREAK_REQUIRED = 7;

/** Custo, em pontos, de um escudo de ofensiva. */
export const SHIELD_COST = 400;
export const SHIELD_MAX = 2;

/** Nota mínima (0-100) para passar de nível. */
export const PASS_SCORE = 70;

export function nextLevel(level: Level): Level | null {
  const i = LEVELS.indexOf(level);
  return i >= 0 && i < LEVELS.length - 1 ? (LEVELS[i + 1] as Level) : null;
}

export function estimatedMonths(goalMinutes: number): number {
  const total = daysPerLevel(goalMinutes) * LEVELS.length;
  return Math.round((total / 30) * 10) / 10;
}
