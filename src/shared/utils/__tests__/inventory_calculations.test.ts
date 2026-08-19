import { describe, it, expect } from 'vitest';
import { 
  diffCalendarDays, 
  calculateAgingDays, 
  calculateActiveSellingDays, 
  getInventoryAgingTier, 
  isVehicleAging 
} from '../vehicle_calculations';
import { VehicleStatus } from '../../domain/constants';
import { VehicleEntity } from '@/src/modules/inventory/domain/VehicleEntity';

describe('Multi-Tier Inventory Aging Calculations (Auto 28 SSoT)', () => {
  describe('diffCalendarDays', () => {
    it('returns 0 for same calendar day', () => {
      expect(diffCalendarDays('2026-08-01', '2026-08-01')).toBe(0);
    });

    it('returns exact day difference across midnight regardless of time of day', () => {
      expect(diffCalendarDays('2026-08-01T23:59:59', '2026-08-02T00:01:00')).toBe(1);
      expect(diffCalendarDays('2026-08-01', '2026-08-11')).toBe(10);
    });

    it('handles month and year rollover correctly', () => {
      expect(diffCalendarDays('2026-07-30', '2026-08-02')).toBe(3);
      expect(diffCalendarDays('2025-12-30', '2026-01-02')).toBe(3);
    });

    it('returns 0 for invalid, null or future start dates', () => {
      expect(diffCalendarDays(null, '2026-08-01')).toBe(0);
      expect(diffCalendarDays(undefined, '2026-08-01')).toBe(0);
      expect(diffCalendarDays('invalid-date', '2026-08-01')).toBe(0);
      expect(diffCalendarDays('2026-08-10', '2026-08-01')).toBe(0);
    });
  });

  describe('calculateAgingDays (Financial Holding Days)', () => {
    it('calculates total days from purchase_date to sale_date', () => {
      const days = calculateAgingDays('2026-05-01', '2026-05-21');
      expect(days).toBe(20);
    });

    it('calculates days from purchase_date to today when not sold', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 15);
      const pastDateStr = pastDate.toISOString().split('T')[0];
      
      const days = calculateAgingDays(pastDateStr, null);
      expect(days).toBe(15);
    });
  });

  describe('calculateActiveSellingDays (Operational Active Days)', () => {
    it('returns 0 days for vehicles in SPA or DEPOSIT_BUY (Pre-stock stage)', () => {
      expect(calculateActiveSellingDays({
        status: VehicleStatus.DEPOSIT_BUY,
        purchase_date: '2026-08-01',
      })).toBe(0);

      expect(calculateActiveSellingDays({
        status: VehicleStatus.SPA,
        purchase_date: '2026-08-01',
      })).toBe(0);
    });

    it('calculates active days from the date vehicle first entered IN_STOCK', () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      const tenDaysAgoStr = tenDaysAgo.toISOString().split('T')[0];

      const twentyDaysAgo = new Date();
      twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
      const twentyDaysAgoStr = twentyDaysAgo.toISOString().split('T')[0];

      const vehicle = {
        status: VehicleStatus.IN_STOCK,
        purchase_date: twentyDaysAgoStr,
        history: [
          { date: twentyDaysAgoStr, status: VehicleStatus.SPA },
          { date: tenDaysAgoStr, status: VehicleStatus.IN_STOCK },
        ]
      };

      // Purchase was 20 days ago, but IN_STOCK started 10 days ago -> 10 active selling days
      expect(calculateActiveSellingDays(vehicle)).toBe(10);
    });

    it('pauses counting when vehicle is reserved with deposit (DEPOSIT_SALE / BANK_DEPOSIT)', () => {
      const vehicle = {
        status: VehicleStatus.DEPOSIT_SALE,
        purchase_date: '2026-08-01',
        history: [
          { date: '2026-08-01', status: VehicleStatus.IN_STOCK },
          { date: '2026-08-08', status: VehicleStatus.DEPOSIT_SALE },
        ]
      };

      // Was in stock for 7 days (Aug 1 to Aug 8) before deposit was taken
      expect(calculateActiveSellingDays(vehicle)).toBe(7);
    });

    it('correctly handles CancelSale and resumes active counting excluding locked deposit days', () => {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      const fiveDaysAgoStr = fiveDaysAgo.toISOString().split('T')[0];

      const vehicle = {
        status: VehicleStatus.IN_STOCK,
        purchase_date: '2026-08-01',
        history: [
          { date: '2026-08-01', status: VehicleStatus.IN_STOCK },
          { date: '2026-08-08', status: VehicleStatus.DEPOSIT_SALE }, // 7 days active
          { date: fiveDaysAgoStr, status: VehicleStatus.IN_STOCK }, // CancelSale 5 days ago
        ]
      };

      // 7 active days in first cycle + 5 active days in second cycle = 12 total active days
      expect(calculateActiveSellingDays(vehicle)).toBe(12);
    });

    it('calculates active days up to sale_date for SOLD vehicles', () => {
      const vehicle = {
        status: VehicleStatus.SOLD,
        purchase_date: '2026-07-01',
        sale_date: '2026-07-16',
        history: [
          { date: '2026-07-01', status: VehicleStatus.SPA },
          { date: '2026-07-05', status: VehicleStatus.IN_STOCK },
          { date: '2026-07-16', status: VehicleStatus.SOLD },
        ]
      };

      // IN_STOCK from July 5 to July 16 = 11 days
      expect(calculateActiveSellingDays(vehicle)).toBe(11);
    });
  });

  describe('getInventoryAgingTier (4 Tiers)', () => {
    it('categorizes 0-14 days as Tier 1 (Fast Turnaround)', () => {
      const tier0 = getInventoryAgingTier(0);
      expect(tier0.tier).toBe(1);
      expect(tier0.label).toBe('Vòng quay nhanh');
      expect(tier0.badgeClass).toBe('glass-badge-emerald');
      expect(tier0.isAging).toBe(false);

      const tier14 = getInventoryAgingTier(14);
      expect(tier14.tier).toBe(1);
    });

    it('categorizes 15-24 days as Tier 2 (Standard)', () => {
      const tier15 = getInventoryAgingTier(15);
      expect(tier15.tier).toBe(2);
      expect(tier15.label).toBe('Tiêu chuẩn');
      expect(tier15.isAging).toBe(false);

      const tier24 = getInventoryAgingTier(24);
      expect(tier24.tier).toBe(2);
    });

    it('categorizes 25-34 days as Tier 3 (Aging Warning - Threshold 25d)', () => {
      const tier25 = getInventoryAgingTier(25);
      expect(tier25.tier).toBe(3);
      expect(tier25.label).toBe('Tồn lâu (≥25d)');
      expect(tier25.badgeClass).toBe('glass-badge-orange');
      expect(tier25.isAging).toBe(true);

      const tier34 = getInventoryAgingTier(34);
      expect(tier34.tier).toBe(3);
      expect(tier34.isAging).toBe(true);
    });

    it('categorizes >= 35 days as Tier 4 (Capital Tie-Up Alert)', () => {
      const tier35 = getInventoryAgingTier(35);
      expect(tier35.tier).toBe(4);
      expect(tier35.label).toBe('Đọng vốn (≥35d)');
      expect(tier35.badgeClass).toBe('glass-badge-red');
      expect(tier35.isAging).toBe(true);

      const tier60 = getInventoryAgingTier(60);
      expect(tier60.tier).toBe(4);
      expect(tier60.isAging).toBe(true);
    });
  });

  describe('isVehicleAging helper', () => {
    it('works with number threshold', () => {
      expect(isVehicleAging(24, 25)).toBe(false);
      expect(isVehicleAging(25, 25)).toBe(true);
      expect(isVehicleAging(30, 25)).toBe(true);
    });

    it('works with Vehicle object using active selling days', () => {
      const vehicleFresh = {
        status: VehicleStatus.SPA,
        purchase_date: '2026-01-01',
      };
      expect(isVehicleAging(vehicleFresh, 25)).toBe(false); // In SPA -> 0 active days -> not aging
    });

    it('returns false for null/undefined', () => {
      expect(isVehicleAging(null)).toBe(false);
      expect(isVehicleAging(undefined)).toBe(false);
    });
  });

  describe('VehicleEntity integration', () => {
    it('exposes holdingDays, activeDays, agingDays and toRaw mapping correctly', () => {
      const rawData = {
        id: 101,
        code: 'CAR-101',
        name: 'Mazda CX-5 Premium',
        status: VehicleStatus.IN_STOCK,
        purchase_price: 800000000,
        purchase_date: '2026-08-01',
        history: [
          { date: '2026-08-01', status: VehicleStatus.SPA, user: 'admin', note: 'Dọn xe' },
          { date: '2026-08-05', status: VehicleStatus.IN_STOCK, user: 'admin', note: 'Vào kho' },
        ],
        is_pinned: false,
        is_coinvested: false,
        total_cost: 10000000,
        sale_price: 850000000,
      };

      const entity = new VehicleEntity(rawData);
      expect(entity.holdingDays).toBeGreaterThanOrEqual(0);
      expect(entity.activeDays).toBeGreaterThanOrEqual(0);
      expect(entity.agingDays).toBe(entity.activeDays);

      const raw = entity.toRaw();
      expect(raw.days).toBe(entity.activeDays);
      expect(raw.holding_days).toBe(entity.holdingDays);
    });
  });
});
