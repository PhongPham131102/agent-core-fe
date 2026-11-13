"use client";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useState } from "react";

import { DataTable, IconAction, useConfirmDelete } from "@/components/common";
import { Can, Permission, useAccess } from "@/features/auth";
import { useDisclosure } from "@/lib/hooks";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/url";
import { formatBytes, formatDateTime } from "@/lib/utils/format";

import {
  useAiKnowledgeDocumentsQuery,
  useDeleteKnowledgeDocument,
} from "../../api/ai-knowledge.queries";

import { DocumentStatusTag } from "./document-status-tag";
import { DocumentUploadModal } from "./document-upload-modal";

import type { IAiKnowledgeDocument } from "../../types/ai-knowledge.types";
import type { TableColumnsType } from "antd";

/** Tài liệu của một kho. Phân trang giữ trong drawer, không đưa lên URL. */
export function KnowledgeDocumentsTab({ baseUid }: { baseUid: string }) {
  const { can } = useAccess();
  const [query, setQuery] = useState({ page: DEFAULT_PAGE, limit: DEFAULT_LIMIT });
  const documents = useAiKnowledgeDocumentsQuery(baseUid, query);
  const deleteDocument = useDeleteKnowledgeDocument();
  const confirmDelete = useConfirmDelete();
  const upload = useDisclosure();

  const handleDelete = (document: IAiKnowledgeDocument) =>
    confirmDelete({
      title: `Xoá tài liệu "${document.fileName}"?`,
      onConfirm: () => deleteDocument.mutateAsync({ uid: baseUid, documentUid: document.uid }),
    });

  const columns: TableColumnsType<IAiKnowledgeDocument> = [
    { title: "File", dataIndex: "fileName", ellipsis: true },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_, document) => <DocumentStatusTag {...document} />,
    },
    { title: "Số đoạn", dataIndex: "chunkCount", width: 90, align: "right" },
    {
      title: "Dung lượng",
      dataIndex: "sizeBytes",
      width: 110,
      align: "right",
      render: (size: number) => formatBytes(size),
    },
    {
      title: "Thêm lúc",
      dataIndex: "createdAt",
      width: 150,
      render: (createdAt: string) => formatDateTime(createdAt),
    },
    {
      title: "",
      key: "actions",
      width: 56,
      align: "right",
      hidden: !can(Permission.aiKnowledgeUpdate),
      render: (_, document) => (
        <IconAction
          label="Xoá"
          ariaLabel={`Xoá tài liệu ${document.fileName}`}
          icon={<DeleteOutlined />}
          danger
          onClick={() => handleDelete(document)}
        />
      ),
    },
  ];

  return (
    <>
      <Can permission={Permission.aiKnowledgeUpdate}>
        <div className="mb-3 flex justify-end">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => upload.show()}>
            Thêm tài liệu
          </Button>
        </div>
      </Can>
      <DataTable<IAiKnowledgeDocument>
        columns={columns}
        result={documents}
        query={query}
        onPaginationChange={(page, limit) => setQuery({ page, limit })}
        locale={{ emptyText: "Chưa có tài liệu nào" }}
      />
      <DocumentUploadModal open={upload.open} baseUid={baseUid} onClose={upload.hide} />
    </>
  );
}
