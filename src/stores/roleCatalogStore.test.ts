import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRoleCatalogStore } from "@/stores/roleCatalogStore";

describe("role catalog store", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useRoleCatalogStore.setState({
      roles: [],
      isLoading: false,
      lastFetchedAt: null,
    });
  });

  it("treats an empty response as a fresh cache", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        ok: true,
        value: { roles: [] },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await useRoleCatalogStore.getState().fetchIfStale();
    await useRoleCatalogStore.getState().fetchIfStale();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(useRoleCatalogStore.getState().lastFetchedAt).not.toBeNull();
  });

  it("shares an in-flight request", async () => {
    let resolveResponse: ((value: unknown) => void) | undefined;
    const responsePromise = new Promise((resolve) => {
      resolveResponse = resolve;
    });
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => responsePromise,
    });
    vi.stubGlobal("fetch", fetchMock);

    const firstRequest = useRoleCatalogStore.getState().fetchIfStale();
    const secondRequest = useRoleCatalogStore.getState().fetchIfStale();
    resolveResponse?.({ ok: true, value: { roles: [] } });

    await Promise.all([firstRequest, secondRequest]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fetches again after invalidation", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        ok: true,
        value: { roles: [] },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await useRoleCatalogStore.getState().fetchIfStale();
    useRoleCatalogStore.getState().invalidate();
    await useRoleCatalogStore.getState().fetchIfStale();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
