import { BasePresenter, BaseView } from '../../../shared/presentation/BasePresenter';
import { InventoryListPresenter } from './InventoryListPresenter';
import { VehicleActionPresenter } from './VehicleActionPresenter';
import { VehicleTransactionPresenter } from './VehicleTransactionPresenter';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Vehicle } from '../../../shared/domain/types';
import { UpdateStatusRequest } from '../application/UpdateVehicleStatus';
import { VehicleStatus } from '../../../shared/domain/constants';
import { IUnifiedExpensePresenter } from '@/src/shared/presentation/interfaces/IUnifiedExpensePresenter';
import { UnifiedExpenseCommand } from '@/src/shared/domain/schemas';

export interface InventoryView extends BaseView {
  showAvailableCars(cars: Vehicle[]): void;
  showSoldCars(cars: Vehicle[]): void;
  onStatusUpdated(): void;
  onVehicleUpdated(vehicle: Vehicle): void;
  setStaffList(staff: import('../../../shared/domain/types').Staff[]): void;
}

export class InventoryPresenter extends BasePresenter<InventoryView> implements IUnifiedExpensePresenter {
  private subscription: RealtimeChannel | null = null;
  private currentStaffCode: string | null = null;
  private currentMonth: string = new Date().toISOString().slice(0, 7);

  constructor(
    private readonly listPresenter: InventoryListPresenter,
    private readonly actionPresenter: VehicleActionPresenter,
    private readonly transactionPresenter: VehicleTransactionPresenter
  ) {
    super();
  }

  public get filterCriteria(): string { return this.listPresenter.filterCriteria; }
  public get searchQueryValue(): string { return this.listPresenter.searchQueryValue; }

  attachView(view: InventoryView): void {
    super.attachView(view);
    this.listPresenter.attachView(view);
    this.actionPresenter.attachView(view);
    this.transactionPresenter.attachView(view);
  }

  detachView(): void {
    super.detachView();
    this.listPresenter.detachView();
    this.actionPresenter.detachView();
    this.transactionPresenter.detachView();
    if (this.subscription) {
      import('../../../shared/infrastructure/supabase').then(({ supabase }) => {
        if (this.subscription) supabase.removeChannel(this.subscription);
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
  }

  // List Delegation
  async loadAvailable(): Promise<void> { await this.listPresenter.loadAvailable(); }
  async loadSold(month: string): Promise<void> { this.currentMonth = month; await this.listPresenter.loadSold(month); }
  async loadPersonal(code: string, month: string): Promise<void> { 
    this.currentStaffCode = code; 
    this.currentMonth = month; 
    await this.listPresenter.loadPersonal(code, month); 
  }
  async loadDepartment(codes: string[], month: string): Promise<void> {
    this.currentMonth = month;
    await this.listPresenter.loadDepartment(codes, month);
  }
  async loadInventory(role: string, code: string | null, month: string): Promise<void> {
    const { PermissionService } = await import('@/src/modules/auth/domain/PermissionService');
    this.currentMonth = month;
    if (PermissionService.canSeeAllData(role)) {
      await Promise.all([this.loadAvailable(), this.loadSold(month)]);
    } else if (code) {
      await this.loadPersonal(code, month);
    } else {
      await Promise.all([this.loadAvailable(), this.loadSold(month)]);
    }
  }
  filter(criteria: string): void { this.listPresenter.filter(criteria); }
  search(query: string): void { this.listPresenter.search(query); }

  // Action Delegation
  async updateVehicleStatus(req: UpdateStatusRequest, role?: string): Promise<void> { await this.actionPresenter.updateVehicleStatus(req, role); }
  async deleteVehicle(id: number, role?: string): Promise<void> { await this.actionPresenter.deleteVehicle(id, role); }
  async updateVehicle(id: number, data: Partial<Vehicle>, role?: string): Promise<void> { await this.actionPresenter.updateVehicle(id, data, role); }
  async togglePin(id: number, pinned: boolean): Promise<void> { await this.actionPresenter.togglePin(id, pinned); }
  async getNextVehicleCode(): Promise<string> { return this.actionPresenter.getNextVehicleCode(); }

  // Transaction Delegation
  async addVehicleCost(id: number, name: string, amount: number, staffId?: string | number, role?: string): Promise<void> { 
    await this.transactionPresenter.addVehicleCost(id, name, amount, staffId, role); 
  }
  async deleteVehicleCost(id: number, index: number, role?: string): Promise<void> { await this.transactionPresenter.deleteVehicleCost(id, index, role); }
  async addPurchasePayment(id: number, amt: number, note: string, rec: string, role?: string): Promise<void> { await this.transactionPresenter.addPurchasePayment(id, amt, note, rec, role); }
  async addSalePayment(id: number, amt: number, note: string, rec: string, status: VehicleStatus, seller: string, buyer?: string, price?: number, comm?: number, bonus?: number, role?: string): Promise<void> {
    await this.transactionPresenter.addSalePayment(id, amt, note, rec, status, seller, buyer, price, comm, bonus, role);
  }
  async cancelSale(id: number, code: string, role?: string): Promise<void> { await this.transactionPresenter.cancelSale(id, code, role); }

  async recordExpense(command: UnifiedExpenseCommand): Promise<void> {
    if (!command.vehicleId) {
      throw new Error('Mã ID xe là bắt buộc đối với chi phí xe');
    }
    await this.addVehicleCost(
      Number(command.vehicleId),
      command.name,
      command.amount,
      command.staffId
    );
  }
}
