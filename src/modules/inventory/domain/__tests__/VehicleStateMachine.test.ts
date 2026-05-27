import { describe, it, expect } from 'vitest';
import { VehicleStateMachine } from '../VehicleStateMachine';
import { VehicleStatus } from '../../../../shared/domain/constants';

describe('VehicleStateMachine', () => {
  describe('canTransition', () => {
    it('should allow transition from DEPOSIT_BUY to SPA', () => {
      expect(VehicleStateMachine.canTransition(VehicleStatus.DEPOSIT_BUY, VehicleStatus.SPA)).toBe(true);
    });

    it('should allow transition from IN_STOCK to SOLD', () => {
      expect(VehicleStateMachine.canTransition(VehicleStatus.IN_STOCK, VehicleStatus.SOLD)).toBe(true);
    });

    it('should NOT allow transition from DEPOSIT_BUY to SOLD directly', () => {
      expect(VehicleStateMachine.canTransition(VehicleStatus.DEPOSIT_BUY, VehicleStatus.SOLD)).toBe(false);
    });

    it('should allow transition to the same status', () => {
      expect(VehicleStateMachine.canTransition(VehicleStatus.IN_STOCK, VehicleStatus.IN_STOCK)).toBe(true);
    });

    it('should allow transition from SOLD back to IN_STOCK (cancellation)', () => {
      expect(VehicleStateMachine.canTransition(VehicleStatus.SOLD, VehicleStatus.IN_STOCK)).toBe(true);
    });
  });

  describe('getFieldsToReset', () => {
    it('should return reset fields when transitioning back to IN_STOCK', () => {
      const resetFields = VehicleStateMachine.getFieldsToReset(VehicleStatus.IN_STOCK);
      expect(resetFields).toHaveProperty('sale_date', undefined);
      expect(resetFields).toHaveProperty('received_amount', 0);
    });

    it('should return empty object when transitioning to SOLD', () => {
      const resetFields = VehicleStateMachine.getFieldsToReset(VehicleStatus.SOLD);
      expect(resetFields).toEqual({});
    });
  });
});
