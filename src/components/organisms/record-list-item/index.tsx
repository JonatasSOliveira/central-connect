'use client'

import { JSX, useRef, useState } from 'react'
import { ConfirmModal, ConfirmModalHandlers } from '../confirm-modal'
import { ButtonColors } from '@/components/atoms/button'
import { ListItem } from '@/components/molecules/list-item'
import { useRouter } from 'next/navigation'

interface RecordListItemProps<RecordType extends { id?: string }> {
  record: RecordType
  labelAttribute: keyof RecordType
  deleteRecord: (record: RecordType) => Promise<void>
  updateFormPagePath: string
}

export const RecordListItem = <RecordType extends { id?: string }>({
  record,
  labelAttribute,
  deleteRecord,
  updateFormPagePath,
}: RecordListItemProps<RecordType>): JSX.Element => {
  const router = useRouter()
  const [changingScreen, setChangingScreen] = useState(false)
  const confirmModalRef = useRef<ConfirmModalHandlers>(null)
  const label = String(record[labelAttribute])

  const openConfirmModal = () => confirmModalRef.current?.openModal()

  const onConfirmDeleteHandler = async () => {
    await deleteRecord(record)
    window.location.reload()
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
