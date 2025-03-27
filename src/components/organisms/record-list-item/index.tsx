'use client'

import { JSX, useRef, useState } from 'react'
import { ConfirmModal, ConfirmModalHandlers } from '../confirm-modal'
import { ButtonColors } from '@/components/atoms/button'
import { ListItem } from '@/components/molecules/list-item'
import { useRouter } from 'next/navigation'
import { KeyOf } from '@/types/KeyOf'

export interface RecordListItemProps<RecordType extends { id?: string }> {
  record: RecordType
  labelAttribute: KeyOf<RecordType>
  deleteRecord: (record: RecordType) => Promise<void>
  updateFormPagePath: string
}

export const RecordListItem = <RecordType extends { id?: string }>({
  record,
  labelAttribute,
  deleteRecord,
  updateFormPagePath,
}: RecordListItemProps<RecordType>): JSX.Element => {
  if (!labelAttribute) {
    throw new Error('labelAttribute is required')
  }

  const router = useRouter()
  const [changingScreen, setChangingScreen] = useState(false)
  const confirmModalRef = useRef<ConfirmModalHandlers>(null)

  const labelKeys = labelAttribute.split('.')
  let objectLabel: RecordType | unknown = record

  for (const key of labelKeys) {
    objectLabel = (objectLabel as Record<string, unknown>)[key]
  }

  const label = String(objectLabel)

  const openConfirmModal = () => confirmModalRef.current?.openModal()

  const onConfirmDeleteHandler = async () => {
    await deleteRecord(record)
    router.refresh()
  }

  const goToEditFormPage = () => {
    setChangingScreen(true)
    router.push(`${updateFormPagePath}/${record.id}`)
  }

  return (
    <>
      <ConfirmModal
        ref={confirmModalRef}
        title="Atenção!"
        message={`Realmente deseja excluir o registro ${label}?`}
        confirmButtonColor={ButtonColors.DANGER}
        onConfirm={onConfirmDeleteHandler}
      />
      <ListItem
        title={label}
        onDelete={openConfirmModal}
        onEdit={goToEditFormPage}
        editIsPending={changingScreen}
      />
    </>
  )
}
