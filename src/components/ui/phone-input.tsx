"use client";

import { Input } from "@/components/ui/input";
import { formatPhoneBrDynamic, normalizePhone } from "@/shared/utils/phone";

interface PhoneInputProps {
  id?: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  onChangeValue?: (value: string) => void;
  onBlur?: () => void;
}

export function PhoneInput({
  id,
  value,
  placeholder = "(11) 99999-9999",
  disabled,
  readOnly,
  autoFocus,
  autoComplete = "tel",
  onChangeValue,
  onBlur,
}: PhoneInputProps) {
  const formattedValue = formatPhoneBrDynamic(value);

  return (
    <Input
      id={id}
      type="tel"
      value={formattedValue}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      autoFocus={autoFocus}
      autoComplete={autoComplete}
      onChange={(event) => onChangeValue?.(normalizePhone(event.target.value))}
      onBlur={onBlur}
    />
  );
}
