import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mswHttp } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import "@/features/ai-skills/errors";
import { AiSkillUploadModal } from "@/features/ai-skills/components/upload/ai-skill-upload-modal";
import { getQueryClient } from "@/lib/query";
import { buildAiSkill } from "@/tests/support/ai-fixtures";
import { apiError, apiOk, apiUrl, server } from "@/tests/support/msw-server";
import { renderWithProviders } from "@/tests/support/render";

import type { IAiSkill } from "@/features/ai-skills/types/ai-skill.types";

const skill = buildAiSkill();
const zip = () =>
  new File([new Uint8Array([80, 75, 3, 4])], "skill.zip", { type: "application/zip" });
const fileInput = () => document.querySelector<HTMLInputElement>('input[type="file"]')!;

/** Ghi lại body multipart thô (request.formData() của undici không đọc được body từ jsdom). */
const captureMultipart = (method: "post" | "put", url: string) => {
  const bodies: string[] = [];
  server.use(
    mswHttp[method](apiUrl(url), async ({ request }) => {
      bodies.push(await request.text());
      return apiOk(skill);
    }),
  );
  return bodies;
};

const renderModal = (target?: IAiSkill) => {
  const onClose = vi.fn();
  renderWithProviders(<AiSkillUploadModal open skill={target} onClose={onClose} />);
  return onClose;
};

afterEach(() => getQueryClient().clear());

describe("AiSkillUploadModal", () => {
  it("tải skill mới: gửi file zip và mã đã nhập", async () => {
    const bodies = captureMultipart("post", "/ai-skills");
    const onClose = renderModal();

    await userEvent.upload(fileInput(), zip());
    await userEvent.type(screen.getByLabelText("Mã"), "tra-cuu");
    await userEvent.click(screen.getByRole("button", { name: "Tải lên" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(bodies[0]).toContain('name="file"; filename="skill.zip"');
    expect(bodies[0]).toMatch(/name="code"\r\n\r\ntra-cuu/);
  });

  it("thay file: chỉ gửi file, không có ô mã", async () => {
    const bodies = captureMultipart("put", `/ai-skills/${skill.uid}/files`);
    const onClose = renderModal(skill);

    expect(screen.queryByLabelText("Mã")).not.toBeInTheDocument();
    await userEvent.upload(fileInput(), zip());
    await userEvent.click(screen.getByRole("button", { name: "Thay file" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(bodies[0]).toContain('filename="skill.zip"');
    expect(bodies[0]).not.toContain('name="code"');
  });

  it("gói thiếu SKILL.md thì báo lỗi ngay dưới ô file", async () => {
    server.use(mswHttp.post(apiUrl("/ai-skills"), () => apiError(400, "ERR_2608")));
    const onClose = renderModal();

    await userEvent.upload(fileInput(), zip());
    await userEvent.click(screen.getByRole("button", { name: "Tải lên" }));

    expect(await screen.findAllByText("Gói skill phải có SKILL.md ở thư mục gốc")).not.toHaveLength(
      0,
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it("không gửi request khi file không phải .zip", async () => {
    const bodies = captureMultipart("post", "/ai-skills");
    renderModal();

    const rar = new File(["x"], "skill.rar", { type: "application/x-rar" });
    await userEvent.setup({ applyAccept: false }).upload(fileInput(), rar);
    await userEvent.click(screen.getByRole("button", { name: "Tải lên" }));

    expect(await screen.findByText("Chỉ nhận file .zip")).toBeInTheDocument();
    expect(bodies).toEqual([]);
  });
});
