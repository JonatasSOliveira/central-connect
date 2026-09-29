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

  it("shares an in-flight request and returns the loaded churches", async () => {
    let resolveResponse: ((value: unknown) => void) | undefined;
    const responsePromise = new Promise((resolve) => {
      resolveResponse = resolve;
    });
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => responsePromise,
    });
    vi.stubGlobal("fetch", fetchMock);

    const firstRequest = useChurchCatalogStore.getState().fetchIfStale();
    const secondRequest = useChurchCatalogStore.getState().fetchIfStale();
    resolveResponse?.({
      ok: true,
      value: {
        churches: [{ id: "church-1", name: "Igreja Central" }],
      },
    });

    const [firstChurches, secondChurches] = await Promise.all([
      firstRequest,
      secondRequest,
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(firstChurches).toEqual(secondChurches);
    expect(firstChurches).toEqual([
      expect.objectContaining({ id: "church-1", name: "Igreja Central" }),
    ]);
  });
});
