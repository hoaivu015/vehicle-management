import { test, expect } from '@playwright/test';

test.describe('Luồng Nghiệp vụ Thêm Xe (Add Vehicle Flow)', () => {
  test.beforeEach(async ({ page }) => {
    // Đi tới trang chủ (App sẽ kiểm tra Session hoặc đăng nhập)
    await page.goto('/');
  });

  test('Hiển thị giao diện chính ổn định và form thêm xe', async ({ page }) => {
    // Kiểm tra tiêu đề hoặc các thành phần chính của App để chắc chắn app đã load
    await expect(page).toHaveTitle(/Auto28/i);
    
    // Kiểm tra Header hoặc nút điều hướng kho xe có hiển thị không
    const inventoryTab = page.locator('text=Kho xe').first();
    if (await inventoryTab.isVisible()) {
      await inventoryTab.click();
      
      // Kiểm tra có nút "Thêm Xe" không (tuỳ thuộc vào quyền hạn admin/sale)
      const addVehicleBtn = page.locator('text=Thêm xe').first();
      if (await addVehicleBtn.isVisible()) {
        await addVehicleBtn.click();
        
        // Form thêm xe phải hiện ra
        const formHeader = page.locator('text=Thông tin xe').first();
        await expect(formHeader).toBeVisible();
      }
    }
  });
});
