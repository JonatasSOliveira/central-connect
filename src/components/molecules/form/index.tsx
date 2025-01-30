import { forwardRef } from 'react'
import { Toaster } from 'react-hot-toast'
import { Icon } from '@iconify/react'
import { Button, ButtonColors } from '@/components/atoms/button'

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: () => void
  isPending: boolean
  confirmButtonText?: string
  onCancel?: () => void
}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  (
    { children, onSubmit, isPending, confirmButtonText, onCancel, ...props },
    ref,
  ) => (
    <form
      ref={ref}
      onSubmit={onSubmit}
      {...props}
      className="flex flex-col gap-2 w-full flex-1"
    >
      <Toaster />
      <div className="flex-1 flex flex-col gap-2">{children}</div>
      <div className="flex justify-center gap-2">
        {onCancel && (
          <Button type="button" color={ButtonColors.DANGER} onClick={onCancel}>
            Cancelar
          </Button>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Icon
              icon="line-md:loading-loop"
              width="24"
              height="24"
              className="text-white"
            />
          ) : (
            confirmButtonText || 'Confirmar'
          )}
        </Button>
      </div>
    </form>
  ),
)

Form.displayName = 'Form'
