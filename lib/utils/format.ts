const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" });

export const formatDateTime = (value: string | Date | null | undefined) => {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`;
};

const BYTE_UNITS = ["B", "KB", "MB", "GB"];
const sizeFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });

/** 1536 → "1,5 KB". */
export const formatBytes = (bytes: number) => {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${sizeFormatter.format(value)} ${BYTE_UNITS[unit]}`;
};
