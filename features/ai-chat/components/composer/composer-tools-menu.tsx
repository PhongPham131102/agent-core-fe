"use client";

import { Button } from "antd";
import { ImagePlus, Sparkles } from "lucide-react";

interface IComposerToolsMenuProps {
  canAddImage: boolean;
  hasSkills: boolean;
  onAddImage: () => void;
  onOpenSkills: () => void;
}

/** Menu của nút "+": đính kèm ảnh, mở danh sách skill. */
export function ComposerToolsMenu({
  canAddImage,
  hasSkills,
  onAddImage,
  onOpenSkills,
}: IComposerToolsMenuProps) {
  return (
    <div
      className="absolute start-0 bottom-full z-20 mb-2 w-52 rounded-xl border p-1.5 shadow-xl"
      style={{
        background: "var(--ac-color-bg-elevated)",
        borderColor: "var(--ac-color-border-secondary)",
      }}
    >
      <Button
        type="text"
        icon={<ImagePlus size={17} />}
        disabled={!canAddImage}
        onClick={onAddImage}
        className="flex! w-full justify-start! gap-2!"
      >
        Đính kèm ảnh
      </Button>
      {hasSkills && (
        <Button
          type="text"
          icon={<Sparkles size={17} />}
          onClick={onOpenSkills}
          className="flex! w-full justify-start! gap-2!"
        >
          Mở danh sách skill
        </Button>
      )}
    </div>
  );
}
