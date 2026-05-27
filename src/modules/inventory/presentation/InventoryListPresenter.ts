import { BasePresenter, BaseView } from '../../../shared/presentation/BasePresenter';
import { GetInventoryList } from '../application/GetInventoryList';
import { Vehicle } from '../../../shared/domain/types';
import { isVehicleAging } from '../../../shared/utils/vehicle_calculations';
import { VehicleStatus, INVENTORY_CONSTANTS } from '../../../shared/domain/constants';
import { fuzzyMatch } from '@/src/shared/utils/string';
import { StaffRepository } from '../../staff/domain/StaffRepository';

export interface InventoryListView extends BaseView {
  showAvailableCars(cars: Vehicle[]): void;
  showSoldCars(cars: Vehicle[]): void;
  setStaffList(staff: import('../../../shared/domain/types').Staff[]): void;
}

export class InventoryListPresenter extends BasePresenter<InventoryListView> {
  private availableCars: Vehicle[] = [];
  private soldCars: Vehicle[] = [];
  private currentFilter: string = 'ALL';
  private currentSearch: string = '';
  private staff: import('../../../shared/domain/types').Staff[] = [];

  constructor(
    private readonly getInventoryListUseCase: GetInventoryList,
    private readonly staffRepository: StaffRepository
  ) {
    super();
  }

  public get filterCriteria(): string { return this.currentFilter; }
  public get searchQueryValue(): string { return this.currentSearch; }

  async loadAvailable(): Promise<void> {
    await this.perform(async () => {
      const [cars, allStaff] = await Promise.all([
        this.getInventoryListUseCase.getAvailable(),
        this.staffRepository.getAll()
      ]);
      
      this.availableCars = cars;
      const { PermissionService } = await import('@/src/modules/auth/domain/PermissionService');
      this.staff = allStaff.filter(s => !PermissionService.isAdmin(s.role));
      
      if (this.view) {
        this.view.setStaffList(this.staff);
        this.applyFilters();
      }
    });
  }

  async loadSold(monthStr: string): Promise<void> {
    await this.perform(async () => {
      this.soldCars = await this.getInventoryListUseCase.getSold(monthStr);
      this.view?.showSoldCars(this.soldCars);
    });
  }

  async loadPersonal(staffCode: string, monthStr: string): Promise<void> {
    await this.perform(async () => {
      const [available, personal, allStaff] = await Promise.all([
        this.getInventoryListUseCase.getAvailable(),
        this.getInventoryListUseCase.getPersonal(staffCode),
        this.staffRepository.getAll()
      ]);
      
      this.availableCars = available;
      this.soldCars = personal.filter(c => c.status === VehicleStatus.SOLD && c.sale_date?.startsWith(monthStr));
      
      const { PermissionService } = await import('@/src/modules/auth/domain/PermissionService');
      this.staff = allStaff.filter(s => !PermissionService.isAdmin(s.role));
      
      if (this.view) {
        this.applyFilters();
        this.view.showSoldCars(this.soldCars);
      }
    });
  }

  async loadDepartment(codes: string[], monthStr: string): Promise<void> {
    await this.perform(async () => {
      const [available, deptCars, allStaff] = await Promise.all([
        this.getInventoryListUseCase.getAvailable(),
        this.getInventoryListUseCase.getDepartment(codes),
        this.staffRepository.getAll()
      ]);
      
      this.availableCars = available;
      this.soldCars = deptCars.filter(c => c.status === VehicleStatus.SOLD && c.sale_date?.startsWith(monthStr));
      
      const { PermissionService } = await import('@/src/modules/auth/domain/PermissionService');
      this.staff = allStaff.filter(s => !PermissionService.isAdmin(s.role));

      if (this.view) {
        this.applyFilters();
        this.view.showSoldCars(this.soldCars);
      }
    });
  }

  filter(criteria: string): void { this.currentFilter = criteria; this.applyFilters(); }
  search(query: string): void { this.currentSearch = query; this.applyFilters(); }

  private applyFilters(): void {
    if (!this.view) return;
    let filtered = [...this.availableCars];
    if (this.currentSearch) {
      const q = this.currentSearch;
      filtered = filtered.filter(car => 
        fuzzyMatch(car.name, q) || 
        fuzzyMatch(car.code, q)
      );
    }
    if (this.currentFilter === 'AGING_25') {
      filtered = filtered.filter(car => isVehicleAging(car.purchase_date, INVENTORY_CONSTANTS.AGING_THRESHOLD_DAYS));
    }
    this.view.showAvailableCars(this.sortVehicles(filtered));
  }

  private sortVehicles(cars: Vehicle[]): Vehicle[] {
    return [...cars].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      const dateA = a.purchase_date ? new Date(a.purchase_date).getTime() : 0;
      const dateB = b.purchase_date ? new Date(b.purchase_date).getTime() : 0;
      return dateB - dateA;
    });
  }
}
