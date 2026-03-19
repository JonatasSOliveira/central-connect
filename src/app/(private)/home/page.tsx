"use client";

import { Church } from "lucide-react";
import { useHomeScreen } from "@/features/home/hooks/useHomeScreen";

export default function HomePage() {
  const { userName } = useHomeScreen();

  return (
    <main className="min-h-screen p-6 bg-background">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Central Connect
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo, {userName}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Church className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Próximos eventos</h2>
                <p className="text-muted-foreground text-sm">
                  Em breve...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
