import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mswHttp } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import "@/features/ai-knowledge/errors";
import { DocumentUploadModal } from "@/features/ai-knowledge/components/documents/document-upload-modal";
import { getQueryClient } from "@/lib/query";
import { apiOk, apiUrl, server } from "@/tests/support/msw-server";
import { renderWithProviders } from "@/tests/support/render";

const BASE_UID = "66666666-6666-4666-8666-666666666666";
const UPLOAD_URL = `/ai-knowledge-bases/${BASE_UID}/documents`;

const fileInput = () => document.querySelector<HTMLInputElement>('input[type="file"]')!;
const textFile = (name: string) => new File(["Chính sách đổi trả"], name, { type: "text/plain" });

const documentWith = (fileName: string, status: "ready" | "failed") => ({
  uid: fileName,
  fileName,
  mimeType: "text/plain",
  sizeBytes: 10,
  chunkCount: status === "ready" ? 1 : 0,
  status: { id: status, name: status },
  errorMessage: status === "failed" ? "The file has no text" : "",
  createdAt: "2026-01-01T00:00:00.000Z",
});

const renderModal = () => {
  const onClose = vi.fn();
  renderWithProviders(<DocumentUploadModal open baseUid={BASE_UID} onClose={onClose} />);
  return onClose;
};

afterEach(() => getQueryClient().clear());

describe("DocumentUploadModal", () => {
  it("gửi mọi file đã chọn trong một request, field `files`", async () => {
    const bodies: string[] = [];
    server.use(
      mswHttp.post(apiUrl(UPLOAD_URL), async ({ request }) => {
        bodies.push(await request.text());
        return apiOk([documentWith("a.md", "ready"), documentWith("b.txt", "ready")]);
      }),
    );
    const onClose = renderModal();

    await userEvent.upload(fileInput(), [textFile("a.md"), textFile("b.txt")]);
    await userEvent.click(screen.getByRole("button", { name: "Tải lên" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(bodies).toHaveLength(1);
    expect(bodies[0]).toContain('name="files"; filename="a.md"');
    expect(bodies[0]).toContain('name="files"; filename="b.txt"');
    expect(await screen.findByText("Đã thêm 2 tài liệu")).toBeInTheDocument();
  });

  it("có file xử lý lỗi thì báo số file lỗi", async () => {
    server.use(
      mswHttp.post(apiUrl(UPLOAD_URL), () =>
        apiOk([documentWith("a.md", "ready"), documentWith("b.txt", "failed")]),
      ),
    );
    renderModal();

    await userEvent.upload(fileInput(), [textFile("a.md"), textFile("b.txt")]);
    await userEvent.click(screen.getByRole("button", { name: "Tải lên" }));

    expect(await screen.findByText("1/2 file xử lý lỗi")).toBeInTheDocument();
  });

  it("không gửi request khi có file sai định dạng", async () => {
    let called = false;
    server.use(
      mswHttp.post(apiUrl(UPLOAD_URL), () => {
        called = true;
        return apiOk([]);
      }),
    );
    renderModal();

    await userEvent.setup({ applyAccept: false }).upload(fileInput(), textFile("a.pdf"));
    await userEvent.click(screen.getByRole("button", { name: "Tải lên" }));

    expect(await screen.findByText(/^a\.pdf: chỉ nhận/)).toBeInTheDocument();
    expect(called).toBe(false);
  });
});
