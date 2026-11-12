# Kế hoạch dựng codebase `agent-core-fe`

Tài liệu này rút kinh nghiệm từ `tgd-fe-v2` (Next 16, React 19, Zustand 5, TanStack Query 5, Axios, Zod 4) để dựng phần nền cho `agent-core-fe`. Phạm vi gồm tooling, tầng HTTP, React Query, Zustand, providers, auth và một module mẫu. Phần UI nghiệp vụ AI (chat, quản lý agent…) chưa nằm trong phạm vi này.

Backend đi kèm là `agent-core-be` (xem `../agent-core-be/docs/PLAN.md`). Contract FE phải khớp:

- Thành công: `{ success: true, message, data, timestamp, path }`
- Lỗi: `{ success: false, message, errorCode, details?, statusCode, timestamp, path }`, mã chung `ERR_1000…ERR_1007`
- Phân trang: query `page`, `limit`; kết quả `{ items, total, page, limit }`
- ID nghiệp vụ là `uid`, entity có `active`, `createdAt/updatedAt`, `createdBy/updatedBy`

## 1. Learning từ `tgd-fe-v2`

### 1.1 Những gì nên giữ nguyên

| Chủ đề                    | Cách làm ở tgd-fe-v2                                                                                                                     | Lý do giữ                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Phân tầng                 | `page.tsx` chỉ mount feature component. Hướng phụ thuộc `features → shared → common → base`, không import ngược                          | Page mỏng, UI tái dùng được                                |
| Domain module             | `lib/modules/<domain>/` gồm `constant / interface / service / hook / store / validation / index.ts`                                      | Ai cũng biết file nằm ở đâu, public surface qua `index.ts` |
| Data flow                 | Component → hook React Query → service → `apiClient`. Component không gọi `apiClient` trực tiếp                                          | Tách UI khỏi transport                                     |
| Query client              | `getQueryClient()`: server tạo mới mỗi request, browser dùng singleton. Không retry lỗi 4xx. `staleTime` 30s, tắt `refetchOnWindowFocus` | Đúng khuyến nghị của docs Next 16 + TanStack               |
| Invalidate theo namespace | Mutation thành công thì invalidate cả namespace (`["ai-agent"]`)                                                                         | Đơn giản, ít bug cache cũ                                  |
| Refresh token             | Interceptor 401 → refresh một lần, các request khác xếp hàng (`failedQueue`), `skipAuthRefresh`, `_retry`                                | Không gọi refresh song song                                |
| Auth event registry       | `registerAuthFailureHandler / registerAuthTokenUpdatedHandler`, tầng HTTP không import UI                                                | Đảo phụ thuộc đúng hướng                                   |
| Đăng xuất đa tab          | `BroadcastChannel` phát `force_logout`, có cờ chống lặp                                                                                  | Đồng bộ phiên giữa các tab                                 |
| Lỗi 403 gom nhóm          | Debounce + dedupe notification theo key                                                                                                  | Không spam toast khi nhiều query cùng 403                  |
| Store factory             | `createStore({ resource, shouldPersist, persistOptions })`, devtools chỉ bật ở dev, `partialize` khi persist                             | Một chỗ cấu hình middleware                                |
| URL state                 | `nuqs` cho filter/pagination cần share link                                                                                              | Filter sống sót khi reload                                 |
| Form                      | `react-hook-form` + `zod` schema đặt trong module (`*.validation.ts`)                                                                    | Validation dùng lại cho cả form và payload                 |
| Realtime chat             | Dedupe event theo `seq`, replay buffer khi resume thread, ack có timeout                                                                 | Stream AI không bị lặp/mất chunk khi reconnect             |
| Chất lượng                | `consistent-type-imports`, `import/order`, `no-floating-promises`, prettier + tailwind plugin, husky + lint-staged                       | Code đồng nhất, bắt lỗi promise sớm                        |
| Env                       | `.env.example` được commit, `.env*` bị ignore                                                                                            | Không lộ secret                                            |

