import { UserRepository } from '../domain/UserRepository';

export class DeleteUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<void> {
    if (!id || !id.trim()) {
      throw new Error('ID người dùng không hợp lệ để xóa');
    }
    await this.userRepository.delete(id);
  }
}
