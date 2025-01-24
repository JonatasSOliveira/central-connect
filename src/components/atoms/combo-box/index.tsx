import { Controller, Control } from 'react-hook-form'
import { Label } from '../label'

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
            value={options.find((option) => option.id === field.value?.id)?.id} // Mapeia o value atual para o índice
            onChange={(e) => {
              const selectedId = e.target.value
              const selectedOption = options.find(
                (option) => option.id === selectedId,
              )
              field.onChange(selectedOption?.value) // Atualiza o value com o valor do objeto selecionado
            }}
          >
            <option value="">Selecione uma opção</option>
            {options.map((option, index) => (
              <option key={index} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  )
}
