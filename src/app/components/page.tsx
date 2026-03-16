"use client";

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
    description: "Componente de botão com múltiplas variantes e tamanhos",
    render: () => (
      <div className="space-y-6">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Variants</h4>
          <div className="flex flex-wrap gap-2">
            {buttonVariants.map((config) => (
              <Button key={config.variant} variant={config.variant as never}>
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Sizes</h4>
          <div className="flex flex-wrap items-center gap-2">
            {buttonSizes.map((config) => (
              <Button key={config.size} size={config.size as never}>
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Icon Sizes</h4>
          <div className="flex flex-wrap items-center gap-2">
            {buttonIconSizes.map((config) => (
              <Button key={config.size} size={config.size as never}>
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">States</h4>
          <div className="flex flex-wrap gap-2">
            <Button>Normal</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </div>
    ),
  },
  {
    name: "Card",
    description: "Container para conteúdo com header, title e description",
    render: () => (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Card content area for additional information.
          </p>
        </CardContent>
      </Card>
    ),
  },
];

export default function ComponentsPage() {
  return (
    <div className="container mx-auto py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Componentes</h1>
        <p className="text-muted-foreground mt-2">
          Showcase dos componentes do Central Connect. Esta página exibe
          automaticamente todos os componentes disponíveis em{" "}
          <code className="bg-muted px-1 py-0.5 rounded text-sm">
            src/components/ui
          </code>
          .
        </p>
      </div>

      {components.map((config) => (
        <section key={config.name} className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">{config.name}</h2>
            {config.description && (
              <p className="text-muted-foreground mt-1">{config.description}</p>
            )}
          </div>

          <Card>
            <CardContent className="pt-6">{config.render()}</CardContent>
          </Card>
        </section>
      ))}
    </div>
  );
}
