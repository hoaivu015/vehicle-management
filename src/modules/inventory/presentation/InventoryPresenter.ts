import { GetInventoryList } from '../application/GetInventoryList';
import { UpdateVehicleStatus, UpdateStatusRequest } from '../application/UpdateVehicleStatus';
import { DeleteVehicle } from '../application/DeleteVehicle';
import { GetNextVehicleCode } from '../application/GetNextVehicleCode';
import { AddVehicleCost } from '../application/AddVehicleCost';
import { AddPurchasePayment } from '../application/AddPurchasePayment';
import { AddSalePayment } from '../application/AddSalePayment';
import { CancelSale } from '../application/CancelSale';
import { UpdateVehicle } from '../application/UpdateVehicle';
import { DeleteVehicleCost } from '../application/DeleteVehicleCost';
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
  private currentStaffCode: string | null = null;
  private currentMonth: string = new Date().toISOString().slice(0, 7);
  private currentFilter: string = 'ALL';
  private currentSearch: string = '';
  public get filterCriteria(): string { return this.currentFilter; }
  public get searchQueryValue(): string { return this.currentSearch; }

  constructor(
    private readonly getInventoryListUseCase: GetInventoryList,
    private readonly updateStatusUseCase: UpdateVehicleStatus,
    private readonly deleteVehicleUseCase: DeleteVehicle,
    private readonly getNextVehicleCodeUseCase: GetNextVehicleCode,
    private readonly addVehicleCostUseCase: AddVehicleCost,
    private readonly addPurchasePaymentUseCase: AddPurchasePayment,
    private readonly addSalePaymentUseCase: AddSalePayment,
    private readonly cancelSaleUseCase: CancelSale,
    private readonly updateVehicleUseCase: UpdateVehicle,
    private readonly deleteVehicleCostUseCase: DeleteVehicleCost
  ) { }

  attachView(view: InventoryView): void { this.view = view; }

  detachView(): void {
    this.view = undefined;
    if (this.subscription) {
      import('../../../shared/infrastructure/supabase').then(({ supabase }) => {
        supabase.removeChannel(this.subscription);
      });
    }
  }

  async subscribeToChanges(): Promise<void> {
    const { supabase } = await import('../../../shared/infrastructure/supabase');
    if (this.subscription) return;
    this.subscription = supabase.channel('inventory_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => this.refreshCurrentView())
      .subscribe();
  }

  async refreshCurrentView(): Promise<void> {
    if (this.currentStaffCode) await this.loadPersonal(this.currentStaffCode, this.currentMonth);
    else { await this.loadAvailable(); await this.loadSold(this.currentMonth); }
    this.applyFilters();
  }

  private async perform<T>(action: () => Promise<T>, successMsg?: string, onResult?: (res: T) => void, reloadId?: number): Promise<void> {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const result = await action();
      if (successMsg) toast.success(successMsg);
      if (onResult) onResult(result);
      if (reloadId) await this.refreshCurrentView(); // Simple refresh for now
      else await this.refreshCurrentView();
    } catch (e: any) { this.view.showError(e.message || 'Đã xảy ra lỗi'); }
    finally { this.view.hideLoading(); }
  }

  async loadAvailable(): Promise<void> {
    if (!this.view) return;
    this.view.showLoading();
    try {
      this.availableCars = await this.getInventoryListUseCase.getAvailable();
      this.view.showAvailableCars(this.availableCars);
    } catch (e: any) { this.view.showError(e.message); }
    finally { this.view.hideLoading(); }
  }

  async loadSold(monthStr: string): Promise<void> {
    this.currentMonth = monthStr;
    if (!this.view) return;
    this.view.showLoading();
    try {
      this.soldCars = await this.getInventoryListUseCase.getSold(monthStr);
      this.view.showSoldCars(this.soldCars);
    } catch (e: any) { this.view.showError(e.message); }
    finally { this.view.hideLoading(); }
  }

  async loadPersonal(staffCode: string, monthStr: string): Promise<void> {
    this.currentStaffCode = staffCode;
    this.currentMonth = monthStr;
    if (!this.view) return;
    this.view.showLoading();
    try {
      const [available, personal] = await Promise.all([
        this.getInventoryListUseCase.getAvailable(),
        this.getInventoryListUseCase.getPersonal(staffCode)
      ]);
      this.availableCars = available;
      this.soldCars = personal.filter(c => c.status === VehicleStatus.SOLD && c.sale_date?.startsWith(monthStr));
      this.view.showAvailableCars(this.availableCars);
      this.view.showSoldCars(this.soldCars);
    } catch (e: any) { this.view.showError(e.message); }
    finally { this.view.hideLoading(); }
  }

  async loadDepartment(codes: string[], monthStr: string): Promise<void> {
    this.currentMonth = monthStr;
    if (!this.view) return;
    this.view.showLoading();
    try {
      const [available, deptCars] = await Promise.all([
        this.getInventoryListUseCase.getAvailable(),
        this.getInventoryListUseCase.getDepartment(codes)
      ]);
      this.availableCars = available;
      this.soldCars = deptCars.filter(c => c.status === VehicleStatus.SOLD && c.sale_date?.startsWith(monthStr));
      this.view.showAvailableCars(this.availableCars);
      this.view.showSoldCars(this.soldCars);
    } catch (e: any) { this.view.showError(e.message); }
    finally { this.view.hideLoading(); }
  }

  async updateVehicleStatus(req: UpdateStatusRequest): Promise<void> {
    await this.perform(() => this.updateStatusUseCase.execute(req), 'Cập nhật thành công', () => this.view?.onStatusUpdated());
  }

  async getNextVehicleCode(): Promise<string> {
    try { return await this.getNextVehicleCodeUseCase.execute(); }
    catch { return ''; }
  }

  async deleteVehicle(id: number): Promise<void> {
    await this.perform(() => this.deleteVehicleUseCase.execute(id), 'Xóa thành công', () => this.view?.onStatusUpdated());
  }

  async updateVehicle(id: number, data: Partial<Vehicle>): Promise<void> {
    await this.perform(() => this.updateVehicleUseCase.execute({ id, data }), 'Đã cập nhật', (res) => this.view?.onVehicleUpdated(res));
  }

  async addVehicleCost(vehicle: Vehicle, costName: string, amount: number): Promise<void> {
    await this.perform(() => this.addVehicleCostUseCase.execute({ vehicleId: vehicle.id, costName, amount }), 'Đã thêm chi phí', (res) => this.view?.onVehicleUpdated(res));
  }

  async deleteVehicleCost(vehicle: Vehicle, costIndex: number): Promise<void> {
    await this.perform(() => this.deleteVehicleCostUseCase.execute({ vehicleId: vehicle.id, costIndex }), 'Đã xóa chi phí', (res) => this.view?.onVehicleUpdated(res));
  }

  filter(criteria: string): void { this.currentFilter = criteria; this.applyFilters(); }
  search(query: string): void { this.currentSearch = query; this.applyFilters(); }

  private applyFilters(): void {
    if (!this.view) return;
    let filtered = [...this.availableCars];
    if (this.currentSearch) {
      const q = this.currentSearch.toLowerCase().trim();
      filtered = filtered.filter(car => car.name.toLowerCase().includes(q) || car.code.toLowerCase().includes(q));
    }
    if (this.currentFilter === 'AGING_25') {
      const limit = new Date(); limit.setDate(limit.getDate() - 25);
      filtered = filtered.filter(car => car.purchase_date && new Date(car.purchase_date) <= limit);
    }
    this.view.showAvailableCars(filtered);
  }

  async togglePin(id: number, isPinned: boolean): Promise<void> {
    await this.perform(() => this.updateVehicleUseCase.execute({ id, data: { is_pinned: isPinned } }), isPinned ? 'Đã ghim' : 'Đã bỏ ghim');
  }

  async addPurchasePayment(id: number, amount: number, note: string, receiver: string): Promise<void> {
    await this.perform(() => this.addPurchasePaymentUseCase.execute({ vehicleId: id, amount, note, receiver }), 'Đã thêm thanh toán');
  }

  async addSalePayment(id: number, amount: number, note: string, receiver: string, nextStatus: VehicleStatus, seller: string, buyerName?: string, salePrice?: number, commission?: number): Promise<void> {
    await this.perform(() => this.addSalePaymentUseCase.execute({ vehicleId: id, amount, note, receiver, nextStatus, seller, buyerName, salePrice, commission }), 'Giao dịch thành công', () => this.view?.onStatusUpdated());
  }

  async cancelSale(id: number, userCode: string): Promise<void> {
    await this.perform(() => this.cancelSaleUseCase.execute({ vehicleId: id, userCode }), 'Hủy giao dịch thành công', () => this.view?.onStatusUpdated());
  }
}
