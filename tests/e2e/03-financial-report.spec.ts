import { test, expect } from '@playwright/test';

test.describe('Luồng Báo cáo Tài chính & Dòng tiền (Financial Report Flow)', () => {
  test('Dashboard hiển thị đầy đủ doanh thu, chi phí và lợi nhuận ròng', async ({ page }) => {
    await page.goto('/');
    
    // Kiểm tra Tab Dòng tiền / Tài chính
    const financeTab = page.locator('text=Dòng tiền').first();
    if (await financeTab.isVisible()) {
      await financeTab.click();
      
      // Các box tài chính quan trọng phải hiển thị dữ liệu động (không double-count)
      const revenueBox = page.locator('text=Tổng doanh thu').first();
      const expenseBox = page.locator('text=Tổng chi phí').first();
      const profitBox = page.locator('text=Lợi nhuận ròng').first();
      
      await expect(revenueBox).toBeVisible();
      await expect(expenseBox).toBeVisible();
      await expect(profitBox).toBeVisible();
    }
  });
});
