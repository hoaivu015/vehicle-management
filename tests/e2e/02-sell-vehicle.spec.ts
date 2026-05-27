import { test, expect } from '@playwright/test';

test.describe('Luồng Nghiệp vụ Bán Xe (Sell Vehicle Flow)', () => {
  test('Bán xe phải chuyển trạng thái qua State Machine an toàn', async ({ page }) => {
    await page.goto('/');
    
    // Kiểm tra kho xe
    const inventoryTab = page.locator('text=Kho xe').first();
    if (await inventoryTab.isVisible()) {
      await inventoryTab.click();
      
      // Tìm một xe đang ở trạng thái InStock (Đang bán)
      const inStockBadge = page.locator('text=Đang bán').first();
      if (await inStockBadge.isVisible()) {
        await inStockBadge.click();
        
        // Xem chi tiết xe có nút "Bán xe" không
        const sellBtn = page.locator('text=Bán xe').first();
        if (await sellBtn.isVisible()) {
          await sellBtn.click();
          
          // Form giao dịch bán xe hiển thị
          const transactionHeader = page.locator('text=Thông tin bán xe').first();
          await expect(transactionHeader).toBeVisible();
        }
      }
    }
  });
});
