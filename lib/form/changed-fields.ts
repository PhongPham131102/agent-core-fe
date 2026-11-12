/** Hai mảng coi là bằng nhau khi cùng tập phần tử, không xét thứ tự. */
const isSameValue = (a: unknown, b: unknown) =>
  Array.isArray(a) && Array.isArray(b)
    ? a.length === b.length && a.every((item) => b.includes(item))
    : a === b;

/**
 * Lấy những field của `next` khác với bản ghi hiện tại, để PATCH chỉ gửi phần đã đổi.
 * BE coi field vắng mặt là "giữ nguyên", nên gửi thừa vừa dễ ghi đè thay đổi của người khác
 * vừa có thể bị từ chối (ví dụ `permissions` của role phải nằm trong quyền của người sửa).
 */
export const changedFields = <T extends object>(
  current: { [K in keyof T]?: unknown },
  next: T,
): Partial<T> =>
  Object.fromEntries(
    Object.entries(next).filter(
      ([key, value]) => value !== undefined && !isSameValue(value, current[key as keyof T]),
    ),
  ) as Partial<T>;

export const hasChanges = (body: object) => Object.keys(body).length > 0;

/** Ô trống của antd có thể là `undefined` (Select xoá), `null` (InputNumber) hoặc `""` (Input). */
const isEmpty = (value: unknown) => value === undefined || value === null || value === "";

/**
 * Giá trị form có khác giá trị ban đầu không, để bật/tắt nút Lưu và Hoàn tác.
 * Khác `changedFields`: xoá trắng một field cũng tính là thay đổi.
 */
export const isDirty = (initial: object, values: object) => {
  const a = initial as Record<string, unknown>;
  const b = values as Record<string, unknown>;
  return Object.keys({ ...a, ...b }).some((key) =>
    isEmpty(a[key]) || isEmpty(b[key])
      ? isEmpty(a[key]) !== isEmpty(b[key])
      : !isSameValue(a[key], b[key]),
  );
};
