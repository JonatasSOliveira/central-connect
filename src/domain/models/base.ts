import { z } from 'zod'

export const BaseModelSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().optional(),
})

export type BaseModel = z.infer<typeof BaseModelSchema>
