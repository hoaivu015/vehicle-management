import React from 'react';
import { motion } from 'motion/react';
import { Edit2, Trash2, TrendingUp, Target, ChevronRight, Check, ShieldCheck, ShoppingBag, Calculator } from 'lucide-react';
import { StaffWithSalary } from '@/src/modules/staff/application/GetStaffList';
import { formatCurrency } from '@/src/shared/utils/currency';
import { PermissionService } from '@/src/modules/auth/domain/PermissionService';
import { cn } from '@/src/shared/utils/cn';

import { BaseCard as CardShell, CardContentSection } from '@/src/shared/design-system/BaseCard';
import { haptics } from '@/src/shared/utils/haptics';

interface StaffCardProps {
  member: StaffWithSalary;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetail: (staff: StaffWithSalary) => void;
  onTogglePayment?: () => void;
  isSubmitting?: boolean;
}

export const StaffCard = React.memo<StaffCardProps>(({
  member,
  onEdit,
  onDelete,
  onViewDetail,
  onTogglePayment,
  isSubmitting = false
}) => {
  const isAdmin = PermissionService.isAdmin(member.role);

  // Phân định chính xác Department
  let departmentName = (member.department || '').trim();
  if (!departmentName) {
    if (isAdmin) {
      departmentName = 'Quản trị';
    } else if (
      member.role === 'accountant' || 
      member.role === 'ketoan' || 
      member.name.toLowerCase().includes('kế toán') || 
      (member.code && member.code.toLowerCase().includes('ktoan'))
    ) {
      departmentName = 'Kế toán';
    } else {
      departmentName = 'Kinh doanh';
    }
  }

  // QUY TẮC CỐT LÕI AUTO 28:
  // 1. Chỉ phòng Kinh doanh mới có chỉ tiêu bán xe (Sales KPI)
  // 2. Phòng kinh doanh nếu chưa giao chỉ tiêu thì chỉ tiêu mặc định bằng 1 xe
  const isSalesDepartment = departmentName.toLowerCase().includes('kinh doanh') || 
                            departmentName.toLowerCase().includes('sales');
  
  const salesTarget = isSalesDepartment ? ((member.target && member.target > 0) ? member.target : 1) : 0;
  const soldCount = member.salaryDetails?.soldCount || 0;
  const completionRate = isSalesDepartment ? Math.round((soldCount / salesTarget) * 100) : 0;
  const isHighPerformer = isSalesDepartment && completionRate >= 100;
  const hasBoughtCars = (member.salaryDetails?.boughtCount || 0) > 0;

  return (
    <>
      {/* ── MOBILE LAYOUT: Thẻ ngang Executive Sắc nét, Không Cắt Chữ, Chuẩn Apple ── */}
      <div
        className="md:hidden group bg-white rounded-[20px] border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md p-3.5 flex flex-col gap-2.5 cursor-pointer active:scale-[0.98] transition-all duration-200 native-interactive"
        onClick={() => {
          haptics.light();
          onViewDetail(member);
        }}
      >
        {/* Top row: Avatar + Full-width Identity (Tên chiếm trọn 100% chiều ngang, tuyệt đối không bị cắt chữ) */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar sắc nét với gradient nhận diện */}
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center font-black text-base shadow-sm border border-white/20">
              {member.name.charAt(0)}
            </div>
            {isHighPerformer && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-sm border border-white">
                <TrendingUp size={9} strokeWidth={3} />
              </div>
            )}
            {isAdmin && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-sm border border-white">
                <ShieldCheck size={9} strokeWidth={3} />
              </div>
            )}
          </div>

          {/* Tên nhân viên ở dòng 1 (Full width) & Mã + Phòng ban ở dòng 2 */}
          <div className="min-w-0 flex-1">
            <h3 className="text-[14.5px] font-black text-slate-900 leading-snug tracking-tight">
              {member.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 flex-nowrap">
              <span className="px-1.5 py-0.5 bg-slate-100 rounded-full text-[9px] font-black uppercase tracking-wider text-slate-700 border border-slate-200 whitespace-nowrap">
                #{member.code}
              </span>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight whitespace-nowrap">
                {departmentName}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom row: KPI Tiến độ (Trái) & Thực lĩnh + Trạng thái/Nút Chi (Phải) */}
        {!isAdmin ? (
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
            {/* Cột trái: Tiến độ KPI chuẩn (Kinh doanh luôn >= 1 xe) hoặc Nghiệp vụ / Xe mua */}
            <div className="flex-1 min-w-0 pr-1">
              {isSalesDepartment ? (
                <>
                  <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                    <span className="text-slate-600 uppercase tracking-wider flex items-center gap-1 truncate">
                      <Target size={11} className="text-blue-600 shrink-0" />
                      <span className="font-black text-slate-800">{soldCount}</span>/{salesTarget} xe
                      {hasBoughtCars && (
                        <span className="text-blue-600 font-bold ml-0.5 whitespace-nowrap">
                          (+{member.salaryDetails.boughtCount} mua)
                        </span>
                      )}
                    </span>
                    <span className={cn(
                      "font-black tracking-tight ml-1 whitespace-nowrap",
                      isHighPerformer ? "text-emerald-600" : "text-blue-600"
                    )}>
                      {completionRate}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(completionRate, 100)}%` }}
                      transition={{ duration: 1, ease: "circOut" }}
                      className={cn(
                        "h-full rounded-full",
                        isHighPerformer ? "bg-emerald-500" : "bg-blue-600"
                      )}
                    />
                  </div>
                </>
              ) : hasBoughtCars ? (
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 bg-blue-50/80 text-blue-700 border border-blue-200/80 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                    <ShoppingBag size={11} className="text-blue-600" />
                    Đã mua {member.salaryDetails.boughtCount} xe
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                    {departmentName.toLowerCase().includes('kế toán') ? (
                      <Calculator size={11} className="text-slate-600" />
                    ) : (
                      <Target size={11} className="text-slate-600" />
                    )}
                    {departmentName}
                  </span>
                </div>
              )}
            </div>

            {/* Cột phải: Thực lĩnh + Trạng thái Thanh toán / Nút Chi */}
            <div className="flex items-center gap-2 shrink-0 pl-3 border-l border-slate-100">
              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block leading-none mb-0.5">
                  Thực lĩnh
                </span>
                <span className={cn(
                  "text-sm font-black tracking-tight whitespace-nowrap",
                  member.salaryDetails.isPaid ? "text-emerald-600" : "text-slate-900"
                )}>
                  {formatCurrency(member.salaryDetails.netSalary)}
                </span>
              </div>

              {/* Nút Chi hoặc Badge Trạng Thái Sắc Nét */}
              {onTogglePayment ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (member.salaryDetails.isPaid) haptics.light();
                    else haptics.success();
                    onTogglePayment();
                  }}
                  disabled={isSubmitting}
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm border native-interactive shrink-0",
                    member.salaryDetails.isPaid
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/20"
                      : "bg-slate-100 border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-200"
                  )}
                  title={member.salaryDetails.isPaid ? "Đã chi lương" : "Chưa chi lương"}
                >
                  <Check size={16} strokeWidth={3.5} />
                </motion.button>
              ) : (
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border whitespace-nowrap shrink-0",
                  member.salaryDetails.isPaid
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                )}>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    member.salaryDetails.isPaid ? "bg-emerald-600" : "bg-amber-500"
                  )} />
                  {member.salaryDetails.isPaid ? "Đã chi" : "Chờ chi"}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-slate-500">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck size={12} className="text-slate-700" />
              <span>Quản trị viên hệ thống</span>
            </div>
            <ChevronRight size={14} className="text-blue-600 opacity-80" />
          </div>
        )}
      </div>

      {/* ── DESKTOP LAYOUT: BaseCard dọc chuẩn Liquid Glass & Squircle Geometry ── */}
      <CardShell
        onClick={() => {
          haptics.light();
          onViewDetail(member);
        }}
        className="gpu-accelerated hidden md:flex h-full neural-card-morph native-interactive"
        minHeight="md:min-h-[380px] min-h-0"
      >
        <CardContentSection padding="p-4 md:p-5" className="h-full flex flex-col justify-between">
          {/* 1. Identity Header */}
          <div>
            <div className="flex items-center gap-3.5 mb-3 relative z-10">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center font-black text-lg shadow-sm border border-white/20">
                  {member.name.charAt(0)}
                </div>
                {isHighPerformer && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                    <TrendingUp size={10} strokeWidth={3} />
                  </div>
                )}
                {isAdmin && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                    <ShieldCheck size={10} strokeWidth={3} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[9.5px] font-bold uppercase tracking-wider text-slate-700 border border-slate-200 whitespace-nowrap">
                    #{member.code}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[9.5px] font-bold uppercase tracking-wider whitespace-nowrap truncate max-w-[130px] border border-blue-100">
                    {departmentName}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 uppercase leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors tracking-tight">
                  {member.name}
                </h3>
              </div>
            </div>

            {/* 2. Performance Metrics (Phòng Kinh doanh mặc định target >= 1) */}
            {!isAdmin && (
              <div className="space-y-2 mb-4 relative z-10">
                {isSalesDepartment ? (
                  <>
                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tiến độ KPI</p>
                        <div className="flex items-center gap-1.5">
                          <Target size={13} className="text-blue-600 shrink-0" strokeWidth={2.5} />
                          <span className={cn(
                            "text-base font-black tracking-tight whitespace-nowrap",
                            isHighPerformer ? "text-emerald-600" : "text-slate-900"
                          )}>
                            {completionRate}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-700 whitespace-nowrap">
                          <span className="font-black text-blue-600">{soldCount}</span>
                          <span className="text-slate-500">/{salesTarget} xe</span>
                          {hasBoughtCars && (
                            <span className="text-[10px] text-blue-600 font-bold ml-1">
                              (+{member.salaryDetails.boughtCount} mua)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(completionRate, 100)}%` }}
                        transition={{ duration: 1.2, ease: "circOut" }}
                        className={cn(
                          "h-full rounded-full shadow-2xs relative overflow-hidden",
                          isHighPerformer ? "bg-emerald-500" : "bg-blue-600"
                        )}
                      />
                    </div>
                  </>
                ) : hasBoughtCars ? (
                  <div className="py-2 px-3 bg-blue-50/80 rounded-xl border border-blue-200/60 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                      <ShoppingBag size={12} className="text-blue-600" />
                      Chuyên môn Mua xe
                    </span>
                    <span className="text-xs font-black text-blue-700">
                      {member.salaryDetails.boughtCount} xe nhập
                    </span>
                  </div>
                ) : (
                  <div className="py-2 px-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      {departmentName.toLowerCase().includes('kế toán') ? (
                        <Calculator size={12} className="text-slate-500" />
                      ) : (
                        <Target size={12} className="text-slate-500" />
                      )}
                      Nghiệp vụ {departmentName}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Financial Summary */}
          {!isAdmin ? (
            <div className="mt-auto bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
                <div className="min-w-0 pr-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                    Thực lĩnh
                  </p>
                  <p className={cn(
                    "text-xl font-black tracking-tight truncate whitespace-nowrap",
                    member.salaryDetails.isPaid ? "text-emerald-600" : "text-slate-900"
                  )}>
                    {formatCurrency(member.salaryDetails.netSalary)}
                  </p>
                </div>
                {onTogglePayment && (
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={(e: React.MouseEvent) => { 
                      e.stopPropagation(); 
                      if (member.salaryDetails.isPaid) {
                        haptics.light();
                      } else {
                        haptics.success();
                      }
                      onTogglePayment(); 
                    }}
                    disabled={isSubmitting}
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm border-2 shrink-0 native-interactive",
                      member.salaryDetails.isPaid 
                        ? "bg-emerald-600 text-white border-white/20 shadow-emerald-600/20" 
                        : "bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300"
                    )}
                    title={member.salaryDetails.isPaid ? "Đã chi lương" : "Chưa chi lương"}
                  >
                    <Check size={18} strokeWidth={3.5} />
                  </motion.button>
                )}
              </div>

              {/* Chi tiết cơ cấu thu nhập SSoT */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Lương cơ bản</span>
                  <span className="text-xs font-black text-slate-800 whitespace-nowrap">
                    {formatCurrency(member.base_salary || 0)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 text-right">
                  <span className={cn(
                    "text-[10px] font-bold uppercase",
                    member.salaryDetails.totalCommission > 0 ? "text-income" : "text-sub-label"
                  )}>
                    Hoa hồng
                  </span>
                  <span className={cn(
                    "text-xs font-black whitespace-nowrap",
                    member.salaryDetails.totalCommission > 0 ? "text-income" : "text-sub-label"
                  )}>
                    +{formatCurrency(member.salaryDetails.totalCommission)}
                  </span>
                </div>
                {member.salaryDetails.totalReimbursements > 0 && (
                  <div className="col-span-2 pt-1 border-t border-slate-200/60 flex justify-between items-center text-[10px]">
                    <span className="font-bold text-income uppercase">Hoàn ứng chi phí</span>
                    <span className="font-black text-income whitespace-nowrap">
                      +{formatCurrency(member.salaryDetails.totalReimbursements)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-auto bg-slate-50/90 rounded-2xl p-6 border border-slate-200/80 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-11 h-11 rounded-xl bg-slate-900/5 text-slate-700 flex items-center justify-center">
                <ShieldCheck size={22} className="text-slate-700" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Quản trị viên</p>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Toàn quyền kiểm soát hệ thống</p>
              </div>
            </div>
          )}

          {/* 4. Footer Actions (Desktop Only) */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 relative z-10">
            <div className="flex gap-2">
              {onEdit && (
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  disabled={isSubmitting} 
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(); }} 
                  className="w-9 h-9 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-all native-interactive"
                  title="Chỉnh sửa thông tin"
                >
                  <Edit2 size={14} />
                </motion.button>
              )}
              {onDelete && (
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  disabled={isSubmitting} 
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(); }} 
                  className="w-9 h-9 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-slate-600 hover:text-red-600 transition-all native-interactive"
                  title="Xóa nhân viên"
                >
                  <Trash2 size={14} />
                </motion.button>
              )}
            </div>
            <button className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-blue-600 hover:gap-2.5 transition-all">
              Chi tiết <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
        </CardContentSection>
      </CardShell>
    </>
  );
});

StaffCard.displayName = 'StaffCard';


