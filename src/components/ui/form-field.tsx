"use client";

import type { ReactNode } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const error = form.formState.errors[name]?.message as string | undefined;

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
