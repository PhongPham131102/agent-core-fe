"use client";

import { Button, Input } from "antd";
import { ArrowUp, LoaderCircle, Plus, Square, X } from "lucide-react";
import { useRef, useState } from "react";

import { IMAGE_UPLOAD } from "@/features/uploads";
import { useClickOutside } from "@/lib/hooks";
import { getErrorMessage } from "@/lib/http";

import { AI_CHAT_LIMITS } from "../../constants";
import { useChatImages } from "../../hooks/use-chat-images";
import { useSendChatMessage } from "../../hooks/use-send-chat-message";
import { stopChatTurn } from "../../socket/chat-socket";
import { ChatConnection, useAiChatStore } from "../../store/ai-chat.store";
import { SkillIcon } from "../skill-icon";

import { ComposerToolsMenu } from "./composer-tools-menu";
import { ImagePreviews } from "./image-previews";
import { filterSkills, SkillMenu } from "./skill-menu";

import type { IAiChatAgent } from "../../types/ai-chat.types";
import type { IAiSkillOption } from "@/features/ai-skills";
import type { ClipboardEvent, KeyboardEvent } from "react";

/** BE bắt buộc có chữ: gửi ảnh không kèm lời thì dùng câu này. */
const IMAGE_ONLY_MESSAGE = "Hãy xem ảnh đính kèm.";
/** Gõ "/" ở đầu ô soạn (chưa có khoảng trắng) để lọc skill. */
const SLASH_QUERY = /^\/([^\s]*)$/;

interface IChatComposerProps {
  agent: IAiChatAgent;
  threadUid: string | null;
  /** Cuộc trò chuyện đang có lượt chạy: nút gửi thành nút dừng. */
  answering: boolean;
}

/**
 * Ô soạn tin: Enter gửi, Shift+Enter xuống dòng. Nút "+" mở menu đính kèm ảnh hoặc chọn
 * skill; gõ "/" cũng mở danh sách skill. Ảnh còn dán trực tiếp vào ô được.
 */
