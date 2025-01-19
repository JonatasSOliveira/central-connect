'use client'

import { JSX, useRef } from 'react'
import { ConfirmModal, ConfirmModalHandlers } from '../confirm-modal'
import { Button, ButtonColors } from '@/components/atoms/button'

interface RecordListItemProps<RecordType extends { id: string }> {
  record: RecordType
  labelAttribute: keyof RecordType
  deleteRecord: (record: RecordType) => Promise<void>
}

export const RecordListItem = <RecordType extends { id: string }>({
  record,
  labelAttribute,
  deleteRecord,
}: RecordListItemProps<RecordType>): JSX.Element => {
  const confirmModalRef = useRef<ConfirmModalHandlers>(null)
  const label = String(record[labelAttribute])

  const openConfirmModal = () => confirmModalRef.current?.openModal()

  const onConfirmDeleteHandler = async () => {
    await deleteRecord(record)
    window.location.reload()
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
      <div className="flex flex-col shadow-md p-4 rounded">
        <div className="mb-2">
          <p>{label}</p>
        </div>
        <div className="flex justify-around">
          <Button
            type="button"
            color={ButtonColors.DANGER}
            onClick={openConfirmModal}
          >
            Excluir
          </Button>
        </div>
      </div>
    </>
  )
}
