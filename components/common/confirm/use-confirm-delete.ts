"use client";

import { App } from "antd";
import { useCallback } from "react";

import type { ReactNode } from "react";

interface IConfirmDeleteOptions {
  title: string;
  content?: ReactNode;
  onConfirm: () => Promise<unknown>;
}

export const useConfirmDelete = () => {
  const { modal } = App.useApp();

  return useCallback(
    ({ title, content, onConfirm }: IConfirmDeleteOptions) => {
      void modal.confirm({
        title,
        content,
        okText: "Xoá",
        okButtonProps: { danger: true },
        cancelText: "Huỷ",
        onOk: () => onConfirm().catch(() => undefined),
      });
    },
    [modal],
  );
};
