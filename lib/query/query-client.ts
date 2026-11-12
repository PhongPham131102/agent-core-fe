import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { ClientErrorCode, CommonErrorCode, getErrorMessage, isApiError } from "@/lib/http";
import { notify } from "@/lib/ui/notify";

import "./query.types";

export const QUERY_STALE_TIME_MS = 30_000;
const MAX_RETRY = 1;

/** Không retry lỗi 4xx và request bị huỷ; lỗi khác retry tối đa MAX_RETRY lần. */
export const shouldRetry = (failureCount: number, error: unknown) => {
  if (isApiError(error) && (error.isClientError || error.code === ClientErrorCode.cancelled)) {
    return false;
  }
  return failureCount < MAX_RETRY;
};

/** 401 do session lifecycle xử lý (logout + redirect), không toast thêm. */
const shouldNotifyError = (error: unknown) =>
  !(isApiError(error) && error.code === CommonErrorCode.unauthorized);

export const makeQueryClient = () => {
  const queryClient: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        const title = query.meta?.errorMessage;
        if (title && shouldNotifyError(error)) notify.error(`${title}: ${getErrorMessage(error)}`);
      },
    }),
    mutationCache: new MutationCache({
      onSuccess: async (_data, _variables, _result, mutation) => {
        const { invalidates, successMessage } = mutation.meta ?? {};
        if (successMessage) notify.success(successMessage);
        // Trả promise để mutation giữ trạng thái pending tới khi refetch xong.
        if (invalidates?.length) {
          await Promise.all(
            invalidates.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
          );
        }
      },
      onError: (error, _variables, _result, mutation) => {
        if (mutation.meta?.silentError || !shouldNotifyError(error)) return;
        notify.error(mutation.meta?.errorMessage ?? getErrorMessage(error));
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
      mutations: { retry: false },
    },
  });
  return queryClient;
};

let browserQueryClient: QueryClient | undefined;

/** Server: client mới cho mỗi request. Browser: một client dùng suốt phiên. */
export const getQueryClient = () => {
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
};
