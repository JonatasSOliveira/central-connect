import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base'

export const PersonModelSchema = BaseModelSchema.extend({
  name: z.string().min(1),
  phoneNumber: z.string().length(11),
  churchRoleId: z.string(),
  churchId: z.string(),
})

export type PersonModel = z.infer<typeof PersonModelSchema>
