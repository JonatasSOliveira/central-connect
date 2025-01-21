'use client'

import { Button, ButtonColors } from '@/components/atoms/button'
import { Modal, ModalHandlers } from '@/components/molecules/modal'
import { PageDefinition } from '@/types/page-definition'
import Link from 'next/link'
import { useRef } from 'react'

export interface NavigationMenuFooterProps {
  pages: PageDefinition[]
}

export const NavigationMenuFooter: React.FC<NavigationMenuFooterProps> = ({
  pages,
}) => {
  const modalRef = useRef<ModalHandlers>(null)

  const openPagesModal = () => modalRef.current?.openModal()

  const closePagesModal = () => modalRef.current?.closeModal()

  return (
    <>
      <Modal ref={modalRef}>
        <div className="pt-2 flex flex-col justify-center gap-2">
          {pages.map(({ title, path }, index) => (
            <Link key={index} href={path} className="flex justify-center">
              <Button
                type="button"
                className="w-[90%]"
                onClick={closePagesModal}
              >
                {title}
              </Button>
            </Link>
          ))}
        </div>
      </Modal>
      <div className="flex w-full justify-center bg-white py-2">
        <Button
          type="button"
          onClick={openPagesModal}
          color={ButtonColors.PRIMARY_OUTLINE}
        >
          Menu
        </Button>
      </div>
    </>
  )
}
