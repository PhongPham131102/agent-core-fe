import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mswHttp } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import { AiMemoriesModal } from "@/features/ai-memories";
import { getQueryClient } from "@/lib/query";
import { apiOk, apiUrl, server } from "@/tests/support/msw-server";
import { renderWithProviders } from "@/tests/support/render";

const AGENT_UID = "77777777-7777-4777-8777-777777777777";

afterEach(() => getQueryClient().clear());

describe("AiMemoriesModal", () => {
  it("liệt kê ghi nhớ của agent và xoá được", async () => {
    let deleted: string | undefined;
    server.use(
      mswHttp.get(apiUrl("/ai-memories"), ({ request }) =>
        new URL(request.url).searchParams.get("agentUid") === AGENT_UID
          ? apiOk([
              { uid: "m1", content: "Thích trả lời ngắn", createdAt: "2026-01-01T00:00:00.000Z" },
            ])
          : apiOk([]),
      ),
      mswHttp.delete(apiUrl("/ai-memories/:uid"), ({ params }) => {
        deleted = String(params.uid);
        return new Response(null, { status: 204 });
      }),
    );
    renderWithProviders(<AiMemoriesModal open agentUid={AGENT_UID} onClose={() => undefined} />);

    expect(await screen.findByText("Thích trả lời ngắn")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xoá ghi nhớ" }));
    await userEvent.click(await screen.findByRole("button", { name: "Xoá" }));

    await waitFor(() => expect(deleted).toBe("m1"));
  });
});
