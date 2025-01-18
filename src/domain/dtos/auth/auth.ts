import { z } from 'zod'

export const AuthDTOSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type AuthDTO = z.infer<typeof AuthDTOSchema>
