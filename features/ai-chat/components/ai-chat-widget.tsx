"use client";

import { Button, Modal } from "antd";
import { MessageCircleMore } from "lucide-react";
import { useState } from "react";

import { useChatConnection } from "../hooks/use-chat-connection";
import { useAiChatStore } from "../store/ai-chat.store";

import { AiChatPanel } from "./ai-chat-panel";

const FULLSCREEN_STYLE = { top: 0, maxWidth: "100vw", margin: 0, paddingBottom: 0 };

/**
 * Chat với agent dạng popup: nút tròn ở góc phải dưới mở khung chat; phóng to thì chiếm
 * cả màn hình. Socket chỉ kết nối khi khung chat đang mở.
 */
export function AiChatWidget() {
  const isOpen = useAiChatStore.use.isOpen();
  const setOpen = useAiChatStore.use.setOpen();
  const [expanded, setExpanded] = useState(false);
  useChatConnection(isOpen);

  const close = () => {
    setOpen(false);
    setExpanded(false);
  };
  const panel = (
    <AiChatPanel
      expanded={expanded}
      onToggleExpanded={() => setExpanded((value) => !value)}
      onClose={close}
    />
  );

  return (
    <>
      {isOpen && !expanded && (
        <section
          role="dialog"
          aria-modal="false"
          aria-label="AI Chat"
          className="fixed end-3 bottom-6 z-[1000] h-[700px] max-h-[calc(100dvh-48px)] w-[580px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border shadow-2xl"
          style={{
            background: "var(--ac-color-bg-container)",
            borderColor: "var(--ac-color-border-secondary)",
          }}
        >
          {panel}
        </section>
      )}

      <Modal
        open={isOpen && expanded}
        width="100vw"
        style={FULLSCREEN_STYLE}
        footer={null}
        closable={false}
        mask={{ closable: false }}
        keyboard={false}
        onCancel={close}
        styles={{
          container: { padding: 0, borderRadius: 0, overflow: "hidden" },
          body: { height: "100dvh", padding: 0, display: "flex", overflow: "hidden" },
        }}
      >
        {expanded && panel}
      </Modal>

      {!isOpen && (
        <div className="fixed end-3 bottom-6 z-[1001] size-11">
          <span
            aria-hidden
            className="ai-chat-fab-pulse pointer-events-none absolute inset-0 rounded-full"
          />
          <Button
            type="primary"
            shape="circle"
            icon={<MessageCircleMore size={20} />}
            aria-label="Mở AI Chat"
            title="Mở AI Chat"
            onClick={() => setOpen(true)}
            className="ai-chat-fab relative! flex! size-11! items-center justify-center border-0! shadow-lg transition-transform hover:scale-105"
          />
        </div>
      )}
    </>
  );
}
