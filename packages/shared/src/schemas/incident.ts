import { z } from 'zod';
import { IncidentType } from '../enums';

export const createIncidentSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  incidentType: z.nativeEnum(IncidentType).default(IncidentType.OTHER),
  photos: z.array(z.string()).optional(),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
