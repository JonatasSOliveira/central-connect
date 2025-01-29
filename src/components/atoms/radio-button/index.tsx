import { Label } from '../label'

type RadioButtonProps = {
  id: string
  label: string
  name: string
  value: string
  error?: string
  checked?: boolean
  onChange?: () => void
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  id,
  name,
  error,
  label,
  checked,
  value,
  onChange,
}) => (
  <>
    <div className="flex gap-2">
      <input
        type="radio"
        name={name}
        checked={checked}
        value={value}
        onChange={onChange}
      />
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
    </div>
    {error && <span className="text-sm text-red-500">{error}</span>}
  </>
)
