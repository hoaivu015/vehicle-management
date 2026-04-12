import { Staff } from '../../../shared/domain/types';
import { StaffRepository } from '../domain/StaffRepository';

export class AddStaff {
  constructor(private readonly repository: StaffRepository) {}

  async execute(staff: Omit<Staff, 'id'> & { password?: string }): Promise<Staff> {
    const { password, ...rest } = staff;
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

    const staffData = {
      ...rest,
      code: staff.code || generateStaffCode(staff.name),
      status: staff.status || 'ACTIVE',
      department: staff.department || 'Kinh doanh',
      base_salary: staff.base_salary || 0,
      commission_per_car: staff.commission_per_car || 0,
      target: staff.target || 0
    } as any;

    const createdStaff = await this.repository.create(staffData);

    // Use system default password if not provided
    const passwordToUse = password || 'auto28';
    
    if ((this.repository as any).registerUser) {
      await (this.repository as any).registerUser({
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

