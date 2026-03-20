"use client";

import type { ReactNode } from "react";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

interface FormContentProps {
  children: ReactNode;
  className?: string;
}

interface FormFooterProps {
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  className?: string;
}

interface FormProps<T extends Record<string, unknown>> {
  children: ReactNode;
  className?: string;
  onSubmit: SubmitHandler<T>;
  form: UseFormReturn<T>;
}

function FormHeader({ title, description, className }: FormHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <h1 className="text-xl font-heading font-semibold text-foreground">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}

function FormContent({ children, className }: FormContentProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

function FormFooter({
  onCancel,
  isLoading,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
  className,
}: FormFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t border-border/50",
        className,
      )}
    >
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          {cancelLabel}
        </Button>
      )}
      <Button type="submit" disabled={isLoading} className="flex-1">
        {isLoading ? "Salvando..." : submitLabel}
      </Button>
    </div>
  );
}

function Form<T extends Record<string, unknown>>({
  children,
  className,
  onSubmit,
  form,
}: FormProps<T>) {
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("space-y-4", className)}
    >
      {children}
    </form>
  );
}

export function FormTemplate({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("max-w-xl mx-auto", className)}>{children}</div>;
}

FormTemplate.Header = FormHeader;
FormTemplate.Content = FormContent;
FormTemplate.Footer = FormFooter;
FormTemplate.Form = Form;

export { Form, FormContent, FormFooter, FormHeader };
