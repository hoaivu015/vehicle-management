import { VehicleRepository } from '../../inventory/domain/VehicleRepository';
import { Vehicle } from '../../../shared/domain/types';
import { GetPersonalOverview, PersonalOverviewDTO } from '../application/GetPersonalOverview';

export type { PersonalOverviewDTO };

export interface PersonalViewInterface {
  updateVehicles(vehicles: Vehicle[]): void;
  setAllVehicles(vehicles: Vehicle[]): void;
  setLoading(loading: boolean): void;
  showPersonalOverview?(overview: PersonalOverviewDTO): void;
  showError?(message: string): void;
}

export class PersonalPresenter {
  private view?: PersonalViewInterface;
  private unsubscribe?: () => void;

  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly getPersonalOverview?: GetPersonalOverview
  ) {}

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

  async loadPersonalOverview(identifier: { id?: string | number; code?: string }, monthStr: string) {
    if (!this.getPersonalOverview) return;
    this.view?.setLoading(true);
    try {
      const overview = await this.getPersonalOverview.execute(identifier, monthStr);
      this.view?.showPersonalOverview?.(overview);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi khi tải thông tin cá nhân.';
      this.view?.showError?.(message);
    } finally {
      this.view?.setLoading(false);
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
