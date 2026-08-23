import { StaffRepository } from '@/src/modules/staff/domain/StaffRepository';
import { VehicleRepository } from '@/src/modules/inventory/domain/VehicleRepository';
import { StaffSalaryService, SalaryDetails } from '@/src/modules/staff/domain/StaffSalaryService';
import { Staff, Vehicle, StaffExpense } from '@/src/shared/domain/types';

export interface PersonalOverviewDTO {
  staff: Staff;
  salaryDetails: SalaryDetails;
  personalExpenses: StaffExpense[];
  soldVehicles: Vehicle[];
  boughtVehicles: Vehicle[];
  coinvestedVehicles: Vehicle[];
  kpiSummary: {
    target: number;
    soldCount: number;
    completionRate: number;
    kpiBonusMultiplier: number;
  };
  incomeSummary: {
    baseSalary: number;
    salesCommission: number;
    buyingCommission: number;
    coinvestProfitShare: number;
    totalCommission: number;
    totalSalary: number;
    totalReimbursements: number;
    totalAdvances: number;
    netSalary: number;
    isPaid: boolean;
  };
}

export class GetPersonalOverview {
  constructor(
    private readonly staffRepo: StaffRepository,
    private readonly vehicleRepo: VehicleRepository
  ) {}

  async execute(identifier: { id?: string | number; code?: string }, monthStr: string): Promise<PersonalOverviewDTO> {
    let staff: Staff | null = null;

    if (identifier.code) {
      staff = await this.staffRepo.getByCode(identifier.code);
    } else if (identifier.id !== undefined) {
      staff = await this.staffRepo.getById(identifier.id);
    }

    if (!staff) {
      throw new Error(`Không tìm thấy thông tin nhân sự.`);
    }

    const allVehicles = await this.vehicleRepo.getAll();
    const salaryDetails = StaffSalaryService.calculateMonthlySalary(staff, allVehicles, monthStr);

    const personalExpenses = staff.expenses || [];

    return {
      staff,
      salaryDetails,
      personalExpenses,
      soldVehicles: salaryDetails.soldCars,
      boughtVehicles: salaryDetails.boughtCars,
      coinvestedVehicles: salaryDetails.coinvestedCars,
      kpiSummary: {
        target: staff.target || 0,
        soldCount: salaryDetails.soldCount,
        completionRate: salaryDetails.completionRate,
        kpiBonusMultiplier: salaryDetails.kpiBonusMultiplier,
      },
      incomeSummary: {
        baseSalary: salaryDetails.base,
        salesCommission: salaryDetails.salesCommission,
        buyingCommission: salaryDetails.buyingCommission,
        coinvestProfitShare: salaryDetails.coinvestProfitShare,
        totalCommission: salaryDetails.totalCommission,
        totalSalary: salaryDetails.totalSalary,
        totalReimbursements: salaryDetails.totalReimbursements,
        totalAdvances: salaryDetails.totalAdvances,
        netSalary: salaryDetails.netSalary,
        isPaid: salaryDetails.isPaid,
      },
    };
  }
}
