import { z } from 'zod';
import { EntryMethod, PersonType } from '../enums';

export const registerEntrySchema = z.object({
  personType: z.nativeEnum(PersonType),
  personId: z.string().uuid(),
  propertyId: z.string().uuid().optional(),
  gate: z.string().min(1, 'Gate is required'),
  entryMethod: z.nativeEnum(EntryMethod).default(EntryMethod.MANUAL),
  notes: z.string().optional(),
});

export const registerExitSchema = z.object({
  entryId: z.string().uuid(),
  gate: z.string().min(1, 'Gate is required'),
});

export type RegisterEntryInput = z.infer<typeof registerEntrySchema>;
export type RegisterExitInput = z.infer<typeof registerExitSchema>;
