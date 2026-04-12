import { GetInventoryList } from '../application/GetInventoryList';
import { UpdateVehicleStatus, UpdateStatusRequest } from '../application/UpdateVehicleStatus';
import { DeleteVehicle } from '../application/DeleteVehicle';
import { GetNextVehicleCode } from '../application/GetNextVehicleCode';
import { Vehicle } from '../../../shared/domain/types';
import { VehicleStatus } from '../../../shared/domain/constants';
import { toast } from 'sonner';

export interface InventoryView {
  showAvailableCars(cars: Vehicle[]): void;
  showSoldCars(cars: Vehicle[]): void;
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onStatusUpdated(): void;
  onVehicleUpdated(vehicle: Vehicle): void;
}

export class InventoryPresenter {
  private view?: InventoryView;
  private availableCars: Vehicle[] = [];
  private soldCars: Vehicle[] = [];
  private subscription: any = null;

  constructor(
    private readonly getInventoryListUseCase: GetInventoryList,
    private readonly updateStatusUseCase: UpdateVehicleStatus,
    private readonly deleteVehicleUseCase: DeleteVehicle,
    private readonly getNextVehicleCodeUseCase: GetNextVehicleCode
  ) {}

  attachView(view: InventoryView): void {
    this.view = view;
  }

  detachView(): void {
    this.view = undefined;
    if (this.subscription) {
      import('../../../shared/infrastructure/supabase').then(({ supabase }) => {
        supabase.removeChannel(this.subscription);
      });
    }
  }

