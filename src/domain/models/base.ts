import { z } from 'zod'

export const BaseModelSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  deletedAt: z.string().optional(),
  createdByUserId: z.string().optional(),
  updatedByUserId: z.string().optional(),
  deletedByUserId: z.string().optional(),
})

export type BaseModel = z.infer<typeof BaseModelSchema>
