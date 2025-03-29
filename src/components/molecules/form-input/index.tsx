import { ComboBox, ComboBoxOption } from '@/components/atoms/combo-box'
import { TextInput } from '@/components/atoms/text-input'
import { JSX } from 'react'
import { Control, FieldErrors, UseFormRegister } from 'react-hook-form'
import { KeyOf } from '@/types/KeyOf'

interface InputProps<RecordType extends Record<string, unknown>> {
  control: Control<RecordType>
  errors: FieldErrors<RecordType>
}

export enum FormInputType {
  TEXT = 'text',
  COMBO_BOX = 'combo_box',
  PASSWORD = 'password',
}

export type InputDefinition<RecordType extends Record<string, unknown>> = {
  field: KeyOf<RecordType>
  label?: string
  placeholder?: string
  options?: ComboBoxOption[]
  type?: FormInputType
  customComponent?: (props: InputProps<RecordType>) => JSX.Element
}

interface FormInputProps<RecordType extends Record<string, unknown>> {
  inputDefinition: InputDefinition<RecordType>
  register: UseFormRegister<RecordType>
  errors: FieldErrors<RecordType>
  autoFocus?: boolean
  control: Control<RecordType>
}

export const FormInput = <RecordType extends Record<string, unknown>>({
  inputDefinition: {
    field,
    label,
    placeholder,
    type,
    options,
    customComponent,
  },
  register,
  errors,
  autoFocus,
  control,
}: FormInputProps<RecordType>): JSX.Element => {
  if (customComponent) return customComponent({ control, errors })

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
    case FormInputType.PASSWORD:
    default:
      return (
        <TextInput
          id={field}
          label={label}
          placeholder={placeholder}
          type={type}
          error={errors[field]?.message as string | undefined}
          autoFocus={autoFocus}
          {...register(field)}
        />
      )
  }
}
