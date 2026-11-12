# agent-core-fe

Frontend cho `agent-core-be`. Stack: Next.js 16 (App Router, Cache Components), React 19, Ant Design 6, TanStack Query 5, Zustand 5, Axios, Zod 4, nuqs, Tailwind 4 (chỉ layout/spacing). Package manager: **yarn**. Kế hoạch và lý do thiết kế: `docs/PLAN.md`.

## Lệnh

```bash
yarn dev          # http://localhost:3001 (BE chạy ở 3000)
yarn typecheck    # next typegen + tsc
yarn lint
yarn test         # Vitest + MSW
yarn build
yarn verify       # chạy tất cả ở trên; phải xanh trước khi commit
```

Env: `cp .env.example .env.local`. Biến được validate ở `lib/env.ts`, thiếu là app không chạy.

## Cấu trúc

```
app/                 route; page.tsx chỉ mount component của feature + metadata
features/<domain>/   api/ (service, keys, queries) · components/ · hooks/ · store/ · schemas/ · types/ · errors.ts · index.ts
components/          ui chung: providers/, layout/, common/ (không chứa từ nghiệp vụ)
lib/                 hạ tầng: env, http, query, store, auth, ui/notify, theme, constants
stores/              store toàn app (app.store.ts)
tests/               setup Vitest, MSW server
```

Hướng phụ thuộc: `app → features → components → lib`. ESLint chặn `lib/` import `features/`/`components/`, và chặn import sâu `@/features/<domain>/...` (chỉ qua `index.ts`).

## Quy ước

- **Server state chỉ ở React Query.** Zustand chỉ cho UI state dùng chung. State cục bộ dùng `useState`. Filter/pagination cần share link dùng `nuqs`.
- **Gọi API:** component → hook trong `features/<domain>/api/*.queries.ts` → service → `http` (`@/lib/http`). Component không gọi `http`/`apiClient` trực tiếp.
- `http.get<T>()` trả thẳng `T` (đã bỏ envelope `{ success, data }`). Mọi lỗi là `ApiError { status, code, message, details }`. Hiển thị lỗi bằng `getErrorMessage(error)`.
- **Mã lỗi riêng của feature:** khai báo trong `features/<domain>/errors.ts` bằng `registerErrorMessages({...})`, không sửa `lib/http`.
- **Query key:** mỗi feature có key factory (`agentKeys.all/lists/list/details/detail`) và `queryOptions()` dùng chung cho `useQuery`, `prefetchQuery`, `invalidateQueries`. Không ghép key bằng tay.
- **Mutation:** khai báo `meta: { invalidates: [...], successMessage }`; toast lỗi và invalidate do `MutationCache` lo. Dùng `meta.silentError` khi tự xử lý lỗi.
- **Store:** tạo bằng `createStore` / `createPersistedStore` (`@/lib/store`), khai báo interface `State` và `Actions` riêng. Persist phải có `version` + `partialize`. Đọc state bằng selector `useXStore.use.field()`.
- Pagination khớp BE: query `page`, `limit`; kết quả `IPaginated<T>` = `{ items, total, page, limit }`. ID nghiệp vụ là `uid`.
- Component antd (nhất là dạng lồng `Typography.Title`, `Layout.Sider`) chỉ dùng trong Client Component (`"use client"`). `page.tsx`/`layout.tsx` là Server Component, chỉ mount component của feature.
- Thông báo ngoài React dùng `notify` (`@/lib/ui/notify`); trong component dùng `App.useApp()` của antd.
- Text giao diện viết tiếng Việt trực tiếp (chưa dùng i18n).
- Không dùng lodash cho việc TS làm được (`===`, `?.`, `??`).
- Component dài quá ~250 dòng thì tách sub-component/hook.
- Test đặt cạnh file (`*.test.ts(x)`), mock API bằng MSW (`tests/msw-server.ts`).
- Realtime/socket: **chưa làm**, không thêm khi chưa được yêu cầu.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
