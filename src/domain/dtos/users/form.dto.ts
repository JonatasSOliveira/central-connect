import { UserModelSchema } from '@/domain/models/user.model'
import { z } from 'zod'

export const UserFormDTOSchema = UserModelSchema.pick({
  person: true,
  userRole: true,
})

export type UserFormDTO = z.infer<typeof UserFormDTOSchema>
