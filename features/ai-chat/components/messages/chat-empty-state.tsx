"use client";

import { MessageCircleMore } from "lucide-react";

/** Cuộc trò chuyện chưa có tin nào. */
export function ChatEmptyState({ agentName }: { agentName: string }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <span
        className="mb-2 flex size-11 items-center justify-center rounded-2xl"
        style={{ background: "var(--ac-color-primary-bg)", color: "var(--ac-color-primary)" }}
      >
        <MessageCircleMore size={22} strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="m-0 text-base font-semibold">Trò chuyện với {agentName}</h2>
    </div>
  );
}
