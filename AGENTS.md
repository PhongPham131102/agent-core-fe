# agent-core-fe

Frontend cho `agent-core-be`. Stack: Next.js 16 (App Router, Cache Components), React 19, Ant Design 6, TanStack Query 5, Zustand 5, Axios, Zod 4, nuqs, Tailwind 4 (chỉ layout/spacing). Package manager: **yarn**. Kế hoạch và lý do thiết kế: `docs/PLAN.md`.

## Lệnh

```bash
yarn dev          # http://localhost:3443 (cổng BE xem PORT trong .env của agent-core-be)
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
  auth/              phiên đăng nhập, người dùng hiện tại, quyền (Permission, useAccess, Can, AuthGuard), trang login
  account/           tài khoản của chính mình: trang /profile (thông tin, ảnh đại diện, đổi mật khẩu), menu tài khoản
  uploads/           tải ảnh lên (POST /uploads/images), AvatarUpload dùng chung
  shell/             khung sau đăng nhập: AuthGuard + AppShell + menu theo quyền
  users/ · roles/    hai module CRUD mẫu (bảng + filter trên URL + form modal)
  ai-api-keys/       API key của nhà cung cấp AI (mỗi nhà cung cấp một key, key luôn ở dạng che)
components/          ui chung, không chứa từ nghiệp vụ, không import features/
  common/<tên>/      mỗi component một thư mục có index.ts: brand, confirm, data-table, feedback,
                     form-modal, icon-action, page, search-input
  layout/            AppShell (chỉ lo bố cục, nhận menu và header qua props)
  providers/
lib/                 hạ tầng: env, http, query, store, auth, form, hooks, url, ui/notify, theme, constants
stores/              store toàn app (app.store.ts)
tests/
  setup/             chạy trước mọi test (vitest.setup.ts: jest-dom, MSW, stub API trình duyệt)
  support/           dùng chung giữa các test: msw-server, render, fixtures
  unit/              *.test.ts(x), cây thư mục giống hệt mã nguồn
```

Hướng phụ thuộc: `app → features → components → lib`. ESLint chặn `lib/` import `features/`/`components/`, chặn `components/` import `features/`, và chặn import sâu `@/features/<domain>/...` (chỉ qua `index.ts`, kể cả giữa các feature). Trong cùng một feature thì import tương đối.

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
- Test không đặt cạnh mã nguồn. Mọi test nằm trong `tests/unit/`, cây thư mục giống hệt mã nguồn: `lib/http/client.ts` → `tests/unit/lib/http/client.test.ts`. Import mã cần test bằng alias `@/...`, kể cả code bên trong feature.
- Mock API bằng MSW (`tests/support/msw-server.ts`: `server`, `apiUrl`, `apiOk`, `apiError`). Render component cần provider bằng `renderWithProviders` (`tests/support/render.tsx`); dữ liệu mẫu ở `tests/support/fixtures.ts`.
- File có hook (`use*`, kể cả `*.queries.ts`) phải có `"use client"`, vì `index.ts` của feature được import từ `page.tsx` (Server Component).
- Realtime/socket: **chưa làm**, không thêm khi chưa được yêu cầu.

## Auth và phân quyền

- Access token chỉ nằm trong bộ nhớ (`tokenHolder`). Refresh token là cookie httpOnly do BE set, nên `apiClient` gửi `withCredentials`. Tải trang thì `AuthGuard` gọi `POST /auth/refresh` để khôi phục phiên.
- Chỉ `refreshSession()` (`features/auth/api/auth.session.ts`) được gọi refresh. Refresh token xoay vòng dùng một lần, nên hàm này dùng chung một promise trong tab và Web Locks giữa các tab.
- Người dùng hiện tại là query `authQueries.me()`. Component đọc qua `useAccess()` (`user`, `can()`, `canAny()`), không gọi lại query.
- Ẩn/hiện theo quyền: `<Can permission={Permission.userCreate}>`; chặn cả trang: `<PermissionGuard>`; menu: thêm `permission` cho mục trong `features/shell/menu.tsx`. Đây chỉ là giao diện, quyền thật do BE kiểm tra.
- Đăng xuất, hết phiên, đổi mật khẩu đều đi qua `forceLogout({ reason })` (`@/lib/auth`): xoá token, cache, store, báo các tab khác rồi về `/login`.
- Endpoint public (login, refresh, logout) gọi với `skipAuth: true`.

## Upload ảnh

- Gửi file bằng `FormData` qua `http.post` như request thường. `apiClient` không đặt `Content-Type` mặc định để axios tự thêm boundary multipart; đừng đặt lại header này.
- Ảnh đại diện dùng `<AvatarUpload value onChange />` (`@/features/uploads`): tải lên rồi trả URL, xoá thì trả `""`. Trong form thì đặt trong `Form.Item name="avatar"`; muốn lưu ngay thì gọi mutation trong `onChange` (xem `features/account/components/profile-avatar.tsx`).
- Kiểm tra định dạng và dung lượng ở client bằng `validateImageFile` cho phản hồi nhanh; BE vẫn kiểm tra lại bằng nội dung file.

## Trang danh sách và form

- Trang danh sách: `PageHeader` + `FilterBar` + `DataTable` (`@/components/common`). `DataTable` nhận thẳng kết quả `useQuery` và lo loading, lỗi, phân trang. Filter và phân trang nằm trên URL qua hook `use-<domain>-filters.ts` (nuqs, dùng `paginationParsers` của `@/lib/url`).
- Form dùng antd `Form` + schema Zod của feature: `rules={[zodRule(schema.shape.field)]}` (`@/lib/form`). Giới hạn độ dài khớp DTO bên BE. Khi sửa chỉ gửi field đã đổi (`changedFields`); `""` nghĩa là xoá giá trị.
- Form trong modal: `FormModal` + component form riêng + `FormActions`. State đóng/mở kèm bản ghi đang sửa: `useDisclosure<T>()` (`@/lib/hooks`).
- Lỗi BE gắn với một field (trùng email, trùng tên): `onError: fieldErrorHandler(form, { [Code]: "field" })`.
- Xoá: `useConfirmDelete()`. Nút hành động trên dòng: `IconAction` (có `disabledReason`).
- Component dùng chung mới thì tạo thư mục riêng trong `components/common/<tên>/` kèm `index.ts`, rồi export ở `components/common/index.ts`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