  /**
   * Đăng ký nhận thay đổi realtime từ Supabase.
   */
  async subscribeToChanges(): Promise<void> {
    const { supabase } = await import('../../../shared/infrastructure/supabase');
    
    if (this.subscription) return;

    this.subscription = supabase.channel('inventory_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
        this.loadAvailable();
      })
      .subscribe();
  }

  /**
   * Tải danh sách xe đang bán.
   */
  async loadAvailable(): Promise<void> {
    if (!this.view) return;
    this.view.showLoading();
    try {
      this.availableCars = await this.getInventoryListUseCase.getAvailable();
      this.view.showAvailableCars(this.availableCars);
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi tải kho xe');
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Tải danh sách xe đã bán trong tháng.
   */
  async loadSold(monthStr: string): Promise<void> {
    if (!this.view) return;
    this.view.showLoading();
    try {
      this.soldCars = await this.getInventoryListUseCase.getSold(monthStr);
      this.view.showSoldCars(this.soldCars);
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi tải danh sách đã bán');
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Tải kho xe cá nhân (Xe mình nhập + Xe mình bán + Xe mình góp vốn)
   * Cập nhật đồng thời cho cả tab 'Trong kho' và 'Đã bán'.
   */
  async loadPersonal(staffCode: string): Promise<void> {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const cars = await this.getInventoryListUseCase.getPersonal(staffCode);
      this.availableCars = cars.filter(c => c.status !== VehicleStatus.SOLD);
      this.soldCars = cars.filter(c => c.status === VehicleStatus.SOLD);
      
      this.view.showAvailableCars(this.availableCars);
      this.view.showSoldCars(this.soldCars);
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi tải kho cá nhân');
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Tải kho xe theo phòng ban (Dành cho Trưởng phòng)
   * Cập nhật đồng thời cho cả tab 'Trong kho' và 'Đã bán'.
   */
  async loadDepartment(codes: string[]): Promise<void> {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const cars = await this.getInventoryListUseCase.getDepartment(codes);
      this.availableCars = cars.filter(c => c.status !== VehicleStatus.SOLD);
      this.soldCars = cars.filter(c => c.status === VehicleStatus.SOLD);

      this.view.showAvailableCars(this.availableCars);
      this.view.showSoldCars(this.soldCars);
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi tải kho phòng ban');
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Tải lại chi tiết 1 xe.
   */
  private async reloadVehicle(id: number): Promise<void> {
    try {
      const repo = (this.getInventoryListUseCase as any).repository;
      const updatedVehicle = await repo.getById(id.toString());
      if (updatedVehicle && this.view) {
        this.view.onVehicleUpdated(updatedVehicle);
      }
    } catch (e) {
      console.error('Error reloading vehicle details:', e);
    }
  }

  /**
   * Cập nhật trạng thái xe.
   */
  async updateVehicleStatus(request: UpdateStatusRequest): Promise<void> {
    if (!this.view) return;
    this.view.showLoading();
    try {
      await this.updateStatusUseCase.execute(request);
      this.view.onStatusUpdated();
      await this.reloadVehicle(request.id);
      // Reload current view
      await this.loadAvailable();
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Lấy mã xe tiếp theo cho form thêm mới.
   */
  async getNextVehicleCode(): Promise<string> {
    try {
      return await this.getNextVehicleCodeUseCase.execute();
    } catch (e) {
      console.error('Error fetching next code:', e);
      return '';
    }
  }

  /**
   * Xóa xe khỏi hệ thống.
   */
  async deleteVehicle(id: number): Promise<void> {
    if (!this.view || !this.deleteVehicleUseCase) return;
    this.view.showLoading();
    try {
      await this.deleteVehicleUseCase.execute(id);
      this.view.onStatusUpdated();
      await this.loadAvailable();
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi xóa xe');
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Cập nhật thông tin xe.
   */
  async updateVehicle(id: number, data: Partial<Vehicle>): Promise<void> {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const updated = await (this.getInventoryListUseCase as any).repository.update(id, data);
      this.view.onVehicleUpdated(updated);
      toast.success('Đã cập nhật thông tin xe');
      await this.loadAvailable();
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi cập nhật xe');
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Thêm chi phí phát sinh cho xe.
   */
  async addVehicleCost(vehicle: Vehicle, costName: string, amount: number): Promise<void> {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const newCost = {
        date: new Date().toISOString().split('T')[0],
        note: costName,
        amount: amount
      };
      
      const updatedHistory = [...(vehicle.cost_history || []), newCost];

      const updated = await (this.getInventoryListUseCase as any).repository.update(vehicle.id, {
        cost_history: updatedHistory
        // total_cost và profit được repository.update() tự recalculate
      });
      
      this.view.onVehicleUpdated(updated);
      toast.success('Đã thêm chi phí Spa/Nội thất');
      await this.loadAvailable();
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi thêm chi phí');
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Xóa chi phí phát sinh.
   */
  async deleteVehicleCost(vehicle: Vehicle, costIndex: number): Promise<void> {
    if (!this.view) return;
    const costToRemove = vehicle.cost_history[costIndex];
    if (!costToRemove) return;

    this.view.showLoading();
    try {
      const updatedHistory = vehicle.cost_history.filter((_, i) => i !== costIndex);

      const updated = await (this.getInventoryListUseCase as any).repository.update(vehicle.id, {
        cost_history: updatedHistory
        // total_cost và profit được repository.update() tự recalculate
      });

      this.view.onVehicleUpdated(updated);
      toast.success('Đã xóa chi phí');
      await this.loadAvailable();
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi xóa chi phí');
    } finally {
      this.view.hideLoading();
    }
  }

  filter(criteria: string): void {
    if (!this.view) return;
    
    let filtered = [...this.availableCars];
    
    if (criteria === 'AGING_25') {
      const twentyFiveDaysAgo = new Date();
      twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);
      
      filtered = filtered.filter(car => {
        if (!car.purchase_date) return false;
        const purchaseDate = new Date(car.purchase_date);
        return purchaseDate <= twentyFiveDaysAgo;
      });
    }

    this.view.showAvailableCars(filtered);
  }

  /**
   * Ghim/Bỏ ghim xe.
   */
  async togglePin(id: number, isPinned: boolean): Promise<void> {
    if (!this.view) return;
    try {
      await (this.getInventoryListUseCase as any).repository.update(id, { is_pinned: isPinned });
      toast.success(isPinned ? 'Đã ghim xe lên đầu danh sách' : 'Đã bỏ ghim xe');
      await this.loadAvailable();
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi ghim xe');
    }
  }

  /**
   * Thêm thanh toán đợt mua xe (DEPOSIT_BUY).
   */
  async addPurchasePayment(id: number, amount: number, note: string, receiver: string): Promise<void> {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const payment = {
        amount,
        note,
        date: new Date().toISOString().split('T')[0],
        receiver
      };
      await (this.getInventoryListUseCase as any).repository.addPurchasePayment(id, payment);
      toast.success('Đã thêm thanh toán mua xe');
      await this.reloadVehicle(id);
      await this.loadAvailable();
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi thêm thanh toán');
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Thực hiện thanh toán đợt bán/cọc và chuyển trạng thái.
   */
  async addSalePayment(id: number, amount: number, note: string, receiver: string, nextStatus: VehicleStatus, seller: string, buyerName?: string, salePrice?: number, commission?: number): Promise<void> {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const payment = {
        amount,
        note,
        date: new Date().toISOString().split('T')[0],
        receiver
      };
      await (this.getInventoryListUseCase as any).repository.addSalePayment(id, payment, nextStatus, seller, buyerName, salePrice, commission);
      toast.success('Đã cập nhật trạng thái và dòng tiền');
      await this.reloadVehicle(id);
      await this.loadAvailable();
      this.view.onStatusUpdated();
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi thực hiện giao dịch');
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Hủy giao dịch bán xe.
   */
  async cancelSale(id: number, userCode: string): Promise<void> {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const historyEntry = {
        date: new Date().toISOString().split('T')[0],
        status: VehicleStatus.IN_STOCK,
        user: userCode,
        note: 'Hủy giao dịch đặt cọc - Quay về trạng thái Trong kho'
      };
      await (this.getInventoryListUseCase as any).repository.cancelSale(id, historyEntry);
      toast.success('Đã hủy giao dịch thành công');
      await this.reloadVehicle(id);
      await this.loadAvailable();
      this.view.onStatusUpdated();
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi hủy giao dịch');
    } finally {
      this.view.hideLoading();
    }
  }
}
