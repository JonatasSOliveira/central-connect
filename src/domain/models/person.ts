import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base'
import { ChurchRoleModelSchema } from '@/domain/models/church-role'

export const PersonModelSchema = BaseModelSchema.extend({
  name: z.string().min(1),
  phoneNumber: z.string().length(11),
  churchRole: ChurchRoleModelSchema,
})

export type PersonModel = z.infer<typeof PersonModelSchema>
