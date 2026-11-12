/** "***abcd" (dạng che BE trả về) → "•••• abcd": đủ để nhận ra key, không lộ thêm gì. */
export const formatMaskedKey = (secretKey: string) => `•••• ${secretKey.replace(/^\*+/, "")}`;
