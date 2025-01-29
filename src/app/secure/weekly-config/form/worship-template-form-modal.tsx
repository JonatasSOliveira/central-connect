'use client'

import { TextInput } from '@/components/atoms/text-input'
import { Form } from '@/components/molecules/form'
import { Modal, ModalHandlers } from '@/components/molecules/modal'
import RadioGroup from '@/components/molecules/radiou-group'
import { DayOfWeek, DayOfWeekLabels } from '@/domain/enums/day-of-week.enum'
import {
  WorshipServiceTemplateModel,
  WorshipServiceTemplateModelSchema,
} from '@/domain/models/worship-service-template'
import { zodResolver } from '@hookform/resolvers/zod'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { Control, useForm } from 'react-hook-form'

export const WorshipTemplateFormModal = forwardRef<ModalHandlers>((_, ref) => {
  const modalRef = useRef<ModalHandlers>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<WorshipServiceTemplateModel>({
    mode: 'onSubmit',
    resolver: zodResolver(WorshipServiceTemplateModelSchema),
    // defaultValues: initialValue,
  })

  const openModal = () => modalRef.current?.openModal()
  const closeModal = () => modalRef.current?.closeModal()

  useImperativeHandle(ref, () => ({
    openModal,
    closeModal,
  }))

  const formAction = handleSubmit(async (data) => {
    console.log('data: ', data)
  })

  console.log(errors)

  return (
    <Modal ref={modalRef}>
      <div className="flex flex-col">
        <Form onSubmit={formAction} onCancel={closeModal} isPending={false}>
          <TextInput
            label="Nome:"
            id="worshipServiceName"
            placeholder="NOME DO CULTO"
            {...register('name')}
          />
          <RadioGroup
            label="Dia da Semana:"
            control={control as unknown as Control}
            name="dayOfWeek"
            options={Object.values(DayOfWeek).map((day) => ({
              label: DayOfWeekLabels[day],
              value: day,
            }))}
          />
          <TextInput
            label="Horário de Início:"
            id="worshipStartTime"
            placeholder="20:00"
            type="time"
            {...register('startTime')}
          />
        </Form>
      </div>
    </Modal>
  )
})

WorshipTemplateFormModal.displayName = 'WorshipTemplateFormModal'