### 1.2 Những điểm nên làm tốt hơn khi dựng lại

1. **Hai kiến trúc data song song.** Bên cạnh `lib/modules/` (271 file import) vẫn còn kiểu cũ `lib/services/` + `lib/hooks/api/` (116 file import), và `lib/types/` trùng vai trò `lib/interfaces/`. Dự án mới chỉ có **một** pattern ngay từ đầu.
2. **Logic và UI của một domain nằm ở hai cây thư mục** (`lib/modules/ai-agent` và `components/features/ai-management`). Sửa một tính năng phải nhảy qua lại. Nên gom theo feature: `features/<domain>/{api,hooks,store,schemas,types,components}` và chặn import sâu bằng ESLint.
3. **Query key lắp tay.** `query-keys.ts` 336 dòng chỉ chứa `namespace` + `subKey`; mỗi hook tự ghép `[...namespace, subKey, params]`, dễ lệch giữa chỗ query và chỗ invalidate. Nên dùng **key factory + `queryOptions()`** đặt cạnh service (đúng pattern docs Next 16 khuyến nghị), dùng chung cho `useQuery`, `prefetchQuery`, `invalidateQueries`.
4. **Hook import `getQueryClient()` trực tiếp** thay vì `useQueryClient()`, và mỗi mutation tự viết `onSuccess → invalidate` + `onError → toast`. Nên đẩy phần lặp vào `QueryCache/MutationCache` toàn cục qua `meta` (`meta.invalidates`, `meta.successMessage`, `meta.silentError`).
5. **Envelope response bị xử lý nhiều cách.** Có `assertSuccess` copy ở từng service, `handleApiResponse`, `token-parser` đoán 4 kiểu shape, và lỗi khi thì là `ApiHttpError`, khi thì là `AxiosError` bị sửa `message` bằng `Object.defineProperty`. Nên có một `http` wrapper **unwrap `data` về `T`** và một class `ApiError { status, code, message, details }` duy nhất, khớp contract BE.
6. **Tầng HTTP chứa nghiệp vụ.** `error-mapper.ts` hardcode `TASK_STATUS_CHANGE_FROM_DONE_BLOCKED`, message lẫn tiếng Việt/Anh. Giống điểm 4 của BE plan: mỗi feature tự đăng ký message cho `errorCode` của mình (OCP), `lib/http` không biết feature nào.
7. **Request interceptor gắn `Bearer null`** khi chưa có token (`accessToken as string`). Chỉ gắn header khi có token.
8. **Zustand factory mất type.** `create-store.ts` dùng nhiều `as unknown as`, `persistOptions: Record<string, unknown>` nên `partialize` không được kiểm tra kiểu. Không có `version/migrate`, không xử lý hydration → `AntdThemeWrapper` phải dùng cờ `mounted` (gây nháy theme). Nên viết factory đúng kiểu mutator của Zustand 5, có `version`, `skipHydration` + hook `useHydrated`.
9. **Server state nằm trong Zustand.** `useLibraryStore` giữ `items/loading/total`, `useProjectStore` giữ `projects`. Đây là việc của React Query. Quy tắc mới: Zustand chỉ giữ **UI/client state**.
10. **Store trùng lặp và wrapper thủ công.** `use-report-store.ts` gần như trùng `use-project-report-store.ts`; `use-app-store.ts` viết tay một hook `useShallow` cho từng store. Nên auto-generate selector (`store.use.x()`) hoặc dùng selector trực tiếp.
11. **Logout phải biết mọi store.** `lib/auth/session-lifecycle.ts` import thẳng `useAutoDesignStore` từ `components/features/...` (lib phụ thuộc ngược vào UI). Nên có **registry reset**: store nào cần reset khi logout tự đăng ký, lifecycle chỉ gọi `resetAllStores()`.
12. **Auth chỉ ở client.** Token để trong `localStorage` (rủi ro XSS), `AuthGuard` client-side với biến global module, danh sách route hardcode. Next 16 có `proxy.ts` để redirect sớm phía server. Xem câu hỏi ở mục 6.
13. **Provider gốc chứa UI nghiệp vụ.** `providers.tsx` mount `AutoDesignMonitorPanel`, `AutoListingMonitorPanel`… Provider chỉ nên chứa hạ tầng; panel nghiệp vụ đặt ở layout của khu vực dùng nó.
14. **Lạm dụng lodash.** 137 lần `_.eq(a, b)`, nhiều `_.get(obj, "a.b")` làm mất type. Dùng TS thuần (`===`, optional chaining); chỉ dùng hàm tiện ích thật sự cần (`debounce`, `groupBy`) từ `es-toolkit` hoặc `lodash-es` theo từng hàm.
15. **Tooling lệch phiên bản.** ESLint 8 + `eslint-config-next@15` trong khi Next 16; Tailwind 3; script dev dùng cờ `--turbo` (Next 16 đã mặc định Turbopack). `agent-core-fe` đã có sẵn ESLint 9 flat config và Tailwind 4, giữ nguyên.
16. **Env không được validate.** `process.env.NEXT_PUBLIC_*` đọc rải rác. Nên validate bằng Zod ở một file `lib/env.ts` (fail fast giống Joi bên BE).
17. **Không có test.** Thêm Vitest + Testing Library + MSW ngay từ đầu, ít nhất cho tầng HTTP, store và query hooks.
18. **Component quá dài** (form agent 421 dòng, prompt form 379 dòng). Đặt ngưỡng ~250 dòng, tách sub-component / hook.
19. **Rule cho AI agent bị nhân bản** ở `.agents/`, `.claude/`, `.cursor/`, `.cursorrules`, `.antigravify/`, `.github/copilot-instructions.md`. Giữ một nguồn (`AGENTS.md`), `CLAUDE.md` chỉ trỏ tới nó.

