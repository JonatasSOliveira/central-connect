import { z } from "zod";
import {
  isValidServiceDate,
  parseServiceDate,
} from "@/modules/services/domain/value-objects/ServiceDate";

export const serviceDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido (AAAA-MM-DD)")
  .refine(isValidServiceDate, "Data inválida")
  .transform((value) => parseServiceDate(value) as Date);
