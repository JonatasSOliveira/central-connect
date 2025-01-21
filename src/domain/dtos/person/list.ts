import { ResourcePermissionModelSchema } from '@/domain/models/resource-permission'
import { z } from 'zod'

export const PersonListDtoSchema = ResourcePermissionModelSchema

export type PersonListDto = z.infer<typeof PersonListDtoSchema>
