import type { StoreApi, UseBoundStore } from "zustand";

type State<S> = S extends { getState: () => infer T } ? T : never;

export type WithSelectors<S> = S & { use: { [K in keyof State<S>]: () => State<S>[K] } };

/**
 * Sinh selector cho từng field: `useAppStore.use.sidebarCollapsed()`.
 * Mỗi selector chỉ subscribe một field nên không cần `useShallow` viết tay.
 */
export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(store: S) => {
  const use: Record<string, () => unknown> = {};
  for (const key of Object.keys(store.getState())) {
    use[key] = () => store((state) => state[key as keyof typeof state]);
  }
  return Object.assign(store, { use }) as WithSelectors<S>;
};
