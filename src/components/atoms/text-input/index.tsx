import { forwardRef } from 'react'
import { Label } from '../label'
import { ErrorSpan } from '../error-span'

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
      />
      <ErrorSpan error={error} />
    </div>
  ),
)

TextInput.displayName = 'TextInput'
