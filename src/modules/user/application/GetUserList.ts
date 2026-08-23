import { UserRepository, UserProfile } from '../domain/UserRepository';

export class GetUserList {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<UserProfile[]> {
    return this.userRepository.getAll();
  }

  subscribe(callback: (users: UserProfile[]) => void): () => void {
    return this.userRepository.subscribe(callback);
  }
}
