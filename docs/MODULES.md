# Tài liệu module `agent-core-fe`

Hợp đồng chung với `agent-core-be`:

- Thành công: `{ success: true, message, data, timestamp, path }`
- Lỗi: `{ success: false, message, errorCode, details?, statusCode, timestamp, path }`, mã chung `ERR_1000…ERR_1007`
- Phân trang: query `page`, `limit`; kết quả `{ items, total, page, limit }`
- ID nghiệp vụ là `uid`, entity có `active`, `createdAt/updatedAt`, `createdBy/updatedBy`

## 1. Nền tảng

- **Tắt `cacheComponents` và `partialPrefetching`.** `@ant-design/cssinjs` gọi `Date.now()`/`Math.random()` khi load module và khi tạo cache; Cache Components của Next 16 coi đó là lỗi lúc prerender. App là dashboard sau đăng nhập, data lấy ở client, nên static shell gần như không có lợi. Nếu sau này cần bật lại thì phải bọc cây antd trong `<Suspense>`.
- **Registry antd tự viết** (`components/providers/antd-registry.tsx`) thay cho `@ant-design/nextjs-registry`: server dùng cache ID cố định, client vẫn `createCache()`. Style antd được bọc trong `@layer antd`.
- **Thứ tự cascade layer** khai báo ở `app/layers.css` (import đầu tiên): `theme, base, antd, components, utilities` để class Tailwind override được antd. Khai báo trong `globals.css` bị bỏ mất khi build, nên phải tách file riêng.
- **Component antd chỉ dùng trong Client Component.** Server Component nhận component client dưới dạng reference, nên `Typography.Title`, `Layout.Sider` sẽ là `undefined`.
- **Refresh token:** dùng một promise refresh dùng chung. Nếu token đã được làm mới sau khi request được gửi, request đó chỉ retry mà không refresh lại.
- **Theme:** chỉ light theme.
- **Node:** `engines >= 22`. Pin `scroll-into-view-if-needed@3.1.0` và `compute-scroll-into-view@3.1.1` qua `resolutions`, vì bản 3.2.0 (antd kéo vào) yêu cầu Node ≥ 26.
- **Vitest 5 cần `vite` làm peer dependency.** jsdom được đặt cùng origin với API test để không phát sinh CORS preflight.

## 2. Đăng nhập, người dùng, vai trò (`auth`, `users`, `roles`, `shell`)

**Hợp đồng BE** (module `auth`, `users`, `permissions`)

- `POST /auth/login`, `POST /auth/refresh` trả `{ accessToken, user }`; `user` kèm `role { uid, name, isSuperAdmin }` và `permissions[]`. Refresh token nằm ở cookie httpOnly `agent_core_refresh_token` (path `/api/auth`, SameSite=Lax), xoay vòng và chỉ dùng được một lần.
- `GET/PATCH /auth/me`, `POST /auth/change-password` (204, đăng xuất mọi phiên), `POST /auth/logout`.
- `GET/POST /users`, `GET/PATCH/DELETE /users/:uid`, `PATCH /users/:uid/password`; filter `search`, `roleUid`.
- `GET/POST /roles`, `GET/PATCH/DELETE /roles/:uid`, `GET /permissions` (danh mục quyền).
- `GET /roles/options` → `{ uid, name, assignable }[]`, cần `user:read`, vì người chỉ có quyền quản lý user không gọi được `GET /roles` (cần `role:read`). `assignable` cho biết người gọi có được gán, hay quản lý người đang giữ, role đó không.

**Thiết kế**

