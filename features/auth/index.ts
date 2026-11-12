import "./errors";

export { authKeys } from "./api/auth.keys";
export { useLogout } from "./api/auth.queries";
export { AuthGuard } from "./components/guards/auth-guard";
export { Can, PermissionGuard } from "./components/guards/can";
export { LoginPage } from "./components/login/login-page";
export { useAccess } from "./hooks/use-access";
export { actionLabel, groupPermissions, permissionLabel, subjectLabel } from "./permission-labels";
export { hasPermissions, Permission } from "./permissions";
export { NewPasswordFields, NewPasswordItem } from "./components/password/new-password-fields";
export {
  avatarSchema,
  AUTH_LIMITS,
  currentPasswordSchema,
  emailSchema,
  fullNameSchema,
  passwordSchema,
} from "./schemas/auth.schema";
export type { PermissionKey } from "./permissions";
export type { IAuthUser } from "./types/auth.types";
