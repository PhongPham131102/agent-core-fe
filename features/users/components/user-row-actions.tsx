"use client";

import { DeleteOutlined, EditOutlined, KeyOutlined } from "@ant-design/icons";
import { Space } from "antd";

import { IconAction } from "@/components/common";
import { Permission, useAccess } from "@/features/auth";

import type { IUser } from "../types/user.types";

interface IUserRowActionsProps {
  user: IUser;
  /** false khi người này giữ role nhiều quyền hơn người đang thao tác. */
  manageable: boolean;
  onEdit: (user: IUser) => void;
  onResetPassword: (user: IUser) => void;
  onDelete: (user: IUser) => void;
}

const NOT_MANAGEABLE = "Người này có vai trò nhiều quyền hơn bạn";
const CANNOT_DELETE_SELF = "Không thể xoá tài khoản của chính mình";

export function UserRowActions({
  user,
  manageable,
  onEdit,
  onResetPassword,
  onDelete,
}: IUserRowActionsProps) {
  const { can, user: currentUser } = useAccess();
  const isSelf = user.uid === currentUser?.uid;
  const name = user.fullName || user.email;
  const blocked = !manageable && NOT_MANAGEABLE;

  return (
    <Space size={4}>
      {can(Permission.userUpdate) && (
        <>
          <IconAction
            label="Sửa"
            ariaLabel={`Sửa ${name}`}
            icon={<EditOutlined />}
            disabledReason={blocked}
            onClick={() => onEdit(user)}
          />
          <IconAction
            label="Đặt lại mật khẩu"
            ariaLabel={`Đặt lại mật khẩu của ${name}`}
            icon={<KeyOutlined />}
            disabledReason={blocked}
            onClick={() => onResetPassword(user)}
          />
        </>
      )}
      {can(Permission.userDelete) && (
        <IconAction
          label="Xoá"
          ariaLabel={`Xoá ${name}`}
          icon={<DeleteOutlined />}
          danger
          disabledReason={blocked || (isSelf && CANNOT_DELETE_SELF)}
          onClick={() => onDelete(user)}
        />
      )}
    </Space>
  );
}
