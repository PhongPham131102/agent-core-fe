import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

import { env } from "@/lib/env";

import { createSelectors } from "./create-selectors";
import { registerPersistedStore } from "./hydration";
import { registerStoreReset } from "./reset-registry";

import type { StateCreator } from "zustand";
import type { PersistOptions } from "zustand/middleware";

const STORAGE_PREFIX = "agent-core";

type DevtoolsMutators = [["zustand/devtools", never]];
// zustand khai báo mutator persist với `unknown` (xem signature của `persist`).
type PersistMutators = [["zustand/devtools", never], ["zustand/persist", unknown]];

interface IBaseStoreOptions<S> {
  /** Tên hiển thị trong Redux DevTools, đồng thời là key reset/persist. */
  name: string;
  /** Phần dữ liệu (không gồm action). Dùng lại khi reset. */
  initialState: S;
  /** Reset về initialState khi logout. */
  resetOnLogout?: boolean;
}

interface IStoreOptions<S, A> extends IBaseStoreOptions<S> {
  actions: StateCreator<S & A, DevtoolsMutators, [], A>;
}

interface IPersistedStoreOptions<S, A, P> extends IBaseStoreOptions<S> {
  actions: StateCreator<S & A, PersistMutators, [], A>;
  persist: {
    /** Tăng khi đổi shape dữ liệu persist, kèm `migrate`. */
    version: number;
    /** Bắt buộc khai báo field nào được lưu, tránh lưu nhầm dữ liệu. */
    partialize: (state: S & A) => P;
    migrate?: PersistOptions<S & A, P>["migrate"];
  };
}

/** Store chỉ sống trong bộ nhớ (UI state dùng chung). */
export const createStore = <S extends object, A extends object>({
  name,
  initialState,
  actions,
  resetOnLogout = true,
}: IStoreOptions<S, A>) => {
  const store = create<S & A>()(
    devtools((...args) => ({ ...initialState, ...actions(...args) }), {
      name,
      enabled: env.isDev,
    }),
  );

  if (resetOnLogout) registerStoreReset(name, () => store.setState({ ...initialState }));
  return createSelectors(store);
};

/** Store lưu xuống localStorage. Hydrate sau khi mount (xem `StoreHydration`). */
export const createPersistedStore = <S extends object, A extends object, P = Partial<S>>({
  name,
  initialState,
  actions,
  persist: { version, partialize, migrate },
  resetOnLogout = false,
}: IPersistedStoreOptions<S, A, P>) => {
  const store = create<S & A>()(
    devtools(
      persist<S & A, [["zustand/devtools", never]], [], P>(
        (...args) => ({ ...initialState, ...actions(...args) }),
        {
          name: `${STORAGE_PREFIX}.${name}`,
          version,
          partialize,
          migrate,
          storage: createJSONStorage<P>(() => localStorage),
          skipHydration: true,
        },
      ),
      { name, enabled: env.isDev },
    ),
  );

  registerPersistedStore(store.persist);
  if (resetOnLogout) registerStoreReset(name, () => store.setState({ ...initialState }));
  return createSelectors(store);
};
