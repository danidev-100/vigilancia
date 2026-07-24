import { z } from 'zod';

export const createPropertySchema = z.object({
  houseNumber: z.string().min(1, 'House number is required'),
  block: z.string().min(1, 'Block is required'),
  street: z.string().min(1, 'Street is required'),
  neighborhood: z.string().min(1, 'Neighborhood is required'),
});

export const updatePropertySchema = createPropertySchema.partial();

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
