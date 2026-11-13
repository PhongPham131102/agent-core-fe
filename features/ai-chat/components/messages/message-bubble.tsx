"use client";

import { Image, Tag } from "antd";
import { memo } from "react";

import { ChatMessageRole } from "../../types/ai-chat.types";
import { SkillIcon } from "../skill-icon";

import { ChatMarkdown } from "./chat-markdown";

import type { IChatViewMessage } from "../../model/chat-messages";
import type { IAiSkillOption } from "@/features/ai-skills";

const TYPING_DOT_DELAYS = ["0s", "0.15s", "0.3s"];

/** Đang làm gì: tool chưa xong gần nhất, hoặc "Đang nghĩ" khi chưa có chữ nào. */
const statusOf = (message: IChatViewMessage) => {
  if (!message.live) return { text: "", thinking: false };
  const running = message.live.steps.findLast(({ done }) => !done);
  if (running)
    return { text: (running.label || running.toolName).replace(/[.… ]+$/, ""), thinking: false };
  return message.content ? { text: "", thinking: false } : { text: "Đang nghĩ", thinking: true };
};

interface IMessageBubbleProps {
  message: IChatViewMessage;
  /** Skill của agent, để hiện tên và icon skill người dùng đã chọn cho tin. */
  skills: IAiSkillOption[];
}

/** Một tin: của người dùng nằm phải (kèm skill, ảnh), của agent nằm trái (markdown, nguồn). */
function MessageBubbleView({ message, skills }: IMessageBubbleProps) {
  const isUser = message.role === ChatMessageRole.user;
  const skill = message.skillCode
    ? (skills.find(({ code }) => code === message.skillCode) ?? {
        code: message.skillCode,
        name: message.skillCode,
        iconUrl: "",
      })
    : undefined;
  const status = statusOf(message);
  const sources = message.live?.sources ?? [];

  return (
    <div className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
      {sources.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {sources.map((source) => (
            <Tag key={`${source.documentUid}:${source.chunkIndex}`} color="blue" className="m-0!">
              Nguồn: {source.fileName}
            </Tag>
          ))}
        </div>
      )}
      {isUser && skill && (
        <span
          className="flex max-w-[85%] items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ background: "var(--ac-color-primary-bg)", color: "var(--ac-color-primary)" }}
        >
          <SkillIcon iconUrl={skill.iconUrl} size={13} />
          <span className="truncate">{skill.name}</span>
        </span>
      )}
      {isUser && message.content && (
        <div
          className="max-w-[85%] rounded-2xl rounded-ee-md px-3.5 py-2.5 text-sm leading-6 break-words whitespace-pre-wrap"
          style={{ background: "var(--ac-color-primary-bg)" }}
        >
          {message.content}
        </div>
      )}
      {!isUser && (message.content || status.text) && (
        <div
          className="flex max-w-[85%] min-w-0 flex-col gap-2 rounded-2xl rounded-es-md px-3.5 py-2.5 text-sm leading-6"
          style={{ background: "var(--ac-color-fill-tertiary)" }}
        >
          {status.text && (
            <span
              role="status"
              className="flex h-6 items-center gap-2"
              style={{ color: "var(--ac-color-text-tertiary)" }}
            >
              <span className={status.thinking ? "sr-only" : ""}>{status.text}</span>
              <span className="flex items-center gap-1">
                {TYPING_DOT_DELAYS.map((delay) => (
                  <span
                    key={delay}
                    className="ai-typing-dot size-1 rounded-full bg-current"
                    style={{ animationDelay: delay }}
                  />
                ))}
              </span>
            </span>
          )}
          {message.content && <ChatMarkdown content={message.content} />}
        </div>
      )}
      {message.imageUrls.length > 0 && (
        <Image.PreviewGroup>
          <div
            className={`flex max-w-[85%] flex-wrap gap-2 ${isUser ? "justify-end" : "justify-start"}`}
          >
            {message.imageUrls.map((url) => (
              <Image
                key={url}
                src={url}
                alt="Ảnh đính kèm"
                width={144}
                height={144}
                className="rounded-xl object-cover"
              />
            ))}
          </div>
        </Image.PreviewGroup>
      )}
      {message.status && !message.errorMessage && (
        <span className="text-xs" style={{ color: "var(--ac-color-text-tertiary)" }}>
          {message.status.name}
        </span>
      )}
      {message.errorMessage && (
        <p className="m-0 text-xs" style={{ color: "var(--ac-color-error)" }}>
          {message.errorMessage}
        </p>
      )}
    </div>
  );
}

/** Tin đã lưu không đổi khi đang stream, nên chỉ bong bóng của lượt đang chạy vẽ lại. */
export const MessageBubble = memo(MessageBubbleView);
