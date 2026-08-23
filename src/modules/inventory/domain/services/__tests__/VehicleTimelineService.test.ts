import { describe, it, expect } from 'vitest';
import { VehicleTimelineService } from '../VehicleTimelineService';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus } from '@/src/shared/domain/constants';

describe('VehicleTimelineService', () => {
  const mockVehicle: Vehicle = {
    id: 101,
    code: 'VH2308-03',
    name: 'LIMO GREEN',
    status: VehicleStatus.SOLD,
    year: '2025',
    image_url: '',
    images: [],
    purchase_price: 550_000_000,
    purchase_date: '2026-08-10',
    sale_price: 600_000_000,
    sale_date: '2026-08-23',
    received_amount: 600_000_000,
    total_cost: 5_000_000,
    is_pinned: false,
    is_coinvested: false,
    history: [
      {
        date: '2026-08-10',
        status: VehicleStatus.DEPOSIT_BUY,
        user: 'Hệ thống',
        note: 'Khởi tạo xe mới (Cọc mua)'
      },
      {
        date: '2026-08-23',
        status: VehicleStatus.IN_STOCK,
        user: 'NV - KTĐAN',
        note: 'Hoàn tất mua - Nhập kho chờ bán'
      },
      {
        date: '2026-08-23',
        status: VehicleStatus.DEPOSIT_SALE,
        user: 'NV - NCVINH',
        note: 'Thanh toán: 10.000.000đ. Giao dịch Cọc trả thẳng'
      },
      {
        date: '2026-08-23',
        status: VehicleStatus.DEPOSIT_SALE,
        user: 'NV - NCVINH',
        note: 'Thanh toán: 570.000.000đ. Thanh toán lần 2'
      },
      {
        date: '2026-08-23',
        status: VehicleStatus.SOLD,
        user: 'NV - NCVINH',
        note: 'Thanh toán: 20.000.000đ. Thanh toán lần 3'
      }
    ],
    purchase_payment_history: [
      {
        date: '2026-08-10',
        amount: 50_000_000,
        note: 'Cọc mua xe từ chủ cũ',
        receiver: 'Anh Nam (Chủ xe)',
        staff_id: 'NV01',
        staff_expense_id: ''
      },
      {
        date: '2026-08-23',
        amount: 500_000_000,
        note: 'Tất toán tiền lấy xe về kho',
        receiver: 'Anh Nam (Chủ xe)',
        staff_id: 'KT01',
        staff_expense_id: ''
      }
    ],
    cost_history: [
      {
        date: '2026-08-15',
        amount: 5_000_000,
        note: 'Spa đánh bóng & dọn nội thất',
        staff_id: 'KT01',
        staff_expense_id: 'EXP-01'
      }
    ],
    sale_payment_history: [
      {
        date: '2026-08-23',
        amount: 10_000_000,
        note: 'Cọc trả thẳng',
        receiver: 'NV - NCVINH',
        staff_id: 'NV - NCVINH',
        staff_expense_id: ''
      },
      {
        date: '2026-08-23',
        amount: 570_000_000,
        note: 'Thanh toán lần 2',
        receiver: 'NV - NCVINH',
        staff_id: 'NV - NCVINH',
        staff_expense_id: ''
      },
      {
        date: '2026-08-23',
        amount: 20_000_000,
        note: 'Thanh toán lần 3',
        receiver: 'NV - NCVINH',
        staff_id: 'NV - NCVINH',
        staff_expense_id: ''
      }
    ]
  };

  it('phải tổng hợp đầy đủ các sự kiện trạng thái, chi mua xe, chi phí spa và thu bán', () => {
    const timeline = VehicleTimelineService.buildUnifiedTimeline(mockVehicle);

    // Kiểm tra có đầy đủ các loại sự kiện
    const incomeEvents = timeline.filter(e => e.category === 'income');
    const expenseEvents = timeline.filter(e => e.category === 'expense');
    const statusEvents = timeline.filter(e => e.category === 'status');

    expect(incomeEvents.length).toBeGreaterThanOrEqual(3);
    expect(expenseEvents.length).toBe(3); // 2 đợt chi mua + 1 chi phí spa
    expect(statusEvents.length).toBeGreaterThanOrEqual(2); // Cọc mua + Nhập kho
  });

  it('phải lọc chính xác theo danh mục (category)', () => {
    const timeline = VehicleTimelineService.buildUnifiedTimeline(mockVehicle);

    const onlyIncome = VehicleTimelineService.filterEvents(timeline, 'income');
    const onlyExpense = VehicleTimelineService.filterEvents(timeline, 'expense');
    const onlyStatus = VehicleTimelineService.filterEvents(timeline, 'status');
    const all = VehicleTimelineService.filterEvents(timeline, 'all');

    expect(onlyIncome.every(e => e.category === 'income')).toBe(true);
    expect(onlyExpense.every(e => e.category === 'expense')).toBe(true);
    expect(onlyStatus.every(e => e.category === 'status')).toBe(true);
    expect(all.length).toBe(timeline.length);
  });

  it('phải tính toán chính xác tổng thu, tổng chi và dòng tiền ròng', () => {
    const timeline = VehicleTimelineService.buildUnifiedTimeline(mockVehicle);
    const summary = VehicleTimelineService.calculateFinancialSummary(mockVehicle, timeline);

    expect(summary.totalIncome).toBe(600_000_000);
    expect(summary.totalExpense).toBe(555_000_000); // 550M mua + 5M spa
    expect(summary.netCashFlow).toBe(45_000_000);
  });
});
