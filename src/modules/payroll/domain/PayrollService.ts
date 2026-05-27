
export class PayrollService {
  /**
   * Tạo thông tin định danh cho phiếu chi lương để đảm bảo SSOT và tính bất biến (Technical Debt protection)
   */
  static getSalaryExpenseDetails(staffCode: string, staffName: string, monthStr: string) {
    return {
      name: `Chi lương tháng ${monthStr} - ${staffName} (${staffCode})`,
      category: 'Lương nhân sự'
    };
  }
}
