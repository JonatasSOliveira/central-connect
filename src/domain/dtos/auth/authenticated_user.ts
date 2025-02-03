import { UserModelSchema } from '@/domain/models/user.model'
import { z } from 'zod'

export const AuthenticatedUserDTOSchema = UserModelSchema.pick({
  id: true,
}).extend({
  id: z.string(),
  email: z.string().email(),
})

export type AuthenticatedUserDTO = z.infer<typeof AuthenticatedUserDTOSchema>
