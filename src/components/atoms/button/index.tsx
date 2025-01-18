import { forwardRef } from 'react'

enum ButtonColors {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DANGER = 'danger',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ButtonColors
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, color = ButtonColors.PRIMARY, ...props }, ref) => {
    let colorClass = ''

    switch (color) {
      case ButtonColors.PRIMARY:
        colorClass = 'bg-blue-500 hover:bg-blue-700'
        break
      case ButtonColors.SECONDARY:
        colorClass = 'bg-gray-500 hover:bg-gray-700'
        break
      case ButtonColors.DANGER:
        colorClass = 'bg-red-500 hover:bg-red-700'
        break
    }

    return (
      <button
        ref={ref}
        {...props}
        className={'rounded px-2 py-1 font-bold text-white' + colorClass}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
