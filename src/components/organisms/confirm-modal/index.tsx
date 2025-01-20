import { forwardRef, useImperativeHandle, useRef, useTransition } from 'react'
import { Modal, ModalHandlers } from '../../molecules/modal'
import { Button, ButtonColors } from '@/components/atoms/button'
import { H2 } from '@/components/atoms/h2'

interface ConfirmModalProps {
  title: string
  message: string
  confirmButtonColor?: ButtonColors
  onConfirm: () => void | Promise<void>
}

export interface ConfirmModalHandlers {
  openModal: () => void
  closeModal: () => void
}

export const ConfirmModal = forwardRef<ConfirmModalHandlers, ConfirmModalProps>(
  ({ title, message, confirmButtonColor, onConfirm }, ref) => {
    const [isPending, startTransition] = useTransition()
    const modalRef = useRef<ModalHandlers>(null)

    const openModal = () => modalRef.current?.openModal()

    const closeModal = () => modalRef.current?.closeModal()

    useImperativeHandle(ref, () => ({
      openModal,
      closeModal,
    }))

    const confirmButtonHandler = () =>
      startTransition(async () => {
        await onConfirm()
        closeModal()
      })

    return (
      <Modal ref={modalRef}>
        <div className="gap-2 flex flex-col">
          <div>
            <H2>{title}</H2>
          </div>
          <p>{message}</p>
          <div className="flex justify-around">
            <Button
              type="button"
              color={ButtonColors.DANGER_OUTLINE}
              onClick={closeModal}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              color={confirmButtonColor}
              onClick={confirmButtonHandler}
              isPending={isPending}
            >
              Confimar
            </Button>
          </div>
        </div>
      </Modal>
    )
  },
)

ConfirmModal.displayName = 'ConfirmModal'
