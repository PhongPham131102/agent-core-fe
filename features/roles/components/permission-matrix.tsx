"use client";

import { Alert, Button, Checkbox, Skeleton, Tooltip } from "antd";
import { useMemo } from "react";

import { actionLabel, hasPermissions, subjectLabel, useAccess } from "@/features/auth";
import { getErrorMessage } from "@/lib/http";

import { usePermissionCatalogQuery } from "../api/roles.queries";

interface IPermissionMatrixProps {
  /** Được `Form.Item` truyền vào. */
  value?: string[];
  onChange?: (next: string[]) => void;
}

const NOT_GRANTABLE_HINT = "Bạn không có quyền này nên không thể cấp cho vai trò khác";

/**
 * Bảng chọn quyền: mỗi hàng là một đối tượng, mỗi cột là một hành động.
 * Danh mục lấy từ BE nên quyền mới tự xuất hiện. Quyền mà người đang thao tác
 * không có thì bị khoá, vì BE từ chối việc cấp quyền vượt quá quyền của mình.
 */
export function PermissionMatrix({ value = [], onChange }: IPermissionMatrixProps) {
  const { user } = useAccess();
  const { data: catalog, error, isPending, refetch } = usePermissionCatalogQuery();

  const actions = useMemo(
    () => [...new Set(catalog?.flatMap((group) => group.permissions.map((p) => p.action)))],
    [catalog],
  );

  if (isPending) return <Skeleton active paragraph={{ rows: 3 }} title={false} />;
  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        title={`Không tải được danh mục quyền: ${getErrorMessage(error)}`}
        action={
          <Button size="small" onClick={() => void refetch()}>
            Thử lại
          </Button>
        }
      />
    );
  }

  const selected = new Set(value);
  const canGrant = (key: string) => hasPermissions(user, [key]);

  const toggle = (keys: string[], checked: boolean) => {
    const next = new Set(selected);
    for (const key of keys) {
      if (checked) next.add(key);
      else next.delete(key);
    }
    onChange?.([...next]);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-black/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-black/[0.02] text-left">
            <th className="px-3 py-2 font-medium">Đối tượng</th>
            {actions.map((action) => (
              <th key={action} className="px-3 py-2 text-center font-medium">
                {actionLabel(action)}
              </th>
            ))}
            <th className="px-3 py-2 text-center font-medium">Tất cả</th>
          </tr>
        </thead>
        <tbody>
          {catalog.map((group) => {
            const grantableKeys = group.permissions.map((p) => p.key).filter(canGrant);
            const checkedCount = grantableKeys.filter((key) => selected.has(key)).length;
            const label = subjectLabel(group.subject);

            return (
              <tr key={group.subject} className="border-t border-black/10">
                <td className="px-3 py-2">{label}</td>
                {actions.map((action) => {
                  const permission = group.permissions.find((p) => p.action === action);
                  if (!permission) return <td key={action} />;
                  const grantable = canGrant(permission.key);

                  return (
                    <td key={action} className="px-3 py-2 text-center">
                      <Tooltip title={grantable ? undefined : NOT_GRANTABLE_HINT}>
                        <Checkbox
                          aria-label={`${actionLabel(action)} ${label.toLowerCase()}`}
                          checked={selected.has(permission.key)}
                          disabled={!grantable}
                          onChange={(event) => toggle([permission.key], event.target.checked)}
                        />
                      </Tooltip>
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center">
                  <Checkbox
                    aria-label={`Tất cả quyền ${label.toLowerCase()}`}
                    checked={grantableKeys.length > 0 && checkedCount === grantableKeys.length}
                    indeterminate={checkedCount > 0 && checkedCount < grantableKeys.length}
                    disabled={grantableKeys.length === 0}
                    onChange={(event) => toggle(grantableKeys, event.target.checked)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
