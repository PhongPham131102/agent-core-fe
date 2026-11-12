import { describe, expect, it } from "vitest";

import { changedFields, hasChanges } from "@/lib/form/changed-fields";

const current = { name: "Editor", description: "", permissions: ["user:read", "user:create"] };

describe("changedFields", () => {
  it("chỉ giữ field có giá trị khác", () => {
    expect(changedFields(current, { ...current, name: "Biên tập" })).toEqual({ name: "Biên tập" });
  });

  it("mảng cùng phần tử nhưng khác thứ tự thì coi là không đổi", () => {
    const body = changedFields(current, { ...current, permissions: ["user:create", "user:read"] });

    expect(hasChanges(body)).toBe(false);
  });

  it("chuỗi rỗng là một thay đổi (xoá giá trị), undefined thì bỏ qua", () => {
    const profile = { avatar: "https://a.co/x.png", fullName: "A" };

    expect(changedFields(profile, { avatar: "" })).toEqual({ avatar: "" });
    expect(changedFields(profile, { fullName: undefined })).toEqual({});
  });
});
