import { UserModelSchema } from '@/domain/models/user.model'
import { z } from 'zod'

export const UserFormDTOSchema = UserModelSchema.pick({
  person: true,
  userRoleId: true,
  email: true,
})
  .extend({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type UserFormDTO = z.infer<typeof UserFormDTOSchema>
