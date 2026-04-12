import { Staff } from '../../../shared/domain/types';
import { Repository } from '../../../shared/domain/Repository';

export interface StaffRepository extends Repository<Staff> {
  getByCode(code: string): Promise<Staff | null>;
  getByEmail(email: string): Promise<Staff | null>;
  getAll(): Promise<Staff[]>;
  getCodesByDepartment(department: string): Promise<string[]>;
  getAccounts(): Promise<any[]>;
  updateAccountPassword(email: string, password: string): Promise<void>;
  deleteAccountByCode(staffCode: string): Promise<void>;
}
