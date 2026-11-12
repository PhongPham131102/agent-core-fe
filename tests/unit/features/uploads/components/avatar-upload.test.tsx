import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mswHttp } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AvatarUpload } from "@/features/uploads";
import { getQueryClient } from "@/lib/query";
import { apiError, apiOk, apiUrl, server } from "@/tests/support/msw-server";
import { renderWithProviders } from "@/tests/support/render";

const URL_AFTER_UPLOAD = "https://cdn.test/agent-core/images/2026-11/u1.webp";

const pngFile = () => new File([new Uint8Array([1, 2, 3])], "a.png", { type: "image/png" });

const fileInput = () => document.querySelector<HTMLInputElement>('input[type="file"]')!;

afterEach(() => getQueryClient().clear());

describe("AvatarUpload", () => {
  it("tải ảnh lên rồi trả URL qua onChange", async () => {
    server.use(
      mswHttp.post(apiUrl("/uploads/images"), () => apiOk({ uid: "u1", url: URL_AFTER_UPLOAD })),
    );
    const onChange = vi.fn();
    renderWithProviders(<AvatarUpload value="" onChange={onChange} />);

    await userEvent.upload(fileInput(), pngFile());

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(URL_AFTER_UPLOAD));
  });

  it("không gửi request khi file sai định dạng", async () => {
    let called = false;
    server.use(
      mswHttp.post(apiUrl("/uploads/images"), () => {
        called = true;
        return apiOk({});
      }),
    );
    const onChange = vi.fn();
    renderWithProviders(<AvatarUpload value="" onChange={onChange} />);

    const pdf = new File(["x"], "a.pdf", { type: "application/pdf" });
    await userEvent.setup({ applyAccept: false }).upload(fileInput(), pdf);

    expect(await screen.findByText("Chỉ nhận ảnh JPG, PNG, WebP hoặc GIF")).toBeInTheDocument();
    expect(called).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("BE từ chối ảnh thì không đổi giá trị", async () => {
    server.use(mswHttp.post(apiUrl("/uploads/images"), () => apiError(415, "ERR_2301")));
    const onChange = vi.fn();
    renderWithProviders(<AvatarUpload value="" onChange={onChange} />);

    await userEvent.upload(fileInput(), pngFile());

    await waitFor(() =>
      expect(getQueryClient().getMutationCache().getAll()[0]?.state.status).toBe("error"),
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it("nút 'Xoá ảnh' trả chuỗi rỗng", async () => {
    const onChange = vi.fn();
    renderWithProviders(<AvatarUpload value={URL_AFTER_UPLOAD} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: /Xoá ảnh/ }));

    expect(onChange).toHaveBeenCalledWith("");
  });
});
