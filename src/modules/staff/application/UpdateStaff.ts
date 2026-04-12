import { Staff } from '../../../shared/domain/types';
import { StaffRepository } from '../domain/StaffRepository';

export class UpdateStaff {
  constructor(private readonly repository: StaffRepository) {}

  async execute(id: string, staff: Partial<Staff>): Promise<Staff> {
    return this.repository.update(id, staff);
  }
}
