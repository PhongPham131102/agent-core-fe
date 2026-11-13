/** Giá trị rỗng theo `type` trong JSON Schema, để điền sẵn khung tham số khi gọi thử tool. */
const EMPTY_BY_TYPE: Record<string, unknown> = {
  string: "",
  number: 0,
  integer: 0,
  boolean: false,
  array: [],
  object: {},
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** `{ properties: { keyword: { type: "string" } } }` → `'{\n  "keyword": ""\n}'`. */
export const argumentsTemplate = (inputSchema: Record<string, unknown>) => {
  const properties = isRecord(inputSchema.properties) ? inputSchema.properties : {};
  const template = Object.fromEntries(
    Object.entries(properties).map(([name, property]) => {
      const type = isRecord(property) && typeof property.type === "string" ? property.type : "";
      return [name, EMPTY_BY_TYPE[type] ?? null];
    }),
  );
  return JSON.stringify(template, null, 2);
};

/** Chuỗi đã qua `mcpToolArgumentsSchema` → object gửi BE; trống là `{}`. */
export const parseArguments = (text: string): Record<string, unknown> =>
  text.trim() ? (JSON.parse(text) as Record<string, unknown>) : {};
