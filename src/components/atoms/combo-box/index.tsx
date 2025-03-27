import { Controller, Control } from 'react-hook-form'
import { Label } from '../label'
import { ErrorSpan } from '../error-span'

export interface ComboBoxOption {
  id: string
  value: unknown
  label: string
}

interface ComboBoxProps {
  id: string
  label?: string
  options: ComboBoxOption[]
  name: string
  control: Control
  error?: string
}

export const ComboBox: React.FC<ComboBoxProps> = ({
  label,
  id,
  options,
  name,
  control,
  error,
}) => {
  return (
    <div className="flex flex-col w-full">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <select
            id={id}
            {...field}
            className="border-2 border-solid rounded-md py-1 px-2"
            value={
              options.find((option) => option.value === field.value)?.id || ''
            }
            onChange={(e) => {
              const selectedId = e.target.value
              const selectedOption = options.find(
                (option) => option.id === selectedId,
              )
              field.onChange(selectedOption ? selectedOption.value : '')
            }}
          >
            <option value="">Selecione uma opção</option>
            {options.map((option, index) => (
              <option key={index} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      />
      <ErrorSpan error={error} />
    </div>
  )
}
