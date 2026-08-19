import { describe, it, expect } from 'vitest';
import { DESIGN_TOKENS } from '../tokens';
import { VEHICLE_STATUS_CONFIG, VehicleStatus } from '../../domain/constants';
import { getInventoryAgingTier } from '../../utils/vehicle_calculations';

describe('SSoT Color System & Token Integrity', () => {
  it('defines valid non-empty tokens in DESIGN_TOKENS', () => {
    expect(DESIGN_TOKENS.colors.brand.primary).toBe('bg-kraft-accent');
    expect(DESIGN_TOKENS.colors.brand.text).toBe('text-brand');
    expect(DESIGN_TOKENS.colors.financial.income).toBe('text-income');
    expect(DESIGN_TOKENS.colors.financial.expense).toBe('text-expense');
    expect(DESIGN_TOKENS.colors.financial.warning).toBe('text-warning');
    expect(DESIGN_TOKENS.colors.neutral.surface_soft).toBe('bg-surface-soft');
    expect(DESIGN_TOKENS.colors.neutral.text_muted).toBe('text-sub-label');
  });

  it('maps all vehicle statuses to defined glass badge classes', () => {
    const statuses = Object.values(VehicleStatus);
    const validBadges = [
      'glass-badge-blue',
      'glass-badge-sky',
      'glass-badge-emerald',
      'glass-badge-red',
      'glass-badge-orange',
      'glass-badge-slate',
      'glass-badge-purple',
      'glass-badge-dark'
    ];

    statuses.forEach(status => {
      const config = VEHICLE_STATUS_CONFIG[status];
      expect(config).toBeDefined();
      expect(config.badgeClass).toBeDefined();
      expect(validBadges).toContain(config.badgeClass);
    });
  });

  it('assigns valid SSoT color classes and glass badges across all 4 inventory aging tiers', () => {
    const tier1 = getInventoryAgingTier(5);
    expect(tier1.tier).toBe(1);
    expect(tier1.badgeClass).toBe('glass-badge-emerald');
    expect(tier1.colorClass).toBe('text-income');

    const tier2 = getInventoryAgingTier(20);
    expect(tier2.tier).toBe(2);
    expect(tier2.badgeClass).toBe('glass-badge-slate');
    expect(tier2.colorClass).toBe('text-sub-label');

    const tier3 = getInventoryAgingTier(30);
    expect(tier3.tier).toBe(3);
    expect(tier3.badgeClass).toBe('glass-badge-orange');
    expect(tier3.colorClass).toBe('text-warning');

    const tier4 = getInventoryAgingTier(40);
    expect(tier4.tier).toBe(4);
    expect(tier4.badgeClass).toBe('glass-badge-red');
    expect(tier4.colorClass).toBe('text-expense');
  });
});
