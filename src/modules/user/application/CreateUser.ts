import { UserRepository, UserProfile } from '../domain/UserRepository';
import { UserRole, ADMIN_EMAILS } from '@/src/shared/domain/constants';

export interface CreateUserInput {
  name: string;
  email: string;
  role: string;
  password?: string;
}

export class CreateUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<void> {
    if (!input.name || !input.name.trim()) {
      throw new Error('Tên người dùng không được để trống');
    }
    if (!input.email || !input.email.trim()) {
      throw new Error('Email không được để trống');
    }

    let finalRole = input.role || UserRole.STAFF;
    if (input.email && ADMIN_EMAILS.includes(input.email)) {
      finalRole = UserRole.ADMIN;
    }

    const newUser: Partial<UserProfile> = {
      name: input.name.trim(),
      email: input.email.trim(),
      role: finalRole,
      ...(input.password ? { password: input.password } : {})
    };

    await this.userRepository.add(newUser);
  }
}
