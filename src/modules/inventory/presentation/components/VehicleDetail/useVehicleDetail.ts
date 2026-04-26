import { useState, useEffect } from 'react';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus, STAFF_CONSTANTS } from '@/src/shared/domain/constants';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';
import { CloudinaryVehicleStorageRepository } from '@/src/modules/inventory/infrastructure/CloudinaryVehicleStorageRepository';
import { VehicleStateMachine } from '@/src/modules/inventory/domain/VehicleStateMachine';

export const useVehicleDetail = (
  vehicle: Vehicle | null,
  userCode: string,
  actions: {
    onUpdateStatus: any;
    onDeleteVehicle: any;
    onUpdateVehicle: any;
    onAddCost: any;
    onDeleteCost: any;
    onPin: any;
    onAddPurchasePayment: any;
    onAddSalePayment: any;
    onCancelSale: any;
  }
) => {
  const [activeTab, setActiveTab] = useState<'info' | 'financials' | 'history' | 'payments_buy' | 'payments_sale'>('info');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Vehicle>>({});
  const [costForm, setCostForm] = useState({ name: '', amount: 0 });
  const [paymentForm, setPaymentForm] = useState<any>({
    amount: 0,
    note: '',
    receiver: userCode,
    seller: userCode,
    buyerName: '',
    commission: vehicle?.commission || 0
  });
  const [transitionStatus, setTransitionStatus] = useState<VehicleStatus | null>(null);
  const [nextStatusInTab, setNextStatusInTab] = useState<VehicleStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelSaleConfirm, setShowCancelSaleConfirm] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const storageRepo = new CloudinaryVehicleStorageRepository();

  const withSubmitState = (fn: Function) => async (...args: any[]) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await fn(...args);
    } catch (error) {
      console.error("Action error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = withSubmitState(actions.onUpdateStatus);
  const handleDeleteVehicle = withSubmitState(actions.onDeleteVehicle);
  const handleUpdateVehicle = withSubmitState(actions.onUpdateVehicle);
  const handleAddCost = withSubmitState(actions.onAddCost);
  const handleDeleteCost = withSubmitState(actions.onDeleteCost);
  const handlePin = withSubmitState(actions.onPin || (() => Promise.resolve()));
  const handleAddPurchasePayment = withSubmitState(actions.onAddPurchasePayment);
  const handleAddSalePayment = withSubmitState(actions.onAddSalePayment);
  const handleCancelSale = withSubmitState(actions.onCancelSale);

  useEffect(() => {
    if (!vehicle) return;
    if (activeTab === 'payments_sale') {
      const validNext = VehicleStateMachine.getValidNextStatuses(vehicle.status as VehicleStatus)
        .filter(s => s !== VehicleStatus.IN_STOCK);
      if (validNext.length > 0 && !nextStatusInTab) {
        setNextStatusInTab(validNext[0] as VehicleStatus);
      }
      if (!paymentForm.salePrice && vehicle.sale_price) {
        setPaymentForm((prev: any) => ({ 
          ...prev, 
          salePrice: vehicle.sale_price || 0,
          seller: vehicle.seller || userCode,
          receiver: vehicle.seller || userCode
        }));
      } else if (vehicle.seller && (paymentForm.seller === userCode || !paymentForm.seller)) {
        setPaymentForm((prev: any) => ({ 
          ...prev, 
          seller: vehicle.seller,
          receiver: vehicle.seller
        }));
      }
    }
  }, [activeTab, vehicle, userCode]);

  const handleStartEdit = () => {
    if (!vehicle) return;
    setEditForm({
      name: vehicle.name,
      year: vehicle.year,
      odo: vehicle.odo,
      color: vehicle.color,
      purchase_price: vehicle.purchase_price,
      sale_price: vehicle.sale_price,
      commission: vehicle.commission,
      buying_commission: vehicle.buying_commission || STAFF_CONSTANTS.DEFAULT_BUYING_COMMISSION,
      buyer: vehicle.buyer,
      coinvestor_code: vehicle.coinvestor_code,
      notes: vehicle.notes,
      image_url: vehicle.image_url,
      seller: vehicle.seller
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!vehicle) return;
    await handleUpdateVehicle(vehicle.id, editForm);
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const publicUrl = await storageRepo.uploadImage(file);
      setEditForm(prev => ({ ...prev, image_url: publicUrl }));
    } catch (err: any) {
      console.error('Image upload failed:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const financials = vehicle ? calculateVehicleFinancials(vehicle) : null;

  return {
    activeTab, setActiveTab,
    isUpdatingStatus, setIsUpdatingStatus,
    isEditing, setIsEditing,
    editForm, setEditForm,
    costForm, setCostForm,
    paymentForm, setPaymentForm,
    transitionStatus, setTransitionStatus,
    nextStatusInTab, setNextStatusInTab,
    isSubmitting,
    showDeleteConfirm, setShowDeleteConfirm,
    showCancelSaleConfirm, setShowCancelSaleConfirm,
    isUploadingImage,
    handleUpdateStatus,
    handleDeleteVehicle,
    handleUpdateVehicle,
    handleAddCost,
    handleDeleteCost,
    handlePin,
    handleAddPurchasePayment,
    handleAddSalePayment,
    handleCancelSale,
    handleStartEdit,
    handleSaveEdit,
    handleImageUpload,
    financials
  };
};
