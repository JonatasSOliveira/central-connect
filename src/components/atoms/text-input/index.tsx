import { forwardRef } from 'react'
import { Label } from '../label'

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label?: string
  error?: string
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ id, error, ...props }, ref) => (
    <div className="flex flex-col w-full">
      {props.label && <Label htmlFor={id}>{props.label}</Label>}
      <input
        className="w-full py-1 px-2 border-b-2"
        id={id}
        ref={ref}
        {...props}
        type="text"
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  ),
)

TextInput.displayName = 'TextInput'
