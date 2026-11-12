/**
 * Chạy `task` khi giữ khoá dùng chung giữa các tab (Web Locks API).
 * Dùng cho thao tác không được chạy song song ở nhiều tab, ví dụ refresh token
 * xoay vòng dùng một lần. Trình duyệt không hỗ trợ thì chạy thẳng.
 */
export const withCrossTabLock = <T>(name: string, task: () => Promise<T>): Promise<T> => {
  if (typeof navigator === "undefined" || !navigator.locks) return task();
  return navigator.locks.request(name, task) as Promise<T>;
};
