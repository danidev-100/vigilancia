import { z } from 'zod';

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  type: z.enum(['visitor', 'employee', 'contractor', 'resident', 'all']).default('all'),
  propertyId: z.string().uuid().optional(),
});

export type SearchInput = z.infer<typeof searchSchema>;