- **Guard ở client, không dùng `proxy.ts`.** Cookie refresh thuộc origin của API và bị giới hạn path `/api/auth`, nên server của Next không đọc được. `AuthGuard` gọi refresh khi tải trang; 401 thì về `/login?redirect=...`. Đích quay lại chỉ nhận đường dẫn nội bộ (chống open redirect).
- **Một điểm refresh duy nhất** (`refreshSession`). Trong tab dùng chung một promise; giữa các tab xếp hàng bằng Web Locks, vì hai tab cùng gửi một cookie cũ thì tab sau bị từ chối.
- **Người dùng hiện tại là một query** (`authQueries.me()`), không lưu `localStorage`. Chưa có token thì queryFn khôi phục phiên bằng refresh; có rồi thì đọc `GET /auth/me`. Dữ liệu cũ quá 5 phút sẽ được đọc lại khi quay lại tab, để quyền bị đổi ở nơi khác được cập nhật.
- **Phân quyền chỉ là giao diện.** `Permission` (hằng số), `useAccess()`, `<Can>`, `<PermissionGuard>`, menu lọc theo quyền. Quy tắc giống `PermissionsGuard` bên BE: Super Admin có mọi quyền.
- **Form dùng antd `Form` + Zod**, không dùng `react-hook-form`: antd Form đã quản lý state và hiển thị lỗi, thêm RHF phải bọc `Controller` cho mọi input. Schema Zod là nguồn duy nhất cho rule và kiểu dữ liệu, nối vào form bằng `zodRule()`.
- **Khi sửa chỉ gửi field đã đổi.** Với role, BE kiểm tra người sửa phải có đủ mọi quyền trong `permissions` gửi lên; gửi lại nguyên danh sách cũ có thể bị từ chối dù chỉ đổi tên.
- **Feature `shell`** ghép `AuthGuard` + `AppShell` + menu theo quyền. `components/layout/AppShell` chỉ lo bố cục, vì `components/` không được import `features/`.
- **Component dùng chung tách thư mục** trong `components/common/`. Trang danh sách và form modal của `users` và `roles` dùng chung các mảnh này.

**Lưu ý khi triển khai**

- FE và API phải cùng site (ví dụ `app.example.com` và `api.example.com`) để cookie SameSite=Lax được gửi kèm; `CORS_ORIGIN` của BE phải liệt kê origin của FE.
- Xoá trắng họ tên hoặc ảnh đại diện: gửi `""`. Bỏ field (hoặc `null`) nghĩa là giữ nguyên, nên form sửa chỉ gửi field đã đổi (`changedFields` ở `@/lib/form`).
- Sửa và xoá role bị BE chặn (403 `ERR_2204`) khi role đó có quyền mà người thao tác không có; trang vai trò khoá sẵn hai nút này theo cùng quy tắc.

## 3. Hồ sơ và upload ảnh đại diện (`account`, `uploads`)

- `POST /uploads/images` (multipart, field `file`, tối đa 10 MB, JPEG/PNG/WebP/GIF, lưu thành WebP trên GCS) trả `{ uid, url, ... }`. `avatar` của user là URL, nên đổi ảnh gồm hai bước: tải ảnh lên lấy `url`, rồi `PATCH /auth/me` (hoặc `/users/:uid`) với `avatar: url`.
- Trang `/profile`: cột trái là ảnh đại diện, danh tính, vai trò, quyền; cột phải hai tab "Thông tin cá nhân" và "Bảo mật" (`?tab=security`, menu tài khoản mở thẳng tới tab này).
- Ở trang hồ sơ, ảnh đại diện lưu ngay khi tải lên hoặc xoá; họ tên lưu bằng nút "Lưu thay đổi", chỉ bật khi có thay đổi. Form người dùng của quản trị viên dùng cùng `AvatarUpload`, lưu khi submit form.
- `features/auth` chỉ giữ phiên đăng nhập và quyền; thao tác trên tài khoản của mình (`PATCH /auth/me`, đổi mật khẩu) nằm ở `features/account`. Nhãn quyền (`permission-labels`) nằm ở `auth` để cả `roles` và `account` dùng.
- `apiClient` không có header `Content-Type: application/json` mặc định: với header này axios đổi `FormData` thành JSON. Axios vẫn tự đặt JSON cho body là object.
- Chưa có: cắt ảnh trước khi tải lên (BE đã thu ảnh về tối đa 2048px, avatar hiển thị `object-cover`), và dọn ảnh cũ khi đổi avatar.

## 4. API key của nhà cung cấp AI (`ai-providers`)

Trang `/ai-api-keys`, quyền `ai-api-key:{read,create,update,delete}`. Ngoài trang API key, feature này giữ danh mục nhà cung cấp/model và hai ô chọn dùng chung `AiProviderSelect`, `AiModelSelect`.

