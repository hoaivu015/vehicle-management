import React, { createContext, useContext, useMemo } from 'react';

// Infrastructure
import { SupabaseVehicleRepository } from '../../modules/inventory/infrastructure/SupabaseVehicleRepository';
import { SupabaseStaffRepository } from '../../modules/staff/infrastructure/SupabaseStaffRepository';
import { SupabaseExpenseRepository } from '../../modules/finance/infrastructure/SupabaseExpenseRepository';
import { CloudinaryVehicleStorageRepository } from '../../modules/inventory/infrastructure/CloudinaryVehicleStorageRepository';
import { SupabaseVehicleStaffRepository } from '../../modules/inventory/infrastructure/SupabaseVehicleStaffRepository';
import { SupabaseUserRepository } from '../../modules/user/infrastructure/SupabaseUserRepository';
import { SupabasePermissionRepository } from '../../modules/auth/infrastructure/SupabasePermissionRepository';
import { SupabaseVehicleCodeGenerator } from '../../modules/inventory/infrastructure/services/SupabaseVehicleCodeGenerator';
import { SupabaseAuthRepository } from '../../modules/auth/infrastructure/SupabaseAuthRepository';

// Application (Inventory)
import { GetInventoryList } from '../../modules/inventory/application/GetInventoryList';
import { UpdateVehicleStatus } from '../../modules/inventory/application/UpdateVehicleStatus';
import { DeleteVehicle } from '../../modules/inventory/application/DeleteVehicle';
import { AddVehicle } from '../../modules/inventory/application/AddVehicle';
import { GetNextVehicleCode } from '../../modules/inventory/application/GetNextVehicleCode';
import { AddPurchasePayment } from '../../modules/inventory/application/AddPurchasePayment';
import { AddSalePayment } from '../../modules/inventory/application/AddSalePayment';
import { CancelSale } from '../../modules/inventory/application/CancelSale';
import { UpdateVehicle } from '../../modules/inventory/application/UpdateVehicle';
import { DeleteVehicleCost } from '../../modules/inventory/application/DeleteVehicleCost';
import { VehicleService } from '../../modules/inventory/application/VehicleService';

// Application (Staff)
import { GetStaffList } from '../../modules/staff/application/GetStaffList';
import { AddStaff } from '../../modules/staff/application/AddStaff';
import { UpdateStaff } from '../../modules/staff/application/UpdateStaff';
import { DeleteStaff } from '../../modules/staff/application/DeleteStaff';
import { ToggleStaffExpenseReimbursement } from '../../modules/staff/application/ToggleStaffExpenseReimbursement';
import { DeleteStaffExpense } from '../../modules/staff/application/DeleteStaffExpense';
import { UpdateStaffExpense } from '../../modules/staff/application/UpdateStaffExpense';
import { ReimburseStaffExpenses } from '../../modules/staff/application/ReimburseStaffExpenses';

// Application (Payroll)
import { ProcessSalaryPayment, CancelSalaryPayment } from '../../modules/payroll/application/ProcessSalaryPayment';

// Application (Finance)
import { GetMonthlyFinance } from '../../modules/finance/application/GetMonthlyFinance';
import { GetFinancialOverview } from '../../modules/finance/application/GetFinancialOverview';
import { RecordExpense } from '../../modules/finance/application/RecordExpense';

// Infrastructure (Notifications)
import { notificationService } from '../infrastructure/SonnerNotificationService';

// Presenters
import { InventoryPresenter } from '../../modules/inventory/presentation/InventoryPresenter';
import { InventoryListPresenter } from '../../modules/inventory/presentation/InventoryListPresenter';
import { VehicleActionPresenter } from '../../modules/inventory/presentation/VehicleActionPresenter';
import { VehicleTransactionPresenter } from '../../modules/inventory/presentation/VehicleTransactionPresenter';
import { StaffPresenter } from '../../modules/staff/presentation/StaffPresenter';
import { StaffListPresenter } from '../../modules/staff/presentation/StaffListPresenter';
import { StaffActionPresenter } from '../../modules/staff/presentation/StaffActionPresenter';
import { StaffExpensePresenter } from '../../modules/staff/presentation/StaffExpensePresenter';
import { PayrollPresenter } from '../../modules/staff/presentation/PayrollPresenter';
import { FinancePresenter } from '../../modules/finance/presentation/FinancePresenter';
import { UserManagementPresenter } from '../../modules/user/presentation/UserManagementPresenter';
import { PersonalPresenter } from '../../modules/user/presentation/PersonalPresenter';
import { PermissionsPresenter } from '../../modules/auth/presentation/PermissionsPresenter';

