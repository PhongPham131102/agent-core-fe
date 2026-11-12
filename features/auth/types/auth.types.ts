/** Khớp `IAuthUserResponse` bên agent-core-be. */
export interface IAuthUser {
  uid: string;
  email: string;
  fullName: string;
  avatar: string;
  roleUid: string;
  role: { uid: string; name: string; isSuperAdmin: boolean };
  /** Chuỗi `<subject>:<action>`; có thể chứa quyền FE chưa biết tới. */
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

/** Body của login và refresh. Refresh token đi qua cookie httpOnly, FE không thấy. */
export interface IAuthSession {
  accessToken: string;
  user: IAuthUser;
}

export interface ILoginBody {
  email: string;
  password: string;
}

export interface IUpdateProfileBody {
  fullName?: string;
  avatar?: string;
}

export interface IChangePasswordBody {
  oldPassword: string;
  newPassword: string;
}
