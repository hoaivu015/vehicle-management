import { StaffRepository } from '../domain/StaffRepository';

export class DeleteStaff {
  constructor(private readonly repository: StaffRepository) {}

  async execute(id: string): Promise<void> {
    // Step 1: Get staff code before deletion
    const staff = await this.repository.getById(id);
    if (staff && staff.code) {
      // Step 2: Delete linked account in users table
      await this.repository.deleteAccountByCode(staff.code);
    }
    // Step 3: Delete actual employee
    return this.repository.delete(id);
  }
}