- Mỗi nhà cung cấp chỉ có một key (BE unique theo `provider`).
- Danh sách nhà cung cấp và model là danh mục cố định bên BE, lấy qua `GET /ai-api-keys/providers` và `GET /ai-api-keys/models/:provider`, dạng `{ id, name }` (model có thêm `acceptsTemperature`). FE không viết cứng danh sách hay nhãn: gửi `id`, hiển thị `name`. Danh mục chỉ đổi khi BE deploy nên FE giữ suốt phiên (`staleTime: Infinity`).
- Response trả `provider` và `defaultModel` dạng `{ id, name }` (`defaultModel` là `null` khi chưa đặt).
- BE chỉ trả key dạng che (`***abcd`), FE hiện thành `•••• abcd`. Khi sửa, ô key để trống là giữ key cũ, nên FE chỉ gửi `secretKey` khi người dùng nhập key mới.
- Ô model mặc định là `Select` trong danh mục của nhà cung cấp, dùng được cả lúc tạo. Đổi nhà cung cấp thì bỏ model đã chọn. Bỏ chọn khi sửa là gửi `""`. Model không thuộc danh mục (`ERR_2402`) hiện ngay dưới ô.
- Chưa đặt `SECRET_ENCRYPTION_KEY` bên BE thì thêm/sửa key trả 503 (`ERR_1009`), hiện bằng thông báo lỗi chung.

## 5. AI agent (`ai-agents`)

Trang `/ai-agents`: danh sách, thêm/sửa/xem trong drawer. Quyền `ai-agent:{read,create,update,delete}`. Mục "AI agent" đứng đầu menu nên là trang đích khi vào `/`.

**Hợp đồng BE**

- Gửi lên `provider`, `model`, `reasoningEffort` bằng `id`; nhận về dạng `{ id, name }` (`reasoningEffort` là `null` khi không dùng). Mức suy luận lấy từ `GET /ai-agents/reasoning-efforts`, FE không tự đặt nhãn.
- Trạng thái là `isActive: boolean`.
- `code` do BE tạo từ tên (slug); FE không có ô nhập mã và không gửi `code`, chỉ hiển thị trong danh sách và tiêu đề drawer.
- Skill: gửi `skillCodes: string[]`, nhận về `skills` dạng option của `ai-skills`. Kho tri thức: gửi `knowledgeBaseUids`, nhận về `knowledgeBases`.
- MCP server: gửi `mcpServerCodes: string[]` (tối đa 20), nhận về `mcpServers` dạng `{ code, name }`.
- Tool và ghi nhớ: gửi `toolNames: string[]` (từ `GET /ai-agents/tools`, dạng `{ id, name, description }`) và `memoryEnabled: boolean`; nhận về `tools` và `memoryEnabled`. Tool của skill, kho tri thức, ghi nhớ do BE tự bật theo cấu hình agent, không chọn tay.
- Temperature và mức suy luận theo `acceptsTemperature` của model: `true` thì BE dùng temperature, bỏ qua mức suy luận (khoá ô mức suy luận); `false` thì ngược lại (khoá ô temperature). Chưa chọn model thì mở cả hai. Giá trị ô bị khoá vẫn gửi được, BE bỏ qua.
- `POST /ai-agents/vector-sync` (`ai-agent:update`) dựng lại vector của cả kho tri thức lẫn ghi nhớ; nút "Dựng lại vector" nằm ở trang AI agent.
- Mã lỗi: `ERR_2500` không tìm thấy; `ERR_2501` (trùng mã, tức trùng tên) và `ERR_2502` (tên không tạo được mã) hiện dưới ô tên; `ERR_2503` (skill không tồn tại), `ERR_2504` (kho không tồn tại), `ERR_2505` (tool không chọn được), `ERR_2506` (MCP server không tồn tại) hiện dưới ô tương ứng; model ngoài danh mục là `ERR_2402` của `ai-providers`, hiện dưới ô model.

**Cấu trúc**

- `form-values.ts`: hàm thuần chuyển giữa bản ghi BE và giá trị form (`toFormValues`, `toCreateBody`, `toUpdateBody`). BE đổi hợp đồng thì chủ yếu sửa ở đây.
- `components/form/ai-agent-form.tsx`: chỉ lo field (thông tin chung, model, chỉ dẫn hệ thống, hội thoại, năng lực) và giá trị. Khối "Năng lực" gồm `AiSkillSelect`, `AiKnowledgeBaseSelect`, ô chọn tool, `AiMcpServerSelect` và công tắc ghi nhớ.
- `components/ai-agent-form-drawer.tsx`: thêm, sửa, xem agent trong một drawer, giữ phần gọi API. Cùng pattern với `UserFormModal`, `RoleFormModal`: bảng truyền bản ghi vào, sửa không đổi gì thì đóng luôn, chỉ gửi field đã đổi. Không có quyền sửa thì form khoá, không có nút lưu.
- Drawer dùng `FormDrawer` (`@/components/common`): như `FormModal` nhưng nút lưu cố định ở chân drawer, submit form qua `formId`.
- Không có trang chi tiết riêng: danh sách đã trả đủ field nên mở drawer không cần gọi thêm API.

