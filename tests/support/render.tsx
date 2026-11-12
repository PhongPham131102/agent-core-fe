import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { App } from "antd";

import { getQueryClient } from "@/lib/query";

import type { ReactElement, ReactNode } from "react";

/**
 * Render kèm các provider mà component thật cần. Dùng chính QueryClient singleton
 * của app vì code ngoài React (session, MutationCache) cũng ghi vào client này.
 * Gọi `getQueryClient().clear()` trong `afterEach` của file test.
 */
export const renderWithProviders = (ui: ReactElement) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={getQueryClient()}>
      <App>{children}</App>
    </QueryClientProvider>
  );
  return render(ui, { wrapper: Wrapper });
};
