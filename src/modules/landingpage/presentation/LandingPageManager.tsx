import React, { useState } from 'react';
import { useLandingPage, LandingPageConfig } from './useLandingPage';
import { 
  Globe, 
  Save, 
  Phone, 
  Send, 
  Copy, 
  Check, 
  AlertTriangle, 
  Code, 
  ExternalLink,
  BarChart3,
  Bot,
  Car
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';

export const LandingPageManager: React.FC = () => {
  const {
    config,
    loading,
    saving,
    tableExists,
    testingTelegram,
    vehicles,
    loadingVehicles,
    loadConfig,
    saveConfig,
    sendTestTelegram,
    toggleVehicleVisibility,
  } = useLandingPage();

  const [activeTab, setActiveTab] = useState<'contact' | 'pixels' | 'telegram' | 'vehicles'>('contact');
  const [formData, setFormData] = useState<LandingPageConfig>(config);
  const [copiedSQL, setCopiedSQL] = useState(false);

  // Sync state when config finishes loading
  React.useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveConfig(formData);
  };

  const handleTestTelegram = async () => {
    await sendTestTelegram(formData.telegram_token, formData.telegram_chat_id);
  };

  const sqlQuery = `-- CHẠY LỆNH NÀY TRONG SUPABASE SQL EDITOR ĐỂ TẠO BẢNG
CREATE TABLE IF NOT EXISTS public.landingpage_config (
  id integer PRIMARY KEY DEFAULT 1,
  phone text DEFAULT '0888813838',
  address text DEFAULT '8F Đường Trịnh Hoài Đức, Tăng Nhơn Phú, Quận 9, TP. Hồ Chí Minh',
  fanpage_url text DEFAULT 'https://www.facebook.com/otoluotsaigon9/',
  telegram_token text DEFAULT '8354150269:AAF2da1-GZAXNgDVplWot053UDETG7CX5ss',
  telegram_chat_id text DEFAULT '2117317097',
  fb_pixel_id text DEFAULT '537471081061777',
  tiktok_pixel_id text DEFAULT 'D802OM3C77UEKU3Q3HPG',
  gtm_id text DEFAULT 'GTM-PPKRWBPC',
  hotline_number text DEFAULT '0888.81.38.38',
  map_iframe_url text DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.5784249693193!2d106.77618710000002!3d10.843538899999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527b0785d11ab%3A0x8437185ef2074ae3!2sAuto28!5e0!3m2!1svi!2sus!4v1778383502219!5m2!1svi!2sus',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Chèn dòng mặc định để cấu hình sẵn hoạt động
INSERT INTO public.landingpage_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Bật tính năng Row Level Security để bảo mật
ALTER TABLE public.landingpage_config ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách cho phép đọc công khai
CREATE POLICY "Allow anonymous read" ON public.landingpage_config
  FOR SELECT USING (true);

-- Tạo chính sách cho phép sửa đổi khi đã đăng nhập
CREATE POLICY "Allow authenticated update" ON public.landingpage_config
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Tạo chính sách cho phép chèn dữ liệu khi đã đăng nhập
CREATE POLICY "Allow authenticated insert" ON public.landingpage_config
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Tự động cập nhật thêm cột battery_type và show_on_landing cho bảng vehicles (không cần phần biển số nữa)
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS battery_type text DEFAULT 'None';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS show_on_landing boolean DEFAULT true;
`;

  const copyToClipboard = (text: string, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4 border-b border-black/5 pb-8">
          <div className="w-12 h-12 rounded-2xl bg-kraft-accent/10 animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 rounded-xl bg-black/5 animate-pulse" />
            <div className="h-3 w-72 rounded-lg bg-black/5 animate-pulse" />
          </div>
        </div>
        <div className="h-80 rounded-[3rem] bg-black/5 animate-pulse" />
      </div>
    );
  }

  // Setup mode when the table doesn't exist yet
  if (!tableExists) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-kraft-accent to-kraft-accent/60 flex items-center justify-center text-white shadow-lg shadow-kraft-accent/20">
              <Globe size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-kraft-ink tracking-tight uppercase">Cấu hình Landing Page</h1>
              <p className="text-xs font-bold text-kraft-ink/40 uppercase tracking-widest">Khởi tạo cơ sở dữ liệu trên Supabase</p>
            </div>
          </div>
        </div>

        <div className="glass-purity-surface rounded-[2.5rem] border-white/40 shadow-2xl p-6 md:p-10 space-y-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-kraft-accent/5 rounded-full blur-3xl -z-10" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5 p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 text-amber-700">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase tracking-wider text-amber-900">Bảng cấu hình chưa tồn tại</h4>
              <p className="text-xs font-bold uppercase text-amber-800/80 leading-relaxed">
                Hệ thống phát hiện bảng `landingpage_config` chưa được khởi tạo trên Supabase. 
                Hãy thực hiện dán lệnh SQL bên dưới để kích hoạt ngay.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <span className="text-[10px] font-black text-kraft-ink/30 uppercase tracking-[0.2em] flex items-center gap-2">
                <Code size={14} className="text-kraft-accent" />
                Mã lệnh khởi tạo SQL
              </span>
              <button
                onClick={() => copyToClipboard(sqlQuery, setCopiedSQL)}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-kraft-accent hover:opacity-80 transition-opacity"
              >
                {copiedSQL ? (
                  <>
                    <Check size={14} className="text-emerald-500" />
                    Đã sao chép!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Sao chép SQL
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-3xl border border-black/5 bg-black/[0.03] overflow-hidden">
              <pre className="p-6 overflow-x-auto text-[11px] font-mono text-kraft-ink/75 leading-relaxed max-h-[300px]">
                {sqlQuery}
              </pre>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-black/5">
            <h4 className="text-xs font-black text-kraft-ink uppercase tracking-wider">Các bước thực hiện nhanh:</h4>
            <ol className="list-decimal pl-5 space-y-2 text-xs text-kraft-ink/60 font-bold uppercase leading-relaxed">
              <li>Nhấp nút **Sao chép SQL** ở trên để lưu mã SQL vào khay nhớ tạm.</li>
              <li>
                Mở dashboard dự án Supabase của bạn tại{' '}
                <a 
                  href="https://supabase.com/dashboard" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-kraft-accent underline inline-flex items-center gap-1 inline"
                >
                  Supabase Console <ExternalLink size={12} />
                </a>
              </li>
              <li>Truy cập mục **SQL Editor** trong thanh bên trái, chọn **New query**.</li>
              <li>Dán mã SQL vừa sao chép vào ô soạn thảo và nhấn nút **Run** ở góc dưới phải.</li>
              <li>
                Quay lại đây và nhấn nút{' '}
                <button 
                  onClick={loadConfig} 
                  className="text-kraft-accent font-black underline border-none p-0 inline"
                >
                  Kiểm tra kết nối
                </button>{' '}
                để tải lại!
              </li>
            </ol>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={loadConfig}
              className="glass-purity-button bg-kraft-ink/5 hover:bg-kraft-ink/10 text-kraft-ink px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
              Tải lại trang
            </button>
            <button
              onClick={loadConfig}
              className="glass-purity-button bg-kraft-accent text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-kraft-accent/20 active:scale-95 transition-all"
            >
              Tôi đã chạy SQL
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-kraft-accent to-kraft-accent/60 flex items-center justify-center text-white shadow-lg shadow-kraft-accent/20">
              <Globe size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-kraft-ink tracking-tight uppercase">Quản trị Landing Page</h1>
              <p className="text-xs font-bold text-kraft-ink/40 uppercase tracking-widest">Đồng bộ cấu hình liên hệ, Pixels & bot Telegram từ xa</p>
            </div>
          </div>
        </div>

        {activeTab !== 'vehicles' && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="glass-purity-button bg-kraft-accent text-white px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 font-black text-xs uppercase tracking-widest shadow-xl shadow-kraft-accent/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Lưu thay đổi
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-[10px] font-black text-kraft-ink/30 uppercase tracking-[0.2em] ml-2 mb-4">Các nhóm cấu hình</p>
          
          <button
            onClick={() => setActiveTab('contact')}
            className={cn(
              "w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-3 border border-transparent",
              activeTab === 'contact' 
                ? "glass-purity-surface border-kraft-accent/20 shadow-lg font-black text-kraft-ink" 
                : "hover:bg-white/40 text-kraft-ink/50 font-bold"
            )}
          >
            <Phone size={16} className={activeTab === 'contact' ? "text-kraft-accent" : "text-kraft-ink/40"} />
            <span className="text-xs uppercase tracking-wider">Thông tin liên hệ</span>
          </button>

          <button
            onClick={() => setActiveTab('pixels')}
            className={cn(
              "w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-3 border border-transparent",
              activeTab === 'pixels' 
                ? "glass-purity-surface border-kraft-accent/20 shadow-lg font-black text-kraft-ink" 
                : "hover:bg-white/40 text-kraft-ink/50 font-bold"
            )}
          >
            <BarChart3 size={16} className={activeTab === 'pixels' ? "text-kraft-accent" : "text-kraft-ink/40"} />
            <span className="text-xs uppercase tracking-wider">Tích hợp Pixels</span>
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={cn(
              "w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-3 border border-transparent",
              activeTab === 'telegram' 
                ? "glass-purity-surface border-kraft-accent/20 shadow-lg font-black text-kraft-ink" 
                : "hover:bg-white/40 text-kraft-ink/50 font-bold"
            )}
          >
            <Bot size={16} className={activeTab === 'telegram' ? "text-kraft-accent" : "text-kraft-ink/40"} />
            <span className="text-xs uppercase tracking-wider">Thông báo Telegram</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vehicles')}
            className={cn(
              "w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-3 border border-transparent",
              activeTab === 'vehicles' 
                ? "glass-purity-surface border-kraft-accent/20 shadow-lg font-black text-kraft-ink" 
                : "hover:bg-white/40 text-kraft-ink/50 font-bold"
            )}
          >
            <Car size={16} className={activeTab === 'vehicles' ? "text-kraft-accent" : "text-kraft-ink/40"} />
            <span className="text-xs uppercase tracking-wider">Kho xe giao ngay</span>
          </button>
        </div>

        {/* Configuration Panel */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSave} className="glass-purity-surface rounded-[2.5rem] border-white/40 shadow-2xl p-6 md:p-8 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'contact' && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 border-b border-black/5 pb-4">
                    <Phone size={18} className="text-kraft-accent" />
                    <h3 className="text-xs font-black text-kraft-ink uppercase tracking-wider">Thông tin liên hệ chính</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-kraft-ink/40 uppercase tracking-widest pl-1">Hotline (Hiển thị văn bản)</label>
                      <input
                        type="text"
                        name="hotline_number"
                        value={formData?.hotline_number || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-black/5 bg-white/40 focus:bg-white focus:ring-1 focus:ring-kraft-accent text-xs font-bold uppercase transition-all"
                        placeholder="0888.81.38.38"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-kraft-ink/40 uppercase tracking-widest pl-1">Hotline (Số gọi - no spaces)</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData?.phone || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-black/5 bg-white/40 focus:bg-white focus:ring-1 focus:ring-kraft-accent text-xs font-bold transition-all"
                        placeholder="0888813838"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-kraft-ink/40 uppercase tracking-widest pl-1">Địa chỉ Showroom</label>
                      <input
                        type="text"
                        name="address"
                        value={formData?.address || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-black/5 bg-white/40 focus:bg-white focus:ring-1 focus:ring-kraft-accent text-xs font-bold transition-all"
                        placeholder="8F Đường Trịnh Hoài Đức, TP. Hồ Chí Minh"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-kraft-ink/40 uppercase tracking-widest pl-1">Link Fanpage Facebook</label>
                      <input
                        type="text"
                        name="fanpage_url"
                        value={formData?.fanpage_url || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-black/5 bg-white/40 focus:bg-white focus:ring-1 focus:ring-kraft-accent text-xs font-bold transition-all"
                        placeholder="https://facebook.com/..."
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-kraft-ink/40 uppercase tracking-widest pl-1">Bản đồ nhúng (URL Google Map iframe src)</label>
                      <textarea
                        name="map_iframe_url"
                        value={formData?.map_iframe_url || ''}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-black/5 bg-white/40 focus:bg-white focus:ring-1 focus:ring-kraft-accent text-xs font-mono transition-all leading-relaxed"
                        placeholder="https://www.google.com/maps/embed?..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'pixels' && (
                <motion.div
                  key="pixels"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 border-b border-black/5 pb-4">
                    <BarChart3 size={18} className="text-kraft-accent" />
                    <h3 className="text-xs font-black text-kraft-ink uppercase tracking-wider">Theo dõi & Tiếp thị số</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-kraft-ink/40 uppercase tracking-widest pl-1">Google Tag Manager ID / Google Tag ID</label>
                      <input
                        type="text"
                        name="gtm_id"
                        value={formData?.gtm_id || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-black/5 bg-white/40 focus:bg-white focus:ring-1 focus:ring-kraft-accent text-xs font-bold transition-all"
                        placeholder="GTM-XXXXXXX hoặc G-XXXXXXX"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-kraft-ink/40 uppercase tracking-widest pl-1">Facebook Pixel ID</label>
                      <input
                        type="text"
                        name="fb_pixel_id"
                        value={formData?.fb_pixel_id || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-black/5 bg-white/40 focus:bg-white focus:ring-1 focus:ring-kraft-accent text-xs font-bold transition-all"
                        placeholder="537471081061777"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-kraft-ink/40 uppercase tracking-widest pl-1">TikTok Pixel ID</label>
                      <input
                        type="text"
                        name="tiktok_pixel_id"
                        value={formData?.tiktok_pixel_id || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-black/5 bg-white/40 focus:bg-white focus:ring-1 focus:ring-kraft-accent text-xs font-bold transition-all"
                        placeholder="D802OM3C77UEKU3Q3HPG"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'telegram' && (
                <motion.div
                  key="telegram"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 border-b border-black/5 pb-4">
                    <Bot size={18} className="text-kraft-accent" />
                    <h3 className="text-xs font-black text-kraft-ink uppercase tracking-wider">Hệ thống thông báo Telegram Leads</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-kraft-ink/40 uppercase tracking-widest pl-1">Telegram Bot Token</label>
                      <input
                        type="password"
                        name="telegram_token"
                        value={formData?.telegram_token || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-black/5 bg-white/40 focus:bg-white focus:ring-1 focus:ring-kraft-accent text-xs font-mono transition-all"
                        placeholder="8354150269:AAF2da1..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-kraft-ink/40 uppercase tracking-widest pl-1">Telegram Chat ID (Nhóm/Kênh nhận báo cáo)</label>
                      <input
                        type="text"
                        name="telegram_chat_id"
                        value={formData?.telegram_chat_id || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-black/5 bg-white/40 focus:bg-white focus:ring-1 focus:ring-kraft-accent text-xs font-bold transition-all"
                        placeholder="2117317097 hoặc -100XXXXXXXXXX"
                      />
                    </div>

                    <div className="p-5 rounded-3xl border border-blue-500/10 bg-blue-500/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Kiểm thử Telegram</h4>
                        <p className="text-[11px] font-bold text-blue-800/60 uppercase">
                          Gửi một tin nhắn thử nghiệm để kiểm tra tính chính xác của Token & Chat ID.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleTestTelegram}
                        disabled={testingTelegram}
                        className="glass-purity-button border-blue-500/20 text-blue-700 bg-blue-500/10 hover:bg-blue-500/20 px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-wider shrink-0 transition-all disabled:opacity-50 active:scale-95"
                      >
                        {testingTelegram ? (
                          <div className="w-3 h-3 border-2 border-blue-500/20 border-t-blue-700 rounded-full animate-spin" />
                        ) : (
                          <Send size={12} />
                        )}
                        Gửi test Telegram
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'vehicles' && (
                <motion.div
                  key="vehicles"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/5 pb-4">
                    <div className="flex items-center gap-2">
                      <Car size={18} className="text-kraft-accent" />
                      <h3 className="text-xs font-black text-kraft-ink uppercase tracking-wider">Quản lý hiển thị kho xe Landing Page</h3>
                    </div>
                    <span className="text-[10px] font-black text-kraft-accent uppercase tracking-widest px-3 py-1 bg-kraft-accent/10 rounded-full">
                      {vehicles.length} xe trong kho
                    </span>
                  </div>

                  {loadingVehicles ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="w-8 h-8 border-4 border-kraft-accent/20 border-t-kraft-accent rounded-full animate-spin" />
                      <span className="text-[10px] font-black uppercase text-kraft-ink/40 tracking-widest">Đang tải kho xe...</span>
                    </div>
                  ) : vehicles.length === 0 ? (
                    <div className="text-center py-16 bg-white/40 border border-hairline-soft rounded-3xl p-6">
                      <p className="text-[11px] font-black uppercase tracking-wider text-kraft-ink/40 mb-1">Kho xe hiện tại trống</p>
                      <p className="text-xs text-kraft-ink/30">Vui lòng thêm xe mới vào kho ở tab Sản phẩm trước.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {vehicles.map((car) => {
                        const isVisible = car.show_on_landing !== false;
                        const isElectric = ['vf3', 'vf5', 'vf6', 'vf7', 'vf8', 'vf9', 'vfe34'].some(k => car.name.toLowerCase().includes(k));
                        
                        return (
                          <div 
                            key={car.id} 
                            className="glass-purity-surface border border-hairline-soft rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-kraft-accent/20 transition-all duration-300"
                          >
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                              <img 
                                src={car.image_url || 'assets/cars/default.jpg'} 
                                alt={car.name}
                                className="w-16 h-16 rounded-xl object-cover border border-black/5 shrink-0" 
                              />
                              <div className="min-w-0 space-y-1">
                                <h4 className="text-sm font-black text-kraft-ink truncate leading-tight">{car.name}</h4>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-black/5 text-kraft-ink/60 rounded-md">
                                    Đời {car.year}
                                  </span>
                                  <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-black/5 text-kraft-ink/60 rounded-md">
                                    {car.odo ? car.odo.toLocaleString('vi-VN') : '0'} km
                                  </span>
                                  {isElectric && (
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-700 rounded-md">
                                      {car.battery_type && car.battery_type !== 'None' ? car.battery_type : 'Pin Thuê'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-black text-kraft-accent">
                                  {car.sale_price ? `${car.sale_price.toLocaleString('vi-VN')} Triệu` : 'Liên hệ'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0 justify-end w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${isVisible ? 'text-emerald-600' : 'text-kraft-ink/30'}`}>
                                {isVisible ? 'Hiển thị công khai' : 'Đang ẩn'}
                              </span>
                              
                              {/* Custom Toggle Switch */}
                              <button
                                type="button"
                                onClick={() => toggleVehicleVisibility(car.id, car.show_on_landing)}
                                className={cn(
                                  "w-12 h-7 rounded-full transition-all duration-300 relative border",
                                  isVisible 
                                    ? "bg-kraft-accent border-transparent" 
                                    : "bg-black/10 border-black/5"
                                )}
                              >
                                <span 
                                  className={cn(
                                    "absolute top-0.5 w-5.5 h-5.5 rounded-full bg-white shadow-md transition-all duration-300",
                                    isVisible ? "left-[22px]" : "left-0.5"
                                  )}
                                />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
};