export function ChatComposer({ agent, threadUid, answering }: IChatComposerProps) {
  const connected = useAiChatStore.use.connection() === ChatConnection.connected;
  const draft = useAiChatStore.use.draft();
  const setDraft = useAiChatStore.use.setDraft();
  const skillCode = useAiChatStore.use.skillCode();
  const setSkillCode = useAiChatStore.use.setSkillCode();
  const setChatError = useAiChatStore.use.setChatError();
  const send = useSendChatMessage();
  const images = useChatImages();
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const skills = agent.skills;
  const selectedSkill = skills.find(({ code }) => code === skillCode);
  const slashQuery = SLASH_QUERY.exec(draft)?.[1];
  const message = draft.trim();
  const canSend =
    connected &&
    !answering &&
    !images.isUploading &&
    (Boolean(message) || images.imageUrls.length > 0) &&
    slashQuery === undefined;

  const closeMenus = () => {
    setSkillsOpen(false);
    setToolsOpen(false);
  };
  // Bấm ra ngoài ô soạn thì đóng các menu.
  useClickOutside(rootRef, skillsOpen || toolsOpen, closeMenus);

  const selectSkill = (skill: IAiSkillOption) => {
    setSkillCode(skill.code);
    if (slashQuery !== undefined) setDraft("");
    closeMenus();
    rootRef.current?.querySelector("textarea")?.focus();
  };

  const submit = () => {
    if (!canSend) return;
    closeMenus();
    const sent = { draft, skillCode, imageUrls: images.imageUrls };
    // Tin hiện ngay trong khung chat nên xoá ô soạn luôn; gửi lỗi thì trả lại.
    setDraft("");
    setSkillCode("");
    images.setImageUrls([]);
    setChatError(null);
    send({
      agentUid: agent.uid,
      threadUid: threadUid ?? undefined,
      message: message || IMAGE_ONLY_MESSAGE,
      skillCode: sent.skillCode,
      imageUrls: sent.imageUrls,
    }).catch((error: unknown) => {
      setDraft(sent.draft);
      setSkillCode(sent.skillCode);
      images.setImageUrls(sent.imageUrls);
      setChatError(getErrorMessage(error));
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape" && (skillsOpen || toolsOpen)) {
      event.preventDefault();
      closeMenus();
      return;
    }
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (skillsOpen) {
      const [first] = filterSkills(skills, slashQuery ?? "");
      if (first) selectSkill(first);
      return;
    }
    submit();
  };

  const handlePaste = (event: ClipboardEvent) => {
    const pasted = [...event.clipboardData.files].filter(({ type }) => type.startsWith("image/"));
    if (pasted.length === 0) return;
    event.preventDefault();
    closeMenus();
    void images.addImages(pasted);
  };

  return (
    <div
      ref={rootRef}
      onPaste={handlePaste}
      className="relative rounded-2xl border px-2 py-1.5 shadow-sm focus-within:border-[var(--ac-color-primary)]"
      style={{
        background: "var(--ac-color-bg-container)",
        borderColor: "var(--ac-color-border-secondary)",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_UPLOAD.accept}
        multiple
        hidden
        onChange={(event) => {
          closeMenus();
          void images.addImages([...(event.target.files ?? [])]);
          event.target.value = "";
        }}
      />
      {toolsOpen && (
        <ComposerToolsMenu
          canAddImage={!images.isUploading && images.imageUrls.length < AI_CHAT_LIMITS.maxImages}
          hasSkills={skills.length > 0}
          onAddImage={() => fileInputRef.current?.click()}
          onOpenSkills={() => {
            setToolsOpen(false);
            setSkillsOpen(true);
          }}
        />
      )}
      {skillsOpen && skills.length > 0 && (
        <SkillMenu skills={skills} query={slashQuery ?? ""} onSelect={selectSkill} />
      )}
      <ImagePreviews urls={images.imageUrls} onRemove={images.removeImage} />
      <Input.TextArea
        aria-label="Tin nhắn"
        variant="borderless"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setSkillsOpen(event.target.value.startsWith("/") && skills.length > 0);
        }}
        onKeyDown={handleKeyDown}
        maxLength={AI_CHAT_LIMITS.messageMaxLength}
        autoSize={{ minRows: 1, maxRows: 5 }}
        placeholder={`Nhắn cho ${agent.name}...`}
        // antd 6.7 vẽ viền xanh khi focus cho ô borderless; khung ô soạn đã đổi màu viền khi
        // focus (focus-within) nên bỏ viền này để không thành hai lớp.
        className="px-2! py-0.5! text-sm! outline-none!"
      />
      {images.error && (
        <p
          role="alert"
          className="m-0 px-2 pb-1 text-xs"
          style={{ color: "var(--ac-color-error)" }}
        >
          {images.error}
        </p>
      )}
      <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <Button
            size="small"
            shape="circle"
            icon={<Plus size={18} />}
            aria-label="Mở công cụ"
            aria-expanded={toolsOpen}
            onClick={() => {
              setSkillsOpen(false);
              setToolsOpen((open) => !open);
            }}
            className="size-8! min-w-8!"
          />
          {selectedSkill && (
            <Button
              size="small"
              type="text"
              title="Bỏ skill đã chọn"
              onClick={() => setSkillCode("")}
              className="flex! h-8! min-w-0 items-center gap-1.5! rounded-full! px-3! text-sm!"
              style={{ background: "var(--ac-color-primary-bg)", color: "var(--ac-color-primary)" }}
            >
              <SkillIcon iconUrl={selectedSkill.iconUrl} size={15} />
              <span className="truncate">{selectedSkill.name}</span>
              <X size={14} className="shrink-0" />
            </Button>
          )}
          {images.isUploading && (
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--ac-color-text-tertiary)" }}
            >
              <LoaderCircle size={13} className="animate-spin" />
              Đang tải ảnh...
            </span>
          )}
        </div>
        {answering ? (
          <Button
            shape="circle"
            icon={<Square size={14} fill="currentColor" />}
            aria-label="Dừng"
            title="Dừng"
            onClick={() => threadUid && stopChatTurn(threadUid)}
            className="size-8! min-w-8!"
          />
        ) : (
          <Button
            type="primary"
            shape="circle"
            icon={<ArrowUp size={18} />}
            aria-label="Gửi"
            title="Gửi"
            disabled={!canSend}
            onClick={submit}
            className="size-8! min-w-8!"
          />
        )}
      </div>
    </div>
  );
}
