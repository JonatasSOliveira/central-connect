'use client'

import { WeeklyConfigController } from '@/application/controllers/weekly-config'
import { Button } from '@/components/atoms/button'
import { TextInput } from '@/components/atoms/text-input'
import { Form } from '@/components/molecules/form'
import { ModalHandlers } from '@/components/molecules/modal'
import {
  WeeklyConfigFormDTO,
  WeeklyConfigFormDTOSchema,
} from '@/domain/dtos/weekly-config/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useRef, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { WorshipTemplateFormModal } from './worship-template-form-modal'

export const WeeklyConfigForm = () => {
  const router = useRouter()
  const worhipTemplateFormModalRef = useRef<ModalHandlers>(null)

  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WeeklyConfigFormDTO>({
    mode: 'onSubmit',
    resolver: zodResolver(WeeklyConfigFormDTOSchema),
    // defaultValues: initialValue,
  })

  const goBack = () => router.back()

  const openWorhipTemplateFormModal = () =>
    worhipTemplateFormModalRef.current?.openModal()

  const formAction: () => void = handleSubmit(async (data) =>
    startTransition(async () => {
      try {
        await WeeklyConfigController.create(data)
        toast.success('Configuração salva com sucesso')
        // router.push(sucessPageDefinition.path)
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message)
          return
        }
        toast.error('Houve um erro, por favor contate o suporte')
      }
    }),
  )

  return (
    <>
      <WorshipTemplateFormModal ref={worhipTemplateFormModalRef} />
      <Form isPending={isPending} onSubmit={formAction} onCancel={goBack}>
        <TextInput
          id="name"
          label="Nome"
          placeholder="CONFIGURAÇÃO XYZ"
          error={errors.name?.message as string | undefined}
          autoFocus
          {...register('name')}
        />
        <Button type="button" onClick={openWorhipTemplateFormModal}>
          Novo culto
        </Button>
      </Form>
    </>
  )
}
