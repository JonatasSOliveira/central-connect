import { Icon } from '@iconify/react'
import { forwardRef } from 'react'

export enum ButtonColors {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DANGER = 'danger',
  DANGER_OUTLINE = 'danger_outline',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ButtonColors
  isPending?: boolean
}

const colorClasses: Record<ButtonColors, string> = {
  [ButtonColors.PRIMARY]: 'text-white bg-blue-500 hover:bg-blue-700',
  [ButtonColors.SECONDARY]: 'text-white bg-gray-500 hover:bg-gray-700',
  [ButtonColors.DANGER]: 'text-white bg-red-500 hover:bg-red-700',
  [ButtonColors.DANGER_OUTLINE]:
    'text-red-500 bg-white border-solid border-red-500 border-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, isPending, color = ButtonColors.PRIMARY, ...props }, ref) => {
    const colorClass = color ? colorClasses[color] : ''

    return (
      <button
        ref={ref}
        className={'rounded px-2 py-1 font-bold ' + colorClass}
        disabled={isPending || props.disabled}
        {...props}
      >
        {!isPending ? (
          children
        ) : (
          <Icon
            icon="line-md:loading-loop"
            width="24"
            height="24"
            className="text-white"
          />
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
