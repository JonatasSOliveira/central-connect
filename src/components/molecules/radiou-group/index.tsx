import { Label } from '@/components/atoms/label'
import { RadioButton } from '@/components/atoms/radio-button'
import React from 'react'
import { Control, Controller } from 'react-hook-form'

type RadioGroupProps = {
  options: { label: string; value: string }[]
  name: string
  control: Control
  label: string
  defaultValue?: string
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  name,
  control,
  defaultValue,
  label,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <div>
            {options.map((option) => (
              <RadioButton
                id={name + option.value}
                key={option.value}
                label={option.label}
                value={option.value}
                name={name}
                checked={field.value === option.value}
                onChange={() => field.onChange(option.value)} // Update value when selected
              />
            ))}
          </div>
        )}
      />
    </div>
  )
}

export default RadioGroup
