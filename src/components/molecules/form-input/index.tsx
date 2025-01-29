import { ComboBox, ComboBoxOption } from '@/components/atoms/combo-box'
import { TextInput } from '@/components/atoms/text-input'
import { JSX } from 'react'
import { Control, FieldErrors, Path, UseFormRegister } from 'react-hook-form'

export enum FormInputType {
  TEXT = 'text',
  COMBO_BOX = 'combo_box',
}

export type InputDefinition<RecordType extends Record<string, unknown>> = {
  field: Path<RecordType>
  label?: string
  placeholder?: string
  options?: ComboBoxOption[]
  type?: FormInputType
}

interface FormInputProps<RecordType extends Record<string, unknown>> {
  inputDefinition: InputDefinition<RecordType>
  register: UseFormRegister<RecordType>
  errors: FieldErrors<RecordType>
  autoFocus?: boolean
  control: Control<RecordType>
}

export const FormInput = <RecordType extends Record<string, unknown>>({
  inputDefinition: { field, label, placeholder, type, options },
  register,
  errors,
  autoFocus,
  control,
}: FormInputProps<RecordType>): JSX.Element => {
  switch (type) {
    case FormInputType.COMBO_BOX:
      if (!options) throw new Error('options is required for combo_box type')

      return (
        <ComboBox
          id={field}
          label={label}
          error={errors[field]?.message as string | undefined}
          control={control as Control}
          name={field}
          options={options}
        />
      )

    case FormInputType.TEXT:
    default:
      return (
        <TextInput
          id={field}
          label={label}
          placeholder={placeholder}
          error={errors[field]?.message as string | undefined}
          autoFocus={autoFocus}
          {...register(field)}
        />
      )
  }
}
