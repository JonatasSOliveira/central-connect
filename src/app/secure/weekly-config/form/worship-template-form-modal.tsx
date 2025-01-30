'use client'

import { ComboBox } from '@/components/atoms/combo-box'
import { TextInput } from '@/components/atoms/text-input'
import { Form } from '@/components/molecules/form'
import { Modal, ModalHandlers } from '@/components/molecules/modal'
import { DayOfWeek, DayOfWeekLabels } from '@/domain/enums/day-of-week.enum'
import {
  WorshipServiceTemplateModel,
  WorshipServiceTemplateModelSchema,
} from '@/domain/models/worship-service-template'
import { zodResolver } from '@hookform/resolvers/zod'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Control, useForm } from 'react-hook-form'

interface WorshipTemplateFormModalProps {
  onConfirm: (data: WorshipServiceTemplateModel, index?: number) => void
}

export interface OpenModalOptions {
  data: WorshipServiceTemplateModel
  index: number
}

export interface WorshipTemplateFormModalHandlers
  extends Omit<ModalHandlers, 'openModal'> {
  openModal: (data?: OpenModalOptions) => void
}

export const WorshipTemplateFormModal = forwardRef<
  WorshipTemplateFormModalHandlers,
  WorshipTemplateFormModalProps
>(({ onConfirm }, ref) => {
  const modalRef = useRef<ModalHandlers>(null)
  const [dataIndex, setDataIndex] = useState<number | undefined>(undefined)
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<WorshipServiceTemplateModel>({
    mode: 'onSubmit',
    resolver: zodResolver(WorshipServiceTemplateModelSchema),
  })

  const openModal = (options?: OpenModalOptions) => {
    reset(
      options?.data || {
        name: undefined,
        dayOfWeek: undefined,
        startTime: undefined,
      },
    )
    setDataIndex(options?.index)
    modalRef.current?.openModal()
  }
  const closeModal = () => modalRef.current?.closeModal()

  useImperativeHandle(ref, () => ({
    openModal,
    closeModal,
  }))

  const formAction = handleSubmit((data) => {
    onConfirm(data, dataIndex)
    closeModal()
  })

  return (
    <Modal ref={modalRef}>
      <div className="flex flex-col">
        <Form onSubmit={formAction} onCancel={closeModal} isPending={false}>
          <TextInput
            label="Nome:"
            id="worshipServiceName"
            placeholder="NOME DO CULTO"
            {...register('name')}
            error={errors.name?.message}
          />
          <ComboBox
            label="Dia da Semana:"
            control={control as unknown as Control}
            name="dayOfWeek"
            id="worshipDayOfWeek"
            error={errors.dayOfWeek?.message}
            options={Object.values(DayOfWeek).map((day) => ({
              label: DayOfWeekLabels[day],
              value: day,
              id: day,
            }))}
          />
          <TextInput
            label="Horário de Início:"
            id="worshipStartTime"
            placeholder="20:00"
            type="time"
            error={errors.startTime?.message}
            {...register('startTime')}
          />
        </Form>
      </div>
    </Modal>
  )
})

WorshipTemplateFormModal.displayName = 'WorshipTemplateFormModal'
