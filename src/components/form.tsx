import { forwardRef } from 'react'
import { Toaster } from 'react-hot-toast'
import { Icon } from '@iconify/react'

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: () => void
  isPending: boolean
  confirmButtonText?: string
}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ children, onSubmit, isPending, confirmButtonText, ...props }, ref) => (
    <form
      ref={ref}
      onSubmit={onSubmit}
      {...props}
      className="flex flex-col gap-2"
    >
      <Toaster />
      {children}
      <div className="flex justify-center">
        <button
          className="rounded bg-blue-500 px-2 py-1 font-bold text-white hover:bg-blue-700"
          type="submit"
          disabled={isPending}
        >
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
        </button>
      </div>
    </form>
  ),
)

Form.displayName = 'Form'
