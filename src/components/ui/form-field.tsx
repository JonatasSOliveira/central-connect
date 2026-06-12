"use client";

import type { ReactNode } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function extractErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  if (Array.isArray(error)) {
    for (const item of error) {
      const message = extractErrorMessage(item);
      if (message) return message;
    }
    return undefined;
  }

  for (const value of Object.values(error)) {
    const message = extractErrorMessage(value);
    if (message) return message;
  }

  return undefined;
}

interface FormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}

function FormField<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  required,
  disabled,
  children,
}: FormFieldProps<T>) {
  const error = extractErrorMessage(form.formState.errors[name]);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className={error ? "text-destructive" : ""}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children || (
        <Input
          id={name}
          placeholder={placeholder}
          disabled={disabled}
          {...form.register(name)}
          aria-invalid={!!error}
        />
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export type { FormFieldProps };
export { FormField };
