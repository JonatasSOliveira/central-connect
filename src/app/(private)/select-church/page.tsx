"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface Church {
  churchId: string;
  roleId: string | null;
}

export default function SelectChurchPage() {
  const router = useRouter();
  const { selectChurch, isLoading } = useAuth();
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<string | null>(null);
  const [loadingChurches, setLoadingChurches] = useState(true);

  useEffect(() => {
    const loadChurches = async () => {
      try {
        const response = await fetch("/api/auth/login");
        const data = await response.json();
        if (data.value?.churches) {
          setChurches(data.value.churches);
        }
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

  if (loadingChurches) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-primary" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="font-heading text-2xl font-bold text-foreground text-center">
          Selecione uma igreja
        </h1>
        <p className="text-muted-foreground text-center mt-2">
          Você pertence a {churches.length} igreja{churches.length !== 1 ? "s" : ""}
        </p>

        <div className="w-full mt-8 space-y-3">
          {churches.map((church) => (
            <Button
              key={church.churchId}
              variant="outline"
              size="lg"
              className="w-full h-14 text-base font-medium justify-start px-4"
              onClick={() => handleSelectChurch(church.churchId)}
              disabled={isLoading || selectedChurch !== null}
            >
              {selectedChurch === church.churchId ? (
                <Loader2 className="w-5 h-5 animate-spin mr-3" />
              ) : (
                <Building2 className="w-5 h-5 mr-3" />
              )}
              Igreja {church.churchId.slice(0, 8)}...
            </Button>
          ))}
        </div>
      </div>
    </main>
  );
}
