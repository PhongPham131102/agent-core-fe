import { describe, expect, it } from "vitest";

import { validateSkillZip } from "@/features/ai-skills/constants";

const zipOfSize = (bytes: number, name = "skill.zip") =>
  new File([new Uint8Array(bytes)], name, { type: "application/zip" });

describe("validateSkillZip", () => {
  it("nhận file .zip không quá 5 MB", () => {
    expect(validateSkillZip(zipOfSize(10))).toBeNull();
    expect(validateSkillZip(zipOfSize(10, "SKILL.ZIP"))).toBeNull();
  });

  it("từ chối file không phải .zip hoặc quá 5 MB", () => {
    expect(validateSkillZip(zipOfSize(10, "skill.rar"))).toBe("Chỉ nhận file .zip");
    expect(validateSkillZip(zipOfSize(5 * 1024 * 1024 + 1))).toBe("File vượt quá 5 MB");
  });
});
