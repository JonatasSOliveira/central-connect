import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, error, ...props }, ref) => (
    <div className="flex flex-col">
      {props.label && <label htmlFor={id}>{props.label}</label>}
      <input className="border-b-2" id={id} ref={ref} {...props} />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  ),
)

Input.displayName = 'Input'
