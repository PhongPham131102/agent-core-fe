"use client";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Space, Tag, Tooltip, Typography } from "antd";

import { DataTable, IconAction, PageHeader, useConfirmDelete } from "@/components/common";
import { Can, Permission, PermissionGuard, useAccess } from "@/features/auth";
import { useDisclosure } from "@/lib/hooks";
import { formatDateTime } from "@/lib/utils/format";

import { useAiApiKeysQuery, useDeleteAiApiKey } from "../../api/ai-api-keys.queries";
import { useAiProvidersQuery } from "../../api/ai-catalog.queries";
import { useAiApiKeyFilters } from "../../hooks/use-ai-api-key-filters";
import { formatMaskedKey } from "../../masked-key";

import { AiApiKeyFormModal } from "./ai-api-key-form-modal";

import type { IAiApiKey } from "../../types/ai-api-key.types";
import type { IAiCatalogOption } from "../../types/ai-catalog.types";
import type { TableColumnsType } from "antd";

const MaskedKey = ({ value }: { value: string }) => (
  <span className="font-mono whitespace-nowrap text-black/65">{formatMaskedKey(value)}</span>
);

function AiApiKeysContent() {
  const { can } = useAccess();
  const { query, setPagination } = useAiApiKeyFilters();
  const keys = useAiApiKeysQuery(query);
  const providers = useAiProvidersQuery();
  const deleteKey = useDeleteAiApiKey();
  const confirmDelete = useConfirmDelete();
  const form = useDisclosure<IAiApiKey>();

  const canEdit = can(Permission.aiApiKeyUpdate);
  const canDelete = can(Permission.aiApiKeyDelete);
  const usedProviders = keys.data?.items.map(({ provider }) => provider.id) ?? [];
  // Form thêm key cần danh sách nhà cung cấp; có rồi mới biết còn nhà cung cấp nào chưa có key.
  const addBlockedReason = !providers.data
    ? providers.isError && "Không tải được danh sách nhà cung cấp"
    : providers.data.every(({ id }) => usedProviders.includes(id)) &&
      "Mọi nhà cung cấp đều đã có key";

  const handleDelete = (apiKey: IAiApiKey) =>
    confirmDelete({
      title: `Xoá API key ${apiKey.provider.name}?`,
      content: "Agent dùng nhà cung cấp này sẽ không gọi được AI cho tới khi có key mới.",
      onConfirm: () => deleteKey.mutateAsync(apiKey.uid),
    });

  const columns: TableColumnsType<IAiApiKey> = [
    {
      title: "Nhà cung cấp",
      dataIndex: "provider",
      render: (provider: IAiCatalogOption) => <span className="font-medium">{provider.name}</span>,
    },
    {
      title: "API key",
      dataIndex: "secretKey",
      render: (secretKey: string) => <MaskedKey value={secretKey} />,
    },
    {
      title: "Model mặc định",
      dataIndex: "defaultModel",
      render: (model: IAiCatalogOption | null) =>
        model ? (
          <Tag title={model.id}>{model.name}</Tag>
        ) : (
          <Typography.Text type="secondary">Chưa đặt</Typography.Text>
        ),
    },
    {
      title: "Lượt dùng",
      dataIndex: "usageCount",
      width: 110,
      align: "right",
      render: (count: number) => count.toLocaleString("vi-VN"),
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      width: 170,
      render: (updatedAt: string) => formatDateTime(updatedAt),
    },
    {
      title: "",
      key: "actions",
      width: 96,
      align: "right",
      hidden: !canEdit && !canDelete,
      render: (_, apiKey) => {
        const { name } = apiKey.provider;
        return (
          <Space size={4}>
            {canEdit && (
              <IconAction
                label="Sửa"
                ariaLabel={`Sửa API key ${name}`}
                icon={<EditOutlined />}
                onClick={() => form.show(apiKey)}
              />
            )}
            {canDelete && (
              <IconAction
                label="Xoá"
                ariaLabel={`Xoá API key ${name}`}
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDelete(apiKey)}
              />
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="API key"
        description="Key của các nhà cung cấp AI mà agent dùng để gọi model. Mỗi nhà cung cấp một key."
        extra={
          <Can permission={Permission.aiApiKeyCreate}>
            <Tooltip title={addBlockedReason}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                loading={providers.isPending}
                disabled={Boolean(addBlockedReason)}
                onClick={() => form.show()}
              >
                Thêm API key
              </Button>
            </Tooltip>
          </Can>
        }
      />
      <Card>
        <DataTable<IAiApiKey>
          columns={columns}
          result={keys}
          query={query}
          onPaginationChange={setPagination}
          locale={{ emptyText: "Chưa có API key nào" }}
        />
      </Card>
      <AiApiKeyFormModal
        open={form.open}
        apiKey={form.payload}
        providers={providers.data ?? []}
        usedProviders={usedProviders}
        onClose={form.hide}
      />
    </>
  );
}

export function AiApiKeysPage() {
  return (
    <PermissionGuard permission={Permission.aiApiKeyRead}>
      <AiApiKeysContent />
    </PermissionGuard>
  );
}
