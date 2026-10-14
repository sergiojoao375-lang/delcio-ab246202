import { describe, it, expect } from "vitest";
import { LEVELS, nextLevel, canTakeFinalExam, isC2FinalExam } from "@/lib/levels";

describe("percurso CEFR até C2", () => {
  it("inclui seis níveis consecutivos", () => {
    expect(LEVELS).toEqual(["beginner", "elementary", "intermediate", "advanced", "higher", "proficient"]);
    expect(nextLevel("advanced")).toBe("higher");
    expect(nextLevel("higher")).toBe("proficient");
    expect(nextLevel("proficient")).toBeNull();
  });
  it("só permite o exame final em C2 após nivelamento", () => {
    for (const level of ["beginner", "elementary", "intermediate", "advanced", "higher"]) {
      expect(canTakeFinalExam(level, true)).toBe(false);
    }
    expect(canTakeFinalExam("proficient", false)).toBe(false);
    expect(canTakeFinalExam("proficient", true)).toBe(true);
  });
  it("uma aprovação antiga em B2 não qualifica para o certificado C2", () => {
    expect(isC2FinalExam({ kind: "final", from_level: "advanced", to_level: "advanced" })).toBe(false);
    expect(isC2FinalExam({ kind: "levelup", from_level: "higher", to_level: "proficient" })).toBe(false);
    expect(isC2FinalExam({ kind: "final", from_level: "proficient", to_level: "proficient" })).toBe(true);
  });
});