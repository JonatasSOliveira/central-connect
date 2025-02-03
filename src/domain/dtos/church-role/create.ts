import { ChurchRoleModelSchema } from '@/domain/models/church-role.model'
import { z } from 'zod'

export const ChurchRoleCreateDTOSchema = ChurchRoleModelSchema.pick({
  name: true,
})

export type ChurchRoleCreateDTO = z.infer<typeof ChurchRoleCreateDTOSchema>
