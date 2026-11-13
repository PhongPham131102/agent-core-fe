import { describe, expect, it } from "vitest";

import { validateKnowledgeFiles } from "@/features/ai-knowledge/constants";

const textFile = (name: string, bytes = 10) => new File([new Uint8Array(bytes)], name);

describe("validateKnowledgeFiles", () => {
  it("nhận file text đúng đuôi, không quá 2 MB", () => {
    expect(validateKnowledgeFiles([textFile("a.md"), textFile("b.CSV")])).toBeNull();
  });

  it("báo file sai đuôi hoặc quá lớn kèm tên file", () => {
    expect(validateKnowledgeFiles([textFile("a.pdf")])).toMatch(/^a\.pdf: chỉ nhận/);
    expect(validateKnowledgeFiles([textFile("a.txt", 2 * 1024 * 1024 + 1)])).toBe(
      "a.txt: vượt quá 2 MB",
    );
  });

  it("tối đa 10 file mỗi lần", () => {
    const files = Array.from({ length: 11 }, (_, index) => textFile(`${index}.txt`));

    expect(validateKnowledgeFiles(files)).toBe("Tối đa 10 file mỗi lần");
  });
});
