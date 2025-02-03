import { UserModelSchema } from '@/domain/models/user.model'
import { z } from 'zod'

export const SignUpRequestDTOSchema = UserModelSchema.pick({
  person: true,
})
  .extend({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type SignUpRequestDTO = z.infer<typeof SignUpRequestDTOSchema>
