import { VehicleCodeGenerator } from '../domain/services/VehicleCodeGenerator';

export class GetNextVehicleCode {
  constructor(private readonly codeGenerator: VehicleCodeGenerator) {}

  async execute(): Promise<string> {
    return this.codeGenerator.generate(new Date());
  }
}
