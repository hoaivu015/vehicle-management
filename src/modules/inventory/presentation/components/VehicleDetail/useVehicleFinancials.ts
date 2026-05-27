import { useState, useEffect } from 'react';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus } from '@/src/shared/domain/constants';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';
import { VehicleStateMachine } from '@/src/modules/inventory/domain/VehicleStateMachine';
import { haptics } from '@/src/shared/utils/haptics';

export interface PaymentFormState {
  amount: number;
  note: string;
  receiver: string;
  seller: string;
  buyerName: string;
  commission: number;
  buying_bonus: number;
  salePrice?: number;
}

export interface UseVehicleFinancialsProps {
  vehicle: Vehicle | null;
  userCode: string;
  onAddCost: (id: number, name: string, amount: number) => Promise<void>;
  onDeleteCost: (id: number, index: number) => Promise<void>;
  onAddPurchasePayment: (id: number, amount: number, note: string, receiver: string) => Promise<void>;
  onAddSalePayment: (
    id: number,
    amount: number,
    note: string,
    receiver: string,
    nextStatus: VehicleStatus,
    seller: string,
    buyerName?: string,
    salePrice?: number,
    commission?: number,
    buyingBonus?: number
  ) => Promise<void>;
  onCancelSale: (id: number, userCode: string) => Promise<void>;
}

export const useVehicleFinancials = ({
  vehicle,
  userCode,
  onAddCost,
  onDeleteCost,
  onAddPurchasePayment,
  onAddSalePayment,
  onCancelSale
}: UseVehicleFinancialsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [activeLedger, setActiveLedger] = useState<'purchase' | 'sale'>(
    vehicle && VehicleStateMachine.isSalePhase(vehicle.status) ? 'sale' : 'purchase'
  );
  
  const [isAddingCost, setIsAddingCost] = useState(false);
  const [showCancelSaleConfirm, setShowCancelSaleConfirm] = useState(false);
  const [nextStatusInTab, setNextStatusInTab] = useState<VehicleStatus | null>(null);

  const [purchasePaymentForm, setPurchasePaymentForm] = useState({
    amount: 0,
    note: ''
  });

  const [paymentForm, setPaymentForm] = useState<PaymentFormState>({
    amount: 0,
    note: '',
    receiver: vehicle?.seller || userCode,
    seller: vehicle?.seller || userCode,
    buyerName: '',
    commission: vehicle?.commission || 0,
    buying_bonus: vehicle?.buying_bonus || 0
  });

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: 0,
      note: '',
      receiver: vehicle?.seller || userCode,
      seller: vehicle?.seller || userCode,
      buyerName: '',
      commission: vehicle?.commission || 0,
      buying_bonus: vehicle?.buying_bonus || 0
    });
    setPurchasePaymentForm({
      amount: 0,
      note: ''
    });
  };

  // Automatically update the form parameters when vehicle changes
  useEffect(() => {
    if (!vehicle) return;
    const validNext = VehicleStateMachine.getValidNextStatuses(vehicle.status)
      .filter(s => s !== VehicleStatus.IN_STOCK);
    if (validNext.length > 0) {
      setNextStatusInTab(validNext[0]);
    }

    setPaymentForm(prev => ({
      ...prev,
      salePrice: vehicle.sale_price || 0,
      seller: vehicle.seller || userCode,
      receiver: vehicle.seller || userCode,
      commission: vehicle.commission || 0,
      buying_bonus: vehicle.buying_bonus || 0,
      buyerName: vehicle.customer_name || ''
    }));
  }, [vehicle?.status, vehicle?.sale_price, vehicle?.seller, vehicle?.commission, vehicle?.buying_bonus, vehicle?.customer_name, userCode]);

  const financials = vehicle ? calculateVehicleFinancials(vehicle) : null;
  const purchaseDebt = vehicle && financials ? financials.purchasePrice - (vehicle.purchase_paid_amount || 0) : 0;

  const isSalePhase = vehicle ? [
    VehicleStatus.DEPOSIT_SALE,
    VehicleStatus.BANK_DEPOSIT,
    VehicleStatus.BANK_CONFIRMED,
    VehicleStatus.SOLD
  ].includes(vehicle.status) : false;

  const saleDebt = vehicle && financials && isSalePhase ? (financials.salePrice || 0) - (vehicle.received_amount || 0) : 0;

  // Wrapped actions leveraging the Unified Action Pattern
  const handleAddCost = async (id: number, name: string, amount: number) => {
    setIsSubmitting(true);
    try {
      await onAddCost(id, name, amount);
      haptics.success();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCost = async (id: number, costIndex: number) => {
    setIsSubmitting(true);
    try {
      await onDeleteCost(id, costIndex);
      haptics.success();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPurchasePayment = async (id: number, amount: number, note: string, receiver: string) => {
    setIsSubmitting(true);
    try {
      await onAddPurchasePayment(id, amount, note, receiver);
      haptics.success();
      resetPaymentForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSalePayment = async (
    id: number,
    amount: number,
    note: string,
    receiver: string,
    nextStatus: VehicleStatus,
    seller: string,
    buyerName?: string,
    salePrice?: number,
    commission?: number,
    buyingBonus?: number
  ) => {
    setIsSubmitting(true);
    try {
      await onAddSalePayment(id, amount, note, receiver, nextStatus, seller, buyerName, salePrice, commission, buyingBonus);
      haptics.success();
      resetPaymentForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSale = async (id: number, code: string) => {
    setIsSubmitting(true);
    try {
      await onCancelSale(id, code);
      haptics.success();
      resetPaymentForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    financials,
    activeLedger,
    setActiveLedger,
    purchaseDebt,
    saleDebt,
    isAddingCost,
    setIsAddingCost,
    isSubmitting,
    paymentForm,
    setPaymentForm,
    purchasePaymentForm,
    setPurchasePaymentForm,
    nextStatusInTab,
    setNextStatusInTab,
    showCancelSaleConfirm,
    setShowCancelSaleConfirm,
    handleAddCost,
    handleDeleteCost,
    handleAddPurchasePayment,
    handleAddSalePayment,
    handleCancelSale
  };
};