/**
 * Interface định nghĩa tất cả các dependencies của hệ thống.
 * Đây là "Single Source of Truth" cho việc khởi tạo.
 */
export interface Dependencies {
  // Repositories
  vehicleRepo: SupabaseVehicleRepository;
  staffRepo: SupabaseStaffRepository;
  expenseRepo: SupabaseExpenseRepository;
  storageRepo: CloudinaryVehicleStorageRepository;
  vehicleStaffRepo: SupabaseVehicleStaffRepository;
  userRepo: SupabaseUserRepository;
  permissionRepo: SupabasePermissionRepository;
  authRepo: SupabaseAuthRepository;

  // Inventory Use Cases
  inventory: {
    getList: GetInventoryList;
    updateStatus: UpdateVehicleStatus;
    deleteVehicle: DeleteVehicle;
    addVehicle: AddVehicle;
    getNextCode: GetNextVehicleCode;
    addPurchasePayment: AddPurchasePayment;
    addSalePayment: AddSalePayment;
    cancelSale: CancelSale;
    updateVehicle: UpdateVehicle;
    deleteCost: DeleteVehicleCost;
    service: VehicleService;
  };

  // Staff Use Cases
  staff: {
    getList: GetStaffList;
    add: AddStaff;
    update: UpdateStaff;
    delete: DeleteStaff;
    toggleReimbursement: ToggleStaffExpenseReimbursement;
    deleteExpense: DeleteStaffExpense;
    updateExpense: UpdateStaffExpense;
    reimburseExpenses: ReimburseStaffExpenses;
  };

  // Payroll Use Cases
  payroll: {
    processSalary: ProcessSalaryPayment;
    cancelSalary: CancelSalaryPayment;
  };

  // Finance Use Cases
  finance: {
    getMonthly: GetMonthlyFinance;
    getOverview: GetFinancialOverview;
    recordExpense: RecordExpense;
  };

  // Presenters (Factories)
  createInventoryPresenter: () => InventoryPresenter;
  createStaffPresenter: () => StaffPresenter;
  createFinancePresenter: () => FinancePresenter;
  createUserManagementPresenter: () => UserManagementPresenter;
  createPersonalPresenter: () => PersonalPresenter;
  createPermissionsPresenter: () => PermissionsPresenter;
}

const DependencyContext = createContext<Dependencies | null>(null);

