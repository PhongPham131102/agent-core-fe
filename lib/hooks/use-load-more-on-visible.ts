"use client";

import { useEffect, useRef } from "react";

interface ILoadMoreOptions {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

/**
 * Gắn ref trả về vào một phần tử nhỏ ở cuối danh sách: phần tử đó lọt vào màn hình thì
 * tải trang tiếp. Dùng cho danh sách cuộn vô hạn (`useInfiniteQuery`).
 */
export const useLoadMoreOnVisible = <T extends Element>({
  hasMore,
  loading,
  onLoadMore,
}: ILoadMoreOptions) => {
  const ref = useRef<T>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const target = ref.current;
    if (!target || !hasMore || loading) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) onLoadMoreRef.current();
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  return ref;
};
