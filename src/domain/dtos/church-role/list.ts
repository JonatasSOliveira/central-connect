import { ChurchRoleModelSchema } from '@/domain/models/church-role.model'
import { z } from 'zod'

export const ChurchRoleListDtoSchema = ChurchRoleModelSchema.extend({
  id: z.string(),
})

export type ChurchRoleListDto = z.infer<typeof ChurchRoleListDtoSchema>
