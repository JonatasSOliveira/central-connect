import { ChurchRoleModelSchema } from '@/domain/models/church-role'
import { z } from 'zod'

export const ChurchRoleListDtoSchema = ChurchRoleModelSchema

export type ChurchRoleListDto = z.infer<typeof ChurchRoleListDtoSchema>
