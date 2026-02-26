import { useCallback, useState } from "react";

export function useAsyncLoading(initialState = false) {
  const [loading, setLoading] = useState(initialState);

  const run = useCallback(async <T>(callback: () => Promise<T>) => {
    try {
      setLoading(true);
      return await callback();
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    run,
  };
}
