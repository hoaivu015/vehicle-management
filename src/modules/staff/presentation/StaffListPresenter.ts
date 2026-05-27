import { BasePresenter, BaseView } from '../../../shared/presentation/BasePresenter';
import { GetStaffList, StaffWithSalary } from '../application/GetStaffList';
import { fuzzyMatch } from '@/src/shared/utils/string';
import { PermissionService } from '@/src/modules/auth/domain/PermissionService';
import { UserRole } from '../../../shared/domain/constants';

import { Vehicle } from '../../../shared/domain/types';

export interface StaffListView extends BaseView {
  showStaffList(staff: StaffWithSalary[]): void;
  showVehicles?(vehicles: Vehicle[]): void;
}

export class StaffListPresenter extends BasePresenter<StaffListView> {
  private staffList: StaffWithSalary[] = [];

  constructor(
    private readonly getStaffListUseCase: GetStaffList,
    private readonly vehicleRepo: import('../../../shared/domain/Repository').Repository<Vehicle>
  ) {
    super();
  }

  async loadStaff(monthStr: string): Promise<void> {
    await this.perform(async () => {
      this.staffList = await this.getStaffListUseCase.execute(monthStr);
      const displayList = this.staffList.filter(s => !PermissionService.isAdmin(s.role));
      this.view?.showStaffList(displayList);
    });
  }

  async loadVehicles(): Promise<void> {
    await this.perform(async () => {
      const vehicles = await this.vehicleRepo.getAll();
      this.view?.showVehicles?.(vehicles);
    });
  }

  filterStaff(query: string): void {
    if (!this.view) return;
    const filtered = this.staffList.filter(s => 
      s.role !== UserRole.ADMIN && (
        fuzzyMatch(s.name, query) || 
        fuzzyMatch(s.code, query)
      )
    );
    this.view.showStaffList(filtered);
  }
}
