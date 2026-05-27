import { useState, useEffect } from 'react';
import { supabase } from '@/src/shared/infrastructure/supabase';
import { useNotification } from '@/src/shared/presentation/useNotification';

export interface LandingPageConfig {
  phone: string;
  address: string;
  fanpage_url: string;
  telegram_token: string;
  telegram_chat_id: string;
  fb_pixel_id: string;
  tiktok_pixel_id: string;
  gtm_id: string;
  hotline_number: string;
  map_iframe_url: string;
}

const DEFAULT_CONFIG: LandingPageConfig = {
  phone: '0888813838',
  address: '8F Đường Trịnh Hoài Đức, Tăng Nhơn Phú, Quận 9, TP. Hồ Chí Minh',
  fanpage_url: 'https://www.facebook.com/otoluotsaigon9/',
  telegram_token: '8354150269:AAF2da1-GZAXNgDVplWot053UDETG7CX5ss',
  telegram_chat_id: '2117317097',
  fb_pixel_id: '537471081061777',
  tiktok_pixel_id: 'D802OM3C77UEKU3Q3HPG',
  gtm_id: 'GTM-PPKRWBPC',
  hotline_number: '0888.81.38.38',
  map_iframe_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.5784249693193!2d106.77618710000002!3d10.843538899999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527b0785d11ab%3A0x8437185ef2074ae3!2sAuto28!5e0!3m2!1svi!2sus!4v1778383502219!5m2!1svi!2sus',
};

export const useLandingPage = () => {
  const [config, setConfig] = useState<LandingPageConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tableExists, setTableExists] = useState(true);
  const [testingTelegram, setTestingTelegram] = useState(false);
  
  // Vehicles management state
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  
  const notification = useNotification();

  const loadConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('landingpage_config')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        // Table not found error handling
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('find')) {
          setTableExists(false);
        } else {
          throw error;
        }
      } else if (data) {
        setTableExists(true);
        setConfig({
          phone: data.phone || DEFAULT_CONFIG.phone,
          address: data.address || DEFAULT_CONFIG.address,
          fanpage_url: data.fanpage_url || DEFAULT_CONFIG.fanpage_url,
          telegram_token: data.telegram_token || DEFAULT_CONFIG.telegram_token,
          telegram_chat_id: data.telegram_chat_id || DEFAULT_CONFIG.telegram_chat_id,
          fb_pixel_id: data.fb_pixel_id || DEFAULT_CONFIG.fb_pixel_id,
          tiktok_pixel_id: data.tiktok_pixel_id || DEFAULT_CONFIG.tiktok_pixel_id,
          gtm_id: data.gtm_id || DEFAULT_CONFIG.gtm_id,
          hotline_number: data.hotline_number || DEFAULT_CONFIG.hotline_number,
          map_iframe_url: data.map_iframe_url || DEFAULT_CONFIG.map_iframe_url,
        });
      } else {
        // If table exists but row 1 is missing, let's create a default row
        setTableExists(true);
        const { error: insertError } = await supabase
          .from('landingpage_config')
          .insert({ id: 1, ...DEFAULT_CONFIG });
        if (insertError) console.error('Failed to insert default row:', insertError);
      }
    } catch (err: any) {
      console.error('Error loading landing page config:', err);
      notification.error('Không thể tải cấu hình Landing Page. Vui lòng kiểm tra kết nối.');
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .neq('status', 'SOLD') // Chỉ hiển thị xe chưa bán
        .order('id', { ascending: false });

      if (error) throw error;
      if (data) {
        setVehicles(data);
      }
    } catch (err: any) {
      console.error('Error loading vehicles for landingpage manager:', err);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const toggleVehicleVisibility = async (vehicleId: number, currentStatus: boolean) => {
    // Nếu show_on_landing là null hoặc undefined, mặc định nó là true trước đó. Do đó currentStatus nhận vào nếu null/undefined thì coi như true.
    const isCurrentlyVisible = currentStatus !== false;
    const nextStatus = !isCurrentlyVisible;

    // Optimistic Update
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, show_on_landing: nextStatus } : v));

    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ show_on_landing: nextStatus })
        .eq('id', vehicleId);

      if (error) throw error;
      notification.success(`Đã ${nextStatus ? 'bật hiển thị' : 'ẩn'} xe thành công trên Landing Page!`);
    } catch (err: any) {
      console.error('Error updating vehicle visibility in database:', err);
      notification.error('Không thể cập nhật trạng thái hiển thị: ' + err.message);
      // Revert optimistic update
      setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, show_on_landing: isCurrentlyVisible } : v));
    }
  };

  const saveConfig = async (newConfig: LandingPageConfig) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('landingpage_config')
        .upsert({
          id: 1,
          ...newConfig,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setConfig(newConfig);
      notification.success('Đã lưu cấu hình Landing Page thành công!');
      return true;
    } catch (err: any) {
      console.error('Error saving config:', err);
      notification.error('Lỗi khi lưu cấu hình: ' + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const sendTestTelegram = async (token: string, chatId: string): Promise<boolean> => {
    if (!token || !chatId) {
      notification.error('Vui lòng điền đầy đủ Token và Chat ID để kiểm thử!');
      return false;
    }

    setTestingTelegram(true);
    try {
      const message = `
<b>🔔 KIỂM THỬ TÍCH HỢP HỆ THỐNG AUTO 28</b>
--------------------------
🟢 <b>Trạng thái:</b> Kết nối thành công!
⚙️ <b>Hệ thống quản lý:</b> Đã liên kết Landing Page.
⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}
--------------------------
<i>Báo cáo kiểm thử tự động được gửi từ trang quản trị.</i>
      `;

      const params = new URLSearchParams({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      });

      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage?${params.toString()}`);
      
      if (response.ok) {
        notification.success('Gửi tin nhắn thử nghiệm thành công! Hãy kiểm tra Telegram.');
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.description || 'API Telegram báo lỗi.');
      }
    } catch (err: any) {
      console.error('Telegram test error:', err);
      notification.error('Gửi tin nhắn thử nghiệm thất bại: ' + err.message);
      return false;
    } finally {
      setTestingTelegram(false);
    }
  };

  useEffect(() => {
    loadConfig();
    loadVehicles();
  }, []);

  return {
    config,
    loading,
    saving,
    tableExists,
    testingTelegram,
    vehicles,
    loadingVehicles,
    loadConfig,
    loadVehicles,
    saveConfig,
    sendTestTelegram,
    toggleVehicleVisibility,
  };
};
