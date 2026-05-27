import { Staff } from '../../../shared/domain/types';
import { StaffRepository } from '../domain/StaffRepository';
import { AddStaffSchema, AddStaffInput } from '../domain/StaffValidation';

export class AddStaff {
  constructor(private readonly repository: StaffRepository) {}

  async execute(input: AddStaffInput): Promise<Staff> {
    // L6: Zod Boundary Validation
    const validatedData = AddStaffSchema.parse(input);
    
    const { password, ...rest } = validatedData;
    
    // Helper to remove diacritics for clean staff codes
    const removeDiacritics = (str: string) => {
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
    };

    const generateStaffCode = (name: string) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length === 0) return `NV-${Math.floor(Math.random() * 1000)}`;
      
      const cleanWords = words.map(w => removeDiacritics(w).toUpperCase());
      const lastWord = cleanWords[cleanWords.length - 1];
      const initials = cleanWords.slice(0, -1).map(w => w[0]).join('');
      
      return `NV-${initials}${lastWord}`;
    };

    const staffData: Omit<Staff, 'id'> = {
      ...rest,
      email: rest.email || '',
      code: validatedData.code || generateStaffCode(validatedData.name),
      status: validatedData.status || 'ACTIVE',
      department: validatedData.department || 'Kinh doanh',
      base_salary: validatedData.base_salary || 0,
      commission_per_car: validatedData.commission_per_car || 0,
      target: validatedData.target || 0,
      expenses: [],
      paid_months: []
    };

    const createdStaff = await this.repository.create(staffData);

    // Use system default password if not provided
    const passwordToUse = password || 'auto28';
    
    // L1: No more 'as any' casting
    if (this.repository.registerUser) {
      await this.repository.registerUser({
        name: createdStaff.name,
        email: createdStaff.email,
        password: passwordToUse,
        role: createdStaff.role,
        linkedfrom: createdStaff.code
      });
    }

    return createdStaff;
  }
}

