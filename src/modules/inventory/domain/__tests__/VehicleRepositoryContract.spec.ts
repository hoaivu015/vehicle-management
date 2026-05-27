import { describe, test, expect } from 'vitest';
import { VehicleRepository } from '../VehicleRepository';

export function runVehicleRepositoryContractTests(
  createRepository: () => Promise<VehicleRepository>
) {
  describe('VehicleRepository Contract Compliance', () => {
    test('phải tuân thủ đầy đủ các phương thức nghiệp vụ của VehicleRepository', async () => {
      const repo = await createRepository();
      
      expect(repo.getAll).toBeDefined();
      expect(repo.getByCode).toBeDefined();
      expect(repo.getAvailableVehicles).toBeDefined();
      expect(repo.updateStatus).toBeDefined();
      expect(repo.addPurchasePayment).toBeDefined();
      expect(repo.addSalePayment).toBeDefined();
      expect(repo.cancelSale).toBeDefined();
    });
  });
}
