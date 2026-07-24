import { z } from 'zod';

export const createContractorSchema = z.object({
  propertyId: z.string().uuid(),
  company: z.string().min(1),
  employeeName: z.string().min(2),
  nationalId: z.string().optional(),
  phone: z.string().optional(),
  vehiclePlate: z.string().optional(),
  vehicleBrand: z.string().optional(),
  vehicleModel: z.string().optional(),
  serviceType: z.string().min(1),
  workOrder: z.string().optional(),
  authorizedUntil: z.string().datetime(),
});

export const updateContractorSchema = createContractorSchema.partial().omit({ propertyId: true });

export type CreateContractorInput = z.infer<typeof createContractorSchema>;
export type UpdateContractorInput = z.infer<typeof updateContractorSchema>;