## 6. Skill (`ai-skills`)

Trang `/ai-skills`, quyền `ai-skill:{read,create,update,delete}`. Mục "Skill" đứng sau "AI agent" trong menu.

**Hợp đồng BE**

- Skill là một gói `.zip` (tối đa 5 MB, 30 file, mỗi file 200 KB, bắt buộc `SKILL.md` ở gốc). BE đọc `name`, `description` trong frontmatter của `SKILL.md` và `agents/openai.yaml` (tên hiển thị, icon), rồi lưu file lên GCS.
- `POST /ai-skills` và `PUT /ai-skills/:uid/files` nhận `multipart/form-data`, field `file`; tạo mới có thêm `code` tuỳ chọn (bỏ trống thì BE lấy slug của `name`). Thay file giữ nguyên `code`.
- `GET /ai-skills/:uid` trả thêm `content`: phần hướng dẫn agent sẽ nhận.
- `GET /ai-skills/options` (`{ code, name, description, iconUrl }`) cho ô chọn skill của agent, cần quyền `ai-agent:read`. Skill đã xoá tự biến mất khỏi agent.
- Mã lỗi `ERR_2600`–`ERR_2611` (`features/ai-skills/errors.ts`). Lỗi về mã hiện dưới ô mã, lỗi về gói zip (kể cả 413 `ERR_1008`) hiện dưới ô file.

**Cấu trúc**

- Tải mới và thay file dùng chung `AiSkillUploadModal` (có `skill` là thay file, không có ô mã). Ô chọn file chỉ giữ `File` trong form, gửi khi submit; kiểm tra nhanh đuôi `.zip` và dung lượng bằng `validateSkillZip`.
- Xem chi tiết trong `AiSkillDetailDrawer`, gọi `GET /ai-skills/:uid` khi mở (danh sách không có `content`).
- `AiSkillSelect` (export từ feature) là ô chọn nhiều skill theo `code`, dùng trong form agent. Danh sách agent có cột Skill.
- Tìm kiếm và phân trang trên URL của các trang Vai trò, AI agent, Skill dùng chung `useSearchListParams` (`@/lib/url`).

## 7. Kho tri thức (`ai-knowledge`)

Trang `/ai-knowledge-bases`, quyền `ai-knowledge:{read,create,update,delete}`. Mục "Kho tri thức" đứng sau "Skill" trong menu.

**Hợp đồng BE**

- Kho: `GET/POST /ai-knowledge-bases`, `PATCH/DELETE /ai-knowledge-bases/:uid` (`name`, `description`). Không có API chi tiết một kho; danh sách đã đủ (`documentCount`, `chunkCount` chỉ đếm tài liệu đã xử lý xong).
- Tài liệu: `GET/POST /ai-knowledge-bases/:uid/documents`, `DELETE .../documents/:documentUid`. Upload multipart field `files`, tối đa 10 file mỗi lần, mỗi file 2 MB, đuôi `.txt .md .markdown .csv .json`. BE tách đoạn và tạo embedding ngay trong request; file lỗi vẫn được lưu với `status.id = "failed"` kèm `errorMessage`, request vẫn 201. Thêm và xoá tài liệu cần `ai-knowledge:update`.
- `POST /ai-knowledge-bases/:uid/search` (`query`, `topK?`): tìm thử theo ngữ nghĩa.
- `GET /ai-knowledge-bases/options` (`{ uid, name, description }`) cho ô chọn kho của agent, cần `ai-agent:read`.
- Mã lỗi `ERR_2800`–`ERR_2805`; `ERR_2403` (`ai-providers`) khi chưa có API key để tạo embedding.

**Cấu trúc**

