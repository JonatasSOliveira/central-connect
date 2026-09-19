"use client";

import { Check, X } from "lucide-react";
import type { ReactNode } from "react";
import type {
  SubmitErrorHandler,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
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
  onInvalid?: SubmitErrorHandler<T>;
  form: UseFormReturn<T>;
}

function FormHeader({ title, description, className }: FormHeaderProps) {
  return (
    <div className={cn("mb-6 mt-4", className)}>
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
  return <div className={cn("space-y-4 pt-4", className)}>{children}</div>;
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
        "fixed inset-x-0 bottom-16 z-40 border-t border-border/80 bg-background/95 p-4 backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-xl flex-col-reverse gap-3 sm:flex-row">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="min-h-12 flex-1">
            <X className="mr-2 w-4 h-4" />
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="min-h-12 flex-1">
          {isLoading ? "Salvando..." : <><Check className="mr-2 w-4 h-4" />{submitLabel}</>}
        </Button>
      </div>
    </div>
  );
}

function Form<T extends Record<string, unknown>>({
  children,
  className,
  onSubmit,
  onInvalid,
  form,
}: FormProps<T>) {
  const submitHandler = onInvalid
    ? form.handleSubmit(onSubmit, onInvalid)
    : form.handleSubmit(onSubmit);

  return (
    <form onSubmit={submitHandler} className={cn("space-y-4 pb-24", className)}>
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
