import "./errors";

export { authKeys } from "./api/auth.keys";
export { AuthGuard } from "./components/guards/auth-guard";
export { Can, PermissionGuard } from "./components/guards/can";
export { LoginPage } from "./components/login/login-page";
export { UserMenu } from "./components/account/user-menu";
export { useAccess } from "./hooks/use-access";
export { hasPermissions, Permission } from "./permissions";
export { NewPasswordFields, NewPasswordItem } from "./components/password/new-password-fields";
export {
  avatarSchema,
  AUTH_LIMITS,
  emailSchema,
  fullNameSchema,
  passwordSchema,
} from "./schemas/auth.schema";
export type { PermissionKey } from "./permissions";
export type { IAuthUser } from "./types/auth.types";
