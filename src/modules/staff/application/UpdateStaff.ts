import { Staff } from '../../../shared/domain/types';
import { StaffRepository } from '../domain/StaffRepository';
import { UpdateStaffSchema, UpdateStaffInput } from '../domain/StaffValidation';

export class UpdateStaff {
  constructor(private readonly repository: StaffRepository) {}

  async execute(input: UpdateStaffInput): Promise<Staff> {
    const validatedData = UpdateStaffSchema.parse(input);
    const { id, ...data } = validatedData;
    return this.repository.update(id, data);
  }
}
