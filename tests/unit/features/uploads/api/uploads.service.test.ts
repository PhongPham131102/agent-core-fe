import { http as mswHttp } from "msw";
import { describe, expect, it } from "vitest";

import { uploadService } from "@/features/uploads/api/uploads.service";
import { apiOk, apiUrl, server } from "@/tests/support/msw-server";

const uploaded = {
  uid: "u1",
  url: "https://cdn.test/agent-core/images/2026-11/u1.webp",
  contentType: "image/webp",
  size: 10,
  width: 1,
  height: 1,
  createdAt: "2026-11-12T00:00:00.000Z",
};

describe("uploadService.uploadImage", () => {
  it("gửi multipart với field `file`, không bị đổi sang JSON", async () => {
    let contentType: string | null = null;
    let body = "";
    server.use(
      mswHttp.post(apiUrl("/uploads/images"), async ({ request }) => {
        contentType = request.headers.get("content-type");
        // Đọc thô: request.formData() của undici không đọc được body jsdom tạo ra.
        body = await request.text();
        return apiOk(uploaded);
      }),
    );

    const file = new File([new Uint8Array([1, 2, 3])], "avatar.png", { type: "image/png" });

    await expect(uploadService.uploadImage(file)).resolves.toEqual(uploaded);
    expect(contentType).toMatch(/^multipart\/form-data; boundary=/);
    expect(body).toContain('name="file"; filename="avatar.png"');
  });
});
