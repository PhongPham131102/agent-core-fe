/** "Trợ lý bán hàng" → "TL": chữ đầu của hai từ đầu, làm ảnh đại diện cho agent. */
export const agentInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("") || "AI";
