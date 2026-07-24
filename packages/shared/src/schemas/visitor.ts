import { z } from 'zod';
import { VisitorType } from '../enums';

export const createVisitorSchema = z.object({
  propertyId: z.string().uuid(),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  document: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  vehiclePlate: z.string().optional(),
  vehicleBrand: z.string().optional(),
  vehicleModel: z.string().optional(),
  notes: z.string().optional(),
  visitorType: z.nativeEnum(VisitorType).default(VisitorType.ONE_TIME),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
});

export const updateVisitorSchema = createVisitorSchema.partial().omit({ propertyId: true });

export type CreateVisitorInput = z.infer<typeof createVisitorSchema>;
export type UpdateVisitorInput = z.infer<typeof updateVisitorSchema>;
