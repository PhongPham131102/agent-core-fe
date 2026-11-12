import { describe, expect, it } from "vitest";

import { createPersistedStore, createStore } from "./create-store";
import { rehydratePersistedStores } from "./hydration";
import { resetAllStores } from "./reset-registry";

interface ICounterState {
  count: number;
}
interface ICounterActions {
  increase: () => void;
}

describe("createStore", () => {
  it("reset về initialState khi logout nhưng giữ action", () => {
    const useCounter = createStore<ICounterState, ICounterActions>({
      name: "counter-test",
      initialState: { count: 0 },
      actions: (set) => ({ increase: () => set((s) => ({ count: s.count + 1 })) }),
    });

    useCounter.getState().increase();
    expect(useCounter.getState().count).toBe(1);

    resetAllStores();
    expect(useCounter.getState().count).toBe(0);
    useCounter.getState().increase();
    expect(useCounter.getState().count).toBe(1);
  });

  it("sinh selector theo field", () => {
    const useCounter = createStore<ICounterState, ICounterActions>({
      name: "selector-test",
      initialState: { count: 0 },
      actions: (set) => ({ increase: () => set((s) => ({ count: s.count + 1 })) }),
    });
    expect(typeof useCounter.use.count).toBe("function");
    expect(typeof useCounter.use.increase).toBe("function");
  });
});

describe("createPersistedStore", () => {
  it("chỉ lưu field trong partialize và chỉ đọc lại sau khi rehydrate", async () => {
    localStorage.setItem(
      "agent-core.persist-test",
      JSON.stringify({ state: { count: 5 }, version: 1 }),
    );
    const usePersisted = createPersistedStore<ICounterState & { draft: string }, ICounterActions>({
      name: "persist-test",
      initialState: { count: 0, draft: "" },
      actions: (set) => ({ increase: () => set((s) => ({ count: s.count + 1, draft: "x" })) }),
      persist: { version: 1, partialize: ({ count }) => ({ count }) },
    });

    expect(usePersisted.getState().count).toBe(0);
    await rehydratePersistedStores();
    expect(usePersisted.getState().count).toBe(5);

    usePersisted.getState().increase();
    const saved = JSON.parse(localStorage.getItem("agent-core.persist-test") ?? "{}");
    expect(saved.state).toEqual({ count: 6 });
  });
});
