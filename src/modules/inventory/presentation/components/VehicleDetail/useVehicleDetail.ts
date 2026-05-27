import { useState } from 'react';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus, STAFF_CONSTANTS } from '@/src/shared/domain/constants';
import { useNotification } from '@/src/shared/presentation/useNotification';
import { useDependencies } from '@/src/shared/ioc/DependencyContext';
import { useVehicleFinancials, PaymentFormState } from './useVehicleFinancials';
import { haptics } from '@/src/shared/utils/haptics';

interface VehicleDetailActions {
  onUpdateStatus: (id: number, status: VehicleStatus, extra?: Record<string, unknown>) => Promise<void>;
  onDeleteVehicle: (id: number) => Promise<void>;
  onUpdateVehicle: (id: number, data: Partial<Vehicle>) => Promise<void>;
  onAddCost: (id: number, name: string, amount: number) => Promise<void>;
  onDeleteCost: (id: number, costIndex: number) => Promise<void>;
  onPin: (id: number, isPinned: boolean) => Promise<void>;
  onAddPurchasePayment: (id: number, amount: number, note: string, receiver: string) => Promise<void>;
  onAddSalePayment: (id: number, amount: number, note: string, receiver: string, nextStatus: VehicleStatus, seller: string, buyerName?: string, salePrice?: number, commission?: number, buyingBonus?: number) => Promise<void>;
  onCancelSale: (id: number, code: string) => Promise<void>;
}

export type { PaymentFormState };

export const useVehicleDetail = (
  vehicle: Vehicle | null,
  userCode: string,
  actions: VehicleDetailActions
) => {
  const { storageRepo } = useDependencies();
  const notification = useNotification();
  const [activeTab, setActiveTab] = useState<'info' | 'financials' | 'history'>('info');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Vehicle>>({});
  const [transitionStatus, setTransitionStatus] = useState<VehicleStatus | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [isSubmittingDetail, setIsSubmittingDetail] = useState(false);

  // Hook composition: delegate financials and transactions to useVehicleFinancials hook
  const {
    financials,
    purchaseDebt,
    saleDebt,
    isSubmitting: isSubmittingFinancials,
    paymentForm,
    setPaymentForm,
    nextStatusInTab,
    setNextStatusInTab,
    showCancelSaleConfirm,
    setShowCancelSaleConfirm,
    handleAddCost,
    handleDeleteCost,
    handleAddPurchasePayment,
    handleAddSalePayment,
    handleCancelSale
  } = useVehicleFinancials({
    vehicle,
    userCode,
    onAddCost: actions.onAddCost,
    onDeleteCost: actions.onDeleteCost,
    onAddPurchasePayment: actions.onAddPurchasePayment,
    onAddSalePayment: actions.onAddSalePayment,
    onCancelSale: actions.onCancelSale
  });

  const isSubmitting = isSubmittingDetail || isSubmittingFinancials;

  const handleUpdateStatus = async (id: number, status: VehicleStatus, extra?: Record<string, unknown>) => {
    setIsSubmittingDetail(true);
    try {
      await actions.onUpdateStatus(id, status, extra);
      haptics.success();
    } finally {
      setIsSubmittingDetail(false);
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    setIsSubmittingDetail(true);
    try {
      await actions.onDeleteVehicle(id);
      haptics.success();
    } finally {
      setIsSubmittingDetail(false);
    }
  };

  const handleUpdateVehicle = async (id: number, data: Partial<Vehicle>) => {
    setIsSubmittingDetail(true);
    try {
      await actions.onUpdateVehicle(id, data);
      haptics.success();
    } finally {
      setIsSubmittingDetail(false);
    }
  };

  const handlePin = async (id: number, isPinned: boolean) => {
    setIsSubmittingDetail(true);
    try {
      await (actions.onPin || (() => Promise.resolve()))(id, isPinned);
      haptics.success();
    } finally {
      setIsSubmittingDetail(false);
    }
  };

  const handleTabChange = (tab: 'info' | 'financials' | 'history') => {
    setActiveTab(tab);
  };

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
      seller: vehicle.seller,
      buying_bonus: vehicle.buying_bonus,
      buying_bonus_paid: vehicle.buying_bonus_paid,
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
      haptics.success();
    } catch (err: unknown) {
      notification.error('Tải ảnh thất bại');
      console.error('Image upload failed:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  return {
    activeTab, setActiveTab: handleTabChange,
    isUpdatingStatus, setIsUpdatingStatus,
    isEditing, setIsEditing,
    editForm, setEditForm,
    costForm: { name: '', amount: 0 }, // Backwards compatibility placeholder
    setCostForm: () => {}, // Backwards compatibility placeholder
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
    financials,
    purchaseDebt,
    saleDebt
  };
};
