'use client'

import { WeeklyConfigController } from '@/application/controllers/weekly-config'
import { Button } from '@/components/atoms/button'
import { TextInput } from '@/components/atoms/text-input'
import { Form } from '@/components/molecules/form'
import {
  WeeklyConfigFormDTO,
  WeeklyConfigFormDTOSchema,
} from '@/domain/dtos/weekly-config/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React, { useRef, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  OpenModalOptions,
  WorshipTemplateFormModal,
  WorshipTemplateFormModalHandlers,
} from './worship-template-form-modal'
import { WorshipServiceTemplateModel } from '@/domain/models/worship-service-template'
import { ListItem } from '@/components/molecules/list-item'
import { DayOfWeekLabels } from '@/domain/enums/day-of-week.enum'
import { ErrorSpan } from '@/components/atoms/error-span'
import { weeklyConfigPageDefinition } from '../page-definition'

interface WeeklyConfigFormProps {
  weeklyConfig?: WeeklyConfigFormDTO
}

export const WeeklyConfigForm: React.FC<WeeklyConfigFormProps> = ({
  weeklyConfig,
}) => {
  const router = useRouter()
  const worhipTemplateFormModalRef =
    useRef<WorshipTemplateFormModalHandlers>(null)

  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<WeeklyConfigFormDTO>({
    mode: 'onSubmit',
    defaultValues: weeklyConfig,
    resolver: zodResolver(WeeklyConfigFormDTOSchema),
  })

  const goBack = () => router.back()

  const openWorhipTemplateFormModal = (options?: OpenModalOptions) =>
    worhipTemplateFormModalRef.current?.openModal(options)

  const formAction: () => void = handleSubmit(
    async (data) =>
      startTransition(async () => {
        try {
          if (weeklyConfig?.id) {
            await WeeklyConfigController.update(weeklyConfig.id, data)
          } else {
            await WeeklyConfigController.create(data)
          }
          toast.success('Configuração salva com sucesso')
          router.push(weeklyConfigPageDefinition.path)
        } catch (error) {
          if (error instanceof Error) {
            toast.error(error.message)
            return
          }
          toast.error('Houve um erro, por favor contate o suporte')
        }
      }),
    (errors) => {
      console.log(errors)
      toast.error('Existem erros no Formulário')
    },
  )

  const updateWorshipTemplateList = (
    data: WorshipServiceTemplateModel,
    index?: number,
  ) => {
    const worshipServiceTemplates = getValues('worshipServiceTemplates') ?? []
    if (index !== undefined) {
      worshipServiceTemplates[index] = data
    } else {
      worshipServiceTemplates?.push(data)
    }

    setValue('worshipServiceTemplates', worshipServiceTemplates, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const deleteWorshipTemplate = (index: number) => {
    const worshipServiceTemplates = getValues('worshipServiceTemplates')
    worshipServiceTemplates?.splice(index, 1)
    setValue('worshipServiceTemplates', worshipServiceTemplates, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  return (
    <>
      <WorshipTemplateFormModal
        ref={worhipTemplateFormModalRef}
        onConfirm={updateWorshipTemplateList}
      />
      <Form isPending={isPending} onSubmit={formAction} onCancel={goBack}>
        <TextInput
          id="name"
          label="Nome"
          placeholder="CONFIGURAÇÃO XYZ"
          error={errors.name?.message as string | undefined}
          autoFocus
          {...register('name')}
        />
        <div className="flex flex-col">
          <p className="font-bold">Cultos</p>
          <ErrorSpan error={errors.worshipServiceTemplates?.message} />
          <Button type="button" onClick={() => openWorhipTemplateFormModal()}>
            Novo culto
          </Button>
          <div className="overflow-auto flex-1 max-h-[45dvh]">
            {getValues('worshipServiceTemplates')?.map(
              (worshipService, index) => (
                <ListItem
                  key={index}
                  title={worshipService.name}
                  description={`${DayOfWeekLabels[worshipService.dayOfWeek]} - ${worshipService.startTime}`}
                  onDelete={() => deleteWorshipTemplate(index)}
                  onEdit={() =>
                    openWorhipTemplateFormModal({ data: worshipService, index })
                  }
                />
              ),
            )}
          </div>
        </div>
      </Form>
    </>
  )
}
