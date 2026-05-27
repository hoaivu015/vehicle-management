import { describe, it, expect } from 'vitest';
import { 
  calcTotalCapitalNeeded, 
  calcTotalInvestment, 
  calcGrossProfit, 
  calcNetProfit, 
  calcProfitShare,
  calcKPICompletion,
  calcKPIMultiplier,
  calcTotalSalary,
  calcCompanyMonthlyNetProfit
} from '../financial_formulas';

describe('Financial Formulas', () => {
  describe('calcTotalCapitalNeeded', () => {
    it('should correctly sum purchase price and total cost', () => {
      expect(calcTotalCapitalNeeded(1000, 200)).toBe(1200);
    });
  });

  describe('calcTotalInvestment', () => {
    it('should include selling commission only if sold', () => {
      expect(calcTotalInvestment(1000, 100, 50, 20, 30, true)).toBe(1200);
      expect(calcTotalInvestment(1000, 100, 50, 20, 30, false)).toBe(1170);
    });
  });

  describe('calcGrossProfit', () => {
    it('should return 0 if sale price is 0', () => {
      expect(calcGrossProfit(0, 1000, 100)).toBe(0);
    });

    it('should subtract total capital from sale price', () => {
      expect(calcGrossProfit(1500, 1000, 100)).toBe(400);
    });
  });

  describe('calcNetProfit', () => {
    it('should subtract all commissions and bonuses from gross profit', () => {
      expect(calcNetProfit(1000, 50, 20, 30)).toBe(900);
    });
  });

  describe('calcProfitShare', () => {
    it('should return full profit if total needed is 0', () => {
      expect(calcProfitShare(1000, 500, 0)).toBe(1000);
    });

    it('should distribute profit based on capital ratio', () => {
      expect(calcProfitShare(1000, 200, 1000)).toBe(200);
      expect(calcProfitShare(1000, 800, 1000)).toBe(800);
    });

    it('should handle losses (negative net profit) correctly', () => {
      expect(calcProfitShare(-1000, 500, 1000)).toBe(-500);
    });

    it('should handle zero capital correctly', () => {
      expect(calcProfitShare(1000, 0, 1000)).toBe(0);
    });
  });

  describe('KPI Math', () => {
    it('should calculate completion rate correctly', () => {
      expect(calcKPICompletion(5, 10)).toBe(50);
      expect(calcKPICompletion(5, 0)).toBe(100);
      expect(calcKPICompletion(15, 10)).toBe(150);
    });

    it('should return full multiplier if threshold is met', () => {
      expect(calcKPIMultiplier(100, 100, 1.2, 1.0)).toBe(1.2);
      expect(calcKPIMultiplier(90, 100, 1.2, 1.0)).toBe(1.0);
      expect(calcKPIMultiplier(150, 100, 1.2, 1.0)).toBe(1.2);
    });
  });

  describe('calcTotalSalary', () => {
    it('should correctly sum base, sales commissions with multiplier, and other commissions', () => {
      expect(calcTotalSalary(1000, 500, 1.2, 300)).toBe(1900);
    });

    it('should handle zero commissions', () => {
      expect(calcTotalSalary(1000, 0, 1.2, 0)).toBe(1000);
    });
  });

  describe('Company Finance Math', () => {
    it('should calculate monthly net profit correctly', () => {
      expect(calcCompanyMonthlyNetProfit(5000, 1000, 2000)).toBe(2000);
    });
  });
});
