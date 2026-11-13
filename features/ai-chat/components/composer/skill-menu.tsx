"use client";

import { Button } from "antd";

import { SkillIcon } from "../skill-icon";

import type { IAiSkillOption } from "@/features/ai-skills";

/** Skill khớp từ khoá (theo tên hoặc mã). */
export const filterSkills = (skills: IAiSkillOption[], query: string) => {
  const keyword = query.trim().toLowerCase();
  return skills.filter(({ name, code }) => `${name} ${code}`.toLowerCase().includes(keyword));
};

interface ISkillMenuProps {
  skills: IAiSkillOption[];
  query: string;
  onSelect: (skill: IAiSkillOption) => void;
}

/** Danh sách skill nổi phía trên ô soạn; mở từ nút "+" hoặc khi gõ "/". */
export function SkillMenu({ skills, query, onSelect }: ISkillMenuProps) {
  const matches = filterSkills(skills, query);

  return (
    <div
      role="listbox"
      aria-label="Skills"
      className="absolute start-0 bottom-full z-20 mb-2 max-h-64 w-80 max-w-full overflow-y-auto rounded-2xl border p-2 shadow-xl"
      style={{
        background: "var(--ac-color-bg-elevated)",
        borderColor: "var(--ac-color-border-secondary)",
      }}
    >
      <p
        className="m-0 px-2 py-1.5 text-xs font-semibold"
        style={{ color: "var(--ac-color-text-tertiary)" }}
      >
        Skills
      </p>
      {matches.length === 0 && (
        <p className="m-0 p-3 text-xs" style={{ color: "var(--ac-color-text-tertiary)" }}>
          Không tìm thấy skill phù hợp.
        </p>
      )}
      {matches.map((skill) => (
        <Button
          key={skill.code}
          type="text"
          role="option"
          onClick={() => onSelect(skill)}
          className="flex! h-auto! w-full items-start! justify-start! gap-2.5! rounded-lg! px-2! py-2!"
        >
          <span
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--ac-color-primary-bg)", color: "var(--ac-color-primary)" }}
          >
            <SkillIcon iconUrl={skill.iconUrl} size={16} />
          </span>
          <span className="grid min-w-0 gap-0.5 text-start">
            <span className="truncate text-sm font-medium">{skill.name}</span>
            {skill.description && (
              <span
                className="line-clamp-2 text-xs whitespace-normal"
                style={{ color: "var(--ac-color-text-tertiary)" }}
              >
                {skill.description}
              </span>
            )}
          </span>
        </Button>
      ))}
    </div>
  );
}
