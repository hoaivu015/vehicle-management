import { VehicleRepository } from '../domain/VehicleRepository';

export class GetNextVehicleCode {
  constructor(private readonly repository: VehicleRepository) {}

  async execute(): Promise<string> {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `VH-${yy}${mm}-`;

    const allCars = await this.repository.getAll();
    const codesInMonth = allCars
      .map(c => c.code)
      .filter(code => code?.startsWith(prefix));

    let nextNN = 1;
    if (codesInMonth.length > 0) {
      const numbers = codesInMonth
        .map(code => {
          const parts = code.split('-');
          const lastPart = parts[parts.length - 1];
          return parseInt(lastPart);
        })
        .filter(n => !isNaN(n));
      
      if (numbers.length > 0) {
        nextNN = Math.max(...numbers) + 1;
      }
    }
    
    /**
     * NOTE: This logic is prone to race conditions if multiple users add vehicles simultaneously.
     * Recommendation: Implement a UNIQUE constraint on the 'code' column in Supabase
     * and consider using a database function or sequence for generation.
     */
    return `${prefix}${nextNN.toString().padStart(2, '0')}`;
  }
}
