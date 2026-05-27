export interface VehicleCodeGenerator {
  /**
   * Tạo mã xe tiếp theo dựa trên ngày hiện tại và số thứ tự trong ngày.
   * Định dạng: VHDDMM-XX (Ví dụ: VH1405-01)
   */
  generate(date: Date): Promise<string>;

  /**
   * Kiểm tra định dạng mã xe có hợp lệ không.
   */
  isValid(code: string): boolean;
}
