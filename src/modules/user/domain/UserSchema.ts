import { z } from 'zod';
import { zId, zString } from '@/src/shared/utils/zod';

export const UserProfileSchema = z.object({
  id: zId,
  name: zString,
  email: zString,
  role: zString,
  code: zString,
  phone: zString.optional(),
  join_date: zString.optional(),
  department: zString.optional(),
});

export type UserProfileDTO = z.infer<typeof UserProfileSchema>;
