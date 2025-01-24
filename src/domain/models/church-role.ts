import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base'

export const ChurchRoleModelSchema = BaseModelSchema.extend({
  name: z.string().min(1),
  churchId: z.string(),
})

export type ChurchRoleModel = z.infer<typeof ChurchRoleModelSchema>
