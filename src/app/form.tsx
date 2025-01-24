'use client'

import { AuthDTO, AuthDTOSchema } from '@/domain/dtos/auth/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { TextInput } from '@/components/atoms/text-input'
import { Form } from '@/components/molecules/form'
import { AuthController } from '@/application/controllers/auth'
import { churchPageDefinition } from './secure/church/page-definition'

export const SignInForm = () => {
  const router = useRouter()
  const [isAuthenticating, startAuth] = useTransition()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthDTO>({
    mode: 'onSubmit',
    resolver: zodResolver(AuthDTOSchema),
  })

  const formAction: () => void = handleSubmit(async (data) =>
    startAuth(async () => {
      try {
        await AuthController.signIn(data)
        toast.success('Usuário autenticado com sucesso')
        router.push(churchPageDefinition.path)
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
    <Form
      onSubmit={formAction}
      isPending={isAuthenticating}
      confirmButtonText="Entrar"
    >
      <div className="flex flex-col gap-2">
        <TextInput
          id="email"
          label="E-mail"
          placeholder="email@domain.com"
          error={errors.email?.message}
          autoFocus
          {...register('email')}
        />
        <TextInput
          id="password"
          label="Senha"
          placeholder="senha"
          error={errors.password?.message}
          type="password"
          {...register('password')}
        />
      </div>
    </Form>
  )
}
