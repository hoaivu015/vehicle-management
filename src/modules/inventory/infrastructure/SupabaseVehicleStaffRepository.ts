import { supabase } from '../../../shared/infrastructure/supabase';
import { VehicleStaffRepository } from '../domain/VehicleStaffRepository';

export class SupabaseVehicleStaffRepository implements VehicleStaffRepository {
  /**
   * Assign a vehicle to a staff's tracked_cars array in the employees table.
   */
  async assignVehicleToStaff(staffCode: string, vehicleCode: string): Promise<void> {
    try {
      const { data: staff, error: fetchError } = await supabase
        .from('employees')
        .select('tracked_cars')
        .eq('code', staffCode)
        .maybeSingle();

      if (fetchError || !staff) return;

      const currentTracked = staff.tracked_cars || [];
      if (!currentTracked.includes(vehicleCode)) {
        await supabase
          .from('employees')
          .update({ tracked_cars: [...currentTracked, vehicleCode] } as any)
          .eq('code', staffCode);
      }
    } catch (err) {
      console.error('Error in assignVehicleToStaff', err);
    }
  }

  /**
   * Remove vehicle from staff tracking
   */
  async removeFromStaffTracking(vehicleCode: string): Promise<void> {
    try {
      const { data: staffList, error: fetchError } = await supabase
        .from('employees')
        .select('id, code, tracked_cars')
        .contains('tracked_cars', [vehicleCode]);

      if (fetchError || !staffList) return;

      await Promise.all(staffList.map(staff => 
        supabase
          .from('employees')
          .update({ tracked_cars: (staff.tracked_cars || []).filter((c: string) => c !== vehicleCode) } as any)
          .eq('id', staff.id)
      ));
    } catch (err) {
      console.error('Error in removeFromStaffTracking', err);
    }
  }

  /**
   * Get staff name from code
   */
  async getStaffName(staffCode: string): Promise<string> {
    if (!staffCode) return '';
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('name')
        .eq('code', staffCode)
        .maybeSingle();
      return error || !data ? staffCode : data.name;
    } catch (e) {
      return staffCode;
    }
  }
}
