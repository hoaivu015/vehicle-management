/**
 * AUTO 28 DESIGN TOKENS
 * 
 * Đây là Source of Truth duy nhất cho mọi thông số về Layout, Spacing và Visual.
 * Thay đổi tại đây sẽ cập nhật toàn bộ ứng dụng.
 */

export const DESIGN_TOKENS = {
  // 📏 Spacing & Gutters
  layout: {
    container_px: "px-6", // Lề cho các khối lớn (Card, MatrixSummary, Modal)
    item_px: "px-4",      // Lề cho các hàng dữ liệu, item danh sách
    gutter_gap: "gap-6",  // Khoảng cách giữa các phần tử trong stack
    section_py: "py-6",   // Khoảng cách dọc cho các section
    
    // 🏢 Executive Layout (Dành cho Modal chi tiết xe)
    sidebar_width: "lg:w-[340px]", 
    content_padding: "p-6 md:p-8",
    modal_body_gap: "gap-0", // Loại bỏ gap giữa sidebar và content để quản lý chính xác hơn
  },

  // 📐 Border Radius
  radius: {
    base: "rounded-[32px]",
    large: "rounded-[40px]",
    button: "rounded-full",
    item: "rounded-2xl",
  },

  // ✨ Visual Effects
  effects: {
    glass: "backdrop-blur-md bg-white/40 border-white/60",
    shadow: "shadow-xl shadow-black/[0.04]", // Nổi bật hơn trên nền xám nhẹ
    shadow_neural_t2: "shadow-neural-t2",
    shadow_neural_t3: "shadow-neural-t3",
    shadow_neon_glow: "shadow-neon-glow",
  },

  // 🎨 Color & Tonal Hierarchy (Industrial Color System SSoT)
  colors: {
    brand: {
      surface: "bg-blue-50/80",
      border: "border-blue-200/60",
      text: "text-blue-700",
      primary: "bg-kraft-accent",
      hover: "hover:bg-blue-700",
      active: "active:bg-blue-800",
    },
    financial: {
      income: "text-income",
      income_surface: "bg-income/10",
      income_border: "border-income/20",
      expense: "text-expense",
      expense_surface: "bg-expense/10",
      expense_border: "border-expense/20",
      warning: "text-warning",
      warning_surface: "bg-warning/10",
      warning_border: "border-warning/20",
    },
    neutral: {
      canvas: "bg-kraft-bg",
      surface: "bg-white",
      surface_soft: "bg-surface-soft",
      border: "border-hairline",
      text_main: "text-kraft-ink",
      text_muted: "text-sub-label",
    }
  }
};

