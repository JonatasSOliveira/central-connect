import { z } from 'zod'

export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
  message: 'O horário deve estar no formato HH:MM',
})
