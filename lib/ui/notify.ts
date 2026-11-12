import type { MessageInstance } from "antd/es/message/interface";
import type { NotificationInstance } from "antd/es/notification/interface";

/**
 * Giữ instance message/notification của antd `<App>` để code ngoài React
 * (QueryCache, session) hiển thị thông báo theo đúng theme.
 * Instance được gắn bởi `AntdAppBridge` trong providers.
 */
let messageApi: MessageInstance | null = null;
let notificationApi: NotificationInstance | null = null;

export const bindNotifyApi = (apis: {
  message: MessageInstance;
  notification: NotificationInstance;
}) => {
  messageApi = apis.message;
  notificationApi = apis.notification;
};

export const notify = {
  success: (content: string) => messageApi?.success(content),
  error: (content: string, key?: string) => messageApi?.error({ content, key }),
  warning: (title: string, description?: string, key?: string) =>
    notificationApi?.warning({ title, description, key }),
};
