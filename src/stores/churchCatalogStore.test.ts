import { beforeEach, describe, expect, it, vi } from "vitest";
import { useChurchCatalogStore } from "@/stores/churchCatalogStore";

describe("church catalog store", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useChurchCatalogStore.setState({
      churches: [],
      isLoading: false,
      lastFetchedAt: null,
    });
  });

  it("treats an empty response as a fresh cache", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        ok: true,
        value: { churches: [] },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await useChurchCatalogStore.getState().fetchIfStale();
    await useChurchCatalogStore.getState().fetchIfStale();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(useChurchCatalogStore.getState().lastFetchedAt).not.toBeNull();
  });

  it("fetches again after the cache is invalidated", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        ok: true,
        value: { churches: [] },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await useChurchCatalogStore.getState().fetchIfStale();
    useChurchCatalogStore.getState().invalidate();
    await useChurchCatalogStore.getState().fetchIfStale();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
