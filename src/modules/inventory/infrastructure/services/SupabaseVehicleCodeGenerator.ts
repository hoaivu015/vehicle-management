import { supabase } from '../../../../shared/infrastructure/supabase';
import { VehicleCodeGenerator } from '../../domain/services/VehicleCodeGenerator';

export class SupabaseVehicleCodeGenerator implements VehicleCodeGenerator {
  private readonly tableName = 'vehicles';

  async generate(date: Date): Promise<string> {
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `VH${dd}${mm}-`;

    // Lấy tất cả mã xe bắt đầu bằng prefix của ngày hôm nay
    const { data, error } = await supabase
      .from(this.tableName)
      .select('code')
      .like('code', `${prefix}%`);

    if (error) throw error;

    let nextNN = 1;
    if (data && data.length > 0) {
      // Tìm số thứ tự lớn nhất trong ngày bằng cách parse số
      const numbers = data.map(item => {
        const parts = item.code.split('-');
        const lastPart = parts[parts.length - 1];
        return parseInt(lastPart);
      }).filter(n => !isNaN(n));

      if (numbers.length > 0) {
        nextNN = Math.max(...numbers) + 1;
      }
    }

    // Trả về định dạng VHDDMM-XX (XX tối thiểu 2 chữ số)
    return `${prefix}${nextNN.toString().padStart(2, '0')}`;
  }

  isValid(code: string): boolean {
    // Regex cho VHDDMM-XX (XX có thể nhiều hơn 2 chữ số nếu cần)
    return /^VH\d{4}-\d{2,}$/.test(code);
  }
}
