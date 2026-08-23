import { UserRepository, UserProfile } from '../domain/UserRepository';
import { UserRole, ADMIN_EMAILS } from '@/src/shared/domain/constants';

export interface UpdateUserInput {
  id: string;
  email?: string | null;
  role?: string | null;
  password?: string | null;
  name?: string | null;
}

export class UpdateUserRole {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: UpdateUserInput): Promise<void> {
    if (!input.id) {
      throw new Error('ID người dùng không hợp lệ');
    }

    const updates: Partial<UserProfile> = {};

    if (input.name !== undefined && input.name !== null) updates.name = input.name.trim();
    if (input.password) updates.password = input.password;

    if (input.role) {
      let finalRole = input.role;
      if (input.email && ADMIN_EMAILS.includes(input.email)) {
        finalRole = UserRole.ADMIN;
      }
      updates.role = finalRole;
    }

    await this.userRepository.update(input.id, updates);
  }
}
