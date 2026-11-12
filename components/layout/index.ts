// Chỉ export AppShell (client). menu-items dùng icon antd (cần React context),
// không được kéo vào server component qua barrel này.
export { AppShell } from "./app-shell";
