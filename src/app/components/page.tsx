"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ChurchFormData } from "@/application/dtos/church/ChurchDTO";
import {
  ChurchFormSchema,
  churchFormDefaultValues,
} from "@/application/dtos/church/ChurchDTO";
import { Form, FormTemplate } from "@/components/templates/form-template";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";

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
  {
    name: "Input",
    description:
      "Campo de entrada de texto com suporte a placeholder, disabled e validação.",
    render: () => (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h4 className="text-sm font-medium text-foreground">Default</h4>
          </div>
          <Input placeholder="Digite aqui..." />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h4 className="text-sm font-medium text-foreground">With Label</h4>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="example">Nome</Label>
            <Input id="example" placeholder="Digite seu nome..." />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h4 className="text-sm font-medium text-foreground">Disabled</h4>
          </div>
          <Input placeholder="Disabled" disabled />
        </div>
      </div>
    ),
  },
  {
    name: "Label",
    description: "Rótulo para campos de formulário com suporte a required.",
    render: () => (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Label Normal</Label>
          <Input placeholder="Input..." />
        </div>
        <div className="space-y-1.5">
          <Label>
            Label Required <span className="text-destructive">*</span>
          </Label>
          <Input placeholder="Campo obrigatório..." />
        </div>
      </div>
    ),
  },
  {
    name: "FormField",
    description:
      "Campo de formulário reutilizável com label, input e mensagem de erro integrados.",
    render: () => {
      const form = useForm<ChurchFormData>({
        resolver: zodResolver(ChurchFormSchema),
        defaultValues: churchFormDefaultValues,
      });

      return (
        <FormTemplate>
          <FormTemplate.Header
            title="Exemplo de Formulário"
            description="Demonstração do FormField com validação"
          />
          <Form<ChurchFormData> form={form} onSubmit={() => {}}>
            <FormTemplate.Content>
              <FormField<ChurchFormData>
                form={form}
                name="name"
                label="Nome da Igreja"
                placeholder="Digite o nome da igreja"
                required
              />
            </FormTemplate.Content>
            <FormTemplate.Footer onCancel={() => {}} isLoading={false} />
          </Form>
        </FormTemplate>
      );
    },
  },
  {
    name: "FormTemplate",
    description:
      "Compound component para estruturar formulários com Header, Content, Footer e Form.",
    render: () => (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h4 className="text-sm font-medium text-foreground">Estrutura</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            O FormTemplate é composto por:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>
              <code className="bg-muted px-1 rounded">FormTemplate.Header</code>{" "}
              - Título e descrição
            </li>
            <li>
              <code className="bg-muted px-1 rounded">
                FormTemplate.Content
              </code>{" "}
              - Campos do formulário
            </li>
            <li>
              <code className="bg-muted px-1 rounded">FormTemplate.Footer</code>{" "}
              - Botões de ação
            </li>
            <li>
              <code className="bg-muted px-1 rounded">Form</code> - Formulário
              com react-hook-form
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    name: "Toaster",
    description:
      "Notificações toast para feedback de ações (sucesso, erro, info).",
    render: () => (
      <div className="flex flex-wrap gap-3">
        <Button
          variant="default"
          onClick={() => toast.success("Igreja criada com sucesso!")}
        >
          Success
        </Button>
        <Button
          variant="destructive"
          onClick={() => toast.error("Ocorreu um erro.")}
        >
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.info("Informação importante.")}
        >
          Info
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.warning("Atenção: dados não salvos.")}
        >
          Warning
        </Button>
      </div>
    ),
  },
];

export default function ComponentsPage() {
  return (
    <div className="bg-background">
      <Toaster />
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
