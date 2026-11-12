/**
 * Bỏ các giá trị rỗng ("" / null / undefined) khỏi query params, để filter chưa chọn
 * không bị gửi lên dưới dạng `?search=` (BE validate từng tham số được gửi).
 */
export const compactParams = <T extends object>(params: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  ) as Partial<T>;
