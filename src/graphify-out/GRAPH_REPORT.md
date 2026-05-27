# Graph Report - src  (2026-05-22)

## Corpus Check
- 258 files · ~84,652 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 779 nodes · 622 edges · 63 communities detected
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 81|Community 81]]

## God Nodes (most connected - your core abstractions)
1. `InventoryPresenter` - 26 edges
2. `StaffPresenter` - 21 edges
3. `SupabaseVehicleRepository` - 18 edges
4. `SupabaseStaffRepository` - 16 edges
5. `VehicleEntity` - 15 edges
6. `InventoryListPresenter` - 12 edges
7. `FinancePresenter` - 12 edges
8. `StaffEntity` - 11 edges
9. `PermissionService` - 10 edges
10. `useDependencies()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `useIsMobile()` --calls--> `PersonalView()`  [INFERRED]
  shared/presentation/hooks/useIsMobile.ts → modules/personal/presentation/PersonalView.tsx
- `useIsMobile()` --calls--> `InventoryPage()`  [INFERRED]
  shared/presentation/hooks/useIsMobile.ts → modules/inventory/presentation/InventoryPage.tsx
- `useIsMobile()` --calls--> `CashflowPage()`  [INFERRED]
  shared/presentation/hooks/useIsMobile.ts → modules/finance/presentation/CashflowPage.tsx
- `useIsMobile()` --calls--> `StaffPage()`  [INFERRED]
  shared/presentation/hooks/useIsMobile.ts → modules/staff/presentation/StaffPage.tsx
- `useDependencies()` --calls--> `useFinance()`  [INFERRED]
  shared/ioc/DependencyContext.tsx → modules/finance/presentation/useFinance.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (14): VehicleDetailModal(), useUnifiedExpense(), useUserManagement(), useDependencies(), useActionResponse(), useAuth(), useFinance(), useInventoryState() (+6 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (8): UpdateVehicle, VehicleEntity, calcProfitShare(), calculateAgingDays(), calculateVehicleFinancials(), isVehicleAging(), FinancialsTab(), useVehicleFinancials()

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (1): InventoryPresenter

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (1): StaffPresenter

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (9): GetFinancialOverview, StaffSalaryService, calcCompanyMonthlyNetProfit(), calcGrossProfit(), calcKPICompletion(), calcKPIMultiplier(), calcStaffTotalCommissions(), calcTotalCapitalNeeded() (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.18
Nodes (1): SupabaseVehicleRepository

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (1): SupabaseStaffRepository

### Community 7 - "Community 7"
Cohesion: 0.19
Nodes (1): InventoryListPresenter

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (1): FinancePresenter

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (1): StaffEntity

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (5): DomainError, EntityNotFoundError, FinancialConstraintError, InvalidStatusTransitionError, UnauthorizedError

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (1): PermissionService

### Community 12 - "Community 12"
Cohesion: 0.2
Nodes (5): useIsMobile(), CashflowPage(), InventoryPage(), PersonalView(), StaffPage()

### Community 13 - "Community 13"
Cohesion: 0.2
Nodes (1): FinanceService

### Community 14 - "Community 14"
Cohesion: 0.31
Nodes (5): AddStaff, fuzzyMatch(), generateStaffCode(), normalizeString(), removeAccents()

### Community 15 - "Community 15"
Cohesion: 0.25
Nodes (1): UserManagementPresenter

### Community 16 - "Community 16"
Cohesion: 0.28
Nodes (1): SupabaseExpenseRepository

### Community 17 - "Community 17"
Cohesion: 0.39
Nodes (1): SonnerNotificationService

### Community 18 - "Community 18"
Cohesion: 0.25
Nodes (2): handleInputChange(), parseSmartInput()

### Community 19 - "Community 19"
Cohesion: 0.25
Nodes (1): SupabaseAuthRepository

### Community 20 - "Community 20"
Cohesion: 0.25
Nodes (1): VehicleTransactionPresenter

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (1): VehicleActionPresenter

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (1): StaffExpensePresenter

### Community 23 - "Community 23"
Cohesion: 0.29
Nodes (2): RecordExpense, generateUUID()

### Community 26 - "Community 26"
Cohesion: 0.33
Nodes (1): FeatureFlagService

### Community 27 - "Community 27"
Cohesion: 0.38
Nodes (2): ModuleRegistry, registerModule()

### Community 28 - "Community 28"
Cohesion: 0.29
Nodes (1): SupabaseUserRepository

### Community 29 - "Community 29"
Cohesion: 0.38
Nodes (4): handleTabChange(), handleDashboardAction(), onInventoryClick(), setActiveTab()

### Community 30 - "Community 30"
Cohesion: 0.29
Nodes (1): GetInventoryList

### Community 31 - "Community 31"
Cohesion: 0.29
Nodes (2): CancelSalaryPayment, ProcessSalaryPayment

### Community 32 - "Community 32"
Cohesion: 0.4
Nodes (1): PersonalPresenter

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (1): VehicleStateMachine

### Community 34 - "Community 34"
Cohesion: 0.47
Nodes (1): PayrollPresenter

### Community 35 - "Community 35"
Cohesion: 0.33
Nodes (1): StaffActionPresenter

### Community 36 - "Community 36"
Cohesion: 0.4
Nodes (2): InventoryPerformanceBar(), formatCurrency()

### Community 38 - "Community 38"
Cohesion: 0.4
Nodes (1): ErrorBoundary

### Community 40 - "Community 40"
Cohesion: 0.5
Nodes (1): PermissionsPresenter

### Community 41 - "Community 41"
Cohesion: 0.4
Nodes (1): VehicleService

### Community 42 - "Community 42"
Cohesion: 0.4
Nodes (1): SupabaseVehicleStaffRepository

### Community 43 - "Community 43"
Cohesion: 0.4
Nodes (1): StaffListPresenter

### Community 44 - "Community 44"
Cohesion: 0.5
Nodes (1): EventBus

### Community 46 - "Community 46"
Cohesion: 0.5
Nodes (1): SupabasePermissionRepository

### Community 47 - "Community 47"
Cohesion: 0.5
Nodes (1): AddPurchasePayment

### Community 48 - "Community 48"
Cohesion: 0.5
Nodes (1): DeleteVehicle

### Community 49 - "Community 49"
Cohesion: 0.5
Nodes (1): AddSalePayment

### Community 50 - "Community 50"
Cohesion: 0.5
Nodes (1): DeleteVehicleCost

### Community 51 - "Community 51"
Cohesion: 0.5
Nodes (1): AddVehicle

### Community 52 - "Community 52"
Cohesion: 0.5
Nodes (1): GetNextVehicleCode

### Community 53 - "Community 53"
Cohesion: 0.5
Nodes (1): CancelSale

### Community 54 - "Community 54"
Cohesion: 0.5
Nodes (1): UpdateVehicleStatus

### Community 55 - "Community 55"
Cohesion: 0.5
Nodes (1): CloudinaryVehicleStorageRepository

### Community 56 - "Community 56"
Cohesion: 0.5
Nodes (1): SupabaseVehicleCodeGenerator

### Community 57 - "Community 57"
Cohesion: 0.5
Nodes (1): GetMonthlyFinance

### Community 58 - "Community 58"
Cohesion: 0.5
Nodes (1): ReimburseStaffExpenses

### Community 59 - "Community 59"
Cohesion: 0.5
Nodes (1): ToggleStaffExpenseReimbursement

### Community 60 - "Community 60"
Cohesion: 0.5
Nodes (1): UpdateStaffExpense

### Community 61 - "Community 61"
Cohesion: 0.5
Nodes (1): DeleteStaffExpense

### Community 62 - "Community 62"
Cohesion: 0.5
Nodes (1): DeleteStaff

### Community 63 - "Community 63"
Cohesion: 0.5
Nodes (1): GetStaffList

### Community 64 - "Community 64"
Cohesion: 0.5
Nodes (1): UpdateStaff

### Community 65 - "Community 65"
Cohesion: 0.67
Nodes (2): fetchAccounts(), handleUpdatePassword()

### Community 69 - "Community 69"
Cohesion: 1.0
Nodes (2): createCrudUseCases(), createSimpleUseCase()

### Community 81 - "Community 81"
Cohesion: 0.67
Nodes (1): PayrollService

## Knowledge Gaps
- **Thin community `Community 2`** (27 nodes): `InventoryPresenter.ts`, `InventoryPresenter`, `.addPurchasePayment()`, `.addSalePayment()`, `.addVehicleCost()`, `.attachView()`, `.cancelSale()`, `.constructor()`, `.deleteVehicle()`, `.deleteVehicleCost()`, `.detachView()`, `.filter()`, `.filterCriteria()`, `.getNextVehicleCode()`, `.loadAvailable()`, `.loadDepartment()`, `.loadInventory()`, `.loadPersonal()`, `.loadSold()`, `.recordExpense()`, `.refreshCurrentView()`, `.search()`, `.searchQueryValue()`, `.subscribeToChanges()`, `.togglePin()`, `.updateVehicle()`, `.updateVehicleStatus()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 3`** (22 nodes): `StaffPresenter.ts`, `StaffPresenter`, `.addStaff()`, `.addStaffExpense()`, `.attachView()`, `.cancelSalary()`, `.constructor()`, `.deleteExpense()`, `.deleteStaff()`, `.detachView()`, `.filterStaff()`, `.loadStaff()`, `.loadVehicles()`, `.paySalary()`, `.recordExpense()`, `.reimburseMultiple()`, `.subscribeToChanges()`, `.toggleReimbursement()`, `.toggleSalaryPayment()`, `.updateExpense()`, `.updateStaff()`, `.updateVehicle()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (19 nodes): `SupabaseVehicleRepository`, `.addPurchasePayment()`, `.addSalePayment()`, `._applyStatusTransition()`, `.cancelSale()`, `.create()`, `.delete()`, `.getAll()`, `.getAvailableVehicles()`, `.getByCode()`, `.getById()`, `.getSoldVehiclesByMonth()`, `.getVehiclesByCodes()`, `.getVehiclesByStaff()`, `._sanitize()`, `.subscribe()`, `.update()`, `.updateStatus()`, `SupabaseVehicleRepository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (17 nodes): `SupabaseStaffRepository`, `.addSalaryPayout()`, `.create()`, `.delete()`, `.deleteAccountByCode()`, `.deleteSalaryPayout()`, `.getAccounts()`, `.getAll()`, `.getByCode()`, `.getByEmail()`, `.getById()`, `.getCodesByDepartment()`, `.registerUser()`, `._sanitize()`, `.update()`, `.updateAccountPassword()`, `SupabaseStaffRepository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (13 nodes): `InventoryListPresenter.ts`, `InventoryListPresenter`, `.applyFilters()`, `.constructor()`, `.filter()`, `.filterCriteria()`, `.loadAvailable()`, `.loadDepartment()`, `.loadPersonal()`, `.loadSold()`, `.search()`, `.searchQueryValue()`, `.sortVehicles()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (13 nodes): `FinancePresenter.ts`, `FinancePresenter`, `.addExpense()`, `.constructor()`, `.deleteExpense()`, `.detachView()`, `.loadFinanceData()`, `.recordExpense()`, `.recordShowroomExpense()`, `.setMonth()`, `.subscribeToChanges()`, `.updateCapital()`, `.updateExpense()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (12 nodes): `StaffEntity`, `.baseSalary()`, `.calculateSalary()`, `.code()`, `.commissionPerCar()`, `.constructor()`, `.id()`, `.name()`, `.role()`, `.target()`, `.toRaw()`, `StaffEntity.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (11 nodes): `PermissionService`, `.can()`, `.canDeleteVehicle()`, `.canManageVehicle()`, `.canSeeAllData()`, `.canSeeFinancials()`, `.hasPermission()`, `.isAdmin()`, `.isRelatedToVehicle()`, `.setDynamicPermissions()`, `PermissionService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (10 nodes): `FinanceService`, `.calculateMonthlyCarCosts()`, `.calculateMonthlyPartnerPayouts()`, `.calculateMonthlyPurchaseOutflow()`, `.calculateMonthlyRevenue()`, `.calculateMonthlySalaries()`, `.calculateMonthlySalesProfit()`, `.calculateTotalCashBalance()`, `.calculateWeeklyCashflow()`, `FinanceService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (9 nodes): `UserManagementPresenter.ts`, `UserManagementPresenter`, `.addUser()`, `.attach()`, `.constructor()`, `.deleteUser()`, `.detach()`, `.loadUsers()`, `.updateUser()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (9 nodes): `SupabaseExpenseRepository`, `.add()`, `.delete()`, `.deleteByNameAndCategory()`, `.getAll()`, `.getCompanySettings()`, `.update()`, `.updateCapital()`, `SupabaseExpenseRepository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (8 nodes): `SonnerNotificationService`, `.error()`, `.info()`, `.setRenderer()`, `.show()`, `.success()`, `.warning()`, `SonnerNotificationService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (8 nodes): `clearInput()`, `cn()`, `handleBlur()`, `handleFocus()`, `handleInputChange()`, `SmartAmountInput.tsx`, `numberParser.ts`, `parseSmartInput()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (8 nodes): `SupabaseAuthRepository`, `.getSessionUserEmail()`, `.onAuthStateChange()`, `.signIn()`, `.signOut()`, `.signUp()`, `.updatePassword()`, `SupabaseAuthRepository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (8 nodes): `VehicleTransactionPresenter.ts`, `VehicleTransactionPresenter`, `.addPurchasePayment()`, `.addSalePayment()`, `.addVehicleCost()`, `.cancelSale()`, `.constructor()`, `.deleteVehicleCost()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (8 nodes): `VehicleActionPresenter.ts`, `VehicleActionPresenter`, `.constructor()`, `.deleteVehicle()`, `.getNextVehicleCode()`, `.togglePin()`, `.updateVehicle()`, `.updateVehicleStatus()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (8 nodes): `StaffExpensePresenter.ts`, `StaffExpensePresenter`, `.addStaffExpense()`, `.constructor()`, `.deleteExpense()`, `.reimburseMultiple()`, `.toggleReimbursement()`, `.updateExpense()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (7 nodes): `RecordExpense`, `.constructor()`, `.execute()`, `RecordExpense.ts`, `stringUtils.ts`, `generateUUID()`, `removeVietnameseTones()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (7 nodes): `FeatureFlagService`, `.constructor()`, `.getAllFlags()`, `.isEnabled()`, `.loadFlags()`, `.setFlag()`, `FeatureFlagService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (7 nodes): `ModuleRegistry`, `.constructor()`, `.getDependencies()`, `.getInstance()`, `.register()`, `registerModule()`, `ModuleRegistry.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (7 nodes): `SupabaseUserRepository`, `.add()`, `.delete()`, `.getAll()`, `.subscribe()`, `.update()`, `SupabaseUserRepository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (7 nodes): `GetInventoryList`, `.constructor()`, `.getAvailable()`, `.getDepartment()`, `.getPersonal()`, `.getSold()`, `GetInventoryList.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (7 nodes): `CancelSalaryPayment`, `.constructor()`, `.execute()`, `ProcessSalaryPayment`, `.constructor()`, `.execute()`, `ProcessSalaryPayment.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (6 nodes): `PersonalPresenter.ts`, `PersonalPresenter`, `.attach()`, `.constructor()`, `.detach()`, `.loadVehicles()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (6 nodes): `VehicleStateMachine`, `.canTransition()`, `.getFieldsToReset()`, `.getValidNextStatuses()`, `.isSalePhase()`, `VehicleStateMachine.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (6 nodes): `PayrollPresenter.ts`, `PayrollPresenter`, `.cancelSalary()`, `.constructor()`, `.paySalary()`, `.toggleSalaryPayment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (6 nodes): `StaffActionPresenter.ts`, `StaffActionPresenter`, `.addStaff()`, `.constructor()`, `.deleteStaff()`, `.updateStaff()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (5 nodes): `InventoryPerformanceBar()`, `InventoryPerformanceBar.tsx`, `numberFormatter.ts`, `formatCurrency()`, `numberToVietnameseText()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (5 nodes): `ErrorBoundary`, `.componentDidCatch()`, `.getDerivedStateFromError()`, `.render()`, `ErrorBoundary.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (5 nodes): `PermissionsPresenter.ts`, `PermissionsPresenter`, `.constructor()`, `.loadPermissions()`, `.savePermissions()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (5 nodes): `VehicleService`, `.constructor()`, `.deleteVehicle()`, `.updateVehicle()`, `VehicleService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (5 nodes): `SupabaseVehicleStaffRepository`, `.assignVehicleToStaff()`, `.getStaffName()`, `.removeFromStaffTracking()`, `SupabaseVehicleStaffRepository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (5 nodes): `StaffListPresenter.ts`, `StaffListPresenter`, `.constructor()`, `.filterStaff()`, `.loadVehicles()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (4 nodes): `EventBus`, `.publish()`, `.subscribe()`, `EventBus.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (4 nodes): `SupabasePermissionRepository`, `.getAllPermissions()`, `.upsertPermissions()`, `SupabasePermissionRepository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (4 nodes): `AddPurchasePayment`, `.constructor()`, `.execute()`, `AddPurchasePayment.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (4 nodes): `DeleteVehicle`, `.constructor()`, `.execute()`, `DeleteVehicle.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (4 nodes): `AddSalePayment`, `.constructor()`, `.execute()`, `AddSalePayment.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (4 nodes): `DeleteVehicleCost`, `.constructor()`, `.execute()`, `DeleteVehicleCost.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (4 nodes): `AddVehicle`, `.constructor()`, `.execute()`, `AddVehicle.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (4 nodes): `GetNextVehicleCode`, `.constructor()`, `.execute()`, `GetNextVehicleCode.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (4 nodes): `CancelSale`, `.constructor()`, `.execute()`, `CancelSale.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (4 nodes): `UpdateVehicleStatus`, `.constructor()`, `.execute()`, `UpdateVehicleStatus.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (4 nodes): `CloudinaryVehicleStorageRepository`, `.deleteImage()`, `.uploadImage()`, `CloudinaryVehicleStorageRepository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (4 nodes): `SupabaseVehicleCodeGenerator.ts`, `SupabaseVehicleCodeGenerator`, `.generate()`, `.isValid()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (4 nodes): `GetMonthlyFinance`, `.constructor()`, `.execute()`, `GetMonthlyFinance.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (4 nodes): `ReimburseStaffExpenses`, `.constructor()`, `.execute()`, `ReimburseStaffExpenses.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (4 nodes): `ToggleStaffExpenseReimbursement`, `.constructor()`, `.execute()`, `ToggleStaffExpenseReimbursement.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (4 nodes): `UpdateStaffExpense`, `.constructor()`, `.execute()`, `UpdateStaffExpense.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (4 nodes): `DeleteStaffExpense`, `.constructor()`, `.execute()`, `DeleteStaffExpense.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (4 nodes): `DeleteStaff`, `.constructor()`, `.execute()`, `DeleteStaff.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (4 nodes): `GetStaffList`, `.constructor()`, `.execute()`, `GetStaffList.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (4 nodes): `UpdateStaff`, `.constructor()`, `.execute()`, `UpdateStaff.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (4 nodes): `AccountPage.tsx`, `fetchAccounts()`, `handleUpdatePassword()`, `togglePassword()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (3 nodes): `createCrudUseCases()`, `createSimpleUseCase()`, `UseCaseFactory.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (3 nodes): `PayrollService`, `.getSalaryExpenseDetails()`, `PayrollService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useVehicleFinancials()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `useVehicleDetail()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._