## 2. Nguyên tắc cho codebase mới

| Nguyên tắc                   | Áp dụng cụ thể                                                                                                                                                                   |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server state vs client state | Dữ liệu từ API chỉ ở React Query. Zustand cho UI state dùng chung nhiều nơi (sidebar, chat draft, turn đang stream). State cục bộ dùng `useState`. Filter/pagination dùng `nuqs` |
| Một cách làm cho mỗi việc    | Một `http` client, một `ApiError`, một kiểu key factory, một store factory                                                                                                       |
| Đảo phụ thuộc                | `lib/*` không import `features/*`. Feature đăng ký vào registry (error message, store reset, menu) thay vì lib biết feature                                                      |
| Type đi xuyên suốt           | Không `as unknown as`, không `_.get` theo string path. Response được type theo contract BE                                                                                       |
| Feature tự đóng gói          | Bên ngoài chỉ import từ `features/<domain>` (qua `index.ts`), không import sâu                                                                                                   |
| Server-first khi hợp lý      | Page là Server Component; phần tương tác là Client Component. Dùng `HydrationBoundary` khi trang cần data ngay lúc render                                                        |

## 3. Cấu trúc thư mục đích

```
app/
├── layout.tsx                    html/body, font, <Providers>
├── global-error.tsx, error.tsx, not-found.tsx
├── (auth)/login/page.tsx
└── (dashboard)/
    ├── layout.tsx                app shell (sidebar, header), panel nghiệp vụ toàn khu vực
    └── agents/page.tsx           chỉ mount <AgentsPage /> + metadata
proxy.ts                          redirect sớm theo cookie phiên (nếu chọn cookie auth)
components/
├── ui/                           primitive (wrapper antd hoặc shadcn/ui)
├── common/                       UI chung không chứa từ nghiệp vụ (DataTable, EmptyState, ConfirmDialog…)
├── layout/                       AppShell, Sidebar, Header
└── providers/                    QueryProvider, ThemeProvider, IntlProvider, Providers
features/
└── <domain>/
    ├── api/
    │   ├── <domain>.service.ts   gọi http, trả T đã unwrap
    │   ├── <domain>.keys.ts      key factory
    │   └── <domain>.queries.ts   queryOptions + hook query/mutation
    ├── components/
    ├── hooks/                    hook UI riêng của feature
    ├── store/                    Zustand (nếu cần)
    ├── schemas/                  Zod (form + payload)
    ├── types/
    ├── constants.ts
    ├── errors.ts                 đăng ký message cho errorCode của feature
    └── index.ts                  public surface
lib/
├── env.ts                        Zod validate env
├── http/
│   ├── client.ts                 axios instance + interceptors
│   ├── http.ts                   get/post/patch/delete unwrap IApiResponse<T>
│   ├── api-error.ts              class ApiError, isApiError
│   ├── error-messages.ts         registry errorCode → message
│   ├── auth-events.ts            registry auth failure / token updated
│   └── types.ts                  IApiResponse, IApiErrorBody, IPaginated, IPaginationQuery
├── query/
│   ├── query-client.ts           makeQueryClient, getQueryClient, QueryCache/MutationCache
│   └── query.types.ts            khai báo Register meta cho TanStack
├── store/
│   ├── create-store.ts           createStore / createPersistedStore
│   ├── create-selectors.ts
│   └── reset-registry.ts         registerStoreReset, resetAllStores
├── auth/                         session lifecycle, token holder
├── realtime/                     (sau) socket/SSE client
└── utils/
stores/                           store toàn cục: app (theme, locale, sidebar)
locales/                          (nếu cần i18n)
tests/                            setup/ (Vitest), support/ (MSW, render, fixtures), unit/ (cây giống mã nguồn)
```

