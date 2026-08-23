import { StaffRepository } from '@/src/modules/staff/domain/StaffRepository';
import { Staff } from '@/src/shared/domain/types';

export class LoginIdentifierResolver {
  constructor(private readonly staffRepo: StaffRepository) {}

  async resolve(identifier: string): Promise<{ email: string; staff?: Staff | null }> {
    const raw = identifier.trim();
    if (raw.includes('@')) {
      const cleanEmail = raw.toLowerCase();
      const staff = await this.staffRepo.getByEmail(cleanEmail).catch(() => null);
      return { email: cleanEmail, staff };
    }

    const staffByCode = await this.staffRepo.getByCode(raw.toUpperCase()).catch(() => null);
    if (staffByCode?.email) {
      return { email: staffByCode.email.toLowerCase(), staff: staffByCode };
    }

    const guessedEmail = `${raw.toLowerCase()}@auto28.vn`;
    const staffByGuessed = await this.staffRepo.getByEmail(guessedEmail).catch(() => null);
    return { email: guessedEmail, staff: staffByGuessed };
  }
}
