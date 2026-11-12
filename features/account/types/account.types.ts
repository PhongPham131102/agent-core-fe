/** Body của PATCH /auth/me. Bỏ field là giữ nguyên, gửi "" là xoá giá trị. */
export interface IUpdateProfileBody {
  fullName?: string;
  avatar?: string;
}

export interface IChangePasswordBody {
  oldPassword: string;
  newPassword: string;
}
