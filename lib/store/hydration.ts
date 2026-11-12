import { useSyncExternalStore } from "react";

interface IPersistApi {
  rehydrate: () => Promise<void> | void;
  hasHydrated: () => boolean;
  onFinishHydration: (listener: () => void) => () => void;
}

const persistedStores = new Set<IPersistApi>();

export const registerPersistedStore = (api: IPersistApi) => {
  persistedStores.add(api);
};

/**
 * Store persisted dùng `skipHydration`, nên server và lần render đầu ở client
 * đều dùng initialState (không lệch hydration). Gọi hàm này sau khi mount.
 */
export const rehydratePersistedStores = async () => {
  await Promise.all([...persistedStores].map((api) => api.rehydrate()));
};

/** `true` khi store đã đọc xong dữ liệu từ localStorage. */
export const useHydrated = (store: { persist: IPersistApi }) =>
  useSyncExternalStore(store.persist.onFinishHydration, store.persist.hasHydrated, () => false);
