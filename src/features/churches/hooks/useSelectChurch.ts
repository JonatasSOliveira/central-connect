import { AuthLoginOutputDTO } from "@/application/dtos/auth";
import { ChurchInfo } from "@/application/dtos/auth/AuthLoginOutputDTO";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Result } from "@/shared/types/Result";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useSelectChurch() {
  const router = useRouter();
  const { selectChurch, isLoading } = useAuth();
  const [churches, setChurches] = useState<ChurchInfo[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<string | null>(null);
  const [loadingChurches, setLoadingChurches] = useState(true);

  useEffect(() => {
    const loadChurches = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data: Result<Omit<AuthLoginOutputDTO, "sessionToken">> =
          await response.json();
        if (!data.ok) {
          return;
        }

        setChurches(data.value.churches);
      } finally {
        setLoadingChurches(false);
      }
    };

    loadChurches();
  }, []);

  const handleSelectChurch = async (churchId: string) => {
    setSelectedChurch(churchId);
    try {
      await selectChurch(churchId);
      router.push("/home");
    } catch {
      setSelectedChurch(null);
    }
  };

  return {
    churches,
    loadingChurches,
    isLoading,
    selectedChurch,
    handleSelectChurch,
  };
}
