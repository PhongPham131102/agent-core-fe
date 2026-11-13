"use client";

import { Drawer, Tabs } from "antd";

import { KnowledgeDocumentsTab } from "./documents/knowledge-documents-tab";
import { KnowledgeSearchTab } from "./search/knowledge-search-tab";

import type { IAiKnowledgeBase } from "../types/ai-knowledge.types";

const DRAWER_WIDTH = 860;

interface IKnowledgeBaseDrawerProps {
  open: boolean;
  base?: IAiKnowledgeBase;
  onClose: () => void;
}

/** Tài liệu và tìm thử của một kho. */
export function KnowledgeBaseDrawer({ open, base, onClose }: IKnowledgeBaseDrawerProps) {
  return (
    <Drawer title={base?.name} open={open} onClose={onClose} size={DRAWER_WIDTH} destroyOnHidden>
      {base && (
        <Tabs
          items={[
            {
              key: "documents",
              label: "Tài liệu",
              children: <KnowledgeDocumentsTab baseUid={base.uid} />,
            },
            {
              key: "search",
              label: "Tìm thử",
              children: <KnowledgeSearchTab baseUid={base.uid} />,
            },
          ]}
        />
      )}
    </Drawer>
  );
}
