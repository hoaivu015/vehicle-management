import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserPlus, Mail, Target, Briefcase, Edit2, ShieldCheck, Lock, Phone, 
  Eye, EyeOff, Sparkles, CheckCircle2, XCircle, KeyRound, Building2
} from 'lucide-react';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { UserRole, USER_ROLE_LABELS, ADMIN_EMAILS } from '@/src/shared/domain/constants';
import { Staff } from '@/src/shared/domain/types';
import { ExecutiveSection } from '@/src/shared/design-system/ExecutiveModules';
import { BaseInput, BaseSelect } from '@/src/shared/design-system/FormElements';
import { cn } from '@/src/shared/utils/cn';
import { haptics } from '@/src/shared/utils/haptics';
import { AddStaffSchema, UpdateStaffSchema } from '../../domain/StaffValidation';

export interface StaffFormData {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  department: string;
  base_salary: number;
  commission_per_car: number;
  target: number;
  status: 'ACTIVE' | 'INACTIVE';
  code?: string;
  password?: string;
}

interface StaffAddFormProps {
  member?: Staff;
  onAdd: (staffData: StaffFormData) => Promise<void>;
  onClose: () => void;
}

const DEPARTMENT_OPTIONS = [
  'Kinh doanh',
  'Kế toán',
  'Kỹ thuật & Dọn xe',
  'Ban quản lý',
  'Marketing'
];

const SALARY_PRESETS = [
  { label: '5tr', value: 5000000 },
  { label: '7tr', value: 7000000 },
  { label: '10tr', value: 10000000 },
  { label: '15tr', value: 15000000 }
];

const COMMISSION_PRESETS = [
  { label: '500k', value: 500000 },
  { label: '1tr', value: 1000000 },
  { label: '1.5tr', value: 1500000 },
  { label: '2tr', value: 2000000 }
];

const TARGET_PRESETS = [1, 3, 5, 8];

/** Chuyển đổi tên tiếng Việt sang mã nhân sự */
function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

function generateStaffCode(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return `NV-${Math.floor(100 + Math.random() * 900)}`;
  
  const cleanWords = words.map(w => removeDiacritics(w).toUpperCase());
  const lastWord = cleanWords[cleanWords.length - 1];
  const initials = cleanWords.slice(0, -1).map(w => w[0]).join('');
  
  return `NV-${initials}${lastWord}`;
}

