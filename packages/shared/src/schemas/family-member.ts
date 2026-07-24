import { z } from 'zod';

export const createFamilyMemberSchema = z.object({
  propertyId: z.string().uuid(),
  fullName: z.string().min(2),
  nationalId: z.string().optional(),
  phone: z.string().min(1),
  relationship: z.string().min(1),
});

export const updateFamilyMemberSchema = createFamilyMemberSchema.partial().omit({ propertyId: true });

export type CreateFamilyMemberInput = z.infer<typeof createFamilyMemberSchema>;
export type UpdateFamilyMemberInput = z.infer<typeof updateFamilyMemberSchema>;
