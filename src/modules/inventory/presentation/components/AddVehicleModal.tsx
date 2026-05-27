import React from 'react';
import { BaseModal as Modal } from '@/src/shared/design-system/BaseModal';
import { AddVehicleForm } from './AddVehicle/AddVehicleForm';

import { Staff } from '@/src/shared/domain/types';
import { AddVehicleRequest } from '../../application/AddVehicle';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddVehicleRequest) => Promise<void>;
  staffList: Staff[];
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onSubmit, staffList }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      maxWidth="7xl" 
      title="Thêm xe mới"
      subtitle="Hệ thống quản lý phương tiện"
      className="h-[90vh] lg:h-auto max-h-[90vh] md:max-h-[820px]"
    >
      <AddVehicleForm 
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        staffList={staffList}
      />
    </Modal>
  );
};

