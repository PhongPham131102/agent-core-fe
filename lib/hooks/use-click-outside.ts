"use client";

import { useEffect, useRef } from "react";

import type { RefObject } from "react";

/** Bấm (pointerdown) ra ngoài phần tử của `ref` thì gọi `onOutside`; chỉ lắng nghe khi `enabled`. */
export const useClickOutside = (
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  onOutside: () => void,
) => {
  const onOutsideRef = useRef(onOutside);

  useEffect(() => {
    onOutsideRef.current = onOutside;
  }, [onOutside]);

  useEffect(() => {
    if (!enabled) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onOutsideRef.current();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [ref, enabled]);
};
