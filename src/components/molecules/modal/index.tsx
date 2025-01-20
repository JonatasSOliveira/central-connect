import { forwardRef, useImperativeHandle, useState } from 'react'

interface ModalProps {
  children: React.ReactNode
}

export interface ModalHandlers {
  openModal: () => void
  closeModal: () => void
}

export const Modal = forwardRef<ModalHandlers, ModalProps>(
  ({ children }, ref) => {
    const [isOpen, setIsOpen] = useState(false)

    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)

    useImperativeHandle(ref, () => ({
      openModal,
      closeModal,
    }))

    if (!isOpen) return null

    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={closeModal}
            >
              ✕
            </button>
            {children}
          </div>
        </div>
      </>
    )
  },
)

Modal.displayName = 'ModalComponent'
