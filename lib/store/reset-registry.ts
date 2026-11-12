/**
 * Store nào cần xoá khi logout thì tự đăng ký ở đây.
 * Session lifecycle chỉ gọi `resetAllStores()`, không cần biết có những store nào.
 */
const resets = new Map<string, () => void>();

export const registerStoreReset = (name: string, reset: () => void) => {
  resets.set(name, reset);
};

export const resetAllStores = () => {
  resets.forEach((reset) => reset());
};
