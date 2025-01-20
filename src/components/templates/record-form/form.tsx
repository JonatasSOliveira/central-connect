'use client'

import { Input } from '@/components/atoms/input'
import { Form } from '@/components/molecules/form'
import { PageDefinition } from '@/types/page-definition'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { JSX, useTransition } from 'react'
import { DefaultValues, Path, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ZodObject, ZodRawShape } from 'zod'

type InputDefinition<RecordType extends Record<string, unknown>> = {
  field: Path<RecordType>
  label?: string
  placeholder?: string
}

export interface FormProps<RecordType extends Record<string, unknown>> {
  schema: ZodObject<ZodRawShape>
  onSubmit: (data: RecordType) => Promise<unknown>
  sucessMessage?: string
  sucessPageDefinition: PageDefinition
  inputsDefinition?: InputDefinition<RecordType>[]
  initialValue?: RecordType
}

export const RecordFormTemplateForm = <
  RecordType extends Record<string, unknown>,
>({
  schema,
  onSubmit,
  sucessMessage,
  sucessPageDefinition,
  inputsDefinition,
  initialValue,
}: FormProps<RecordType>): JSX.Element => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecordType>({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
    defaultValues: initialValue as DefaultValues<RecordType> | undefined,
  })

  const fields = Object.keys(schema.shape) as Path<RecordType>[]

  const formAction: () => void = handleSubmit(async (data) =>
    startTransition(async () => {
      try {
        await onSubmit(data)
        if (sucessMessage) toast.success(sucessMessage)
        router.push(sucessPageDefinition.path)
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
    <Form isPending={isPending} onSubmit={formAction}>
      {fields.map((field, index) => {
        const inputDefinition = inputsDefinition?.find(
          (inputDef) => inputDef.field === field,
        )

        return (
          <Input
            key={index}
            id={`${field}-${index}`}
            label={inputDefinition?.label}
            placeholder={inputDefinition?.placeholder}
            error={errors[field]?.message as string | undefined}
            autoFocus={index === 0}
            {...register(field)}
          />
        )
      })}
    </Form>
  )
}
