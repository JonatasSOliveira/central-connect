import { forwardRef } from 'react'

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, ...props }, ref) => (
    <label ref={ref} className="font-bold" {...props}>
      {children}
    </label>
  ),
)

Label.displayName = 'Label'