## 4. Các bước thực hiện

Mỗi bước kết thúc ở trạng thái xanh: `typecheck && lint && test && build`.

### Bước 0: Tooling

- Chọn package manager thống nhất với BE (BE dùng `yarn`; repo FE hiện có `package-lock.json`).
- `tsconfig`: giữ `strict`, thêm `noUncheckedIndexedAccess`, `noImplicitOverride`.
- ESLint 9 flat (đã có): thêm `@typescript-eslint/consistent-type-imports`, `no-floating-promises`, `no-misused-promises`, import order, `eqeqeq`, `no-console` (cho phép warn/error), `no-restricted-imports` chặn `@/features/*/*` (chỉ cho import qua index) và chặn `lib/**` import `features/**`.
- Prettier + `prettier-plugin-tailwindcss`, husky + lint-staged, script `typecheck`, `format`, `test`.
- Vitest + `@testing-library/react` + `msw` + `jsdom`.
- `.env.example`: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL` (nếu cần).
- Gỡ trang mẫu của Create Next App. Đặt `metadata` thật.

### Bước 1: Env và tầng HTTP

- `lib/env.ts`: schema Zod cho `NEXT_PUBLIC_*`, export `env` đã parse. App lỗi rõ ràng khi thiếu biến.
- `lib/http/types.ts` khớp BE:

```ts
export interface IApiResponse<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}
export interface IApiErrorBody {
  success: false;
  message: string;
  errorCode: string;
  details?: string[];
  statusCode: number;
}
export interface IPaginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
export interface IPaginationQuery {
  page?: number;
  limit?: number;
}
```

- `lib/http/api-error.ts`:

```ts
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: string[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;
```

- `client.ts`: axios instance (`baseURL` từ `env`), request interceptor chỉ gắn `Authorization` khi có token, response interceptor:
  - 401 → refresh một lần + hàng đợi (giữ cơ chế của tgd), thất bại thì `emitAuthFailure()`.
  - Mọi lỗi khác → chuyển thành `ApiError` (lỗi mạng/timeout → `ApiError(0, 'NETWORK_ERROR', …)`).
- `http.ts`: `http.get<T>(url, config) → Promise<T>` (đã unwrap `.data.data`). Service không còn `assertSuccess`.
- `error-messages.ts`: `registerErrorMessages({ ERR_AGENT_001: 'Agent không tồn tại' })`, `getErrorMessage(error)` ưu tiên registry → `message` từ BE → message theo status.
- Unit test: unwrap, map lỗi, refresh queue (2 request cùng 401 chỉ gọi refresh 1 lần), không gắn `Bearer null`.

### Bước 2: React Query

- `makeQueryClient()`:
  - `queries`: `staleTime` 30s, `refetchOnWindowFocus: false`, `retry` không retry `ApiError` 4xx, tối đa 1 lần cho lỗi khác.
  - `QueryCache.onError`: toast lỗi khi query có `meta.errorMessage` (query mặc định im lặng, UI tự hiển thị lỗi).
  - `MutationCache.onSuccess`: tự `invalidateQueries` theo `meta.invalidates`, toast `meta.successMessage`.
  - `MutationCache.onError`: toast `getErrorMessage(error)` trừ khi `meta.silentError`.
- Khai báo type cho `meta` qua `declare module '@tanstack/react-query' { interface Register { queryMeta; mutationMeta; defaultError: ApiError } }` để `error` luôn là `ApiError`.
- Pattern cho mỗi feature:

```ts
// features/agents/api/agent.keys.ts
export const agentKeys = {
  all: ["agents"] as const,
  lists: () => [...agentKeys.all, "list"] as const,
  list: (q: IAgentListQuery) => [...agentKeys.lists(), q] as const,
  details: () => [...agentKeys.all, "detail"] as const,
  detail: (uid: string) => [...agentKeys.details(), uid] as const,
};

// features/agents/api/agent.queries.ts
export const agentQueries = {
  list: (q: IAgentListQuery) =>
    queryOptions({
      queryKey: agentKeys.list(q),
      queryFn: () => agentService.list(q),
      placeholderData: keepPreviousData,
    }),
  detail: (uid: string) =>
    queryOptions({ queryKey: agentKeys.detail(uid), queryFn: () => agentService.detail(uid) }),
};

export const useCreateAgent = () =>
  useMutation({
    mutationFn: agentService.create,
    meta: { invalidates: [agentKeys.lists()], successMessage: "Đã tạo agent" },
  });
```

- `QueryProvider` (client) + `ReactQueryDevtools` chỉ ở dev.
- Khi trang cần data lúc render đầu: Server Component `prefetchQuery(agentQueries.detail(uid))` + `HydrationBoundary` (theo docs `node_modules/next/dist/docs/01-app/02-guides/client-side-data-fetching/tanstack-query.md`).
- Test: hook với MSW, kiểm tra invalidate sau mutation.

### Bước 3: Zustand

- `lib/store/create-store.ts`, giữ type đầy đủ, không cast:

```ts
export const createStore = <T>(
  name: string,
  init: StateCreator<T, [["zustand/devtools", never]]>,
) => createSelectors(create<T>()(devtools(init, { name, enabled: isDev })));

export const createPersistedStore = <T, P = Partial<T>>(
  name: string,
  init: StateCreator<T, [["zustand/devtools", never], ["zustand/persist", P]]>,
  options: Omit<PersistOptions<T, P>, "name"> & { version: number },
) =>
  createSelectors(
    create<T>()(
      devtools(persist(init, { name, skipHydration: true, ...options }), { name, enabled: isDev }),
    ),
  );
```

- `createSelectors`: sinh `useStore.use.field()` thay cho hook `useShallow` viết tay.
- `reset-registry.ts`: `registerStoreReset(name, reset)` và `resetAllStores()`. Mỗi store khai báo `initialState` riêng để reset.
- Hydration: `<StoreHydration />` gọi `persist.rehydrate()` trong effect cho các store persisted, kèm hook `useHydrated(store)`. Không còn cờ `mounted` ở provider.
- `stores/app.store.ts`: `sidebarCollapsed`, `locale` (persist, `version: 1`). Theme do `next-themes` lo (tránh nháy, không cần store).
- Quy tắc ghi trong `AGENTS.md`: không đưa data từ API vào Zustand.
- Test: reset registry, `partialize`, migrate version.

### Bước 4: Providers, layout, theme, i18n

- `components/providers/providers.tsx` chỉ chứa hạ tầng: `NuqsAdapter`, `QueryProvider`, `ThemeProvider`, `IntlProvider` (nếu dùng), `Toaster`, `StoreHydration`.
- Root layout giữ `<html suppressHydrationWarning>` cho theme. `metadata` thật.
- App shell (sidebar/header) ở `app/(dashboard)/layout.tsx`. Menu khai báo theo feature (`features/*/menu.ts`) rồi gom lại, có gate theo permission.
- `error.tsx`, `global-error.tsx`, `not-found.tsx`, `loading.tsx` dùng component chung.
- Lưu ý Cache Components đang bật (`cacheComponents: true`): phần đọc cookie/session phải nằm sau `<Suspense>`; xem `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`.

### Bước 5: Auth

Phụ thuộc vào câu trả lời ở mục 6. Phương án đề xuất (nếu BE tự quản lý user):

- BE trả access token trong body và set refresh token ở cookie `httpOnly; Secure; SameSite=Lax; Path=/auth`.
- FE giữ access token **trong bộ nhớ** (`lib/auth/token-holder.ts`), không ghi `localStorage`. Khi tải trang, gọi `/auth/refresh` để lấy lại access token.
- `proxy.ts`: nếu không có cookie phiên thì redirect `/login?redirectTo=…` (kiểm tra lạc quan; quyền thật do BE quyết định).
- Giữ từ tgd: refresh queue, `BroadcastChannel` logout đa tab, registry auth event. `forceLogout()` gọi `resetAllStores()` + `queryClient.clear()`.
- `useCurrentUser()` là một query (`authQueries.me()`), không persist user vào `localStorage`.
- Nếu API khác domain và không dùng được cookie: dùng lại cách của tgd (token trong storage) nhưng gom vào `token-holder` để sau này đổi dễ.

### Bước 6: Module mẫu `agents` (khuôn để copy)

Khớp module mẫu `agents` bên BE (name, description, model, enabled).

- `types/agent.types.ts`: `IAgent`, `IAgentListQuery extends IPaginationQuery { search?; active? }`, `ICreateAgentPayload`, `IUpdateAgentPayload`.
- `schemas/agent.schema.ts`: Zod cho form, giới hạn độ dài khớp `@MaxLength` của DTO bên BE.
- `api/agent.service.ts`, `agent.keys.ts`, `agent.queries.ts` theo bước 2.
- `errors.ts`: đăng ký message cho mã lỗi `agents` của BE.
- `components/`: `AgentsPage` (bảng + filter qua `nuqs` + phân trang `page/limit`), `AgentFormDialog` (RHF + Zod), `DeleteAgentDialog`.
- `index.ts` chỉ export `AgentsPage` và những gì feature khác cần.
- `app/(dashboard)/agents/page.tsx` mount `<AgentsPage />`.
- Test: service với MSW (thành công, lỗi `ERR_*`), schema, một test tương tác form.

### Bước 7 (sau phần nền): Realtime / chat

- Chọn transport theo BE (SSE hay Socket.IO). Tách phần xử lý event thành **reducer thuần** (dedupe `seq`, replay buffer, gắn turn vào thread) để test không cần socket, rồi mới nối vào store `chat`.
- Client socket là class có `connect/disconnect/onAuthRevoked`, được `auth lifecycle` điều khiển, không dùng biến global rải rác.

## 5. Định nghĩa hoàn thành cho phần nền

- App không chạy được khi thiếu env, và báo rõ biến nào sai.
- Mọi service trả về `T` đã unwrap; mọi lỗi API trong UI là `ApiError` có `code`.
- Không có `as unknown as` trong `lib/store`; store persisted không gây hydration warning, không nháy theme.
- Logout xoá sạch React Query cache + mọi store đã đăng ký, đồng bộ sang tab khác.
- Module `agents` CRUD chạy với BE thật; test pass không cần BE (MSW).
- `typecheck`, `lint`, `test`, `build` đều pass.

## 6. Quyết định đã chốt

- **Thư viện UI:** Ant Design 6. Tailwind 4 chỉ dùng cho layout/spacing, không thay component antd.
- **Auth:** đã làm (Bước 5) theo API của `agent-core-be`: đăng nhập, khôi phục phiên, đăng xuất, hồ sơ, đổi mật khẩu, phân quyền. Chi tiết ở mục 8.
- **i18n:** chưa làm. Text tiếng Việt viết thẳng trong code; khi cần sẽ thêm sau.
- **Realtime/chat:** bỏ qua, chưa làm Bước 7.
- **Package manager:** `yarn` (classic 1.22, giống BE).

## 7. Điều chỉnh khi dựng phần nền (Bước 0–4)

- **Tắt `cacheComponents` và `partialPrefetching`.** `@ant-design/cssinjs` gọi `Date.now()`/`Math.random()` khi load module và khi tạo cache; Cache Components của Next 16 coi đó là lỗi lúc prerender. App là dashboard sau đăng nhập, data lấy ở client, nên static shell gần như không có lợi. Nếu sau này cần bật lại thì phải bọc cây antd trong `<Suspense>`.
- **Registry antd tự viết** (`components/providers/antd-registry.tsx`) thay cho `@ant-design/nextjs-registry`: server dùng cache ID cố định, client vẫn `createCache()`. Style antd được bọc trong `@layer antd`.
- **Thứ tự cascade layer** khai báo ở `app/layers.css` (import đầu tiên): `theme, base, antd, components, utilities` để class Tailwind override được antd. Khai báo trong `globals.css` bị bỏ mất khi build, nên phải tách file riêng.
- **Component antd chỉ dùng trong Client Component.** Server Component nhận component client dưới dạng reference, nên `Typography.Title`, `Layout.Sider` sẽ là `undefined`.
- **Refresh token:** dùng một promise refresh dùng chung thay cho `failedQueue`. Nếu token đã được làm mới sau khi request được gửi, request đó chỉ retry mà không refresh lại (test bắt được lỗi refresh 2 lần).
- **Theme:** chỉ light theme, chưa dùng `next-themes`.
- **Node:** `engines >= 22`. Pin `scroll-into-view-if-needed@3.1.0` và `compute-scroll-into-view@3.1.1` qua `resolutions`, vì bản 3.2.0 (antd kéo vào) yêu cầu Node ≥ 26.
- **Vitest 5 cần `vite` làm peer dependency.** jsdom được đặt cùng origin với API test để không phát sinh CORS preflight.

## 8. Bước 5 đã làm: đăng nhập, người dùng, vai trò

Dựng theo API thật của `agent-core-be` (module `auth`, `users`, `permissions`). Module mẫu của Bước 6 chính là `users` và `roles`, thay cho `agents` (BE chưa có).

**Contract đã chốt với BE**

- `POST /auth/login`, `POST /auth/refresh` trả `{ accessToken, user }`; `user` kèm `role { uid, name, isSuperAdmin }` và `permissions[]`. Refresh token nằm ở cookie httpOnly `agent_core_refresh_token` (path `/api/auth`, SameSite=Lax), xoay vòng và chỉ dùng được một lần.
- `GET/PATCH /auth/me`, `POST /auth/change-password` (204, đăng xuất mọi phiên), `POST /auth/logout`.
- `GET/POST /users`, `GET/PATCH/DELETE /users/:uid`, `PATCH /users/:uid/password`; filter `search`, `roleUid`.
- `GET/POST /roles`, `GET/PATCH/DELETE /roles/:uid`, `GET /permissions` (danh mục quyền).
- `GET /roles/options` → `{ uid, name, assignable }[]`, cần `user:read`. BE thêm theo đề nghị của FE, vì người chỉ có quyền quản lý user không gọi được `GET /roles` (cần `role:read`). `assignable` cho biết người gọi có được gán, hay quản lý người đang giữ, role đó không.

**Quyết định phía FE**

- **Guard ở client, không dùng `proxy.ts`.** Cookie refresh thuộc origin của API và bị giới hạn path `/api/auth`, nên server của Next không đọc được. `AuthGuard` gọi refresh khi tải trang; 401 thì về `/login?redirect=...`. Đích quay lại chỉ nhận đường dẫn nội bộ (chống open redirect).
- **Một điểm refresh duy nhất** (`refreshSession`). Trong tab dùng chung một promise; giữa các tab xếp hàng bằng Web Locks, vì hai tab cùng gửi một cookie cũ thì tab sau bị từ chối.
- **Người dùng hiện tại là một query** (`authQueries.me()`), không lưu `localStorage`. Chưa có token thì queryFn khôi phục phiên bằng refresh; có rồi thì đọc `GET /auth/me`. Dữ liệu cũ quá 5 phút sẽ được đọc lại khi quay lại tab, để quyền bị đổi ở nơi khác được cập nhật.
- **Phân quyền chỉ là giao diện.** `Permission` (hằng số), `useAccess()`, `<Can>`, `<PermissionGuard>`, menu lọc theo quyền. Quy tắc giống `PermissionsGuard` bên BE: Super Admin có mọi quyền.
- **Form dùng antd `Form` + Zod**, không dùng `react-hook-form` như plan ban đầu: antd Form đã quản lý state và hiển thị lỗi, thêm RHF phải bọc `Controller` cho mọi input. Schema Zod vẫn là nguồn duy nhất cho rule và kiểu dữ liệu, nối vào form bằng `zodRule()`.
- **Khi sửa chỉ gửi field đã đổi.** Với role, BE kiểm tra người sửa phải có đủ mọi quyền trong `permissions` gửi lên; gửi lại nguyên danh sách cũ có thể bị từ chối dù chỉ đổi tên.
- **Feature `shell`** ghép `AuthGuard` + `AppShell` + menu theo quyền. `components/layout/AppShell` chỉ lo bố cục, vì `components/` không được import `features/`.
- **Component dùng chung tách thư mục** trong `components/common/` (`data-table`, `form-modal`, `icon-action`, `confirm`, `page`, `feedback`, `brand`, `search-input`). Trang danh sách và form modal của `users` và `roles` dùng chung các mảnh này.
- **File có hook phải có `"use client"`** (kể cả `*.queries.ts`): `index.ts` của feature được import từ `page.tsx` là Server Component.

**Lưu ý khi triển khai**

- FE và API phải cùng site (ví dụ `app.example.com` và `api.example.com`) để cookie SameSite=Lax được gửi kèm; `CORS_ORIGIN` của BE phải liệt kê origin của FE.
- Xoá trắng họ tên hoặc ảnh đại diện: gửi `""`. Bỏ field (hoặc `null`) nghĩa là giữ nguyên, nên form sửa chỉ gửi field đã đổi (`changedFields` ở `@/lib/form`).
- Sửa và xoá role bị BE chặn (403 `ERR_2204`) khi role đó có quyền mà người thao tác không có; trang vai trò khoá sẵn hai nút này theo cùng quy tắc.
