import { UserModelSchema } from '@/domain/models/user.model'
import { z } from 'zod'

export const UserListDTOSchema = UserModelSchema.extend({
  id: z.string(),
})

export type UserListDTO = z.infer<typeof UserListDTOSchema>