- Trang danh sách kho; tạo/sửa kho bằng `KnowledgeBaseFormModal`. Bấm tên kho mở `KnowledgeBaseDrawer` với hai tab: "Tài liệu" (bảng, thêm, xoá; phân trang giữ trong drawer) và "Tìm thử".
- Thêm tài liệu: `DocumentUploadModal`, gửi mọi file trong một request; báo theo số file xong hoặc lỗi vì BE xử lý từng file riêng. Trạng thái tài liệu hiện tên BE trả, rê chuột vào trạng thái lỗi để xem lý do.
- Ô chọn file dùng chung `FilePicker` (`@/components/common`, giá trị là `File[]`) cho cả skill (một file) và tài liệu (nhiều file).

## 8. MCP server (`ai-mcp-servers`)

Trang `/ai-mcp-servers`, quyền `ai-mcp-server:{read,create,update,delete}`. Mục "MCP server" đứng sau "Kho tri thức" trong menu.

**Hợp đồng BE**

- `GET/POST /ai-mcp-servers` (`search` theo tên/mã), `GET/PATCH/DELETE /ai-mcp-servers/:uid`. Body `{ code, name, url, headers?: [{ key, value }], allowedWriteTools? }`; `code` gồm a-z, 0-9, `_`, bắt đầu bằng chữ, tối đa 20, không sửa được. Trùng mã trả `ERR_3101`, hiện dưới ô mã.
- Header luôn trả dạng che (`***abcd`). PATCH gửi lại đúng giá trị che thì BE giữ giá trị cũ, gửi giá trị khác thì thay.
- `POST /:uid/sync-tools` đọc tool từ server MCP và lưu lại. Không kết nối được trả 502 `ERR_3103` và lỗi được lưu ở `lastSyncError` (`""` là không lỗi); `toolsSyncedAt` là `null` khi chưa đồng bộ.
- `GET /:uid/tools` trả `{ name, description, inputSchema, readOnly, allowed }`. Tool ghi chỉ `allowed` khi tên nằm trong `allowedWriteTools`.
- `POST /:uid/tools/:toolName/call` (`{ arguments }`) gọi thử, trả `{ isError, text, structuredContent }`; tool chưa được phép trả 403 `ERR_3102`.
- `GET /ai-mcp-servers/options` (`{ code, name }`) cho ô chọn của agent, cần `ai-agent:read`.
- Trong chat, tool MCP là tool thường, tên dạng `<code>__<tool>`. Người chat cần `ai-mcp-server:read` để agent dùng tool chỉ đọc, `ai-mcp-server:update` cho tool ghi.

**Cấu trúc**

- `form-values.ts`: chuyển giữa bản ghi và form. Form đổ sẵn header dạng che; khi sửa chỉ gửi field đã đổi, header đổi bất kỳ chỗ nào thì gửi cả danh sách, không bao giờ gửi mã.
- `AiMcpServerFormModal` + `McpHeadersField` (`Form.List` cặp tên / giá trị, không trùng tên).
- `McpToolsDrawer` đọc chi tiết server (luôn mới sau khi đồng bộ, sửa): nút "Đồng bộ tool", banner `lastSyncError`, `McpToolsTable` (công tắc "Cho phép" cho tool ghi lưu bằng PATCH `allowedWriteTools`, nút gọi thử).
- `McpToolCallModal`: ô tham số JSON điền sẵn khung theo `inputSchema` (`tool-arguments.ts`), hiện kết quả trả về.
- Đồng bộ lỗi vẫn làm mới dữ liệu để `lastSyncError` hiện ra.

## 9. Chat với agent và ghi nhớ (`ai-chat`, `ai-memories`)

Chat là popup gắn trong shell cho người có quyền `ai-chat:use`: nút tròn ở góc phải dưới, cửa sổ 580×700, phóng to thành toàn màn hình. Không có trang riêng.

**Hợp đồng BE**

