import { VehicleRepository } from '../../inventory/domain/VehicleRepository';
import { Vehicle } from '../../../shared/domain/types';

export interface PersonalViewInterface {
  updateVehicles(vehicles: Vehicle[]): void;
  setAllVehicles(vehicles: Vehicle[]): void;
  setLoading(loading: boolean): void;
}

export class PersonalPresenter {
  private view?: PersonalViewInterface;
  private unsubscribe?: () => void;

  constructor(private readonly vehicleRepository: VehicleRepository) {}

  attach(view: PersonalViewInterface) {
    this.view = view;
    this.loadVehicles();
    this.unsubscribe = this.vehicleRepository.subscribe(vehicles => {
      this.view?.setAllVehicles(vehicles);
    });
  }

  detach() {
    this.view = undefined;
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private async loadVehicles() {
    this.view?.setLoading(true);
    try {
      const vehicles = await this.vehicleRepository.getAll();
      this.view?.setAllVehicles(vehicles);
    } catch (err) {
      console.error('Error loading vehicles in PersonalPresenter:', err);
    } finally {
      this.view?.setLoading(false);
    }
  }
}
