'use client'

import { useRef, useState, useTransition } from 'react'
import { Icon } from '@iconify/react'
import { ChurchController } from '@/application/controllers/church'
import { Button, ButtonColors } from '@/components/atoms/button'
import { Modal, ModalHandlers } from '@/components/molecules/modal'
import { useChurch } from '@/context/ChurchContext'
import { ChurchStorageDTO } from '@/domain/dtos/church/storage'

export const ChurchSelector = () => {
  const [churches, setChurches] = useState<ChurchStorageDTO[]>([])
  const [isPending, startTransition] = useTransition()
  const { selectedChurch, setSelectedChurch } = useChurch()

  const modalRef = useRef<ModalHandlers>(null)

  const openSelectChurchModal = () =>
    startTransition(async () => {
      const churches = (await ChurchController.listAll()).map((church) => ({
        id: church.id,
        name: church.name,
      }))
      setChurches(churches)
      modalRef.current?.openModal()
    })

  const selectChurch = async (church: ChurchStorageDTO) => {
    setSelectedChurch(church)
    modalRef.current?.closeModal()
  }

  return (
    <>
      <Modal ref={modalRef}>
        <div>
          {churches.map((church) => (
            <Button
              key={church.id}
              type="button"
              onClick={() => selectChurch(church)}
            >
              {church.name}
            </Button>
          ))}
        </div>
      </Modal>
      <Button
        type="button"
        color={ButtonColors.PRIMARY_OUTLINE}
        onClick={openSelectChurchModal}
        isPending={isPending}
      >
        {selectedChurch ? selectedChurch.name : 'Selecione uma igreja'}
        <Icon icon="tabler:arrows-exchange" width="24" height="24" />
      </Button>
    </>
  )
}
