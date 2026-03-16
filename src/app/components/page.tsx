"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ComponentConfig {
  name: string;
  description?: string;
  render: () => React.ReactNode;
}

const buttonVariants = [
  { variant: "default", label: "Default" },
  { variant: "secondary", label: "Secondary" },
  { variant: "outline", label: "Outline" },
  { variant: "ghost", label: "Ghost" },
  { variant: "destructive", label: "Destructive" },
  { variant: "link", label: "Link" },
];

const buttonSizes = [
  { size: "xs", label: "XS" },
  { size: "sm", label: "SM" },
  { size: "default", label: "Default" },
  { size: "lg", label: "LG" },
];

const buttonIconSizes = [
  { size: "icon-xs", label: "+" },
  { size: "icon-sm", label: "+" },
  { size: "icon", label: "+" },
  { size: "icon-lg", label: "+" },
];

const components: ComponentConfig[] = [
  {
    name: "Button",
    description:
      "Componente de botão interativo com múltiplas variantes, tamanhos e estados.",
    render: () => (
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h4 className="text-sm font-medium text-foreground">Variants</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Diferentes estilos visuais para diferentes contextos
          </p>
          <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg">
            {buttonVariants.map((config) => (
              <Button key={config.variant} variant={config.variant as never}>
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h4 className="text-sm font-medium text-foreground">Sizes</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Diferentes tamanhos para melhor adaptação ao layout
          </p>
          <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg">
            {buttonSizes.map((config) => (
              <Button key={config.size} size={config.size as never}>
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h4 className="text-sm font-medium text-foreground">Icon Sizes</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Botões com ícones para ações rápidas
          </p>
          <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg">
            {buttonIconSizes.map((config) => (
              <Button key={config.size} size={config.size as never}>
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h4 className="text-sm font-medium text-foreground">States</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Estados normais e desabilitados
          </p>
          <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg">
            <Button>Normal</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </div>
    ),
  },
  {
    name: "Card",
    description:
      "Container flexível para agrupar conteúdo relacionado com header, title e description.",
    render: () => (
      <div className="grid gap-6">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Default</h4>
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>
                Card description goes here with more details about the content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Card content area for additional information and details that
                might need to be displayed to the user.
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">
            Without Description
          </h4>
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Simple Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A simplified card version without description.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
];

export default function ComponentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Home
        </Link>

        <div className="mb-10 pb-6 border-b">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
            Componentes
          </h1>
          <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
            Showcase dos componentes do Central Connect. Esta página exibe
            automaticamente todos os componentes disponíveis em{" "}
            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
              src/components/ui
            </code>
          </p>
        </div>

        <div className="space-y-12">
          {components.map((config, index) => (
            <section
              key={config.name}
              className="scroll-mt-4"
              id={config.name.toLowerCase()}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                  {index + 1}
                </span>
                <h2 className="font-heading text-2xl font-semibold">
                  {config.name}
                </h2>
              </div>
              {config.description && (
                <p className="text-muted-foreground mb-6 ml-11">
                  {config.description}
                </p>
              )}

              <Card className="overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  {config.render()}
                </CardContent>
              </Card>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Para adicionar novos componentes:{" "}
            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
              pnpm dlx shadcn@latest add {"<componente>"}
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
