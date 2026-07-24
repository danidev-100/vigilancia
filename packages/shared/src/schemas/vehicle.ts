import { z } from 'zod';

export const createVehicleSchema = z.object({
  plate: z.string().min(1, 'License plate is required'),
  brand: z.string().min(1),
  model: z.string().min(1),
  color: z.string().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
