"use client";

import { useCallback, useState } from "react";

interface IDisclosureState<T> {
  open: boolean;
  payload: T | undefined;
}

/**
 * State đóng/mở cho modal, drawer kèm dữ liệu đang thao tác (ví dụ bản ghi đang sửa).
 * `hide()` giữ nguyên `payload` để nội dung không đổi trong lúc chạy animation đóng.
 */
export const useDisclosure = <T = undefined>() => {
  const [state, setState] = useState<IDisclosureState<T>>({ open: false, payload: undefined });

  const show = useCallback((payload?: T) => setState({ open: true, payload }), []);
  const hide = useCallback(() => setState((prev) => ({ ...prev, open: false })), []);

  return { ...state, show, hide };
};