export const DependencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dependencies = useMemo<Dependencies>(() => {
    // 1. Khởi tạo Infrastructure
    const vehicleRepo = new SupabaseVehicleRepository();
    const staffRepo = new SupabaseStaffRepository();
    const expenseRepo = new SupabaseExpenseRepository();
    const storageRepo = new CloudinaryVehicleStorageRepository();
    const vehicleStaffRepo = new SupabaseVehicleStaffRepository();
    const userRepo = new SupabaseUserRepository();
    const permissionRepo = new SupabasePermissionRepository();
    const authRepo = new SupabaseAuthRepository();
    const vehicleCodeGenerator = new SupabaseVehicleCodeGenerator();

    // 5. Khởi tạo Finance Use Cases
    const finance = {
      getMonthly: new GetMonthlyFinance(expenseRepo, vehicleRepo, staffRepo),
      getOverview: new GetFinancialOverview(expenseRepo, vehicleRepo, staffRepo),
      recordExpense: new RecordExpense(staffRepo, vehicleRepo, expenseRepo),
    };

    // 2. Khởi tạo Inventory Use Cases
    const inventory = {
      getList: new GetInventoryList(vehicleRepo),
      updateStatus: new UpdateVehicleStatus(vehicleRepo),
      deleteVehicle: new DeleteVehicle(vehicleRepo, storageRepo),
      addVehicle: new AddVehicle(vehicleRepo, vehicleCodeGenerator),
      getNextCode: new GetNextVehicleCode(vehicleCodeGenerator),
      addPurchasePayment: new AddPurchasePayment(vehicleRepo),
      addSalePayment: new AddSalePayment(vehicleRepo),
      cancelSale: new CancelSale(vehicleRepo),
      updateVehicle: new UpdateVehicle(vehicleRepo, expenseRepo, staffRepo),
      deleteCost: new DeleteVehicleCost(vehicleRepo, staffRepo),
      service: new VehicleService(vehicleRepo, vehicleStaffRepo),
    };

    // 3. Khởi tạo Staff Use Cases
    const staff = {
      getList: new GetStaffList(staffRepo, vehicleRepo),
      add: new AddStaff(staffRepo),
      update: new UpdateStaff(staffRepo),
      delete: new DeleteStaff(staffRepo),
      toggleReimbursement: new ToggleStaffExpenseReimbursement(staffRepo),
      deleteExpense: new DeleteStaffExpense(staffRepo, vehicleRepo),
      updateExpense: new UpdateStaffExpense(staffRepo, vehicleRepo),
      reimburseExpenses: new ReimburseStaffExpenses(staffRepo),
    };

    // 4. Khởi tạo Payroll Use Cases
    const payroll = {
      processSalary: new ProcessSalaryPayment(staffRepo, expenseRepo, vehicleRepo),
      cancelSalary: new CancelSalaryPayment(staffRepo, expenseRepo, vehicleRepo),
    };

    // 6. Presenter Factories
    const createInventoryPresenter = () => {
      const listPresenter = new InventoryListPresenter(
        inventory.getList,
        staffRepo
      );
      const actionPresenter = new VehicleActionPresenter(
        inventory.updateStatus,
        inventory.deleteVehicle,
        inventory.updateVehicle,
        inventory.getNextCode
      );
      const transactionPresenter = new VehicleTransactionPresenter(
        finance.recordExpense,
        inventory.addPurchasePayment,
        inventory.addSalePayment,
        inventory.cancelSale,
        inventory.deleteCost
      );

      return new InventoryPresenter(
        listPresenter,
        actionPresenter,
        transactionPresenter
      );
    };

    const createStaffPresenter = () => {
      const listPresenter = new StaffListPresenter(staff.getList, vehicleRepo);
      const actionPresenter = new StaffActionPresenter(
        staff.add,
        staff.update,
        staff.delete
      );
      const expensePresenter = new StaffExpensePresenter(
        finance.recordExpense,
        staff.toggleReimbursement,
        staff.deleteExpense,
        staff.updateExpense,
        staff.reimburseExpenses
      );
      const payrollPresenter = new PayrollPresenter(
        payroll.processSalary,
        payroll.cancelSalary
      );

      return new StaffPresenter(
        listPresenter,
        actionPresenter,
        expensePresenter,
        payrollPresenter,
        inventory.updateVehicle
      );
    };

    const createFinancePresenter = () => new FinancePresenter(
      finance.getMonthly,
      finance.getOverview,
      expenseRepo,
      vehicleRepo,
      staffRepo,
      finance.recordExpense,
      notificationService
    );

    const createUserManagementPresenter = () => new UserManagementPresenter(userRepo);

    const createPersonalPresenter = () => new PersonalPresenter(vehicleRepo);

    const createPermissionsPresenter = () => new PermissionsPresenter(permissionRepo, notificationService);

    return {
      vehicleRepo,
      staffRepo,
      expenseRepo,
      storageRepo,
      vehicleStaffRepo,
      userRepo,
      inventory,
      staff,
      payroll,
      finance,
      createInventoryPresenter,
      createStaffPresenter,
      createFinancePresenter,
      createUserManagementPresenter,
      createPersonalPresenter,
      createPermissionsPresenter,
      permissionRepo,
      authRepo
    };
  }, []);

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
};

/**
 * Hook để sử dụng dependencies trong các React components/hooks khác.
 */
export const useDependencies = () => {
  const context = useContext(DependencyContext);
  if (!context) {
    throw new Error('useDependencies must be used within a DependencyProvider');
  }
  return context;
};
