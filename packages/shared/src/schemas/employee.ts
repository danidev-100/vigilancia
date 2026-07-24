import { z } from 'zod';

export const createEmployeeSchema = z.object({
  propertyId: z.string().uuid(),
  fullName: z.string().min(2),
  nationalId: z.string().optional(),
  phone: z.string().min(1),
  position: z.string().min(1),
  company: z.string().min(1),
  vehiclePlate: z.string().optional(),
  workSchedule: z.string().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial().omit({ propertyId: true });

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