- REST chỉ để đọc lại, đổi tên và xoá: `GET /ai-chats/agents` (agent đang bật, kèm `memoryEnabled`, `skills`), `GET /ai-chats/threads?agentUid=`, `PATCH /ai-chats/threads/:uid` (`title` ≤ 80), `DELETE /ai-chats/threads/:uid`, `GET /ai-chats/threads/:uid/messages` (mới nhất trước).
- Socket.IO namespace `/ai-chat` ở gốc BE. Gửi `ai:chat` (`agentUid`, `message`, `threadUid?`, `imageUrls?` ≤ 4 ảnh đã tải qua `POST /uploads/images`, `skillCode?` của agent) và `ai:chat:stop`, đều có ack. Nhận `chunk`, `step`, `tool-result` (nguồn trích dẫn trong `artifact.sources`), `done`, `error`. Sự kiện phát tới mọi tab, không mang id lượt, có thể tới trước ack. Không có resume.
- Tin của agent có `toolCalls`; tin của người dùng có `imageUrls`, `skillCode`. Tin bị dừng có `errorMessage` nhưng không phải lỗi. BE không lưu được tin trả lời thì `ai:chat:error` gửi tin có `uid` rỗng: FE không ghi tin đó vào lịch sử mà báo `errorMessage` bằng banner. Xoá cuộc chat đang có lượt chạy trả `ERR_3001`.
- Mã lỗi `ERR_3000`–`ERR_3004`. Ghi nhớ: `GET /ai-memories?agentUid=`, `DELETE /ai-memories/:uid`, `ERR_2900`.

**Cách giữ tin nhắn**

- Lịch sử ở React Query (`useInfiniteQuery`, mới nhất trước). Lượt đang chạy ở store Zustand `useAiChatStore` (`turns`), cùng trạng thái popup, agent và cuộc chat đang mở.
- `model/chat-messages.ts` là nơi duy nhất ghép hai nguồn: `toChatView(saved, turn)` trả danh sách tin để hiển thị; BE đã lưu tin người dùng của lượt thì không hiện lần nữa. Tin bị dừng không bị coi là lỗi.
- Lượt xong: `addFinishedTurn` ghi tin trả lời BE gửi kèm `done` (và tin người dùng tạm nếu cache chưa có) vào trang đầu của cache, rồi mới bỏ lượt, nên không nháy và không trùng; sau đó tải lại nền để thay tin tạm bằng bản đã lưu.
- Sự kiện chỉ ghép với lượt cùng `threadUid`; cuộc chat chưa có lượt (tab khác, hay sự kiện tới trước ack) thì mở lượt chỉ có phần trả lời. Ack về thì `assignThread` gộp lượt đang chờ với phần đó; lượt đã xong trước ack (`finishedThreadUids`) thì bỏ luôn. Không đoán theo "lượt đang chờ ack" nên hai tab cùng mở cuộc chat mới không lẫn nhau.
- Đóng popup hay mất kết nối thì bỏ mọi lượt đang chạy và đọc lại lịch sử qua REST (không có resume), tránh kẹt ở "đang trả lời". Trạng thái kết nối `connection` (`connecting`/`connected`/`disconnected`); mất kết nối thì hiện dòng "Mất kết nối" trên ô soạn.

**Giao diện** (`features/ai-chat/components`; icon `lucide-react`, màu lấy từ token antd `var(--ac-*)`)

- `ai-chat-widget.tsx`: nút nổi (gradient chạy, vòng sáng nhấp nháy), khung 580×700 ở góc phải dưới, phóng to thành modal toàn màn hình; socket chỉ kết nối khi mở (`useChatConnection`).
- `ai-chat-panel.tsx` + `threads/`: lịch sử trò chuyện mở đè khi thu nhỏ, cố định bên trái khi phóng to; đổi tên, xoá; cuộn tới cuối thì tải thêm (`useLoadMoreOnVisible`).
- `header/`: đổi agent (ô thả xuống riêng), lịch sử, ghi nhớ (agent bật ghi nhớ), xoá cuộc trò chuyện, phóng to, đóng.
- `messages/`: `flex-col-reverse` (tin mới ở dưới, cuộn lên thì tải tin cũ, nút về tin mới nhất); bong bóng tin có chip skill, ảnh 144px, nhãn "Nguồn", dòng trạng thái kèm ba chấm khi đang trả lời; markdown bằng `react-markdown` + `remark-gfm`; lỗi gửi hiện thành banner.
- `composer/`: nút "+" mở menu đính kèm ảnh hoặc danh sách skill; gõ "/" lọc skill, Enter chọn skill đầu; skill đã chọn hiện thành chip; ảnh chọn hoặc dán, tải lên ngay (tối đa 4), lỗi hiện dưới ô. Tin đang soạn và skill nằm trong store nên đóng popup không mất.