const StaffAddForm: React.FC<StaffAddFormProps> = ({ member, onAdd, onClose }) => {
  const isEdit = !!member;

  const [formData, setFormData] = useState<StaffFormData>(() => ({
    name: member?.name || '',
    email: member?.email || '',
    phone: member?.phone || '',
    role: (member?.role as UserRole) || UserRole.STAFF,
    department: member?.department || 'Kinh doanh',
    base_salary: member?.base_salary || 0,
    commission_per_car: member?.commission_per_car || 0,
    target: member?.target ?? 3,
    status: (member?.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
    code: member?.code || '',
    password: ''
  }));

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrors({});

    // Validate bằng Zod Schema (Không dùng browser required tooltip)
    const schemaToUse = isEdit ? UpdateStaffSchema : AddStaffSchema;
    const validationResult = schemaToUse.safeParse({
      ...formData,
      code: formData.code || (formData.name ? generateStaffCode(formData.name) : undefined),
      ...(isEdit ? { id: member.id } : {})
    });

    if (!validationResult.success) {
      haptics.error();
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach(issue => {
        const fieldName = issue.path[0] as string;
        fieldErrors[fieldName] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    haptics.medium();

    try {
      let finalData = { 
        ...formData,
        code: formData.code || generateStaffCode(formData.name)
      };

      if (formData.email && ADMIN_EMAILS.includes(formData.email) && formData.role !== UserRole.ADMIN) {
        if (!confirm(`Email ${formData.email} thuộc danh sách Quản trị viên. Bạn có muốn đặt vai trò là Quản trị viên cho nhân sự này không?`)) {
          setLoading(false);
          return;
        }
        finalData = { ...finalData, role: UserRole.ADMIN };
      }

      await onAdd(finalData);
      haptics.success();
      onClose();
    } catch (error: unknown) {
      console.error(error);
      haptics.error();
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu nhân sự';
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  }, [formData, isEdit, member, onAdd, onClose]);

  // Phím tắt Cmd/Ctrl + Enter để Submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
      <ModalBody className="flex-1 p-4 md:p-5 space-y-4">
        {/* LỖI TỔNG THỂ */}
        {errors.form && (
          <div className="p-2.5 bg-expense-light/50 border border-expense-light rounded-2xl flex items-center gap-2 text-expense text-xs font-bold">
            <XCircle size={15} className="shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* PHÂN ĐOẠN 1: THÔNG TIN ĐỊNH DANH & TÀI KHOẢN (GRID 2 CỘT DENSE) */}
          <ExecutiveSection title="Thông tin định danh & Tài khoản" accent="bg-brand" columns={2}>
            {/* 1. Họ và tên */}
            <div className="space-y-1">
              <BaseInput 
                label="Họ và tên"
                value={formData.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  const autoCode = !isEdit ? generateStaffCode(newName) : formData.code;
                  setFormData({ ...formData, name: newName, code: autoCode });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="NGUYỄN VĂN A"
                icon={Briefcase}
                variant="dense"
                error={errors.name}
              />
            </div>

            {/* 2. Số điện thoại */}
            <div className="space-y-1">
              <BaseInput 
                label="Số điện thoại"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
                placeholder="0901234567"
                icon={Phone}
                variant="dense"
                error={errors.phone}
              />
            </div>

            {/* 3. Email đăng nhập */}
            <div className="relative space-y-1">
              <BaseInput 
                label="Email đăng nhập"
                type="email"
                value={formData.email}
                disabled={isEdit}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="email@auto28.vn"
                icon={isEdit ? Lock : Mail}
                variant="dense"
                error={errors.email}
                className={cn(
                  isEdit && "opacity-60 bg-surface-soft border-hairline-soft cursor-not-allowed italic"
                )}
              />
              {isEdit && (
                <span className="absolute right-3 top-8 text-[8px] font-black uppercase text-sub-label opacity-40 tracking-widest">
                  Cố định
                </span>
              )}
            </div>

            {/* 4. Mật khẩu khởi tạo (Thêm mới) hoặc Mã nhân sự (Chỉnh sửa) */}
            {!isEdit ? (
              <div className="relative space-y-1">
                <BaseInput 
                  label="Mật khẩu khởi tạo"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mặc định: auto28"
                  icon={KeyRound}
                  variant="dense"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-sub-label hover:text-kraft-ink transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <BaseInput 
                  label="Mã nhân sự"
                  value={formData.code || ''}
                  disabled
                  icon={Sparkles}
                  variant="dense"
                  className="opacity-60 bg-surface-soft border-hairline-soft cursor-not-allowed font-mono font-bold"
                />
              </div>
            )}

            {/* 5. Chức vụ & Vai trò */}
            <div className="space-y-1">
              <BaseSelect 
                label="Chức vụ"
                value={formData.role}
                onChange={(e) => {
                  setFormData({ ...formData, role: e.target.value as UserRole });
                  haptics.light();
                }}
                icon={ShieldCheck}
                variant="dense"
                error={errors.role}
              >
                {Object.values(UserRole).filter(r => r !== UserRole.ADMIN).map(role => (
                  <option key={role} value={role}>{USER_ROLE_LABELS[role as UserRole]}</option>
                ))}
              </BaseSelect>
            </div>

            {/* 6. Phòng ban */}
            <div className="space-y-1">
              <div className="flex justify-between items-end px-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-sub-label opacity-40 leading-none">
                  Phòng ban
                </label>
              </div>
              <div className="relative">
                <input
                  list="department-options"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Chọn hoặc nhập phòng ban"
                  className={cn(
                    "w-full bg-white border border-hairline-soft focus:border-kraft-accent focus:ring-4 focus:ring-kraft-accent/5 rounded-t2 outline-none font-black text-xs h-12 pl-11 pr-4 transition-all"
                  )}
                />
                <Building2 size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/40" />
                <datalist id="department-options">
                  {DEPARTMENT_OPTIONS.map(d => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>
            </div>
          </ExecutiveSection>

          {/* TRẠNG THÁI HOẠT ĐỘNG (COMPACT BAR) */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-surface-soft border border-hairline-soft">
            <span className="text-[11px] font-black uppercase tracking-wider text-sub-label px-1">
              Trạng thái nhân sự:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, status: 'ACTIVE' }));
                  haptics.light();
                }}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all border",
                  formData.status === 'ACTIVE'
                    ? "bg-emerald-50 text-emerald-600 border-emerald-300 shadow-sm"
                    : "text-sub-label border-transparent hover:bg-black/5 opacity-50"
                )}
              >
                <CheckCircle2 size={12} className={formData.status === 'ACTIVE' ? "text-emerald-500" : "text-sub-label"} />
                <span>Đang làm việc</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, status: 'INACTIVE' }));
                  haptics.light();
                }}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all border",
                  formData.status === 'INACTIVE'
                    ? "bg-red-50 text-red-600 border-red-300 shadow-sm"
                    : "text-sub-label border-transparent hover:bg-black/5 opacity-50"
                )}
              >
                <XCircle size={12} className={formData.status === 'INACTIVE' ? "text-red-500" : "text-sub-label"} />
                <span>Đã nghỉ việc</span>
              </button>
            </div>
          </div>

          {/* PHÂN ĐOẠN 2: CHẾ ĐỘ ĐÃI NGỘ & CHỈ TIÊU (GRID 3 CỘT DENSE) */}
          <ExecutiveSection title="Chế độ & Chỉ tiêu Showroom" accent="bg-income" columns={3} divider>
            {/* Lương cơ bản */}
            <div className="space-y-1.5">
              <SmartAmountInput
                label="Lương cơ bản"
                value={formData.base_salary}
                onChange={(v) => {
                  setFormData({ ...formData, base_salary: v });
                  if (errors.base_salary) setErrors({ ...errors, base_salary: '' });
                }}
                placeholder="VD: 7tr"
                variant="dense"
                error={errors.base_salary}
              />
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {SALARY_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, base_salary: preset.value }));
                      haptics.light();
                    }}
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border shrink-0 transition-all",
                      formData.base_salary === preset.value
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-surface-soft text-sub-label hover:text-kraft-ink border-hairline-soft"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hoa hồng / Xe */}
            <div className="space-y-1.5">
              <SmartAmountInput
                label="Hoa hồng / Xe"
                value={formData.commission_per_car}
                onChange={(v) => {
                  setFormData({ ...formData, commission_per_car: v });
                  if (errors.commission_per_car) setErrors({ ...errors, commission_per_car: '' });
                }}
                placeholder="VD: 1tr"
                variant="dense"
                error={errors.commission_per_car}
              />
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {COMMISSION_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, commission_per_car: preset.value }));
                      haptics.light();
                    }}
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border shrink-0 transition-all",
                      formData.commission_per_car === preset.value
                        ? "bg-kraft-accent text-white border-kraft-accent shadow-sm"
                        : "bg-surface-soft text-sub-label hover:text-kraft-ink border-hairline-soft"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mục tiêu KPI */}
            <div className="space-y-1.5">
              <BaseInput 
                label="Mục tiêu (xe/tháng)"
                type="number"
                value={formData.target || ''}
                onChange={(e) => {
                  setFormData({ ...formData, target: parseInt(e.target.value) || 0 });
                  if (errors.target) setErrors({ ...errors, target: '' });
                }}
                placeholder="Số xe"
                icon={Target}
                variant="dense"
                error={errors.target}
              />
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {TARGET_PRESETS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, target: t }));
                      haptics.light();
                    }}
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border shrink-0 transition-all",
                      formData.target === t
                        ? "bg-kraft-accent text-white border-kraft-accent shadow-sm"
                        : "bg-surface-soft text-sub-label hover:text-kraft-ink border-hairline-soft"
                    )}
                  >
                    {t} xe
                  </button>
                ))}
              </div>
            </div>
          </ExecutiveSection>
        </div>
      </ModalBody>

      <ModalFooter 
        onCancel={onClose} 
        onSubmit={handleSubmit}
        isSubmitting={loading}
        submitLabel={isEdit ? 'Lưu thay đổi' : 'Thêm nhân sự'}
      />
    </form>
  );
};

interface StaffAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (staffData: StaffFormData) => Promise<void>;
  member?: Staff;
}

export const StaffAddModal: React.FC<StaffAddModalProps> = ({ isOpen, onClose, onAdd, member }) => {
  const isEdit = !!member;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      maxWidth="2xl" 
      title={isEdit ? 'Cập nhật nhân sự' : 'Thêm nhân sự mới'}
      subtitle={isEdit ? `Mã #${member?.code} • ${member?.name}` : 'Khởi tạo tài khoản & chế độ đãi ngộ showroom'}
      icon={isEdit ? Edit2 : UserPlus}
      height="auto"
    >
      {isOpen && (
        <StaffAddForm 
          key={member?.id ?? 'new'} 
          member={member} 
          onAdd={onAdd} 
          onClose={onClose} 
        />
      )}
    </Modal>
  );
};



