import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Central Connect</h1>
      <p className="text-muted-foreground mb-8">
        Sistema de gestão de escalas ministeriais para igrejas.
      </p>
      <Link href="/components">
        <Button>Ver Componentes</Button>
      </Link>
    </div>
  );
}
